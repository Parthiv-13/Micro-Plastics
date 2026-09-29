import React, { useState, useEffect } from "react";
import { Satellite, Sliders, Play, CheckCircle2, ShieldAlert, Cpu, Info, Sparkles, HelpCircle } from "lucide-react";
import { fetchSatelliteOverview, computeFDI } from "../services/api";

export default function SatelliteViewer() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Spectral Calculator states
  const [redVal, setRedVal] = useState(0.025);
  const [nirVal, setNirVal] = useState(0.095);
  const [swirVal, setSwirVal] = useState(0.035);
  const [sensorType, setSensorType] = useState("Sentinel-2 MSI");
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    fetchSatelliteOverview()
      .then((data) => {
        setOverview(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Satellite overview error:", err);
        setLoading(false);
      });
  }, []);

  const handleComputeFDI = async () => {
    try {
      const res = await computeFDI({
        red: parseFloat(redVal),
        nir: parseFloat(nirVal),
        swir1: parseFloat(swirVal),
        sensor: sensorType
      });
      setCalcResult(res);
    } catch (err) {
      console.error("Compute FDI error:", err);
    }
  };

  useEffect(() => {
    handleComputeFDI();
  }, [redVal, nirVal, swirVal, sensorType]);

  // Quick preset triggers
  const applyPreset = (type) => {
    if (type === "plastic") {
      setRedVal(0.032);
      setNirVal(0.185);
      setSwirVal(0.038);
    } else if (type === "algae") {
      setRedVal(0.022);
      setNirVal(0.092);
      setSwirVal(0.035);
    } else if (type === "clean") {
      setRedVal(0.012);
      setNirVal(0.025);
      setSwirVal(0.015);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "20px", height: "calc(100vh - 110px)" }}>
      {/* Multispectral Passes & Cross-Sensor Comparison */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        <div>
          <div className="badge-glow badge-cyan" style={{ marginBottom: "6px" }}>
            <Satellite size={12} /> Step 4 • Earth Observation Remote Sensing
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Sentinel-2 & Landsat-9 Multispectral Pipeline</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Satellite spectral anomaly detection monitoring marine floating plastic patches from space.
          </p>
        </div>

        {/* Plain English Satellite Explainer */}
        <div style={{
          background: "rgba(0, 242, 254, 0.08)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          borderRadius: "8px",
          padding: "14px",
          fontSize: "0.78rem",
          lineHeight: 1.5,
          color: "#e2e8f0"
        }}>
          <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "4px" }}>
            🛰️ How satellites spot plastic from 786 km in orbit:
          </strong>
          Clean seawater absorbs almost all infrared light and looks completely dark. Floating plastic, however, reflects infrared light strongly! Our system analyzes Near-Infrared (NIR) and Shortwave-Infrared (SWIR) bands to calculate the Floating Debris Index (FDI), detecting marine garbage patches automatically.
        </div>

        {/* Side-by-Side Satellite Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Sentinel-2 Card */}
          <div style={{
            background: "rgba(16, 30, 64, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(0, 242, 254, 0.3)",
            padding: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, color: "var(--accent-cyan)", fontSize: "0.95rem" }}>
                Copernicus Sentinel-2B
              </span>
              <span className="badge-glow badge-cyan" style={{ fontSize: "0.65rem" }}>10m - 20m Res</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              ESA European Space Agency • Tile: {overview?.sentinel2?.tile_id || "T44VNR"} • Cloud: {overview?.sentinel2?.cloud_cover_percent || "2.8"}%
            </p>

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Target Indices:</span>
                <strong>FDI, NDVI, Plastic Index</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Debris Hotspots:</span>
                <strong style={{ color: "var(--accent-rose)" }}>
                  {overview?.sentinel2?.total_anomalies_detected || 4} Detected
                </strong>
              </div>
            </div>
          </div>

          {/* Landsat-9 Card */}
          <div style={{
            background: "rgba(16, 30, 64, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 183, 3, 0.3)",
            padding: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, color: "var(--accent-amber)", fontSize: "0.95rem" }}>
                USGS / NASA Landsat-9
              </span>
              <span className="badge-glow badge-amber" style={{ fontSize: "0.65rem" }}>30m Res</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              USGS Earth Observation • Path/Row: {overview?.landsat9?.path_row || "142_051"}
            </p>

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Cross-Calibration:</span>
                <strong style={{ color: "var(--accent-emerald)" }}>Harmonized with MSI</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Surface Clusters:</span>
                <strong style={{ color: "var(--accent-amber)" }}>
                  {overview?.landsat9?.detected_clusters?.length || 4} Clusters
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Detected Marine Hotspots Table */}
        <div style={{ marginTop: "6px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", margin: 0, textTransform: "uppercase" }}>
              Spectral Floating Debris Detections
            </h4>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              High FDI (&gt;0.03) + Low NDVI indicates confirmed plastic
            </span>
          </div>

          <div style={{
            background: "rgba(3, 8, 22, 0.6)",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Anomaly ID</th>
                  <th style={{ padding: "10px" }}>Coordinates</th>
                  <th style={{ padding: "10px" }}>FDI Value</th>
                  <th style={{ padding: "10px" }}>Plant Index (NDVI)</th>
                  <th style={{ padding: "10px" }}>Classification</th>
                  <th style={{ padding: "10px" }}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "S2-HOTSPOT-001", coords: "13.10°N, 80.35°E", fdi: "0.0845", ndvi: "0.042", cat: "PLASTIC", conf: "94%" },
                  { id: "S2-HOTSPOT-002", coords: "12.85°N, 80.24°E", fdi: "0.0620", ndvi: "0.038", cat: "PLASTIC", conf: "89%" },
                  { id: "L9-HOTSPOT-003", coords: "35.48°N, -148.22°W", fdi: "0.1140", ndvi: "0.015", cat: "PLASTIC", conf: "98%" },
                  { id: "S2-ALGAE-004",   coords: "13.02°N, 80.30°E", fdi: "0.0510", ndvi: "0.420", cat: "SARGASSUM", conf: "91%" },
                ].map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "10px", fontWeight: 700, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                      {row.id}
                    </td>
                    <td style={{ padding: "10px" }}>{row.coords}</td>
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      {row.fdi}
                    </td>
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)" }}>{row.ndvi}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background: row.cat === "PLASTIC" ? "rgba(247, 37, 133, 0.2)" : "rgba(6, 214, 160, 0.2)",
                        color: row.cat === "PLASTIC" ? "var(--accent-rose)" : "var(--accent-emerald)",
                        border: `1px solid ${row.cat === "PLASTIC" ? "rgba(247, 37, 133, 0.4)" : "rgba(6, 214, 160, 0.4)"}`
                      }}>
                        {row.cat}
                      </span>
                    </td>
                    <td style={{ padding: "10px", fontWeight: 700, color: "var(--accent-emerald)" }}>{row.conf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Spectral Calculator & Interactive Simulator */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        <div>
          <div className="badge-glow badge-rose" style={{ marginBottom: "6px" }}>
            <Sliders size={12} /> Interactive Spectral Lab
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>FDI Spectral Simulator</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Test how different wavelengths distinguish synthetic plastics from seaweed.
          </p>
        </div>

        {/* Quick Simulation Presets */}
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Try Quick Presets:
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              onClick={() => applyPreset("plastic")}
              className="btn-outline"
              style={{ padding: "7px", fontSize: "0.72rem", borderColor: "rgba(247, 37, 133, 0.5)", color: "var(--accent-rose)" }}
            >
              🧴 Plastic Slick
            </button>
            <button
              onClick={() => applyPreset("algae")}
              className="btn-outline"
              style={{ padding: "7px", fontSize: "0.72rem", borderColor: "rgba(6, 214, 160, 0.5)", color: "var(--accent-emerald)" }}
            >
              🌿 Seaweed / Algae
            </button>
          </div>
        </div>

        {/* Sensor selector */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["Sentinel-2 MSI", "Landsat-9 OLI-2"].map((s) => (
            <button
              key={s}
              onClick={() => setSensorType(s)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: sensorType === s ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                background: sensorType === s ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: sensorType === s ? "var(--accent-cyan)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer"
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sliders with Wavelength Descriptions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.78rem" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>
                Visible Red (665 nm) • <span style={{ color: "var(--text-muted)" }}>Water absorbs</span>
              </span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{redVal}</strong>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.08"
              step="0.001"
              value={redVal}
              onChange={(e) => setRedVal(e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent-rose)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>
                Near-Infrared NIR (842 nm) • <span style={{ color: "var(--accent-cyan)" }}>Plastic reflects!</span>
              </span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{nirVal}</strong>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.25"
              step="0.002"
              value={nirVal}
              onChange={(e) => setNirVal(e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>
                Shortwave-IR SWIR (1610 nm) • <span style={{ color: "var(--text-muted)" }}>Haze baseline</span>
              </span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{swirVal}</strong>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.001"
              value={swirVal}
              onChange={(e) => setSwirVal(e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent-emerald)" }}
            />
          </div>
        </div>

        {/* Spectral Calculation Output */}
        {calcResult && (
          <div style={{
            background: "rgba(16, 30, 64, 0.6)",
            border: "1px solid var(--border-glass)",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Computed FDI Index:</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                {calcResult.fdi}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Plastic Index (PI):</span>
              <strong style={{ fontSize: "0.95rem", color: "var(--accent-emerald)", fontFamily: "var(--font-mono)" }}>
                {calcResult.plastic_index}
              </strong>
            </div>

            <div style={{
              background: calcResult.classification?.includes("Plastic") ? "rgba(247, 37, 133, 0.18)" : "rgba(6, 214, 160, 0.15)",
              border: `1px solid ${calcResult.classification?.includes("Plastic") ? "var(--accent-rose)" : "var(--accent-emerald)"}`,
              borderRadius: "6px",
              padding: "10px",
              fontSize: "0.85rem",
              fontWeight: 700,
              textAlign: "center",
              marginTop: "4px",
              color: calcResult.classification?.includes("Plastic") ? "var(--accent-rose)" : "var(--accent-emerald)"
            }}>
              {calcResult.classification?.includes("Plastic") ? "🚨 Confirmed Floating Plastic Debris" : `🌿 ${calcResult.classification}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
