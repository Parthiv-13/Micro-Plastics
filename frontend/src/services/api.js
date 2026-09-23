import toast from "react-hot-toast";

const API_BASE = "/api"; // Utilizing Vite Proxy

/**
 * Helper for robust API fetching with centralized error handling & toast notifications
 */
async function fetchWithHandler(url, options = {}, successMsg = null, loadingMsg = null) {
  let toastId;
  if (loadingMsg) {
    toastId = toast.loading(loadingMsg);
  }

  try {
    const response = await fetch(url, options);
    
    // Attempt to parse JSON even if error status, as backend might send { success: false, message: "..." }
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Not JSON
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    if (!response.ok || (data && data.success === false)) {
      const errorMsg = data.message || data.error || `Error ${response.status}`;
      throw new Error(errorMsg);
    }

    if (toastId) {
      toast.success(successMsg || "Success!", { id: toastId });
    } else if (successMsg) {
      toast.success(successMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);
    
    // Determine friendly error message
    let msg = error.message;
    if (msg.includes("Failed to fetch")) {
      msg = "Backend server is unreachable. Is it running?";
    }
    
    if (toastId) {
      toast.error(`Error: ${msg}`, { id: toastId, duration: 5000 });
    } else {
      toast.error(`Error: ${msg}`, { duration: 5000 });
    }
    
    // Re-throw so components can handle local state (like disabling loaders)
    throw error;
  }
}

export async function fetchHealth() {
  // Silent fail for health check
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (e) {
    throw new Error("Backend offline");
  }
}

export async function fetchSatelliteOverview() {
  return fetchWithHandler(`${API_BASE}/satellite/overview`);
}

export async function computeFDI(data) {
  return fetchWithHandler(`${API_BASE}/satellite/compute-fdi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }, "FDI Computation Complete", "Computing Floating Debris Index...");
}

export async function runSegFormerInference(frameId = "sample_01", scale = 0.65, polymerFilter = "ALL") {
  return fetchWithHandler(`${API_BASE}/detection/segment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frameId, scale, polymerFilter })
  }, "Segmentation Analysis Complete", "Running SegFormer Model...");
}

export async function fetchPolymers() {
  return fetchWithHandler(`${API_BASE}/detection/polymers`);
}

export async function runPINNSimulation(polymer = "PE", lat = 12.92, lon = 80.25) {
  return fetchWithHandler(`${API_BASE}/physics/simulate-pinn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ polymer, lat, lon })
  }, "Simulation Complete", "Solving DeepXDE Transport PDE...");
}

export async function runReverseAttribution(detectedCoords = [13.08, 80.32], polymer = "PE") {
  return fetchWithHandler(`${API_BASE}/physics/reverse-attribution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ detectedCoords, polymer })
  });
}

export async function runBacktrack(lat, lon, polymer = "PE", hours = 72) {
  // Silent loading here since Map component has its own overlay loading state
  return fetchWithHandler(`${API_BASE}/physics/backtrack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon, polymer, hours })
  });
}

export async function fetchSources(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithHandler(`${API_BASE}/sources${query ? "?" + query : ""}`);
}

export async function fetchMapLayers() {
  // Silent fetch, as it's part of initial mount
  try {
    const res = await fetch(`${API_BASE}/map/layers`);
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function fetchGlobalStats() {
  // Silent fetch
  try {
    const res = await fetch(`${API_BASE}/map/global-stats`);
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function fetchLedgerRecords() {
  return fetchWithHandler(`${API_BASE}/ledger/records`);
}

export async function fetchLedgerStats() {
  return fetchWithHandler(`${API_BASE}/ledger/stats`);
}

export async function appendLedgerBlock(blockData) {
  return fetchWithHandler(`${API_BASE}/ledger/append`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blockData)
  }, "Successfully committed to cryptographic ledger", "Appending block...");
}
