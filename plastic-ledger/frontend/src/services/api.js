const API_BASE = "http://localhost:5000/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSatelliteOverview() {
  const res = await fetch(`${API_BASE}/satellite/overview`);
  return res.json();
}

export async function computeFDI(data) {
  const res = await fetch(`${API_BASE}/satellite/compute-fdi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function runSegFormerInference(frameId = "sample_01", scale = 0.65, polymerFilter = "ALL") {
  const res = await fetch(`${API_BASE}/detection/segment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frameId, scale, polymerFilter })
  });
  return res.json();
}

export async function fetchPolymers() {
  const res = await fetch(`${API_BASE}/detection/polymers`);
  return res.json();
}

export async function runPINNSimulation(polymer = "PE", lat = 12.92, lon = 80.25) {
  const res = await fetch(`${API_BASE}/physics/simulate-pinn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ polymer, lat, lon })
  });
  return res.json();
}

export async function runReverseAttribution(detectedCoords = [13.08, 80.32], polymer = "PE") {
  const res = await fetch(`${API_BASE}/physics/reverse-attribution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ detectedCoords, polymer })
  });
  return res.json();
}

export async function fetchSources() {
  const res = await fetch(`${API_BASE}/sources`);
  return res.json();
}

export async function fetchMapLayers() {
  const res = await fetch(`${API_BASE}/map/layers`);
  return res.json();
}

export async function fetchLedgerRecords() {
  const res = await fetch(`${API_BASE}/ledger/records`);
  return res.json();
}

export async function fetchLedgerStats() {
  const res = await fetch(`${API_BASE}/ledger/stats`);
  return res.json();
}

export async function appendLedgerBlock(blockData) {
  const res = await fetch(`${API_BASE}/ledger/append`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blockData)
  });
  return res.json();
}
