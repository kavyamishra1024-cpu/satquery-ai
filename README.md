SatQuery AI
Making satellite imagery accessible through natural-language queries.
Built for Smart India Hackathon — Problem Statement SIH26167 (ISRO): An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries
Team: NexaCore
What it does
SatQuery AI lets a user upload a satellite or aerial image, ask a question in plain language (e.g. "Identify the major water bodies in this image"), and get an instant analysis — water body detection, land cover classification, or object presence — along with a confidence score and a visual overlay highlighting the detected region.
The problem
During disasters like floods, satellite images are captured constantly, but analyzing them typically requires trained remote-sensing experts. This creates a bottleneck when fast decisions are needed. SatQuery AI aims to make this kind of analysis accessible to non-experts — disaster response teams, environmental researchers, and urban planners — without requiring GIS training.
Current prototype (MVP)
This is a working prototype, not the final product. It currently uses:
Frontend: React.js
Backend: Python + FastAPI
Detection method: OpenCV with HSV color-space thresholding to detect water bodies and classify land cover (vegetation / water / urban-bare land)
Output: Coverage percentage, a computed confidence score, an automatic risk-level classification (Low / Moderate / High based on water coverage), and a visual overlay on the uploaded image
Note on "AI": the current detection pipeline is classical computer vision (color-based thresholding), not a trained machine learning model. This is an honest limitation of the current MVP — see roadmap below.
Roadmap — planned next phase
Integrate Sentinel-1 SAR (radar) imagery, which works through cloud cover and at night, unlike optical images
Train a U-Net segmentation model on labeled datasets (e.g. Sen1Floods11) for genuine pixel-level, learned detection instead of fixed color rules
Add a language model (LLM) layer, strictly grounded in our own detection model's output, to support more flexible, conversational queries
Formal accuracy evaluation using standard segmentation metrics (IoU) against labeled ground truth
Tech stack
Layer
Technology
Frontend
React.js
Backend
Python, FastAPI
Image processing
OpenCV, NumPy, Pillow
Current detection
HSV color-space thresholding
Planned detection
TensorFlow/Keras (U-Net)
Planned data source
Sentinel-1 SAR, ISRO Bhuvan
Planned language layer
LLM API
Running locally
Backend:pip install fastapi uvicorn opencv-python numpy pillow python-multipart
uvicorn main:app --reload
Bash
Frontend:npm install
npm run dev
Bash
Team NexaCore
Built for Smart India Hackathon 2026.
