import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers, Compass, Wind, Eye, AlertTriangle, Play } from "lucide-react";

export default function OceanMap({ onSelectHotspot, onTriggerPINN }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({ hotspots: [], currents: [], swath: null });

  const [mapLayers, setMapLayers] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [showCurrents, setShowCurrents] = useState(true);
  const [showSwath, setShowSwath] = useState(true);

  useEffect(() => {
    // Fetch map layer data
    fetch("http://localhost:5000/api/map/layers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMapLayers(data.layers);
        }
      })
      .catch((err) => console.error("Map layer fetch error:", err));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [13.0827, 80.2707],
      zoom: 10,
      zoomControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Dark sleek CartoDB Basemap
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update dynamic layers when data loads
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLayers) return;

    // Clear previous markers
    layersRef.current.hotspots.forEach((m) => m.remove());
    layersRef.current.currents.forEach((m) => m.remove());
    if (layersRef.current.swath) layersRef.current.swath.remove();

    layersRef.current.hotspots = [];
    layersRef.current.currents = [];

    // 1. Sentinel-2 Swath Polygon
    if (showSwath && mapLayers.sentinelSwath) {
      const swath = L.polygon(mapLayers.sentinelSwath, {
        color: "#00f2fe",
        weight: 1.5,
        dashArray: "5, 5",
        fillColor: "#00f2fe",
        fillOpacity: 0.08
      }).addTo(map);

      swath.bindTooltip("Sentinel-2 MSI Orbit Swath (Tile T44VNR)", {
        sticky: true,
        className: "glass-tooltip"
      });
      layersRef.current.swath = swath;
    }

    // 2. Ocean Current Vectors
    if (showCurrents && mapLayers.currents) {
      mapLayers.currents.forEach((c) => {
        const icon = L.divIcon({
          className: "current-vector-icon",
          html: `<div style="transform: rotate(${c.direction}deg); color: #4facfe; font-size: 14px; opacity: 0.75;">➔</div>`,
          iconSize: [16, 16]
        });
        const marker = L.marker([c.lat, c.lon], { icon }).addTo(map);
        layersRef.current.currents.push(marker);
      });
    }

    // 3. Floating Debris Hotspots
    if (mapLayers.hotspots) {
      mapLayers.hotspots.forEach((hs) => {
        const color =
          hs.severity === "CRITICAL"
            ? "#f72585"
            : hs.severity === "HIGH"
            ? "#ffb703"
            : "#06d6a0";

        const marker = L.circleMarker([hs.lat, hs.lon], {
          radius: hs.severity === "CRITICAL" ? 12 : 9,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.8
        }).addTo(map);

        marker.on("click", () => {
          setSelectedHotspot(hs);
          if (onSelectHotspot) onSelectHotspot(hs);
        });

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 180px; color: #111;">
            <strong style="color: ${color}; font-size: 14px;">${hs.id} — ${hs.severity} Risk</strong><br/>
            <span><b>Sensor:</b> ${hs.source}</span><br/>
            <span><b>Polymer:</b> ${hs.polymer}</span><br/>
            <span><b>FDI Index:</b> ${hs.fdi}</span><br/>
            <span><b>Density:</b> ${hs.particles_m3} particles/m³</span>
          </div>
        `);

        layersRef.current.hotspots.push(marker);
      });
    }
  }, [mapLayers, showCurrents, showSwath]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", height: "calc(100vh - 120px)" }}>
      {/* Map Viewport */}
      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Floating Controls Overlay */}
        <div style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 500,
          background: "rgba(10, 18, 42, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          display: "flex",
          gap: "12px",
          alignItems: "center"
        }}>
          <button
            onClick={() => setShowCurrents(!showCurrents)}
            className="btn-outline"
            style={{
              padding: "6px 12px",
              fontSize: "0.75rem",
              borderColor: showCurrents ? "var(--accent-cyan)" : "var(--border-subtle)",
              color: showCurrents ? "var(--accent-cyan)" : "var(--text-secondary)"
            }}
          >
            <Wind size={14} /> Ocean Currents {showCurrents ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setShowSwath(!showSwath)}
            className="btn-outline"
            style={{
              padding: "6px 12px",
              fontSize: "0.75rem",
              borderColor: showSwath ? "var(--accent-cyan)" : "var(--border-subtle)",
              color: showSwath ? "var(--accent-cyan)" : "var(--text-secondary)"
            }}
          >
            <Layers size={14} /> Sentinel-2 Swath {showSwath ? "ON" : "OFF"}
          </button>
        </div>

        {/* Map Legend */}
        <div style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          zIndex: 500,
          background: "rgba(10, 18, 42, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          fontSize: "0.75rem",
          display: "flex",
          gap: "16px"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f72585" }} /> Critical FDI Plume
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffb703" }} /> High Risk Cluster
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#06d6a0" }} /> Moderate / Natural
          </span>
        </div>
      </div>

      {/* Details & Trigger Sidebar */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px", overflowY: "auto" }}>
        <div>
          <div className="badge-glow badge-cyan" style={{ marginBottom: "8px" }}>
            <Compass size={12} /> Geospatial Telemetry
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Coastal Surveillance</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Coromandel Coast / Bay of Bengal Sentinel-2 & Landsat-9 Monitoring Zone.
          </p>
        </div>

        {selectedHotspot ? (
          <div style={{
            background: "rgba(16, 30, 64, 0.5)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-sm)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--accent-cyan)" }}>
                {selectedHotspot.id}
              </span>
              <span className={`badge-glow ${selectedHotspot.severity === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                {selectedHotspot.severity}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Sensor</span>
                <strong>{selectedHotspot.source}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Polymer</span>
                <strong style={{ color: "var(--accent-emerald)" }}>{selectedHotspot.polymer}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>FDI Spectral</span>
                <strong>{selectedHotspot.fdi}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Concentration</span>
                <strong>{selectedHotspot.particles_m3} /m³</strong>
              </div>
            </div>

            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                className="btn-glow-cyan"
                style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem" }}
                onClick={() => onTriggerPINN && onTriggerPINN(selectedHotspot)}
              >
                <Play size={14} /> Run DeepXDE PINN Attribution
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            padding: "24px 16px",
            textAlign: "center",
            border: "1px dashed var(--border-glass)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-muted)",
            fontSize: "0.85rem"
          }}>
            Click any hotspot marker on the ocean map to inspect spectral metrics and trigger Physics-AI backward drift attribution.
          </div>
        )}

        {/* Global Statistics Box */}
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            Real-Time Ingestion Stats
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Active Sentinel Swaths</span>
              <strong style={{ color: "var(--accent-cyan)" }}>1 Orbit Active</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Detected Debris Fields</span>
              <strong style={{ color: "#fff" }}>5 Marine Hotspots</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Ocean Eddy Diffusivity</span>
              <strong style={{ color: "var(--accent-emerald)" }}>12.5 m²/s</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
