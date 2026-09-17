import React, { useState, useEffect } from "react";
import { Activity, ArrowUpRight, Compass, ShieldAlert, CheckCircle2, Play } from "lucide-react";
import { runReverseAttribution, fetchSources, appendLedgerBlock } from "../services/api";

export default function SourceAttribution({ onLedgerUpdated }) {
  const [sources, setSources] = useState([]);
  const [selectedPolymer, setSelectedPolymer] = useState("PE");
  const [attributionResult, setAttributionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    fetchSources()
      .then((data) => {
        if (data.success) setSources(data.sources);
      })
      .catch((err) => console.error("Sources fetch error:", err));

    executeReverseAttribution("PE");
  }, []);

  const executeReverseAttribution = async (poly = selectedPolymer) => {
    setLoading(true);
    setCommitted(false);
    try {
      const res = await runReverseAttribution([13.08, 80.32], poly);
      if (res.success) {
        setAttributionResult(res.data);
      }
    } catch (err) {
      console.error("Reverse attribution error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitAttribution = async () => {
    if (!attributionResult || committed) return;
    const primary = attributionResult.attributions.find((a) => a.is_primary_culprit);
    try {
      await appendLedgerBlock({
        eventType: "PINN_ATTRIBUTION_TRACE",
        location: `Backward Trajectory from Lat 13.08, Lon 80.32`,
        summary: `DeepXDE adjoint solver matched ${selectedPolymer} plume to ${primary?.name || "Unknown Source"} with ${(primary?.confidence * 100).toFixed(1)}% confidence`,
        attributedParty: primary?.name || "Coastal Entity",
        severity: "CRITICAL",
        payload: {
          polymer: selectedPolymer,
          drift_hours: attributionResult.backward_pinn_hours,
          top_culprit: primary
        }
      });
      setCommitted(true);
      if (onLedgerUpdated) onLedgerUpdated();
    } catch (err) {
      console.error("Commit error:", err);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px", height: "calc(100vh - 120px)" }}>
      {/* Attribution Table & Ranked Emitters */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
          <div>
            <div className="badge-glow badge-rose" style={{ marginBottom: "6px" }}>
              <Activity size={12} /> Inverse Adjoint Hydrodynamics
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>DeepXDE Backward-in-Time Source Attribution</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Tracks observed marine plumes back to origin using hydrodynamic current fields.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Observed Polymer:</span>
            {["PE", "PET", "Nylon", "PVC"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPolymer(p);
                  executeReverseAttribution(p);
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: selectedPolymer === p ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                  background: selectedPolymer === p ? "rgba(0, 242, 254, 0.15)" : "transparent",
                  color: selectedPolymer === p ? "var(--accent-cyan)" : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Top Attributed Culprit Banner */}
        {attributionResult?.attributions && (
          <div style={{
            background: "linear-gradient(135deg, rgba(247, 37, 133, 0.15), rgba(114, 9, 183, 0.15))",
            border: "1px solid rgba(247, 37, 133, 0.4)",
            borderRadius: "var(--radius-sm)",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span className="badge-glow badge-rose" style={{ fontSize: "0.65rem", marginBottom: "6px" }}>
                Primary Attributed Emitter
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff" }}>
                {attributionResult.attributions.find((a) => a.is_primary_culprit)?.name}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Type: {attributionResult.attributions.find((a) => a.is_primary_culprit)?.type} • Drift Distance: {attributionResult.attributions.find((a) => a.is_primary_culprit)?.distance_km} km
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-rose)", fontFamily: "JetBrains Mono" }}>
                {((attributionResult.attributions.find((a) => a.is_primary_culprit)?.confidence || 0.9) * 100).toFixed(1)}%
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PINN Probability</span>
            </div>
          </div>
        )}

        {/* Ranked Candidate Sources List */}
        <div>
          <h4 style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", marginBottom: "10px", textTransform: "uppercase" }}>
            Candidate Inflow Attribution Matrix
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {attributionResult?.attributions?.map((src) => (
              <div
                key={src.source_id}
                style={{
                  background: "rgba(16, 30, 64, 0.5)",
                  border: src.is_primary_culprit ? "1px solid var(--accent-rose)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <strong style={{ fontSize: "0.95rem" }}>{src.name}</strong>
                    <span className="badge-glow badge-cyan" style={{ fontSize: "0.65rem" }}>
                      {src.type}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Source ID: {src.source_id} • Distance to Plume: {src.distance_km} km
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: src.is_primary_culprit ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                    {(src.confidence * 100).toFixed(1)}%
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Adjoint Likelihood</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action and Surveillance Panel */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div className="badge-glow badge-emerald" style={{ marginBottom: "6px" }}>
            Regulatory Enforcement
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Ledger Attribution Audit</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Cryptographically seal source attribution for compliance reporting.
          </p>
        </div>

        <div style={{
          background: "rgba(3, 8, 22, 0.6)",
          padding: "16px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-glass)",
          fontSize: "0.8rem",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Inverse Time Window:</span>
            <strong>36 Hours Adjoint</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Stokes Gravity Model:</span>
            <strong>Coupled Density Decoupling</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Attribution Standard:</span>
            <strong>UNEP Marine Plastic Audit v2</strong>
          </div>
        </div>

        <button
          onClick={handleCommitAttribution}
          disabled={committed}
          className="btn-glow-cyan"
          style={{
            marginTop: "auto",
            justifyContent: "center",
            background: committed ? "rgba(6, 214, 160, 0.2)" : undefined,
            borderColor: committed ? "var(--accent-emerald)" : undefined,
            color: committed ? "var(--accent-emerald)" : undefined
          }}
        >
          {committed ? (
            <>
              <CheckCircle2 size={16} /> Attribution Sealed to Cryptographic Ledger
            </>
          ) : (
            <>
              <ShieldAlert size={16} /> Seal Attribution Block in Plastic Ledger
            </>
          )}
        </button>
      </div>
    </div>
  );
}
