# Machine Learning & AI Pipeline

All machine learning, deep learning, physics-informed modeling, and satellite remote sensing code lives here in **consolidated single-file modules**.

---

## File Index

| File | Description |
|:---|:---|
| `yolo_pipeline.py` | YOLOv8 object detection: dataset prep, training, inference, and edge export |
| `vision.py` | SegFormer sub-pixel segmentation + Mask2Former instance segmentation config |
| `physics.py` | DeepXDE PINN advection-diffusion-settling solver + ocean current vectors |
| `satellite.py` | Sentinel-2 FDI engine + Landsat-9 OLI-2 marine debris pipeline |
| `data_loader.py` | Annotation dataset bridge for SegFormer/Mask2Former training |
| `models/metadata.json` | Model registry, calibration scales, and architecture configs |
| `yolov8_microplastic_detection.ipynb` | Interactive Jupyter notebook (EDA, training, evaluation) |

---

## YOLOv8 Pipeline (`yolo_pipeline.py`)

Single CLI with 4 subcommands:

```bash
# Validate annotations & preview split statistics
python yolo_pipeline.py prepare --dry-run

# Partition dataset with synthetic frame generation
python yolo_pipeline.py prepare --generate-synthetic

# Train with fluorescence-optimized augmentations
python yolo_pipeline.py train --weights yolov8n.pt --epochs 50 --batch 16 --device 0

# Inference with calibrated particle sizing
python yolo_pipeline.py infer --weights best.pt --source ../data/nile-red-microplastics/images/test/ --scale 0.65

# Export to edge formats
python yolo_pipeline.py export --weights best.pt --format onnx
python yolo_pipeline.py export --weights best.pt --format openvino
python yolo_pipeline.py export --weights best.pt --format engine --half
```

---

## Vision Engine (`vision.py`)

SegFormer sub-pixel semantic segmentation with polygon extraction, Feret caliper measurement, circularity, and Stokes settling velocity:

```bash
python vision.py --test --scale 0.65
python vision.py --show-config   # Print Mask2Former architecture config
```

---

## Physics-AI Engine (`physics.py`)

DeepXDE PINN solving the advection-diffusion-settling PDE + ocean current vectors:

```bash
python physics.py --test --polymer PE
python physics.py --currents --lat 13.08 --lon 80.32
```

---

## Satellite Engine (`satellite.py`)

Sentinel-2 MSI and Landsat-9 OLI-2 floating debris detection:

```bash
python satellite.py --sensor sentinel2 --test
python satellite.py --sensor landsat9 --test
```

---

## 6 Target Polymer Classes

| ID | Class | Full Chemical Name | Nile Red Fluorescence |
|:---:|:---:|:---|:---|
| `0` | **ABS** | Acrylonitrile Butadiene Styrene | Yellowish-orange |
| `1` | **Nylon** | Polyamide (PA) | Green-to-yellow |
| `2` | **PE** | Polyethylene (LDPE / HDPE) | Golden-yellow |
| `3` | **PET** | Polyethylene Terephthalate | Orange-red |
| `4` | **PS** | Polystyrene | High-intensity golden-yellow |
| `5` | **PVC** | Polyvinyl Chloride | Reddish-orange |

---

## Installation

```bash
pip install -r requirements.txt
```
