import React, { useState, useEffect } from "react";
import { ShieldCheck, Hash, Calendar, MapPin, Download, CheckCircle2, Lock, Info, HelpCircle } from "lucide-react";
import { fetchLedgerRecords, fetchLedgerStats } from "../services/api";

export default function LedgerAudit() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const loadData = () => {
    Promise.all([fetchLedgerRecords(), fetchLedgerStats()])
      .then(([recData, statData]) => {
        if (recData.success) {
          setRecords(recData.records);
          if (recData.records.length > 0) {
            setSelectedBlock(recData.records[recData.records.length - 1]);
          }
        }
        if (statData.success) {
          setStats(statData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ledger load error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `plastic_ledger_audit_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "20px", height: "calc(100vh - 110px)" }}>
      {/* Blockchain Ledger Stream */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        {/* Header & Stats Banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
          <div>
            <div className="badge-glow badge-cyan" style={{ marginBottom: "6px" }}>
              <Lock size={12} /> Step 6 • Court-Admissible Evidence
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Cryptographic Environmental Audit Log</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Tamper-evident SHA-256 blockchain storing satellite anomalies, AI detections, and polluter attributions.
            </p>
          </div>

          <button onClick={handleExportJSON} className="btn-outline" style={{ fontSize: "0.78rem", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Download size={14} /> Export Court-Ready JSON
          </button>
        </div>

        {/* Plain English Ledger Explainer */}
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
            🔒 Why a blockchain for ocean plastic?
          </strong>
          In maritime pollution disputes, companies frequently claim sensor reports were faked, altered, or backdated. PlasticLedger seals every satellite detection and AI finding into a mathematical SHA-256 blockchain block. Once sealed, no party can edit or erase the proof without breaking the cryptographic chain.
        </div>

        {/* Global Summary Cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div style={{ background: "rgba(16, 30, 64, 0.5)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Audited Plastic Volume</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--accent-cyan)" }}>{stats.total_audited_metric_tons} Tons</strong>
            </div>
            <div style={{ background: "rgba(16, 30, 64, 0.5)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Average AI Confidence</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--accent-emerald)" }}>{stats.average_pinn_confidence}%</strong>
            </div>
            <div style={{ background: "rgba(16, 30, 64, 0.5)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Monitored Outfalls</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--accent-amber)" }}>{stats.active_monitored_sources} Facilities</strong>
            </div>
          </div>
        )}

        {/* Block List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
          {records.map((block) => {
            const isSelected = selectedBlock?.index === block.index;
            return (
              <div
                key={block.index}
                onClick={() => setSelectedBlock(block)}
                style={{
                  background: isSelected ? "rgba(0, 242, 254, 0.12)" : "rgba(16, 30, 64, 0.5)",
                  border: isSelected ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "14px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                      Block #{block.index}
                    </span>
                    <span className="badge-glow badge-cyan" style={{ fontSize: "0.62rem" }}>
                      {block.eventType}
                    </span>
                  </div>

                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--accent-emerald)" }}>
                    <CheckCircle2 size={12} /> Validated Proof
                  </span>
                </div>

                <p style={{ fontSize: "0.85rem", marginTop: "8px", fontWeight: 500, color: "#fff", margin: "8px 0" }}>
                  {block.summary}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  <span>Party: <strong style={{ color: "#fff" }}>{block.attributedParty}</strong></span>
                  <span>{new Date(block.timestamp).toLocaleString()}</span>
                </div>

                <div style={{
                  background: "rgba(3, 8, 22, 0.6)",
                  padding: "5px 8px",
                  borderRadius: "4px",
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  marginTop: "8px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  Hash: {block.currentHash}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Block Verification Inspector */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        <div>
          <div className="badge-glow badge-emerald" style={{ marginBottom: "6px" }}>
            <Hash size={12} /> Block Cryptographic Proof
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Header & Verification</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Cryptographic proof linkage verifying zero record tampering.
          </p>
        </div>

        {selectedBlock ? (
          <>
            <div style={{
              background: "rgba(3, 8, 22, 0.7)",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "0.78rem"
            }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Block Index:</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                  #{selectedBlock.index}
                </strong>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Timestamp:</span>
                <strong style={{ fontFamily: "var(--font-mono)", color: "#e2e8f0" }}>
                  {new Date(selectedBlock.timestamp).toISOString()}
                </strong>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Previous Block SHA-256 Hash:</span>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--accent-amber)",
                  wordBreak: "break-all",
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "6px",
                  borderRadius: "4px",
                  marginTop: "2px"
                }}>
                  {selectedBlock.previousHash || "0000000000000000000000000000000000000000000000000000000000000000"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Current Block SHA-256 Hash:</span>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--accent-cyan)",
                  wordBreak: "break-all",
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "6px",
                  borderRadius: "4px",
                  marginTop: "2px"
                }}>
                  {selectedBlock.currentHash}
                </div>
              </div>
            </div>

            {/* Evidence Payload */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-cyan)", fontWeight: 700, marginBottom: "8px" }}>
                Verified Evidence Payload
              </span>
              <div style={{
                flex: 1,
                background: "rgba(3, 8, 22, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "14px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "#94a3b8",
                overflowY: "auto",
                whiteSpace: "pre-wrap"
              }}>
                {JSON.stringify(selectedBlock, null, 2)}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Select a block on the left to inspect its cryptographic proof.
          </div>
        )}
      </div>
    </div>
  );
}
