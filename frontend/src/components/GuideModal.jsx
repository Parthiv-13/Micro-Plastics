import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Compass, Microscope, Waves, Satellite, Activity, ShieldCheck, 
  ArrowRight, Sparkles, HelpCircle, CheckCircle2, ChevronRight, Info
} from "lucide-react";

export default function GuideModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const PIPELINE_STEPS = [
    {
      id: "overview",
      badge: "The Big Picture",
      icon: Sparkles,
      color: "#00f2fe",
      title: "What is PlasticLedger?",
      tagline: "An end-to-end intelligence system to find, identify, track, and legally prove ocean plastic pollution.",
      explanation: `Over 14 million tons of plastic enter our oceans every year, breaking down into microplastics that kill marine life and enter human drinking water. 

PlasticLedger connects 6 cutting-edge technologies into a single continuous pipeline: Space Satellites spot trash from orbit ➔ Global Maps track currents ➔ AI Vision identifies the microscopic plastic type ➔ Physics Neural Networks predict drift & settling ➔ Reverse Math tracks the exact polluter ➔ Cryptographic Blockchains seal the legal evidence.`,
      keyTerms: [
        { term: "Microplastics", desc: "Plastic fragments under 5 mm that float invisibly in oceans and accumulate toxins." },
        { term: "Ocean Gyres", desc: "5 massive circulating ocean currents (like giant whirlpools) where floating debris gets trapped." },
        { term: "End-to-End Pipeline", desc: "From satellite photo in space to court-admissible evidence in an immutable ledger." }
      ]
    },
    {
      id: "step1",
      badge: "Step 1 • Space Spotting",
      icon: Satellite,
      color: "#4facfe",
      title: "Sentinel & Landsat Remote Sensing",
      tagline: "Spotting floating plastic slicks from 786 km above Earth using invisible infrared light.",
      explanation: `Human eyes only see Red, Green, and Blue light. Earth observation satellites (Copernicus Sentinel-2 & NASA/USGS Landsat-9) also see Near-Infrared (NIR) and Shortwave-Infrared (SWIR).

Clean ocean water absorbs almost all infrared light and looks pitch-black. Floating plastic, however, reflects infrared light strongly! By comparing NIR and SWIR wavelengths, we calculate the Floating Debris Index (FDI). If FDI is high and plant chlorophyll (NDVI) is low, our system flags a plastic anomaly in real-time.`,
      keyTerms: [
        { term: "FDI (Floating Debris Index)", desc: "A mathematical index comparing infrared reflectance. High values (>0.03) indicate floating trash." },
        { term: "Sentinel-2 MSI", desc: "European Space Agency satellite with 10–20 meter optical resolution, scanning every coast every 5 days." },
        { term: "Landsat-9 OLI-2", desc: "USGS/NASA satellite providing cross-calibrated 30-meter multispectral ocean imaging." }
      ]
    },
    {
      id: "step2",
      badge: "Step 2 • Global GIS Command",
      icon: Compass,
      color: "#00f2fe",
      title: "Ocean GIS Map & Gyres",
      tagline: "Live situational awareness of 190+ plastic accumulation hotspots across world oceans.",
      explanation: `The Global GIS Map synthesizes satellite radar, surface drifter buoys, and NOAA ocean current vectors.

You can inspect the 5 major ocean garbage patches (North Pacific, South Pacific, North Atlantic, South Atlantic, and Indian Ocean), visualize real-time surface current directions, and click any hotspot to run a 30-day backward simulation to see where that specific trash originated.`,
      keyTerms: [
        { term: "The 5 Gyres", desc: "Subtropical oceanic gyres acting as planetary conveyor belts pulling floating trash into dense centers." },
        { term: "Current Vectors", desc: "Real-time velocity and heading of ocean surface water (in m/s and degrees)." },
        { term: "Backtrack Pin", desc: "Clicking any hotspot calculates a backward Lagrangian trajectory to find its source." }
      ]
    },
    {
      id: "step3",
      badge: "Step 3 • AI Particle Vision",
      icon: Microscope,
      color: "#a855f7",
      title: "SegFormer Sub-Pixel Vision",
      tagline: "Identifying microscopic plastic particles down to 10 micrometers with Deep Learning.",
      explanation: `When ocean water samples are collected by researchers or cleanup vessels, the particles are dyed with Nile Red fluorescence and photographed under a microscope.

Our SegFormer Transformer AI neural network automatically segments every microplastic particle, measures its exact size (Feret diameter in micrometers), and classifies the polymer family:
• Polyethylene (PE) — shopping bags, films
• PET — plastic beverage bottles
• Nylon — commercial fishing nets & ropes
• Polystyrene (PS) — styrofoam cups & buoys
• PVC — pipes & construction waste`,
      keyTerms: [
        { term: "Feret Diameter", desc: "The greatest distance between two parallel planes bounding the particle (measured in micrometers, µm)." },
        { term: "Nile Red Staining", desc: "A fluorescent dye that binds specifically to synthetic polymers, making them glow under blue light." },
        { term: "SegFormer", desc: "A state-of-the-art vision transformer model trained on ocean microplastic microscopy datasets." }
      ]
    },
    {
      id: "step4",
      badge: "Step 4 • Ocean Physics AI",
      icon: Waves,
      color: "#06d6a0",
      title: "DeepXDE Physics-Informed Neural Network (PINN)",
      tagline: "Solving hydrodynamic fluid equations to forecast whether plastics float or sink.",
      explanation: `Standard AI only guesses based on past pictures. DeepXDE uses Physics-Informed Neural Networks (PINNs), encoding actual laws of ocean fluid mechanics directly into the AI loss function:

∂C/∂t + u·∇C = K_h·∇²C - w_s·(∂C/∂z) + S

What this means in plain words:
1. Advection (u·∇C): Ocean currents push the plastic forward.
2. Eddy Diffusivity (K_h·∇²C): Waves and turbulence scatter the plastic outward into a wider plume.
3. Stokes Settling (w_s): Light plastics (PE: density 0.92 g/cm³) float on surface water (density 1.025 g/cm³), while heavy plastics (PET: 1.38 g/cm³, Nylon: 1.14 g/cm³) sink down to the seabed!`,
      keyTerms: [
        { term: "PINN", desc: "Physics-Informed Neural Network: AI constrained by laws of physics, ensuring predictions never violate fluid dynamics." },
        { term: "Stokes Velocity", desc: "The speed at which a particle sinks or rises depending on its density vs seawater." },
        { term: "Plume Dispersion", desc: "How many meters wide the trash cloud grows as time progresses (T+0h to T+96h)." }
      ]
    },
    {
      id: "step5",
      badge: "Step 5 • Forensic Attribution",
      icon: Activity,
      color: "#ffb703",
      title: "Source Attribution & Reverse Drift",
      tagline: "Rewinding ocean currents in reverse like a detective to find the exact polluter.",
      explanation: `When a large plastic concentration is detected off a coastline, who is legally responsible?

Our Source Attribution engine runs an Adjoint Transport equation backward in time. By combining polymer fingerprinting with backward-in-time hydrodynamic flow, it matches the detected plume against 43 verified river mouths, industrial outfalls, and shipping ports with an exact confidence probability (e.g. '88.0% probability: Cooum Canal Sluice, Chennai').`,
      keyTerms: [
        { term: "Adjoint Transport", desc: "Mathematical technique for running fluid motion backward in time from sensor observation to source." },
        { term: "Emitter Registry", desc: "Database of 43 global river mouths and coastal outfalls responsible for 80% of marine plastic runoff." },
        { term: "Attribution Probability", desc: "Statistical likelihood that a specific facility was the origin point of the detected plume." }
      ]
    },
    {
      id: "step6",
      badge: "Step 6 • Tamper-Proof Proof",
      icon: ShieldCheck,
      color: "#f72585",
      title: "Cryptographic Environmental Ledger",
      tagline: "Locking satellite and AI evidence into an immutable SHA-256 blockchain audit trail.",
      explanation: `Environmental lawsuits often fail because polluters claim data was altered, backdated, or faked.

Every time our satellite detects an anomaly or our PINN attributes a polluter, we seal the full forensic package into a cryptographic block:
• Timestamp & GPS Coordinates
• Satellite FDI Spectral Values
• Microscope Polymer Classification
• SHA-256 Hash linked to previous block

Once written, no company, government, or hacker can edit, tamper with, or delete the record. It serves as permanent legal evidence for maritime enforcement and environmental regulatory bodies.`,
      keyTerms: [
        { term: "SHA-256 Hash", desc: "A 64-character mathematical fingerprint that changes completely if even a single byte of data is altered." },
        { term: "Immutable Chain", desc: "Each block contains the hash of the previous block, creating an unbreakable chain of custody." },
        { term: "Regulatory Compliance", desc: "Court-ready JSON exports compliant with UNEP and International Maritime Organization (IMO) standards." }
      ]
    }
  ];

  const current = PIPELINE_STEPS[activeStep];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(3, 8, 22, 0.8)",
        backdropFilter: "blur(12px)",
        padding: "20px"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "960px",
            maxHeight: "90vh",
            background: "linear-gradient(145deg, rgba(16, 30, 64, 0.95), rgba(7, 13, 30, 0.98))",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 242, 254, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(255, 255, 255, 0.02)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #00f2fe, #4facfe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Sparkles size={20} color="#030816" />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  PlasticLedger <span style={{ color: "var(--accent-cyan)" }}>Intelligence System Guide</span>
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Plain-English explanation of how every technology in this platform works
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "8px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Tabs */}
          <div style={{
            display: "flex",
            gap: "8px",
            padding: "12px 24px",
            background: "rgba(3, 8, 22, 0.6)",
            borderBottom: "1px solid var(--border-subtle)",
            overflowX: "auto"
          }}>
            {PIPELINE_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: isSelected ? `1px solid ${step.color}` : "1px solid transparent",
                    background: isSelected ? `${step.color}18` : "transparent",
                    color: isSelected ? step.color : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  <StepIcon size={14} />
                  <span>{step.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Title & Tagline Card */}
            <div style={{
              background: "rgba(16, 30, 64, 0.4)",
              border: `1px solid ${current.color}40`,
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `${current.color}20`,
                border: `1px solid ${current.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Icon size={26} color={current.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: current.color,
                    background: `${current.color}15`,
                    padding: "3px 8px",
                    borderRadius: "4px"
                  }}>
                    {current.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                  {current.title}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "var(--accent-cyan)", fontWeight: 500, lineHeight: 1.4 }}>
                  {current.tagline}
                </p>
              </div>
            </div>

            {/* Plain English Explanation */}
            <div>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Info size={14} /> In Plain English
              </h4>
              <div style={{
                background: "rgba(3, 8, 22, 0.7)",
                border: "1px solid var(--border-glass)",
                borderRadius: "10px",
                padding: "18px",
                fontSize: "0.9rem",
                color: "#e2e8f0",
                lineHeight: 1.7,
                whiteSpace: "pre-line"
              }}>
                {current.explanation}
              </div>
            </div>

            {/* Key Terms Translated */}
            <div>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <HelpCircle size={14} /> Key Technical Terms Translated
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {current.keyTerms.map((kt, i) => (
                  <div key={i} style={{
                    background: "rgba(16, 30, 64, 0.35)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "12px 14px"
                  }}>
                    <strong style={{ display: "block", color: current.color, fontSize: "0.85rem", marginBottom: "4px" }}>
                      {kt.term}
                    </strong>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
                      {kt.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderTop: "1px solid var(--border-subtle)",
            background: "rgba(3, 8, 22, 0.8)"
          }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Step {activeStep + 1} of {PIPELINE_STEPS.length}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="btn-outline"
                  style={{ fontSize: "0.8rem", padding: "8px 16px" }}
                >
                  Previous
                </button>
              )}

              {activeStep < PIPELINE_STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="btn-glow-cyan"
                  style={{ fontSize: "0.8rem", padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Next Step <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="btn-glow-cyan"
                  style={{ fontSize: "0.8rem", padding: "8px 20px" }}
                >
                  Got It, Let's Explore!
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
