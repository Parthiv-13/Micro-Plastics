import React, { useState, useEffect } from "react";
import { Waves, Play, Info, HelpCircle, CheckCircle2, Compass, ArrowRight, ShieldCheck } from "lucide-react";
import { runPINNSimulation } from "../services/api";

const POLYMER_DETAILS = {
  PE:    { name: "Polyethylene", usage: "Shopping bags, plastic wraps, milk jugs", float: "Floats on Surface", density: "0.92 g/cm³", color: "#00f2fe" },
  PS:    { name: "Polystyrene", usage: "Styrofoam cups, food packaging, buoys", float: "Floats near Surface", density: "1.04 g/cm³", color: "#4cc9f0" },
  ABS:   { name: "ABS Polymer", usage: "Electronic casings, toys, automotive parts", float: "Neutral Drift", density: "1.07 g/cm³", color: "#7209b7" },
  Nylon: { name: "Nylon / Polyamide", usage: "Commercial fishing nets, monofilament line", float: "Sinks to Ocean Floor", density: "1.14 g/cm³", color: "#ffb703" },
  PET:   { name: "PET Polyester", usage: "Single-use water bottles, soda containers", float: "Sinks to Marine Sediment", density: "1.38 g/cm³", color: "#f72585" },
  PVC:   { name: "PVC Vinyl", usage: "Plumbing pipes, synthetic vinyl tile", float: "Heavy Sinking to Abyss", density: "1.45 g/cm³", color: "#e63946" }
};

export default function DeepXDESimulator({ selectedHotspot }) {
  const [polymer, setPolymer] = useState(selectedHotspot?.polymer || "PE");
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [selectedTimestep, setSelectedTimestep] = useState(24);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const currentPolymerInfo = POLYMER_DETAILS[polymer] || POLYMER_DETAILS.PE;

  const executeSimulation = async () => {
    setLoading(true);
    try {
      const res = await runPINNSimulation(polymer, 12.92, 80.25);
      if (res.success || res.physics_model) {
        setSimResult(res.data || res);
      }
    } catch (err) {
      console.error("PINN simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation();
  }, [polymer]);

  const selectedStepData = simResult?.trajectory?.find(s => s.time_hours === selectedTimestep) || simResult?.trajectory?.[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", height: "calc(100vh - 110px)" }}>
      {/* Parameter Control Panel */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        <div>
          <div className="badge-glow badge-cyan" style={{ marginBottom: "6px" }}>
            <Waves size={12} /> Step 3 • Ocean Hydrodynamic AI
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>DeepXDE Drift Physics</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Physics-Informed Neural Network solving how plastics move, disperse, and settle in sea currents.
          </p>
        </div>

        {/* Plain-English Goal Card */}
        <div style={{
          background: "rgba(0, 242, 254, 0.08)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "0.78rem",
          lineHeight: 1.5,
          color: "#e2e8f0"
        }}>
          <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "4px" }}>
            🎯 What this solves:
          </strong>
          When plastic is dumped into the sea, does it float across continents or sink to the seafloor? Our neural network computes the fluid mechanics to forecast its drift trail over 4 days.
        </div>

        {/* Polymer Selection with Everyday Meanings */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Choose Plastic Type:
            </label>
            <span style={{ fontSize: "0.7rem", color: "var(--accent-cyan)" }}>
              Seawater = 1.025 g/cm³
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {Object.entries(POLYMER_DETAILS).map(([p, info]) => {
              const isSelected = polymer === p;
              return (
                <button
                  key={p}
                  onClick={() => setPolymer(p)}
                  style={{
                    padding: "9px 10px",
                    borderRadius: "8px",
                    border: isSelected ? `1px solid ${info.color}` : "1px solid var(--border-subtle)",
                    background: isSelected ? `${info.color}20` : "rgba(255, 255, 255, 0.02)",
                    color: isSelected ? info.color : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{p}</span>
                    <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>{info.density}</span>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 400 }}>
                    {p === "PE" && "Bags & Bottles"}
                    {p === "PS" && "Styrofoam"}
                    {p === "ABS" && "Hard Cases"}
                    {p === "Nylon" && "Fishing Nets"}
                    {p === "PET" && "Water Bottles"}
                    {p === "PVC" && "Pipes & Vinyl"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Polymer Behavior Summary */}
        <div style={{
          background: "rgba(16, 30, 64, 0.6)",
          padding: "12px",
          borderRadius: "8px",
          border: `1px solid ${currentPolymerInfo.color}40`,
          fontSize: "0.78rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>Material:</span>
            <strong style={{ color: currentPolymerInfo.color }}>{currentPolymerInfo.name}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>Common Usage:</span>
            <span>{currentPolymerInfo.usage}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>Fate in Ocean:</span>
            <strong style={{ color: currentPolymerInfo.color }}>{currentPolymerInfo.float}</strong>
          </div>
          {simResult && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Vertical Stokes Velocity:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                {simResult.stokes_velocity_m_s} m/s
              </span>
            </div>
          )}
        </div>

        {/* Governing PDE Formula Card with Toggleable Explanation */}
        <div style={{
          background: "rgba(3, 8, 22, 0.7)",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--border-glass)",
          fontSize: "0.78rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Hydrodynamic Equation
            </span>
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              style={{ background: "none", border: "none", color: "var(--accent-cyan)", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <HelpCircle size={12} /> {showFormulaDetails ? "Hide" : "Explain"}
            </button>
          </div>

          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            color: "var(--accent-cyan)",
            padding: "6px",
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "4px",
            textAlign: "center"
          }}>
            ∂C/∂t + u·∇C = K_h·∇²C - w_s·(∂C/∂z) + S
          </div>

          {showFormulaDetails && (
            <div style={{ marginTop: "10px", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.5, borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
              <p style={{ margin: "2px 0" }}>• <strong>u·∇C (Currents):</strong> Water flow carries the trash horizontally.</p>
              <p style={{ margin: "2px 0" }}>• <strong>K_h·∇²C (Diffusion):</strong> Wave turbulence scatters the plastic outward.</p>
              <p style={{ margin: "2px 0" }}>• <strong>w_s·∂C/∂z (Settling):</strong> Gravity sinks heavy plastics down to the seabed.</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={executeSimulation}
          disabled={loading}
          className="btn-glow-cyan"
          style={{ width: "100%", justifyContent: "center", marginTop: "auto", padding: "10px" }}
        >
          <Play size={14} /> {loading ? "Computing Neural Ocean Physics..." : "Recompute PINN Trajectory"}
        </button>
      </div>

      {/* Trajectory & Plume Visualization View */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        {/* Header with Convergence Metrics */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Advection-Diffusion Plume Dispersion</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              DeepXDE L-BFGS-B Neural Optimization • 5,000 Training Epochs
            </p>
          </div>

          {simResult?.pinn_convergence && (
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="badge-glow badge-emerald" style={{ fontSize: "0.7rem" }}>
                Physics Loss: {simResult.pinn_convergence.pde_residual_loss?.toExponential(2)}
              </div>
              <div className="badge-glow badge-cyan" style={{ fontSize: "0.7rem" }}>
                Data Loss: {simResult.pinn_convergence.data_loss?.toExponential(2)}
              </div>
            </div>
          )}
        </div>

        {/* Selected Timestep Overview Banner */}
        {selectedStepData && (
          <div style={{
            background: "linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(79, 172, 254, 0.08))",
            border: "1px solid rgba(0, 242, 254, 0.3)",
            borderRadius: "10px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-cyan)", fontWeight: 700 }}>
                Trajectory Forecast at T + {selectedStepData.time_hours} Hours
              </span>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                Plume Spread Radius: <span style={{ color: "var(--accent-cyan)" }}>{selectedStepData.dispersion_radius_meters} meters</span> wide
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                Center GPS: {selectedStepData.lat.toFixed(4)}°N, {selectedStepData.lon.toFixed(4)}°E • Concentration: {selectedStepData.peak_concentration} particles/m³
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                {selectedStepData.peak_concentration}
              </div>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Particles / m³</span>
            </div>
          </div>
        )}

        {/* Trajectory Timestep Cards */}
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
            Click a timeline card to view that stage of drift:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {simResult?.trajectory?.map((step) => {
              const isSel = selectedTimestep === step.time_hours;
              return (
                <div
                  key={step.time_hours}
                  onClick={() => setSelectedTimestep(step.time_hours)}
                  style={{
                    background: isSel ? "rgba(0, 242, 254, 0.18)" : "rgba(255, 255, 255, 0.02)",
                    border: isSel ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "12px 10px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSel ? "0 0 14px rgba(0, 242, 254, 0.2)" : "none"
                  }}
                >
                  <div style={{ fontSize: "0.72rem", color: isSel ? "var(--accent-cyan)" : "var(--text-muted)", fontWeight: 700 }}>
                    T + {step.time_hours}h
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "4px" }}>
                    {step.dispersion_radius_meters} m
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Spread Width
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trajectory Coordinates Table */}
        <div style={{
          flex: 1,
          background: "rgba(3, 8, 22, 0.6)",
          borderRadius: "8px",
          border: "1px solid var(--border-glass)",
          overflowY: "auto",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", margin: 0, textTransform: "uppercase" }}>
              Simulated Lagrangian Drift Coordinates
            </h4>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Step-by-step GPS location & dilution rate
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "8px" }}>Time (hrs)</th>
                <th style={{ padding: "8px" }}>Latitude</th>
                <th style={{ padding: "8px" }}>Longitude</th>
                <th style={{ padding: "8px" }}>Peak Conc. (pts/m³)</th>
                <th style={{ padding: "8px" }}>Dispersion (m)</th>
              </tr>
            </thead>
            <tbody>
              {simResult?.trajectory?.map((row) => (
                <tr
                  key={row.time_hours}
                  onClick={() => setSelectedTimestep(row.time_hours)}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                    background: selectedTimestep === row.time_hours ? "rgba(0, 242, 254, 0.08)" : "transparent",
                    cursor: "pointer"
                  }}
                >
                  <td style={{ padding: "10px 8px", fontWeight: 600 }}>T + {row.time_hours}h</td>
                  <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)" }}>{row.lat.toFixed(4)}</td>
                  <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)" }}>{row.lon.toFixed(4)}</td>
                  <td style={{ padding: "10px 8px", color: "var(--accent-emerald)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {row.peak_concentration}
                  </td>
                  <td style={{ padding: "10px 8px" }}>{row.dispersion_radius_meters} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
