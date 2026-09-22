# Micro-Plastics Detection & Identification Platform

An open-source research and engineering platform for automated microplastic and marine plastic debris detection, quantification, polymer classification, and pollution source attribution — spanning satellite Earth observation, fluorescence microscopy, physics-informed neural networks, and a full-stack web dashboard.

---

## Repository Structure

```
Micro-Plastics/
│
├── data/                                   # ALL DATASETS
│   ├── nile-red-microplastics/             # Fluorescence microscopy dataset
│   │   ├── README.md                       # Dataset documentation & polymer breakdown
│   │   ├── data.yaml                       # YOLOv8 multi-class dataset config
│   │   └── annotations/                    # 2,566 YOLO annotation frames
│   │       ├── ABS/    (406 files)
│   │       ├── Nylon/  (592 files)
│   │       ├── PE/     (496 files)
│   │       ├── PET/    (272 files)
│   │       ├── PS/     (272 files)
│   │       └── PVC/    (528 files)
│   ├── nasa-marine-debris/                 # Satellite imagery dataset (PlanetScope)
│   │   ├── README.md
│   │   ├── data.yaml
│   │   └── download_dataset.py
│   └── processed/                          # Runtime processed outputs
│       └── sample_inventory.json
│
├── backend/                                # EXPRESS.JS MERN BACKEND
│   ├── package.json
│   ├── server.js                           # Entry point (http://localhost:5000)
│   ├── config.js / config.py               # System configuration
│   ├── database.js / database.py           # Mongoose + in-memory fallback
│   ├── api/                                # REST API routes
│   │   ├── satellite.js                    # Sentinel-2 & Landsat-9 endpoints
│   │   ├── detection.js                    # SegFormer sub-pixel vision
│   │   ├── physics.js                      # DeepXDE PINN transport
│   │   ├── sources.js                      # Pollution source attribution
│   │   ├── map.js                          # Ocean GIS GeoJSON layers
│   │   └── ledger.js                       # SHA-256 cryptographic audit
│   ├── models/                             # Mongoose schemas
│   │   ├── Detection.js
│   │   ├── LedgerRecord.js
│   │   ├── PINNSimulation.js
│   │   ├── PollutionSource.js
│   │   └── SatelliteScene.js
│   └── services/                           # Business logic
│       ├── attribution.js
│       ├── copernicus.js
│       ├── detection.js
│       ├── landsat.js
│       └── preprocessing.js
│
├── frontend/                               # VITE + REACT SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                         # Main dashboard
│       ├── index.css                       # Oceanic dark theme
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── OceanMap.jsx                # Leaflet GIS ocean map
│       │   ├── SegFormerStudio.jsx         # Sub-pixel segmentation canvas
│       │   ├── DeepXDESimulator.jsx        # PINN transport solver UI
│       │   ├── SatelliteViewer.jsx         # Sentinel-2 & Landsat-9 viewer
│       │   ├── SourceAttribution.jsx       # Inverse PINN source ranking
│       │   ├── LedgerAudit.jsx             # SHA-256 block explorer
│       │   └── GlobalStatsPanel.jsx        # Statistics dashboard
│       └── services/api.js                 # API client
│
├── ml/                                     # ALL ML & AI
│   ├── README.md                           # Full ML documentation
│   ├── requirements.txt                    # Unified Python dependencies
│   ├── yolo_pipeline.py                    # YOLOv8: prepare | train | infer | export
│   ├── vision.py                           # SegFormer + Mask2Former segmentation
│   ├── physics.py                          # DeepXDE PINN + ocean currents
│   ├── satellite.py                        # Sentinel-2 FDI + Landsat-9 pipeline
│   ├── data_loader.py                      # Annotation dataset loader
│   ├── models/metadata.json                # Model registry & calibration
│   └── yolov8_microplastic_detection.ipynb # Interactive Jupyter notebook
│
├── .env                                    # Environment configuration
├── .gitignore                              # Git ignore rules
└── README.md                               # This file
```

---

## Datasets

### 1. Nile Red Microplastic Fluorescence Dataset
* **Modality**: Fluorescence microscopy under controlled excitation with Nile Red hydrophobic fluorescent dye.
* **Target Polymers (6 Classes)**:
  - `0`: **ABS** (Acrylonitrile Butadiene Styrene)
  - `1`: **Nylon** (Polyamide)
  - `2`: **PE** (Polyethylene)
  - `3`: **PET** (Polyethylene Terephthalate)
  - `4`: **PS** (Polystyrene)
  - `5`: **PVC** (Polyvinyl Chloride)
* **Annotation Format**: YOLOv8 bounding boxes (`<class> <x_center> <y_center> <width> <height>`).
* **Scale**: 2,566 annotated image frames.
* **Associated Paper**: Rermborirak et al. (2025), *Journal of Hazardous Materials Advances*, [DOI: 10.1016/j.hazadv.2025.100787](https://doi.org/10.1016/j.hazadv.2025.100787).

### 2. NASA Marine Debris Dataset
* **Modality**: Optical Earth observation imagery (PlanetScope, 3m spatial resolution).
* **Target Classes**: Floating debris, plastics, algae, sargassum, wood, and artificial objects.
* **Reference**: Shah, Thomas, & Maskey (2021), Radiant MLHub, [DOI: 10.34911/rdnt.9r6ekg](https://doi.org/10.34911/rdnt.9r6ekg).

---

## Quick Start

### 1. ML Pipeline (Python)
```bash
cd ml
pip install -r requirements.txt

# Prepare dataset (dry run)
python yolo_pipeline.py prepare --dry-run

# Train YOLOv8
python yolo_pipeline.py train --weights yolov8n.pt --epochs 50

# Run inference
python yolo_pipeline.py infer --weights best.pt --source ../data/nile-red-microplastics/images/test/

# Export to ONNX
python yolo_pipeline.py export --weights best.pt --format onnx

# Test SegFormer vision engine
python vision.py --test

# Test DeepXDE PINN simulation
python physics.py --test

# Test Sentinel-2 FDI
python satellite.py --test
```

### 2. Backend Server (Express MERN)
```bash
cd backend
npm install
node server.js
# → http://localhost:5000
```

### 3. Frontend Application (Vite + React)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## License & Attribution

- Microplastic fluorescence annotations and dataset references are distributed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) per Rermborirak et al. (2025).
- Machine learning code and notebooks are open-source under MIT License.