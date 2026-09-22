#!/usr/bin/env python3
"""
YOLOv8 Microplastic Detection & Identification Pipeline
========================================================

Unified command-line interface consolidating dataset preparation, model training,
inference with quantitative particle sizing, and edge hardware export.

Subcommands:
    prepare  — Validate YOLO annotations, stratified Train/Val/Test split, optional
               synthetic fluorescence frame generation.
    train    — Fine-tune YOLOv8 with fluorescence-specific augmentations (180° rotation,
               constrained hue shift for Nile Red emission preservation).
    infer    — Run detection on microscope images, apply magnification calibration,
               and produce physical particle statistics (Feret diameter, area, CSV).
    export   — Convert trained PyTorch weights to ONNX / OpenVINO / TensorRT / TFLite
               for portable edge deployment.

Usage:
    python yolo_pipeline.py prepare --dry-run
    python yolo_pipeline.py train --weights yolov8n.pt --epochs 50
    python yolo_pipeline.py infer --weights best.pt --source ../test_images/
    python yolo_pipeline.py export --weights best.pt --format onnx

Author: Micro-Plastics Research Team
License: MIT
"""

import argparse
import math
import os
import random
import shutil
import sys
from pathlib import Path

import numpy as np

# ═══════════════════════════════════════════════════════════════════════════════
# Shared Constants
# ═══════════════════════════════════════════════════════════════════════════════

# Polymer class mapping per Rermborirak et al. (2025)
CLASS_NAMES = {
    0: "ABS",
    1: "Nylon",
    2: "PE",
    3: "PET",
    4: "PS",
    5: "PVC"
}

CLASS_BGR_COLORS = {
    0: (30, 170, 255),   # ABS (Yellow-orange in BGR)
    1: (40, 255, 180),   # Nylon (Green-yellow)
    2: (50, 220, 240),   # PE (Golden yellow)
    3: (40, 90, 255),    # PET (Red-orange)
    4: (80, 230, 255),   # PS (Bright golden)
    5: (30, 60, 240),    # PVC (Reddish-orange)
}


def find_repo_root() -> Path:
    """Locate the Micro-Plastics repository root directory."""
    cwd = Path.cwd().resolve()
    for parent in [cwd] + list(cwd.parents):
        if (parent / "data").is_dir() or (parent / ".git").is_dir():
            return parent
    return cwd


# ═══════════════════════════════════════════════════════════════════════════════
# PREPARE — Dataset Preparation & Stratified Partitioning
# ═══════════════════════════════════════════════════════════════════════════════

def parse_and_validate_annotation(txt_path: Path):
    """
    Parses an annotation file and checks coordinate boundaries.
    Returns: list of (class_id, x_center, y_center, width, height)
    """
    valid_boxes = []
    with open(txt_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            if len(parts) < 5:
                continue
            try:
                cid = int(parts[0])
                xc, yc, w, h = map(float, parts[1:5])
            except ValueError:
                continue

            # Bounds checking (normalized coordinates in [0, 1])
            if not (0.0 <= xc <= 1.0 and 0.0 <= yc <= 1.0):
                continue
            if not (0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                continue

            valid_boxes.append((cid, xc, yc, w, h))
    return valid_boxes


def generate_synthetic_fluorescence_frame(txt_label_path: Path, img_size=(640, 640)):
    """
    Generates a realistic fluorescence microscopy image matching YOLO annotations.
    Simulates dark microscope background, sensor noise, solvatochromic dye emissions,
    and optical point spread function (PSF) blur.
    """
    try:
        import cv2
    except ImportError:
        print("[!] OpenCV is required to generate synthetic images. Please install opencv-python.")
        return None

    w_img, h_img = img_size
    # Dark background with mild sensor noise
    img = np.random.normal(12, 4, (h_img, w_img, 3)).clip(0, 45).astype(np.uint8)

    boxes = parse_and_validate_annotation(txt_label_path)
    for cid, xc, yc, w, h in boxes:
        px_x = int(xc * w_img)
        px_y = int(yc * h_img)
        px_w = max(4, int(w * w_img))
        px_h = max(4, int(h * h_img))

        color = CLASS_BGR_COLORS.get(cid, (200, 200, 200))
        axes = (max(2, px_w // 2), max(2, px_h // 2))
        angle = random.randint(0, 180)

        # Outer fluorescence glow
        glow_color = tuple(max(0, c // 2) for c in color)
        cv2.ellipse(img, (px_x, px_y), (axes[0] + 3, axes[1] + 3), angle, 0, 360, glow_color, -1)
        # Intense particle core
        cv2.ellipse(img, (px_x, px_y), axes, angle, 0, 360, color, -1)

    # Simulate optical point spread function
    img = cv2.GaussianBlur(img, (3, 3), 0)
    return img


def cmd_prepare(args):
    """Execute dataset preparation and stratified partitioning."""
    import yaml

    annotation_dir = args.annotations
    output_dir = args.output
    train_ratio = args.train_ratio
    val_ratio = args.val_ratio
    test_ratio = args.test_ratio

    if not math.isclose(train_ratio + val_ratio + test_ratio, 1.0, rel_tol=1e-3):
        raise ValueError(f"Ratios must sum to 1.0, got {train_ratio + val_ratio + test_ratio}")

    print(f"[*] Locating annotation sources in: {annotation_dir.resolve()}")
    if not annotation_dir.exists():
        print(f"[!] Annotation directory not found: {annotation_dir}")
        sys.exit(1)

    # Collect files per class
    class_files = {}
    total_frames = 0
    total_boxes = 0

    for cid, cname in CLASS_NAMES.items():
        folder = annotation_dir / cname
        if folder.exists():
            files = sorted(list(folder.glob("*.txt")))
            class_files[cname] = files
            total_frames += len(files)
            for f in files:
                boxes = parse_and_validate_annotation(f)
                total_boxes += len(boxes)
        else:
            class_files[cname] = []

    print(f"[+] Found {total_frames:,} annotated frames with {total_boxes:,} total microplastic bounding boxes.")
    print("-" * 60)
    for cname, files in class_files.items():
        print(f"    - {cname:<8}: {len(files):>5} frames")
    print("-" * 60)

    if args.dry_run:
        print("[DRY-RUN] No files will be moved, copied, or generated.")
        return

    images_dir = output_dir / "images"
    labels_dir = output_dir / "labels"

    splits = ["train", "val", "test"]
    for split in splits:
        (images_dir / split).mkdir(parents=True, exist_ok=True)
        (labels_dir / split).mkdir(parents=True, exist_ok=True)

    split_counts = {s: 0 for s in splits}
    per_class_split = {cname: {s: 0 for s in splits} for cname in CLASS_NAMES.values()}

    for cid, cname in CLASS_NAMES.items():
        files = class_files.get(cname, [])
        if not files:
            continue

        rnd = random.Random(args.seed + cid)
        shuffled = list(files)
        rnd.shuffle(shuffled)

        n_total = len(shuffled)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        partition = {
            "train": shuffled[:n_train],
            "val": shuffled[n_train:n_train + n_val],
            "test": shuffled[n_train + n_val:]
        }

        for sname, split_files in partition.items():
            for src_txt in split_files:
                dest_txt = labels_dir / sname / src_txt.name
                shutil.copy2(src_txt, dest_txt)
                split_counts[sname] += 1
                per_class_split[cname][sname] += 1

                if args.generate_synthetic:
                    dest_img = images_dir / sname / f"{src_txt.stem}.jpg"
                    if not dest_img.exists():
                        syn_frame = generate_synthetic_fluorescence_frame(src_txt)
                        if syn_frame is not None:
                            try:
                                import cv2
                                cv2.imwrite(str(dest_img), syn_frame)
                            except Exception as e:
                                print(f"[!] Error saving synthetic frame {dest_img}: {e}")

    print("\n[+] Stratified Partition Summary:")
    print(f"{'Polymer':<10} {'Train':>8} {'Val':>8} {'Test':>8} {'Total':>8}")
    print("-" * 46)
    for cname in CLASS_NAMES.values():
        t = per_class_split[cname]["train"]
        v = per_class_split[cname]["val"]
        ts = per_class_split[cname]["test"]
        tot = t + v + ts
        print(f"{cname:<10} {t:>8} {v:>8} {ts:>8} {tot:>8}")
    print("-" * 46)
    print(f"{'Total':<10} {split_counts['train']:>8} {split_counts['val']:>8} {split_counts['test']:>8} {sum(split_counts.values()):>8}")

    # Generate or update data.yaml
    data_yaml_path = output_dir / "data.yaml"
    yaml_config = {
        "path": str(output_dir.resolve()).replace("\\", "/"),
        "train": "images/train",
        "val": "images/val",
        "test": "images/test",
        "names": {cid: name for cid, name in CLASS_NAMES.items()}
    }

    with open(data_yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(yaml_config, f, sort_keys=False)

    print(f"[OK] Generated YOLOv8 configuration at: {data_yaml_path.resolve()}")


# ═══════════════════════════════════════════════════════════════════════════════
# TRAIN — YOLOv8 Training with Fluorescence-Optimized Augmentations
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_train(args):
    """Initializes and runs the YOLOv8 training routine."""
    try:
        import torch
        from ultralytics import YOLO
    except ImportError:
        print("[!] Ultralytics and PyTorch are required to run training.")
        print("    Install them with: pip install ultralytics torch")
        sys.exit(1)

    data_yaml = args.data
    if not data_yaml.exists():
        print(f"[!] Dataset config not found: {data_yaml.resolve()}")
        print("    Please run `python yolo_pipeline.py prepare` first to generate data.yaml and splits.")
        sys.exit(1)

    # Detect device
    device = args.device
    if not device:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    print("=" * 65)
    print("      MICROPLASTIC YOLOV8 FLUORESCENCE TRAINING PIPELINE      ")
    print("=" * 65)
    print(f"[*] Dataset Config     : {data_yaml.resolve()}")
    print(f"[*] Base Weights       : {args.weights}")
    print(f"[*] Epochs             : {args.epochs}")
    print(f"[*] Batch Size         : {args.batch}")
    print(f"[*] Image Resolution   : {args.imgsz}x{args.imgsz}")
    print(f"[*] Compute Device     : {device.upper()}")
    if device == "cuda" or (isinstance(device, str) and device.startswith("cuda")):
        print(f"[*] GPU Name           : {torch.cuda.get_device_name(0)}")
    print(f"[*] Output Directory   : {args.project}/{args.name}")
    print("=" * 65)

    # Load YOLO model
    model = YOLO(args.weights)

    # Train arguments with fluorescence-tailored hyperparameter augmentations
    train_args = {
        "data": str(data_yaml.resolve()).replace("\\", "/"),
        "epochs": args.epochs,
        "batch": args.batch,
        "imgsz": args.imgsz,
        "device": device,
        "workers": args.workers,
        "patience": args.patience,
        "project": args.project,
        "name": args.name,
        "exist_ok": True,
        "resume": args.resume,
        "verbose": True,
        # Fluorescence-specific augmentations
        "degrees": 180.0,   # Microscope slides have arbitrary rotational orientations
        "fliplr": 0.5,      # Horizontal reflection
        "flipud": 0.5,      # Vertical reflection
        "hsv_h": 0.015,     # Constrained hue shift to protect Nile Red emission wavelengths
        "hsv_s": 0.5,       # Saturation jitter
        "hsv_v": 0.4,       # Value / brightness jitter (exposure variations)
        "scale": 0.3,       # Particle scale variations
        "mosaic": 1.0,      # Multi-scale mosaic context
    }

    print("\n[*] Starting training loop...\n")
    results = model.train(**train_args)
    print("\n[+] Training completed successfully!")
    print(f"[+] Model checkpoints and metrics saved in: {args.project}/{args.name}")
    return results


# ═══════════════════════════════════════════════════════════════════════════════
# INFER — Inference & Quantitative Particle Sizing Engine
# ═══════════════════════════════════════════════════════════════════════════════

class MicroplasticQuantifier:
    """Converts pixel bounding boxes into calibrated physical micrometer dimensions."""

    def __init__(self, pixels_per_micron: float = 0.65):
        """
        Args:
            pixels_per_micron: Camera/lens calibration scale factor.
                Example: at 10x objective magnification with standard sensor,
                1 micrometer equates to ~0.5 to 1.2 pixels.
        """
        self.scale = max(1e-6, pixels_per_micron)

    def quantify(self, class_id: int, w_pixels: float, h_pixels: float, conf: float = 1.0) -> dict:
        w_um = w_pixels / self.scale
        h_um = h_pixels / self.scale
        feret_max_um = max(w_um, h_um)
        feret_min_um = min(w_um, h_um)
        aspect_ratio = feret_max_um / max(1e-6, feret_min_um)
        area_um2 = math.pi * (w_um / 2.0) * (h_um / 2.0)

        # Standard marine biology size classification
        if feret_max_um < 100:
            size_category = "< 100 um (Fine Microplastic)"
        elif feret_max_um < 300:
            size_category = "100 - 300 um (Medium Microplastic)"
        elif feret_max_um < 1000:
            size_category = "300 - 1000 um (Coarse Microplastic)"
        else:
            size_category = "1 - 5 mm (Large Microplastic)"

        return {
            "class_id": class_id,
            "polymer": CLASS_NAMES.get(class_id, f"Class_{class_id}"),
            "confidence": conf,
            "width_px": round(w_pixels, 1),
            "height_px": round(h_pixels, 1),
            "width_um": round(w_um, 2),
            "height_um": round(h_um, 2),
            "feret_max_um": round(feret_max_um, 2),
            "area_um2": round(area_um2, 2),
            "aspect_ratio": round(aspect_ratio, 2),
            "size_category": size_category,
        }


def cmd_infer(args):
    """Run YOLOv8 inference with physical quantification."""
    try:
        from ultralytics import YOLO
        import cv2
    except ImportError:
        print("[!] Ultralytics and OpenCV are required for inference.")
        print("    Install them with: pip install ultralytics opencv-python")
        sys.exit(1)

    import pandas as pd

    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    quantifier = MicroplasticQuantifier(pixels_per_micron=args.scale)

    print("=" * 65)
    print("      MICROPLASTIC INFERENCE & QUANTITATIVE SIZING ENGINE     ")
    print("=" * 65)
    print(f"[*] Weights            : {args.weights}")
    print(f"[*] Source             : {args.source.resolve()}")
    print(f"[*] Confidence Cutoff  : {args.conf:.2f}")
    print(f"[*] Calibration Scale  : {args.scale:.3f} px / um")
    print(f"[*] Output Directory   : {output_dir.resolve()}")
    print("=" * 65)

    model = YOLO(args.weights)

    # Collect source files
    source = args.source
    if source.is_dir():
        image_paths = sorted(
            [p for p in source.glob("*.*") if p.suffix.lower() in [".jpg", ".jpeg", ".png", ".tif", ".tiff"]]
        )
    elif source.is_file():
        image_paths = [source]
    else:
        print(f"[!] Invalid source path: {source}")
        sys.exit(1)

    if not image_paths:
        print(f"[!] No valid image files found in {source}")
        sys.exit(1)

    print(f"[*] Processing {len(image_paths)} images...\n")

    all_detections = []

    for img_idx, img_path in enumerate(image_paths, 1):
        results = model.predict(
            source=str(img_path),
            conf=args.conf,
            iou=args.iou,
            imgsz=args.imgsz,
            device=args.device if args.device else None,
            verbose=False,
        )

        res = results[0]
        boxes = res.boxes
        num_dets = len(boxes) if boxes is not None else 0
        print(f"[{img_idx}/{len(image_paths)}] {img_path.name} -> {num_dets} particle(s) detected")

        frame_dets = []
        if boxes is not None and num_dets > 0:
            for b in boxes:
                cid = int(b.cls[0].item())
                cf = float(b.conf[0].item())
                xyxy = b.xyxy[0].tolist()
                w_px = xyxy[2] - xyxy[0]
                h_px = xyxy[3] - xyxy[1]

                info = quantifier.quantify(class_id=cid, w_pixels=w_px, h_pixels=h_px, conf=cf)
                info["image"] = img_path.name
                info["bbox_xyxy"] = [round(v, 1) for v in xyxy]
                frame_dets.append(info)
                all_detections.append(info)

        # Save annotated image
        if not args.no_plots:
            annotated_img = res.plot(line_width=2, font_size=1)
            out_img_path = output_dir / f"det_{img_path.name}"
            cv2.imwrite(str(out_img_path), annotated_img)

    # Summarize & Export
    if all_detections:
        df = pd.DataFrame(all_detections)
        print("\n" + "=" * 65)
        print("                 QUANTITATIVE SUMMARY REPORT                 ")
        print("=" * 65)
        print(f"Total Particles Detected : {len(df):,}")
        print("\nPolymer Breakdown:")
        print(df["polymer"].value_counts().to_string())
        print("\nSize Category Distribution:")
        print(df["size_category"].value_counts().to_string())
        print("\nPhysical Size Statistics (um):")
        print(df[["feret_max_um", "area_um2", "aspect_ratio"]].describe().to_string())

        if not args.no_csv:
            csv_path = output_dir / "microplastic_quantification_report.csv"
            df.to_csv(csv_path, index=False)
            print(f"\n[+] Exported CSV report to: {csv_path.resolve()}")
    else:
        print("\n[INFO] No particles were detected matching confidence threshold.")

    print(f"[+] All outputs saved to: {output_dir.resolve()}")


# ═══════════════════════════════════════════════════════════════════════════════
# EXPORT — Model Export for Portable Edge Devices
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_export(args):
    """Export trained PyTorch YOLOv8 weights to optimized edge formats."""
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[!] Ultralytics is required for model export.")
        print("    Install it with: pip install ultralytics")
        sys.exit(1)

    export_format = args.format

    print("=" * 65)
    print("      YOLOV8 MODEL EXPORT FOR PORTABLE EDGE HARDWARE          ")
    print("=" * 65)
    print(f"[*] Input Weights      : {args.weights}")
    print(f"[*] Target Format      : {export_format.upper()}")
    print(f"[*] Resolution (imgsz) : {args.imgsz}x{args.imgsz}")
    print(f"[*] FP16 Half Precision: {args.half}")
    print(f"[*] Dynamic Dimensions : {args.dynamic}")
    print(f"[*] ONNX Simplify      : {not args.no_simplify}")
    print("=" * 65)

    model = YOLO(args.weights)

    export_kwargs = {
        "format": export_format,
        "imgsz": args.imgsz,
        "half": args.half,
        "dynamic": args.dynamic,
        "simplify": not args.no_simplify,
    }

    try:
        output_path = model.export(**export_kwargs)
        print("\n" + "=" * 65)
        print(f"[SUCCESS] Exported model to: {output_path}")
        print("=" * 65)
        return output_path
    except Exception as e:
        print(f"\n[!] Export failed: {e}")
        if export_format == "engine":
            print("    Note: TensorRT (.engine) export requires NVIDIA GPU and TensorRT installed.")
        elif export_format == "openvino":
            print("    Note: OpenVINO export requires `pip install openvino`.")
        elif export_format == "tflite":
            print("    Note: TFLite export requires `pip install tensorflow`.")
        sys.exit(1)


# ═══════════════════════════════════════════════════════════════════════════════
# CLI Entrypoint — Argument Parsing
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    repo_root = find_repo_root()

    parser = argparse.ArgumentParser(
        prog="yolo_pipeline",
        description="YOLOv8 Microplastic Detection & Identification Pipeline"
    )
    subparsers = parser.add_subparsers(dest="command", help="Pipeline stage to execute")

    # ── prepare ───────────────────────────────────────────────────────────
    p_prepare = subparsers.add_parser("prepare", help="Prepare and partition the dataset for YOLOv8.")
    p_prepare.add_argument(
        "--annotations", type=Path,
        default=repo_root / "data" / "nile-red-microplastics" / "annotations",
        help="Path to annotations directory containing polymer folders."
    )
    p_prepare.add_argument(
        "--output", type=Path,
        default=repo_root / "data" / "nile-red-microplastics",
        help="Output directory for YOLO formatted dataset."
    )
    p_prepare.add_argument("--train-ratio", type=float, default=0.70, help="Train split ratio (default: 0.70)")
    p_prepare.add_argument("--val-ratio", type=float, default=0.20, help="Validation split ratio (default: 0.20)")
    p_prepare.add_argument("--test-ratio", type=float, default=0.10, help="Test split ratio (default: 0.10)")
    p_prepare.add_argument("--seed", type=int, default=42, help="Random seed for reproducible stratified split.")
    p_prepare.add_argument("--generate-synthetic", action="store_true",
                           help="Generate synthetic fluorescence frames if raw images are absent.")
    p_prepare.add_argument("--dry-run", action="store_true",
                           help="Inspect dataset files and print split statistics without copying.")

    # ── train ─────────────────────────────────────────────────────────────
    p_train = subparsers.add_parser("train", help="Train YOLOv8 on Nile Red fluorescence dataset.")
    p_train.add_argument("--data", type=Path,
                         default=repo_root / "data" / "nile-red-microplastics" / "data.yaml",
                         help="Path to dataset YAML config.")
    p_train.add_argument("--weights", type=str, default="yolov8n.pt",
                         help="Initial model weights (yolov8n.pt, yolov8s.pt, etc.).")
    p_train.add_argument("--epochs", type=int, default=50, help="Number of training epochs (default: 50).")
    p_train.add_argument("--batch", type=int, default=16, help="Batch size (default: 16).")
    p_train.add_argument("--imgsz", type=int, default=640, help="Image resolution (default: 640).")
    p_train.add_argument("--device", type=str, default="", help="Device: '0', '0,1', 'cpu', 'cuda' (default: auto).")
    p_train.add_argument("--workers", type=int, default=4, help="DataLoader worker threads (default: 4).")
    p_train.add_argument("--patience", type=int, default=20, help="Early stopping patience (default: 20).")
    p_train.add_argument("--project", type=str, default="microplastic_experiments", help="Experiment project folder.")
    p_train.add_argument("--name", type=str, default="yolov8n_nile_red", help="Experiment run name.")
    p_train.add_argument("--resume", action="store_true", help="Resume training from last checkpoint.")

    # ── infer ─────────────────────────────────────────────────────────────
    p_infer = subparsers.add_parser("infer", help="Run inference and physical particle quantification.")
    p_infer.add_argument("--weights", type=str, default="yolov8n.pt", help="Path to trained YOLO weights (.pt).")
    p_infer.add_argument("--source", type=Path, required=True, help="Path to image or folder of images.")
    p_infer.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default: 0.25).")
    p_infer.add_argument("--iou", type=float, default=0.45, help="NMS IoU threshold (default: 0.45).")
    p_infer.add_argument("--imgsz", type=int, default=640, help="Inference resolution (default: 640).")
    p_infer.add_argument("--device", type=str, default="", help="Device (default: auto).")
    p_infer.add_argument("--scale", type=float, default=0.65, help="Calibration (pixels per micrometer).")
    p_infer.add_argument("--output-dir", type=Path, default=Path("inference_results"),
                         help="Output directory for annotated images and reports.")
    p_infer.add_argument("--no-plots", action="store_true", help="Disable saving annotated images.")
    p_infer.add_argument("--no-csv", action="store_true", help="Disable CSV report export.")

    # ── export ────────────────────────────────────────────────────────────
    p_export = subparsers.add_parser("export", help="Export model to edge hardware formats.")
    p_export.add_argument("--weights", type=str, required=True, help="Path to trained YOLOv8 .pt weights.")
    p_export.add_argument("--format", type=str, default="onnx",
                          choices=["onnx", "openvino", "engine", "tflite", "coreml", "saved_model"],
                          help="Target export format (default: onnx).")
    p_export.add_argument("--imgsz", type=int, default=640, help="Image resolution (default: 640).")
    p_export.add_argument("--half", action="store_true", help="Export with FP16 half-precision.")
    p_export.add_argument("--dynamic", action="store_true", help="Enable dynamic batch / spatial dimensions.")
    p_export.add_argument("--no-simplify", action="store_true", help="Disable onnx-simplifier.")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(0)

    dispatch = {
        "prepare": cmd_prepare,
        "train": cmd_train,
        "infer": cmd_infer,
        "export": cmd_export,
    }
    dispatch[args.command](args)


if __name__ == "__main__":
    main()
