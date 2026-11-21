#!/usr/bin/env python3
"""Fit a 3D LUT that moves OUR footage's colour distribution onto the REFERENCE's, then (optionally) apply it.

Method: per-channel histogram matching in Lab space (L, a, b quantile mapping) learned from frames of both videos,
blended with `--strength`, baked into a 33^3 .cube, applied with ffmpeg lut3d (deterministic, re-usable).

Usage:
  python3 -I color_match.py --ref ref.mp4 --src ours.mp4 --cube match.cube [--strength 0.8] [--apply out.mp4]
  (--ref/--src may also be folders of PNG frames)
"""
import argparse, glob, os, subprocess
import numpy as np


def frames(path, n=24):
    if os.path.isdir(path):
        from PIL import Image
        return np.concatenate([np.asarray(Image.open(p).convert("RGB").resize((160, 284)), float).reshape(-1, 3) for p in sorted(glob.glob(os.path.join(path, "*.png")))]) / 255
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={n / dur:.4f},scale=160:284", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(float) / 255


# --- sRGB <-> Lab (D65)
def _lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def _gam(c): return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); Mi = np.linalg.inv(M)
WP = np.array([0.95047, 1.0, 1.08883])
def _f(t): return np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
def _fi(t): return np.where(t > 0.2069, t ** 3, (t - 16 / 116) / 7.787)
def rgb2lab(rgb):
    xyz = _lin(rgb) @ M.T / WP; f = _f(xyz)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)
def lab2rgb(lab):
    fy = (lab[:, 0] + 16) / 116; fx = fy + lab[:, 1] / 500; fz = fy - lab[:, 2] / 200
    xyz = np.stack([_fi(fx), _fi(fy), _fi(fz)], 1) * WP
    return np.clip(_gam(xyz @ Mi.T), 0, 1)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--ref", required=True); ap.add_argument("--src", required=True)
    ap.add_argument("--cube", default="match.cube"); ap.add_argument("--strength", type=float, default=0.8); ap.add_argument("--apply")
    a = ap.parse_args()
    R, S = rgb2lab(frames(a.ref)), rgb2lab(frames(a.src))
    qs = np.linspace(0.005, 0.995, 99)
    maps = [(np.quantile(S[:, c], qs), np.quantile(R[:, c], qs)) for c in range(3)]
    N = 33; g = np.linspace(0, 1, N)
    b_, g_, r_ = np.meshgrid(g, g, g, indexing="ij")  # .cube order: r fastest
    grid = np.stack([r_.ravel(), g_.ravel(), b_.ravel()], 1)
    lab = rgb2lab(grid); out = lab.copy()
    for c, (sq, rq) in enumerate(maps):
        sq = np.maximum.accumulate(sq + np.arange(99) * 1e-6)
        out[:, c] = np.interp(lab[:, c], sq, rq)
    out = lab + a.strength * (out - lab)
    rgb = lab2rgb(out)
    with open(a.cube, "w") as f:
        f.write(f'TITLE "style-match"\nLUT_3D_SIZE {N}\n')
        for v in rgb: f.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
    stat = lambda X: f"L {X[:,0].mean():5.1f}±{X[:,0].std():4.1f}  a {X[:,1].mean():5.1f}  b {X[:,2].mean():5.1f}  chroma {np.hypot(X[:,1],X[:,2]).mean():4.1f}"
    print("ref ", stat(R)); print("src ", stat(S)); print("wrote", a.cube)
    if a.apply:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.src, "-vf", f"lut3d={a.cube}", "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-c:a", "copy", "-movflags", "+faststart", a.apply], check=True)
        print("applied ->", a.apply)


if __name__ == "__main__":
    main()
