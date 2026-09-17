import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import OceanMap from "./components/OceanMap";
import SegFormerStudio from "./components/SegFormerStudio";
import DeepXDESimulator from "./components/DeepXDESimulator";
import SatelliteViewer from "./components/SatelliteViewer";
import SourceAttribution from "./components/SourceAttribution";
import LedgerAudit from "./components/LedgerAudit";
import { fetchHealth } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [healthData, setHealthData] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealthData(data))
      .catch((err) => console.warn("Backend not yet connected:", err));
  }, []);

  const handleTriggerPINNFromMap = (hotspot) => {
    setSelectedHotspot(hotspot);
    setActiveTab("pinn");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} healthData={healthData} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "20px 28px", maxWidth: "1680px", margin: "0 auto", width: "100%" }}>
        {activeTab === "map" && (
          <OceanMap
            onSelectHotspot={(hs) => setSelectedHotspot(hs)}
            onTriggerPINN={handleTriggerPINNFromMap}
          />
        )}

        {activeTab === "vision" && (
          <SegFormerStudio />
        )}

        {activeTab === "pinn" && (
          <DeepXDESimulator selectedHotspot={selectedHotspot} />
        )}

        {activeTab === "satellite" && (
          <SatelliteViewer />
        )}

        {activeTab === "attribution" && (
          <SourceAttribution />
        )}

        {activeTab === "ledger" && (
          <LedgerAudit />
        )}
      </main>
    </div>
  );
}
