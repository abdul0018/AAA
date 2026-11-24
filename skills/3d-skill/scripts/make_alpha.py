#!/usr/bin/env python3
"""Turn a render on a flat dark background into a transparent PNG (alpha from the distance to the bg colour,
colours un-premultiplied), so glass/x-ray renders sit on the grid board with no rectangle edge.
Usage: python3 -I make_alpha.py in.png out.png [--lo 6 --span 38]"""
import argparse
import numpy as np
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--lo', type=float, default=6); ap.add_argument('--span', type=float, default=38)
a = ap.parse_args()
im = np.array(Image.open(a.src).convert('RGB')).astype(float)
bg = np.median(np.concatenate([im[:12].reshape(-1, 3), im[-12:].reshape(-1, 3), im[:, :12].reshape(-1, 3), im[:, -12:].reshape(-1, 3)]), axis=0)
al = np.clip((np.abs(im - bg).max(axis=2) - a.lo) / a.span, 0, 1) ** 0.85
rgb = np.clip((im - bg * (1 - al[..., None])) / np.maximum(al[..., None], 1e-3), 0, 255)
Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA').save(a.dst)
print('bg', bg, '->', a.dst)
