import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import OceanMap from "./components/OceanMap";
import SegFormerStudio from "./components/SegFormerStudio";
import DeepXDESimulator from "./components/DeepXDESimulator";
import SatelliteViewer from "./components/SatelliteViewer";
import SourceAttribution from "./components/SourceAttribution";
import LedgerAudit from "./components/LedgerAudit";
import { fetchHealth } from "./services/api";

export default function App() {
  const [activeTab,       setActiveTab]       = useState("map");
  const [healthData,      setHealthData]      = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  // ML detections geocoded onto the global ocean map
  const [userDetections,  setUserDetections]  = useState([]);

  useEffect(() => {
    fetchHealth()
      .then(data => {
        setHealthData(data);
      })
      .catch(err => {
        toast.error("Backend server is unreachable! Please start the API.", { duration: 6000 });
        console.warn("Backend not yet connected:", err);
      });
  }, []);

  const handleTriggerPINNFromMap = (hotspot) => {
    setSelectedHotspot(hotspot);
    setActiveTab("pinn");
  };

  // Called from SegFormerStudio when user clicks "Place on Map"
  const handleDetectionGeolocated = (detection) => {
    setUserDetections(prev => [...prev, detection]);
    setActiveTab("map");
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, scale: 0.99, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "map":
        return <OceanMap key="map" onSelectHotspot={hs => setSelectedHotspot(hs)} onTriggerPINN={handleTriggerPINNFromMap} userDetections={userDetections} />;
      case "vision":
        return <SegFormerStudio key="vision" onDetectionGeolocated={handleDetectionGeolocated} />;
      case "pinn":
        return <DeepXDESimulator key="pinn" selectedHotspot={selectedHotspot} />;
      case "satellite":
        return <SatelliteViewer key="satellite" />;
      case "attribution":
        return <SourceAttribution key="attribution" />;
      case "ledger":
        return <LedgerAudit key="ledger" />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast Notifications Provider */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(16, 30, 64, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem'
          },
          success: {
            iconTheme: { primary: 'var(--accent-emerald)', secondary: '#111' },
          },
          error: {
            iconTheme: { primary: 'var(--accent-rose)', secondary: '#111' },
          }
        }}
      />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} healthData={healthData} />

      <main style={{ flex: 1, padding: "20px 28px", maxWidth: "1780px", margin: "0 auto", width: "100%", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ height: "100%" }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
