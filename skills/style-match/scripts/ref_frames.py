#!/usr/bin/env python3
"""Pick representative style-reference frames from a reference video (one per scene + evenly spaced fill-ins),
blur a watermark zone, and write a contact sheet.

Usage: python3 -I ref_frames.py ref.mp4 out_dir [--n 8] [--wm "x0,y0,x1,y1"]   (wm box in 0..1 fractions; default top-right 0.55,0,1,0.09)
"""
import argparse, os, subprocess, json
import numpy as np
from PIL import Image, ImageFilter


def probe(v):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", v], capture_output=True, text=True).stdout)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("out"); ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--wm", default="0.55,0,1,0.09"); a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    dur = probe(a.video)
    # coarse visual-change curve at 4 fps
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.video, "-vf", "fps=4,scale=64:114", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 114, 64, 3).astype(float)
    diff = np.r_[0, np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2, 3))]
    # split into n segments of equal "visual change", take the middle of each
    c = np.cumsum(diff + 1e-3); c /= c[-1]
    times = [float(np.searchsorted(c, (k + 0.5) / a.n)) / 4 for k in range(a.n)]
    x0, y0, x1, y1 = [float(v) for v in a.wm.split(",")]
    paths = []
    for i, t in enumerate(times):
        p = os.path.join(a.out, f"ref_{i:02d}_{t:05.2f}.png")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{min(t, dur - 0.05):.2f}", "-i", a.video, "-frames:v", "1", p], check=True)
        im = Image.open(p).convert("RGB"); W, H = im.size
        if x1 > x0:
            box = (int(W * x0), int(H * y0), int(W * x1), int(H * y1)); im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(18)), box)
        im.save(p); paths.append(p)
    ims = [Image.open(p).resize((180, 320)) for p in paths]
    sheet = Image.new("RGB", (184 * len(ims), 320)); [sheet.paste(im, (i * 184, 0)) for i, im in enumerate(ims)]
    sheet.save(os.path.join(a.out, "refs_sheet.png"))
    json.dump({"times": times, "frames": paths}, open(os.path.join(a.out, "refs.json"), "w"), indent=1)
    print("\n".join(paths)); print("sheet:", os.path.join(a.out, "refs_sheet.png"))


if __name__ == "__main__":
    main()
