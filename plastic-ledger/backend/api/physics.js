const express = require("express");
const router = express.Router();
const attributionService = require("../services/attribution");

/**
 * POST /api/physics/simulate-pinn
 * Solves the advection-diffusion-settling PDE via DeepXDE PINN
 */
router.post("/simulate-pinn", async (req, res) => {
  try {
    const { polymer = "PE", lat = 12.92, lon = 80.25 } = req.body;
    const sim = await attributionService.runForwardSimulation(polymer, lat, lon);
    res.json(sim);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/physics/reverse-attribution
 * Solves backward-in-time PINN adjoint transport to rank likely pollution emitters
 */
router.post("/reverse-attribution", async (req, res) => {
  try {
    const { detectedCoords = [13.08, 80.32], polymer = "PE" } = req.body;
    const attribution = await attributionService.runInverseAttribution(detectedCoords, polymer);
    res.json(attribution);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
