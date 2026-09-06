import { useState } from "react";

const BACKEND_URL = "http://127.0.0.1:8000";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const examples = [
    "Identify the major water bodies in this image.",
    "Detect objects present in this satellite image.",
    "Analyze the land cover in this area.",
  ];

  const loadFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleUpload = (e) => loadFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    loadFile(e.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!image || !query.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("query", query);
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the analysis server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden">
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
        @keyframes orbit-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .orbit-ring { animation: orbit-rotate 16s linear infinite; }
        .orbit-ring-slow { animation: orbit-rotate 26s linear infinite reverse; }
      `}</style>

      {/* Global starfield background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#080b18] via-[#0a0e24] to-[#0c1230] overflow-hidden">
        {Array.from({ length: 150 }).map((_, i) => {
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const size = Math.random() * 2.2 + 0.8;
          const delay = Math.random() * 4;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${delay}s infinite`,
              }}
            ></div>
          );
        })}

        {/* Glowing earth-like sphere, bottom right */}
        <div className="absolute -right-40 bottom-0 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 opacity-20 blur-3xl"></div>
        <div className="absolute -right-24 -bottom-24 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 opacity-40 shadow-[0_0_120px_40px_rgba(56,189,248,0.15)]"></div>

        {/* Large faint satellite silhouette, top-left, for depth */}
        <div
          className="absolute -left-20 top-24 opacity-[0.07] pointer-events-none select-none"
          style={{ fontSize: "340px", transform: "rotate(-15deg)" }}
        >
          🛰️
        </div>

        {/* Visible orbiting satellite, top-right — now in the background layer so nothing covers it */}
        <div className="absolute right-10 top-10 w-44 h-44 pointer-events-none hidden md:block">
          <div className="orbit-ring absolute inset-0 rounded-full border border-cyan-300/25">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
              🛰️
            </span>
          </div>
          <div className="orbit-ring-slow absolute inset-8 rounded-full border border-blue-300/20">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-[4px] bg-gradient-to-br from-violet-400 to-violet-600 rotate-45 shadow-md shadow-violet-500/40"></div>
            <div className="absolute left-3 top-0 w-6 h-6 rounded-[5px] bg-gradient-to-br from-indigo-400 to-blue-500 rotate-45 shadow-lg shadow-indigo-500/40"></div>
            <div className="absolute right-0 bottom-0 w-4 h-4 rounded-[3px] bg-gradient-to-br from-blue-400 to-cyan-400 rotate-45 shadow-md shadow-blue-500/40"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              SatQuery AI
            </h1>
            <p className="text-[11px] text-slate-400">
              AI-Powered Satellite Image Analysis
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-300">
            AI Model Ready
          </span>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
        {/* WORKSPACE */}
        <section className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* UPLOAD PANEL */}
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10">
              <h3 className="font-semibold text-white">Satellite Image</h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload an image to begin analysis
              </p>
            </div>

            <div className="p-6">
              {preview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/30 border border-white/10">
                  <img
  src={
    result?.overlay_image
      ? `data:image/png;base64,${result.overlay_image}`
      : preview
  }
  alt="Satellite"
  className="w-full h-full object-cover"
/>
                  {result?.boxes?.map((box, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded-md"
                      style={{
                        left: `${box.x_pct}%`,
                        top: `${box.y_pct}%`,
                        width: `${box.w_pct}%`,
                        height: `${box.h_pct}%`,
                      }}
                    >
                      <div className="absolute -top-7 left-0 bg-cyan-500 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap">
                        {box.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed cursor-pointer transition ${
                    dragActive
                      ? "border-cyan-400 bg-cyan-400/5"
                      : "border-white/20 bg-black/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <div className="text-3xl mb-3">☁️</div>
                  <p className="font-semibold text-slate-200">
                    {dragActive
                      ? "Drop it here"
                      : "Drag & drop your satellite image here"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">or</p>
                  <div className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-500/20">
                    Choose Image
                  </div>
                </label>
              )}

              <div className="mt-5">
                <p className="text-xs font-semibold text-cyan-300 mb-2">
                  Image Requirements
                </p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>✓ JPG, PNG, WEBP formats</li>
                  <li>✓ Max file size: 10MB</li>
                  <li>✓ High resolution recommended</li>
                </ul>
              </div>

              {preview && (
                <label className="block mt-4 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <div className="w-full py-2.5 text-center rounded-lg border border-white/15 text-sm font-medium text-slate-300 hover:bg-white/5 transition">
                    ⟳ Replace Image
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* QUERY PANEL */}
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10">
              <h3 className="font-semibold text-white">Ask SatQuery AI</h3>
              <p className="text-xs text-cyan-300 mt-1">
                Get intelligent insights about your satellite image
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Question
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Identify major water bodies in this image"
                className="w-full h-28 resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition"
              />

              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-400 mb-3">
                  Example Questions
                </p>
                <div className="space-y-2">
                  {examples.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(item)}
                      className="w-full text-left px-3 py-2.5 rounded-lg bg-black/20 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/5 text-xs text-slate-300 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!image || !query.trim() || loading}
                className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition ${
                  !image || !query.trim() || loading
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:opacity-90"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    Analyzing image...
                  </span>
                ) : (
                  "✨ Analyze Image ✨"
                )}
              </button>

              {!image && (
                <p className="text-center text-[11px] text-slate-500 mt-3">
                  Upload an image before running analysis.
                </p>
              )}
              {error && (
                <p className="text-center text-xs text-red-400 mt-3">{error}</p>
              )}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Upload", desc: "Drop in a satellite or aerial image of the area you want analyzed.", icon: "📤" },
              { step: "02", title: "Ask", desc: "Type a natural-language question, or pick one of the examples.", icon: "💬" },
              { step: "03", title: "Detect", desc: "SatQuery AI scans the image and highlights what it finds, live.", icon: "🔍" },
            ].map((s) => (
              <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-500">{s.step}</span>
                </div>
                <p className="font-semibold text-white text-sm">{s.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= RESULTS ================= */}
        <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Analysis Result</h3>
            {result ? (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                ✓ Analysis Complete
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-white/5 text-slate-400 border border-white/10 text-xs font-medium">
                Ready to analyze
              </span>
            )}
          </div>

          {!result ? (
            <p className="text-sm text-slate-500 py-6">AI analysis will appear here...</p>
          ) : (
            <div className="pt-4">
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Query</p>
                <p className="text-sm text-slate-200">{result.query}</p>
              </div>

              {result.mode === "land_cover" ? (
                <>
                  <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 bg-black/20 border border-white/10 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">
                          🗺️
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-cyan-300 uppercase">Detected Feature</p>
                          <h4 className="text-xl font-bold text-white mt-1">Land Cover Classification</h4>
                          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                            This scene is predominantly <strong className="text-slate-200">{result.dominant_class}</strong>, based on color-region classification of the image.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 space-y-3">
                        {result.breakdown.map((b) => (
                          <div key={b.label}>
                            <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                              <span>{b.label}</span>
                              <span>{b.pct}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <p className="text-xs font-semibold text-slate-400 uppercase">Dominant Class</p>
                        <p className="text-2xl font-bold text-white mt-2">{result.dominant_class}</p>
                        <p className="text-xs text-slate-500 mt-1">Live classification result</p>
                      </div>
                      <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-400 uppercase">Confidence</p>
                          <span className="text-lg font-bold text-emerald-400">{result.confidence}%</span>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-cyan-200">
                      <strong>Live detection:</strong> This breakdown was computed from the actual uploaded image using color-based land cover classification — not a demo placeholder.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 bg-black/20 border border-white/10 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">
                          🌊
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-cyan-300 uppercase">Detected Feature</p>
                          <h4 className="text-xl font-bold text-white mt-1">Water Bodies</h4>
                          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                            {result.objects_detected > 0
                              ? `Detected ${result.objects_detected} water region(s), covering approximately ${result.water_coverage_pct}% of the image.`
                              : "No clear water regions were detected in this image."}
                          </p>
                          {result.risk_level && (
  <div
    className="mt-4 px-4 py-2.5 rounded-lg inline-block text-sm font-semibold"
    style={{
      backgroundColor: `${result.risk_color}20`,
      color: result.risk_color,
      border: `1px solid ${result.risk_color}50`,
    }}
  >
    ⚠ {result.risk_level}
  </div>
)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-6">
                        <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-medium">Water Body</span>
                        <span className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-medium">Coverage: {result.water_coverage_pct}%</span>
                        <span className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-medium">Remote Sensing</span>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <p className="text-xs font-semibold text-slate-400 uppercase">Objects Detected</p>
                        <p className="text-3xl font-bold text-white mt-2">{result.objects_detected}</p>
                        <p className="text-xs text-slate-500 mt-1">Live detection result</p>
                      </div>
                      <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-400 uppercase">Confidence</p>
                          <span className="text-lg font-bold text-emerald-400">{result.confidence}%</span>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-cyan-200">
                      <strong>Live detection:</strong> This result was computed from the actual uploaded image using color-based water segmentation — not a demo placeholder. Detected region boxes are drawn at their real position in the image above.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 shrink-0">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-[2px] bg-gradient-to-br from-violet-400 to-violet-600 rotate-45"></div>
              <div className="absolute left-1.5 top-0 w-3.5 h-3.5 rounded-[3px] bg-gradient-to-br from-indigo-400 to-blue-500 rotate-45"></div>
            </div>
            <p className="text-xs text-slate-500 font-medium">SatQuery AI</p>
          </div>
          <p className="text-xs text-slate-500">
            Built with OpenCV, FastAPI &amp; React • Live Detection Prototype
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
