import React, { useState, useEffect } from "react";
import { Activity, ArrowUpRight, Compass, ShieldAlert, CheckCircle2, Play, Globe, Filter, Info, HelpCircle } from "lucide-react";
import { runReverseAttribution, fetchSources, appendLedgerBlock } from "../services/api";

const OCEAN_BASINS = ["All", "Pacific", "Atlantic", "Indian", "Mediterranean", "Black Sea", "Red Sea", "North Sea"];
const RISK_LEVELS  = ["All", "CRITICAL", "HIGH", "MEDIUM"];

export default function SourceAttribution({ onLedgerUpdated }) {
  const [sources,            setSources]           = useState([]);
  const [filteredSources,    setFilteredSources]   = useState([]);
  const [selectedPolymer,    setSelectedPolymer]   = useState("PE");
  const [selectedBasin,      setSelectedBasin]     = useState("All");
  const [selectedRisk,       setSelectedRisk]      = useState("All");
  const [attributionResult,  setAttributionResult] = useState(null);
  const [loading,            setLoading]           = useState(false);
  const [committed,          setCommitted]         = useState(false);
  const [totalTons,          setTotalTons]         = useState(0);

  // Load sources + run initial attribution
  useEffect(() => {
    fetchSources()
      .then(data => {
        if (data.success) {
          setSources(data.sources);
          setFilteredSources(data.sources);
          setTotalTons(data.total_annual_discharge_tons);
        }
      })
      .catch(err => console.error("Sources fetch error:", err));

    executeReverseAttribution("PE");
  }, []);

  // Filter sources by basin and risk
  useEffect(() => {
    let filtered = [...sources];
    if (selectedBasin !== "All") {
      filtered = filtered.filter(s => s.ocean_basin.includes(selectedBasin));
    }
    if (selectedRisk !== "All") {
      filtered = filtered.filter(s => s.risk_level === selectedRisk);
    }
    setFilteredSources(filtered);
  }, [sources, selectedBasin, selectedRisk]);

  const executeReverseAttribution = async (poly = selectedPolymer) => {
    setLoading(true);
    setCommitted(false);
    try {
      const res = await runReverseAttribution([13.08, 80.32], poly);
      if (res.success) setAttributionResult(res.data);
    } catch (err) {
      console.error("Reverse attribution error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitAttribution = async () => {
    if (!attributionResult || committed) return;
    const primary = attributionResult.attributions.find(a => a.is_primary_culprit);
    try {
      await appendLedgerBlock({
        eventType: "PINN_ATTRIBUTION_TRACE",
        location: `Global Backward Trajectory from Lat 13.08, Lon 80.32`,
        summary: `DeepXDE adjoint solver matched ${selectedPolymer} plume to ${primary?.name || "Unknown"} with ${((primary?.confidence || 0) * 100).toFixed(1)}% confidence`,
        attributedParty: primary?.name || "Coastal Entity",
        severity: "CRITICAL",
        payload: { polymer: selectedPolymer, drift_hours: attributionResult.backward_pinn_hours, top_culprit: primary }
      });
      setCommitted(true);
      if (onLedgerUpdated) onLedgerUpdated();
    } catch (err) {
      console.error("Commit error:", err);
    }
  };

  const riskColor = r => ({ CRITICAL: "#f72585", HIGH: "#ffb703", MEDIUM: "#4cc9f0", LOW: "#06d6a0" }[r] || "#fff");
  const maxTons = Math.max(...filteredSources.map(s => s.annual_discharge_tons), 1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px", height: "calc(100vh - 110px)" }}>

      {/* ── Left: Global Source Registry ─────────────────────────── */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
          <div className="badge-glow badge-rose" style={{ marginBottom: "6px" }}>
            <Activity size={12} /> Step 5 • Ocean Forensic Intelligence
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Global Pollution Emitter Registry</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            {sources.length} verified major plastic discharge outfalls and river estuaries worldwide. Combined annual discharge: <strong style={{ color: "var(--accent-amber)" }}>{(totalTons / 1000).toFixed(1)}k tons/yr</strong>.
          </p>
        </div>

        {/* Plain English Explanation */}
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
            🕵️‍♂️ How we find the polluter:
          </strong>
          When plastic is spotted in the ocean, we don't just guess who dumped it. We take the exact polymer type (e.g. PE bags or Nylon nets) and run ocean currents <em>backwards in time</em>. By rewinding fluid drift, we calculate which river or coastal facility was the true origin point.
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={13} style={{ color: "var(--text-muted)" }} />
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Basin:</span>
            <select value={selectedBasin} onChange={e => setSelectedBasin(e.target.value)}
              style={{ background: "rgba(16,30,64,0.8)", color: "#e2e8f0", border: "1px solid var(--border-glass)", borderRadius: "4px", padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", outline: "none" }}>
              {OCEAN_BASINS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Risk:</span>
            <select value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)}
              style={{ background: "rgba(16,30,64,0.8)", color: "#e2e8f0", border: "1px solid var(--border-glass)", borderRadius: "4px", padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", outline: "none" }}>
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            {filteredSources.length} emission sites indexed
          </span>
        </div>

        {/* Source Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {filteredSources.map(src => {
            const barPct = (src.annual_discharge_tons / maxTons) * 100;
            const col = riskColor(src.risk_level);
            return (
              <div key={src.source_id} style={{
                background: "rgba(16,30,64,0.45)",
                border: `1px solid ${col}28`,
                borderLeft: `3px solid ${col}`,
                borderRadius: "8px",
                padding: "12px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.88rem" }}>{src.name}</strong>
                      <span style={{ fontSize: "0.6rem", padding: "2px 7px", borderRadius: "9999px", background: `${col}20`, color: col, border: `1px solid ${col}50`, fontWeight: 700 }}>
                        {src.risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {src.country} • {src.type} • {src.ocean_basin}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: "0.95rem", color: col }}>{src.annual_discharge_tons}t</strong>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>/year discharge</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: "rgba(255,255,255,0.06)", height: "4px", borderRadius: "2px", overflow: "hidden", margin: "6px 0" }}>
                  <div style={{ width: `${barPct}%`, height: "100%", background: col, borderRadius: "2px" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {src.typical_polymers?.map(p => (
                      <span key={p} style={{ fontSize: "0.6rem", padding: "1px 5px", borderRadius: "3px", background: "rgba(0,242,254,0.08)", color: "var(--accent-cyan)", border: "1px solid rgba(0,242,254,0.2)" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {src.cleanup_status || "Active Monitoring"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Forensic Reverse Solver & Attribution Matrix ─── */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        <div>
          <div className="badge-glow badge-cyan" style={{ marginBottom: "6px" }}>
            <Activity size={12} /> Backward-in-Time Solver
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Source Attribution Matrix</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Select an observed plastic polymer to calculate backward ocean drift to the emitter.
          </p>
        </div>

        {/* Polymer selector */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "7px", fontWeight: 600 }}>
            Observed Marine Polymer:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {["PE", "PET", "Nylon", "PVC", "PS", "ABS"].map(p => (
              <button key={p} onClick={() => { setSelectedPolymer(p); executeReverseAttribution(p); }}
                style={{ padding: "8px", borderRadius: "6px", border: selectedPolymer === p ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)", background: selectedPolymer === p ? "rgba(0,242,254,0.15)" : "rgba(255,255,255,0.03)", color: selectedPolymer === p ? "var(--accent-cyan)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Culprit Banner */}
        {attributionResult?.attributions && (
          <div style={{ background: "linear-gradient(135deg, rgba(247,37,133,0.18), rgba(114,9,183,0.18))", border: "1px solid rgba(247,37,133,0.5)", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.65rem", color: "var(--accent-rose)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🎯 Top Attributed Origin
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginTop: "2px" }}>
                {attributionResult.attributions.find(a => a.is_primary_culprit)?.name}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                {attributionResult.attributions.find(a => a.is_primary_culprit)?.country} • {attributionResult.attributions.find(a => a.is_primary_culprit)?.distance_km} km drift path
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
                {((attributionResult.attributions.find(a => a.is_primary_culprit)?.confidence || 0) * 100).toFixed(1)}%
              </div>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Match Certainty</span>
            </div>
          </div>
        )}

        {/* Ranked Candidates */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
          {attributionResult?.attributions?.map(src => (
            <div key={src.source_id} style={{ background: "rgba(16,30,64,0.5)", border: src.is_primary_culprit ? "1px solid var(--accent-rose)" : "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ fontSize: "0.85rem" }}>{src.name}</strong>
                  {src.polymer_match && (
                    <span style={{ fontSize: "0.6rem", padding: "2px 6px", borderRadius: "9999px", background: "rgba(6,214,160,0.12)", color: "var(--accent-emerald)", border: "1px solid rgba(6,214,160,0.3)" }}>
                      Polymer ✓
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {src.country} • {src.distance_km} km • {src.transport_hours}h drift
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: src.is_primary_culprit ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                  {((src.confidence || 0) * 100).toFixed(1)}%
                </div>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Probability</span>
              </div>
            </div>
          ))}
        </div>

        {/* Explanatory Seal Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button onClick={handleCommitAttribution} disabled={committed || !attributionResult} className="btn-glow-cyan"
            style={{ justifyContent: "center", padding: "11px", background: committed ? "rgba(6,214,160,0.2)" : undefined, borderColor: committed ? "var(--accent-emerald)" : undefined, color: committed ? "var(--accent-emerald)" : undefined }}>
            {committed
              ? <><CheckCircle2 size={16} /> Attribution Sealed to Cryptographic Ledger</>
              : <><ShieldAlert size={16} /> Lock Evidence in Tamper-Proof Ledger</>}
          </button>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" }}>
            Creates an immutable SHA-256 block for environmental regulators.
          </span>
        </div>
      </div>
    </div>
  );
}
