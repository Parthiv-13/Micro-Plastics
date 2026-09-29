import React, { useState } from "react";
import { 
  Satellite, Waves, ShieldCheck, Microscope, Compass, Activity, 
  HelpCircle, Sparkles, BookOpen 
} from "lucide-react";
import GuideModal from "./GuideModal";

export default function Navbar({ activeTab, setActiveTab, healthData }) {
  const [guideOpen, setGuideOpen] = useState(false);

  const navItems = [
    { id: "map",         step: "01", label: "Global Map",       sub: "Hotspots & Gyres",      icon: Compass },
    { id: "vision",      step: "02", label: "AI Vision",        sub: "SegFormer Microplastics", icon: Microscope },
    { id: "pinn",        step: "03", label: "Physics AI",       sub: "DeepXDE Drift PDE",     icon: Waves },
    { id: "satellite",   step: "04", label: "Satellites",       sub: "Sentinel-2 & Landsat",  icon: Satellite },
    { id: "attribution", step: "05", label: "Polluter Trace",   sub: "Reverse Adjoint Flow",  icon: Activity },
    { id: "ledger",      step: "06", label: "Audit Ledger",     sub: "SHA-256 Blockchain",   icon: ShieldCheck },
  ];

  return (
    <>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid var(--border-glass)",
        background: "rgba(7, 13, 30, 0.92)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        gap: "16px"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #00f2fe, #4facfe)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(0, 242, 254, 0.35)",
            flexShrink: 0
          }}>
            <Waves size={22} color="#030816" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                PLASTIC<span style={{ color: "var(--accent-cyan)" }}>LEDGER</span>
              </h1>
              <span className="badge-glow badge-cyan" style={{ fontSize: "0.6rem", padding: "2px 6px" }}>
                AI • PINN • GIS
              </span>
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0, whiteSpace: "nowrap" }}>
              Autonomous Marine Microplastic Intelligence
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          overflowX: "auto",
          padding: "2px 0"
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={`${item.label} — ${item.sub}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: isActive ? "1px solid var(--accent-cyan)" : "1px solid transparent",
                  background: isActive ? "rgba(0, 242, 254, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 0 12px rgba(0, 242, 254, 0.2)" : "none"
                }}
              >
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: isActive ? "var(--accent-cyan)" : "var(--text-muted)",
                  background: isActive ? "rgba(0, 242, 254, 0.18)" : "rgba(255, 255, 255, 0.05)",
                  padding: "1px 5px",
                  borderRadius: "4px"
                }}>
                  {item.step}
                </span>
                <Icon size={14} style={{ color: isActive ? "var(--accent-cyan)" : "var(--text-muted)" }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & System Guide */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Guide Explainer Button */}
          <button
            onClick={() => setGuideOpen(true)}
            className="btn-glow-cyan"
            style={{
              padding: "7px 14px",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            <BookOpen size={14} />
            <span>How It Works</span>
          </button>

          {/* Live Engine Status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            background: "rgba(16, 30, 64, 0.7)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "9999px",
            fontSize: "0.72rem",
            whiteSpace: "nowrap"
          }}>
            <span className="pulse-dot" />
            <span style={{ color: "var(--text-secondary)" }}>
              Engine: <strong style={{ color: "#fff" }}>{healthData?.database?.database || "Ready"}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Interactive Walkthrough Modal */}
      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
