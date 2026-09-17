const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/layers", (req, res) => {
  const centerLat = 13.0827;
  const centerLon = 80.2707;

  // Ocean current grid points
  const currents = [];
  for (let dLat = -0.3; dLat <= 0.3; dLat += 0.15) {
    for (let dLon = -0.1; dLon <= 0.4; dLon += 0.15) {
      const pLat = parseFloat((centerLat + dLat).toFixed(4));
      const pLon = parseFloat((centerLon + dLon).toFixed(4));
      currents.push({
        lat: pLat,
        lon: pLon,
        u_east: 0.35 + (Math.sin(pLat * 10) * 0.1),
        v_north: -0.18 + (Math.cos(pLon * 10) * 0.08),
        speed_knots: 0.8,
        direction: 115
      });
    }
  }

  // Floating debris hotspot markers
  const hotspots = [
    { id: "HS-01", lat: 13.095, lon: 80.315, severity: "HIGH", polymer: "PE", particles_m3: 14.2, fdi: 0.082, source: "Sentinel-2 MSI" },
    { id: "HS-02", lat: 13.025, lon: 80.285, severity: "CRITICAL", polymer: "PET", particles_m3: 28.5, fdi: 0.114, source: "Landsat-9 OLI-2" },
    { id: "HS-03", lat: 13.180, lon: 80.340, severity: "MEDIUM", polymer: "Nylon", particles_m3: 8.9, fdi: 0.048, source: "Sentinel-2 MSI" },
    { id: "HS-04", lat: 12.980, lon: 80.290, severity: "HIGH", polymer: "PVC", particles_m3: 18.1, fdi: 0.076, source: "Field Buoy #4" },
    { id: "HS-05", lat: 13.120, lon: 80.380, severity: "LOW", polymer: "PS", particles_m3: 4.6, fdi: 0.031, source: "Sentinel-2 MSI" }
  ];

  // Satellite footprint bounding polygon
  const sentinelSwath = [
    [13.40, 80.15],
    [13.40, 80.55],
    [12.75, 80.55],
    [12.75, 80.15],
    [13.40, 80.15]
  ];

  res.json({
    success: true,
    center: [centerLat, centerLon],
    zoom: 10,
    layers: {
      currents,
      hotspots,
      sentinelSwath,
      coastalBuoys: [
        { id: "BUOY-A1", lat: 13.05, lon: 80.31, temp_c: 28.2, microplastic_count: 145 },
        { id: "BUOY-A2", lat: 13.12, lon: 80.36, temp_c: 28.0, microplastic_count: 98 }
      ]
    }
  });
});

module.exports = router;
