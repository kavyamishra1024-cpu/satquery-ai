from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import io
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_risk_level(coverage_pct):
    if coverage_pct < 10:
        return {"level": "Low Risk", "color": "#22c55e"}
    elif coverage_pct < 25:
        return {"level": "Moderate Risk — Monitor Closely", "color": "#f59e0b"}
    else:
        return {"level": "High Risk — Immediate Response Recommended", "color": "#ef4444"}


def detect_water(img_bgr, h, w):
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    # Narrowed hue range: true blue/cyan only, no longer overlapping dark-green forest hues
    lower_water = np.array([95, 40, 20])
    upper_water = np.array([135, 255, 220])
    hue_mask = cv2.inRange(hsv, lower_water, upper_water)

    # Second check: water's blue channel must clearly outweigh green/red.
    # Dense trees/turf are green-dominant even when dark, so this filters them out.
    b, g, r = cv2.split(img_bgr.astype(np.int16))
    blue_dominant = ((b - g) > 8) & ((b - r) > 8)

    mask = cv2.bitwise_and(hue_mask, blue_dominant.astype(np.uint8) * 255)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = [c for c in contours if cv2.contourArea(c) > (h * w * 0.002)]
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    boxes = []
    for c in contours:
        x, y, cw, ch = cv2.boundingRect(c)
        boxes.append({
            "label": "WATER BODY",
            "x_pct": round((x / w) * 100, 1),
            "y_pct": round((y / h) * 100, 1),
            "w_pct": round((cw / w) * 100, 1),
            "h_pct": round((ch / h) * 100, 1),
        })

    water_pixels = int(np.sum(mask > 0))
    coverage_pct = round((water_pixels / (h * w)) * 100, 1)
    confidence = min(99, round(60 + coverage_pct * 2, 1)) if boxes else 0

    # Create blue overlay
    overlay = img_bgr.copy()
    overlay[mask > 0] = (255, 0, 0)

    result_img = cv2.addWeighted(img_bgr, 0.45, overlay, 0.55, 0)

    _, buffer = cv2.imencode(".png", result_img)
    overlay_base64 = base64.b64encode(buffer).decode("utf-8")

    risk_info = get_risk_level(coverage_pct)

    return {
        "mode": "water_detection",
        "objects_detected": len(boxes),
        "confidence": confidence,
        "water_coverage_pct": coverage_pct,
        "boxes": boxes,
        "overlay_image": overlay_base64,
        "risk_level": risk_info["level"],
        "risk_color": risk_info["color"],
    }


def classify_land_cover(img_bgr, h, w):
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    total = h * w

    # Water: true blue/cyan hues, confirmed by blue-channel dominance
    hue_mask = cv2.inRange(hsv, np.array([95, 40, 20]), np.array([135, 255, 220]))
    b, g, r = cv2.split(img_bgr.astype(np.int16))
    blue_dominant = ((b - g) > 8) & ((b - r) > 8)
    water_mask = cv2.bitwise_and(hue_mask, blue_dominant.astype(np.uint8) * 255)

    # Vegetation: green tones
    veg_mask = cv2.inRange(hsv, np.array([35, 40, 30]), np.array([85, 255, 220]))

    # Everything else = urban / bare land / other
    combined = cv2.bitwise_or(water_mask, veg_mask)
    other_mask = cv2.bitwise_not(combined)

    water_pct = round((int(np.sum(water_mask > 0)) / total) * 100, 1)
    veg_pct = round((int(np.sum(veg_mask > 0)) / total) * 100, 1)
    other_pct = round(max(0, 100 - water_pct - veg_pct), 1)

    breakdown = [
        {"label": "Vegetation", "pct": veg_pct, "color": "#22c55e"},
        {"label": "Water", "pct": water_pct, "color": "#3b82f6"},
        {"label": "Urban / Bare Land", "pct": other_pct, "color": "#a8a29e"},
    ]
    dominant = max(breakdown, key=lambda b: b["pct"])

    return {
        "mode": "land_cover",
        "breakdown": breakdown,
        "dominant_class": dominant["label"],
        "confidence": min(99, round(70 + dominant["pct"] * 0.3, 1)),
    }


@app.post("/analyze")
async def analyze(image: UploadFile = File(...), query: str = Form(...)):
    contents = await image.read()
    pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = np.array(pil_img)
    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    h, w = img_bgr.shape[:2]

    query_lower = query.lower()

    if "land cover" in query_lower or "land-cover" in query_lower:
        result = classify_land_cover(img_bgr, h, w)
    else:
        result = detect_water(img_bgr, h, w)

    result["query"] = query
    return result