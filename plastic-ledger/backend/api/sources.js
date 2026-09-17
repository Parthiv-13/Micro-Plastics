const express = require("express");
const router = express.Router();

const SEED_SOURCES = [
  {
    source_id: "SRC-001",
    name: "Adyar River Estuary",
    type: "River Discharge",
    lat: 13.0102,
    lon: 80.2785,
    annual_discharge_tons: 420,
    primary_polymers: ["PE", "PET", "PVC"],
    risk_level: "HIGH",
    status: "Active Plume Monitoring"
  },
  {
    source_id: "SRC-002",
    name: "Ennore Industrial Port Outflow",
    type: "Port / Maritime",
    lat: 13.2504,
    lon: 80.3352,
    annual_discharge_tons: 280,
    primary_polymers: ["Nylon", "ABS"],
    risk_level: "CRITICAL",
    status: "Containment Boom Deployed"
  },
  {
    source_id: "SRC-003",
    name: "Cooum River Coastal Mouth",
    type: "Urban Wastewater",
    lat: 13.0658,
    lon: 80.2901,
    annual_discharge_tons: 650,
    primary_polymers: ["PE", "PS", "PET"],
    risk_level: "CRITICAL",
    status: "High Surface Debris"
  },
  {
    source_id: "SRC-004",
    name: "Coromandel Offshore Cargo Corridor",
    type: "Commercial Shipping",
    lat: 12.8500,
    lon: 80.4500,
    annual_discharge_tons: 150,
    primary_polymers: ["Nylon", "ABS", "PE"],
    risk_level: "MEDIUM",
    status: "AIS Telemetry Surveillance"
  }
];

router.get("/", (req, res) => {
  res.json({
    success: true,
    total_sources: SEED_SOURCES.length,
    sources: SEED_SOURCES
  });
});

module.exports = router;
