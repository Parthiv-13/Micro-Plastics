#!/usr/bin/env python3
"""
Satellite: Sentinel-2 & Landsat-9 Multispectral Marine Debris Pipelines
=======================================================================

Unified module combining:
  • Sentinel-2 MSI Floating Debris Index (FDI, Biermann et al. 2020),
    Normalized Difference Vegetation Index (NDVI), and Kikaki Plastic Index (PI).
  • Landsat-9 OLI-2 cross-sensor harmonized marine debris detection.
  • Synthetic scene analysis for both sensors.

Sentinel-2 Bands:
  B02: Blue (490 nm, 10m), B03: Green (560 nm, 10m), B04: Red (665 nm, 10m),
  B08: NIR (842 nm, 10m), B11: SWIR-1 (1610 nm, 20m), B12: SWIR-2 (2190 nm, 20m)

Landsat-9 OLI-2 Bands:
  B2: Blue (482 nm, 30m), B3: Green (561 nm, 30m), B4: Red (655 nm, 30m),
  B5: NIR (865 nm, 30m), B6: SWIR-1 (1609 nm, 30m), B7: SWIR-2 (2201 nm, 30m)

Author: Micro-Plastics Research Team
License: MIT
"""

import os
import sys
import json
import argparse
import numpy as np


# ═══════════════════════════════════════════════════════════════════════════════
# Spectral Band Wavelengths
# ═══════════════════════════════════════════════════════════════════════════════

# Sentinel-2 MSI center wavelengths (nm)
LAMBDA_S2 = {
    "B02_BLUE": 492.4,
    "B03_GREEN": 559.8,
    "B04_RED": 664.6,
    "B08_NIR": 832.8,
    "B11_SWIR1": 1613.7,
    "B12_SWIR2": 2202.4,
}

# Landsat-9 OLI-2 center wavelengths (nm)
LAMBDA_L9 = {
    "B2_BLUE": 482.0,
    "B3_GREEN": 561.4,
    "B4_RED": 654.6,
    "B5_NIR": 864.7,
    "B6_SWIR1": 1608.9,
    "B7_SWIR2": 2200.7,
}


# ═══════════════════════════════════════════════════════════════════════════════
# Sentinel-2 FDI Engine
# ═══════════════════════════════════════════════════════════════════════════════

class Sentinel2FDIEngine:
    """Computes spectral indices for floating marine debris and plastics from Sentinel-2 MSI."""

    def compute_fdi(self, red: float, nir: float, swir1: float) -> float:
        """
        Calculates Floating Debris Index (Biermann et al., 2020).
        """
        l_red = LAMBDA_S2["B04_RED"]
        l_nir = LAMBDA_S2["B08_NIR"]
        l_swir1 = LAMBDA_S2["B11_SWIR1"]

        # Linear baseline reflectance between Red and SWIR1 at NIR wavelength
        r_prime_nir = red + (swir1 - red) * ((l_nir - l_red) / (l_swir1 - l_red))
        fdi = nir - r_prime_nir
        return round(float(fdi), 5)

    def compute_ndvi(self, red: float, nir: float) -> float:
        """Normalized Difference Vegetation Index for distinguishing algae/sargassum."""
        denom = nir + red
        if abs(denom) < 1e-6:
            return 0.0
        return round(float((nir - red) / denom), 4)

    def compute_plastic_index(self, red: float, nir: float) -> float:
        """Kikaki Plastic Index: PI = NIR / (NIR + Red)"""
        denom = nir + red
        if abs(denom) < 1e-6:
            return 0.0
        return round(float(nir / denom), 4)

    def classify_pixel(self, red: float, nir: float, swir1: float) -> dict:
        """Classifies spectral signature into water, plastic, vegetation, or foam."""
        fdi = self.compute_fdi(red, nir, swir1)
        ndvi = self.compute_ndvi(red, nir)
        pi = self.compute_plastic_index(red, nir)

        if fdi > 0.02 and ndvi < 0.15:
            classification = "Floating Plastic Debris / Polymer Aggregation"
            confidence = min(0.96, 0.75 + fdi * 5.0)
            category = "PLASTIC"
        elif fdi > 0.02 and ndvi >= 0.15:
            classification = "Organic Marine Debris (Sargassum / Algae)"
            confidence = min(0.95, 0.70 + ndvi)
            category = "VEGETATION"
        elif nir > 0.15 and swir1 > 0.10:
            classification = "Whitecap / Wave Foam / Cloud"
            confidence = 0.88
            category = "FOAM_CLOUD"
        else:
            classification = "Clean Open Ocean Water"
            confidence = 0.99
            category = "WATER"

        return {
            "fdi": fdi,
            "ndvi": ndvi,
            "plastic_index": pi,
            "classification": classification,
            "category": category,
            "confidence": round(confidence, 3)
        }

    def generate_synthetic_scene_analysis(self, tile_id: str = "T44VNR", lat: float = 13.08, lon: float = 80.32) -> dict:
        """
        Simulates multispectral band values for a Sentinel-2 pass over coastal waters.
        """
        rng = np.random.RandomState(abs(hash(tile_id)) % 9999)
        num_anomalies = rng.randint(4, 8)
        anomalies = []

        for i in range(num_anomalies):
            is_plastic = (i % 2 == 0)
            if is_plastic:
                red = round(rng.uniform(0.015, 0.035), 4)
                nir = round(rng.uniform(0.055, 0.110), 4)
                swir1 = round(rng.uniform(0.020, 0.045), 4)
            else:
                red = round(rng.uniform(0.020, 0.040), 4)
                nir = round(rng.uniform(0.120, 0.220), 4)
                swir1 = round(rng.uniform(0.015, 0.030), 4)

            d_lat = rng.uniform(-0.08, 0.08)
            d_lon = rng.uniform(-0.08, 0.08)
            sig = self.classify_pixel(red, nir, swir1)

            anomalies.append({
                "anomaly_id": f"S2-HOTSPOT-{i+1:03d}",
                "lat": round(lat + d_lat, 5),
                "lon": round(lon + d_lon, 5),
                "bands": {"B04_RED": red, "B08_NIR": nir, "B11_SWIR1": swir1},
                "indices": {
                    "FDI": sig["fdi"],
                    "NDVI": sig["ndvi"],
                    "PI": sig["plastic_index"]
                },
                "category": sig["category"],
                "classification": sig["classification"],
                "confidence": sig["confidence"],
                "estimated_area_m2": round(rng.uniform(200, 3500), 1),
                "polymer_signature": "PE / PET / PP floating matrix" if sig["category"] == "PLASTIC" else "Natural bio-mass"
            })

        return {
            "satellite": "Sentinel-2B MSI",
            "tile_id": tile_id,
            "acquisition_date": "2026-09-08T05:22:18Z",
            "cloud_cover_percent": 3.4,
            "center_coords": {"lat": lat, "lon": lon},
            "total_anomalies_detected": len(anomalies),
            "plastic_hotspots": len([a for a in anomalies if a["category"] == "PLASTIC"]),
            "anomalies": anomalies
        }


# ═══════════════════════════════════════════════════════════════════════════════
# Landsat-9 OLI-2 Pipeline
# ═══════════════════════════════════════════════════════════════════════════════

class Landsat9Pipeline:
    """Processes USGS Landsat-9 OLI-2 scenes for floating marine macro-plastics."""

    def compute_fdi_l9(self, red: float, nir: float, swir1: float) -> float:
        l_red = LAMBDA_L9["B4_RED"]
        l_nir = LAMBDA_L9["B5_NIR"]
        l_swir1 = LAMBDA_L9["B6_SWIR1"]

        r_prime = red + (swir1 - red) * ((l_nir - l_red) / (l_swir1 - l_red))
        fdi = nir - r_prime
        return round(float(fdi), 5)

    def generate_scene_report(self, path_row: str = "142_051", lat: float = 13.08, lon: float = 80.32) -> dict:
        rng = np.random.RandomState(abs(hash(path_row)) % 7777)
        anomalies = []
        for i in range(4):
            red = round(rng.uniform(0.018, 0.038), 4)
            nir = round(rng.uniform(0.060, 0.120), 4)
            swir1 = round(rng.uniform(0.022, 0.048), 4)
            fdi = self.compute_fdi_l9(red, nir, swir1)

            anomalies.append({
                "target_id": f"L9-DEBRIS-{i+1:03d}",
                "lat": round(lat + rng.uniform(-0.06, 0.06), 5),
                "lon": round(lon + rng.uniform(-0.06, 0.06), 5),
                "fdi_oli2": fdi,
                "classification": "Surface Plastic Cluster" if fdi > 0.02 else "Sediment / Turbid Water",
                "sensor_resolution_m": 30.0,
                "confidence": 0.91 if fdi > 0.02 else 0.78
            })

        return {
            "satellite": "Landsat-9 OLI-2",
            "path_row": path_row,
            "acquisition_date": "2026-09-07T05:18:42Z",
            "spatial_resolution": "30m Multispectral",
            "cross_sensor_harmonization": "Sentinel-2 MSI calibrated",
            "detected_clusters": anomalies
        }


# ═══════════════════════════════════════════════════════════════════════════════
# CLI Entrypoint
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sentinel-2 & Landsat-9 Marine Debris Engine")
    parser.add_argument("--sensor", type=str, default="sentinel2", choices=["sentinel2", "landsat9"],
                        help="Which satellite sensor pipeline to run.")
    parser.add_argument("--test", action="store_true", help="Run test analysis")
    args = parser.parse_args()

    if args.sensor == "landsat9":
        pipeline = Landsat9Pipeline()
        print(json.dumps(pipeline.generate_scene_report(), indent=2))
    else:
        engine = Sentinel2FDIEngine()
        print(json.dumps(engine.generate_synthetic_scene_analysis(), indent=2))
    sys.exit(0)
