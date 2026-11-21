#!/usr/bin/env python3
"""Side-by-side QA: reference vs ours at matching story beats, plus numeric style distance.

Usage: python3 -I compare.py --ref ref.mp4 --ours ours.mp4 --pairs "0.8:1.0,5.2:5.0,11:10.5" --out compare.png
Metrics per pair and overall: mean Lab colour (ΔE between averages), lightness/contrast, chroma, edge density
(line-art weight). Aim for ΔE_avg < 6, chroma within ±15 %, edge density within ±25 %.
"""
import argparse, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import importlib.util, os
spec = importlib.util.spec_from_file_location("cm", os.path.join(os.path.dirname(os.path.abspath(__file__)), "color_match.py"))
cm = importlib.util.module_from_spec(spec); spec.loader.exec_module(cm)


def grab(v, t, w=360):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t}", "-i", v, "-frames:v", "1", "-vf", f"scale={w}:{int(w*16/9)}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return Image.frombytes("RGB", (w, int(w * 16 / 9)), raw)


def metrics(im):
    a = np.asarray(im, float).reshape(-1, 3) / 255; lab = cm.rgb2lab(a)
    e = np.asarray(im.convert("L").filter(ImageFilter.FIND_EDGES), float)
    return lab.mean(0), lab[:, 0].std(), np.hypot(lab[:, 1], lab[:, 2]).mean(), (e > 40).mean()


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--ref"); ap.add_argument("--ours"); ap.add_argument("--pairs"); ap.add_argument("--out", default="compare.png")
    a = ap.parse_args()
    pairs = [tuple(float(x) for x in p.split(":")) for p in a.pairs.split(",")]
    sheet = Image.new("RGB", (364 * len(pairs), 640 * 2 + 60), (20, 20, 20)); d = ImageDraw.Draw(sheet)
    rows = []
    for i, (tr, to) in enumerate(pairs):
        A, B = grab(a.ref, tr), grab(a.ours, to)
        sheet.paste(A, (i * 364, 0)); sheet.paste(B, (i * 364, 640 + 30))
        ma, mb = metrics(A), metrics(B)
        dE = float(np.linalg.norm(ma[0] - mb[0]))
        rows.append((dE, mb[2] / max(ma[2], 1e-6), mb[3] / max(ma[3], 1e-6)))
        d.text((i * 364 + 6, 642), f"ref {tr}s / ours {to}s  dE {dE:.1f}  chroma x{rows[-1][1]:.2f}  edges x{rows[-1][2]:.2f}", fill=(255, 220, 90))
    sheet.save(a.out)
    m = np.array(rows).mean(0)
    print(f"avg dE {m[0]:.1f} | chroma ratio {m[1]:.2f} | edge-density ratio {m[2]:.2f}  -> {a.out}")


if __name__ == "__main__":
    main()
