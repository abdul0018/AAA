#!/usr/bin/env python3
"""Make any SFX file (ElevenLabs, downloads, recordings) sit on the SFX Kit loudness scale so it can be mixed by
pro_mix.py next to kit sounds: trims leading/trailing silence, sets the loudest 150 ms to the kit's medium reference
(~ -20.5 LUFS-ish, measured here as K-weighted-approx RMS), limits true peak to -3 dBTP, writes 48 kHz/24-bit WAV.

Usage: python3 -I match_sfx.py <in files...> --out <dir> [--target -20.5]
The sound's sync point is then its start (onset), so in props use {"src": "<dir>/<name>.wav", "at": <moment>}.
"""
import argparse, os, subprocess
import numpy as np

SR = 48000


def load(path, af=""):
    chain = f"aresample={SR}" + (f",{af}" if af else "")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", chain, "-ac", "2", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--target", type=float, default=-20.5)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for f in a.files:
        # approximate K-weighting: high-shelf +4 dB @1.5 kHz and high-pass 60 Hz, for measurement only
        k = load(f, "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,highpass=f=60,treble=g=4:f=1500")
        m = k.mean(1)
        w = int(0.15 * SR)
        if len(m) < w:
            m = np.pad(m, (0, w - len(m)))
        c = np.convolve(m ** 2, np.ones(w) / w, "valid")
        loud = 10 * np.log10(c.max() + 1e-12) - 0.691
        gain = a.target - loud
        name = os.path.splitext(os.path.basename(f))[0]
        dst = os.path.join(a.out, name + ".wav")
        af = (f"silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
              f"afade=t=out:st=0:d=0.001,volume={gain:.2f}dB,alimiter=limit=0.708:level=disabled,aresample={SR}")
        # (the 1 ms fade is a no-op guard; real fades come from the source)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-af", af.replace("afade=t=out:st=0:d=0.001,", ""), "-ar", str(SR), "-c:a", "pcm_s24le", dst], check=True)
        print(f"{name:24} loudest150ms {loud:6.1f} -> {a.target} (gain {gain:+.1f} dB)  -> {dst}")


if __name__ == "__main__":
    main()
