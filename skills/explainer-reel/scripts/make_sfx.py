#!/usr/bin/env python3
"""Generate the explainer-reel sound pack procedurally (no downloads, no API keys).

Usage:  python3 make_sfx.py <out_dir> [--music SECONDS]

Writes 44.1 kHz 16-bit WAVs:
  pop.wav       soft UI pop for a title / object appearing        (~0.12 s)
  pop_hi.wav    brighter pop for small badges, marks, inset circles
  tick.wav      tiny click, used in a fast loop by number counters
  whoosh.wav    filtered-noise swish for scene transitions         (~0.45 s)
  whoosh_rev.wav reversed swish (suck-in) before a big reveal
  thud.wav      low soft impact under a punch word                 (~0.35 s)
  zap.wav       static-electric discharge crackle (the "CHIRS!")    (~0.5 s)
  ding.wav      clean bell for a check mark / correct answer
  error.wav     short low buzz for a red X / wrong answer
  sparkle.wav   glittery ascending ticks for charges / particles
  riser.wav     1.2 s noise+tone riser that builds into a payoff
  rain.wav      4 s seamless light-rain loop
  hum.wav       2 s seamless electric hum loop (for "charged" states)
  music_bed.wav (only with --music N) calm D-minor ambient pad, N seconds
"""
import sys, os, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=None, curve=4.0):
    """Attack then exponential decay envelope of n samples."""
    a_n = max(1, int(SR * a))
    e = np.ones(n)
    e[:a_n] = np.linspace(0, 1, a_n)
    rest = n - a_n
    if rest > 0:
        e[a_n:] = np.exp(-curve * np.linspace(0, 1, rest))
    return e


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff can be a scalar or an array."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    y = np.zeros_like(x)
    prev = 0.0
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    for i in range(len(x)):
        prev += k[i] * (x[i] - prev)
        y[i] = prev
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def norm(x, peak=0.89):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def fade(x, fi=0.003, fo=0.01):
    n_i, n_o = int(SR * fi), int(SR * fo)
    if n_i:
        x[:n_i] *= np.linspace(0, 1, n_i)
    if n_o:
        x[-n_o:] *= np.linspace(1, 0, n_o)
    return x


def save(path, x, stereo_width=0.0):
    x = np.clip(x, -1, 1)
    if stereo_width:
        d = int(SR * 0.012)
        r = np.concatenate([np.zeros(d), x[:-d]])
        st = np.stack([x, x * (1 - stereo_width) + r * stereo_width], 1)
    else:
        st = np.stack([x, x], 1)
    data = (st * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def pop(freq0=520, freq1=180, d=0.12, bright=0.25):
    tt = t(d)
    f = freq1 + (freq0 - freq1) * np.exp(-tt * 45)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env(len(tt), 0.002, curve=7)
    click = highpass(rng.standard_normal(len(tt)), 3000) * env(len(tt), 0.0005, curve=60) * bright
    return fade(norm(body + click, 0.8))


def tick():
    tt = t(0.035)
    x = np.sin(2 * np.pi * 2200 * tt) * env(len(tt), 0.0005, curve=25)
    x += highpass(rng.standard_normal(len(tt)), 4000) * env(len(tt), 0.0003, curve=80) * 0.4
    return fade(norm(x, 0.55), 0.0005, 0.005)


def whoosh(d=0.45):
    n = int(SR * d)
    noise = rng.standard_normal(n)
    x = np.linspace(0, 1, n)
    shape = np.sin(np.pi * x) ** 1.6
    cutoff = 400 + 5200 * np.sin(np.pi * x) ** 2
    y = lowpass(noise, cutoff)
    y = highpass(y, 180) * shape
    return fade(norm(y, 0.7), 0.01, 0.05)


def thud():
    tt = t(0.35)
    f = 48 + 90 * np.exp(-tt * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, curve=9)
    knock = lowpass(rng.standard_normal(len(tt)), 900) * env(len(tt), 0.001, curve=40) * 0.6
    return fade(norm(body + knock, 0.9))


def zap():
    n = int(SR * 0.55)
    y = np.zeros(n)
    # dense random crackle bursts
    for _ in range(70):
        pos = int(abs(rng.normal(0.06, 0.09)) * SR)
        if pos >= n - 400:
            continue
        L = int(rng.integers(60, 380))
        burst = rng.standard_normal(L) * np.exp(-np.linspace(0, 6, L)) * rng.uniform(0.3, 1)
        y[pos:pos + L] += burst
    y = highpass(y, 1400)
    # bright snap at the start
    tt = t(0.02)
    y[: len(tt)] += highpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 250) * 2.5
    # buzzy carrier (mains-like) decaying
    tb = t(0.55)
    buzz = np.sign(np.sin(2 * np.pi * 110 * tb)) * 0.18 * np.exp(-tb * 9)
    y += lowpass(buzz, 2500)
    return fade(norm(y, 0.92), 0.0005, 0.08)


def ding():
    tt = t(0.9)
    x = (np.sin(2 * np.pi * 1318.5 * tt) + 0.45 * np.sin(2 * np.pi * 2637 * tt) + 0.2 * np.sin(2 * np.pi * 3955 * tt))
    x *= env(len(tt), 0.002, curve=6)
    return fade(norm(x, 0.6))


def error():
    tt = t(0.32)
    x = np.sign(np.sin(2 * np.pi * 150 * tt)) * 0.5 + np.sin(2 * np.pi * 75 * tt)
    x = lowpass(x, 1200) * env(len(tt), 0.004, curve=5)
    return fade(norm(x, 0.55))


def sparkle():
    n = int(SR * 0.7)
    y = np.zeros(n)
    for i in range(9):
        pos = int(i * 0.07 * SR)
        f = 1800 * (1.12 ** i) * rng.uniform(0.97, 1.03)
        tt = t(0.12)
        s = np.sin(2 * np.pi * f * tt) * env(len(tt), 0.001, curve=14) * (0.5 + 0.5 * rng.random())
        y[pos:pos + len(s)] += s[: max(0, min(len(s), n - pos))]
    return fade(norm(y, 0.45))


def riser(d=1.2):
    n = int(SR * d)
    x = np.linspace(0, 1, n)
    noise = lowpass(rng.standard_normal(n), 300 + 7000 * x ** 2)
    f = 180 + 700 * x ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    y = (highpass(noise, 200) + tone) * x ** 2
    return fade(norm(y, 0.6), 0.02, 0.01)


def loopify(y, xf=0.25):
    """Crossfade tail into head so the clip loops seamlessly."""
    n = int(SR * xf)
    head, tail = y[:n].copy(), y[-n:].copy()
    w = np.linspace(0, 1, n)
    y = y[: len(y) - n].copy()
    y[:n] = head * w + tail * (1 - w)
    return y


def rain(d=4.0):
    n = int(SR * (d + 0.25))
    bed = lowpass(highpass(rng.standard_normal(n), 900), 6000) * 0.12
    drops = np.zeros(n)
    for _ in range(int(d * 55)):
        pos = int(rng.integers(0, n - 800))
        L = int(rng.integers(120, 600))
        f = rng.uniform(2500, 6000)
        tt = np.arange(L) / SR
        drops[pos:pos + L] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 300) * rng.uniform(0.05, 0.4)
    return norm(loopify(bed + drops), 0.35)


def hum(d=2.0):
    tt = t(d + 0.25)
    x = sum(np.sin(2 * np.pi * 100 * k * tt) / k for k in range(1, 6)) * 0.4
    x *= 1 + 0.15 * np.sin(2 * np.pi * 3 * tt)
    return norm(loopify(x), 0.25)


def music_bed(seconds):
    """Calm ambient pad, D minor: Dm - Bb - F - C, 4 s per chord, soft pluck pulse."""
    chords = [[146.83, 174.61, 220.0, 293.66], [116.54, 146.83, 174.61, 233.08],
              [174.61, 220.0, 261.63, 349.23], [130.81, 164.81, 196.0, 261.63]]
    n = int(SR * seconds)
    y = np.zeros(n)
    seg = 4.0
    for i in range(int(np.ceil(seconds / seg))):
        ch = chords[i % 4]
        s0 = int(i * seg * SR)
        L = min(int((seg + 1.0) * SR), n - s0)
        if L <= 0:
            break
        tt = np.arange(L) / SR
        e = np.minimum(1, tt / 0.8) * np.minimum(1, np.maximum(0, (seg + 1.0 - tt)) / 1.0)
        pad = sum(np.sin(2 * np.pi * f * tt + k) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) for k, f in enumerate(ch))
        bass = np.sin(2 * np.pi * ch[0] / 2 * tt) * 0.8
        y[s0:s0 + L] += (pad * 0.18 + bass * 0.25) * e
        # soft pluck arpeggio on 8th notes (tempo 120)
        for j in range(8):
            p0 = s0 + int(j * 0.5 * SR)
            f = ch[[0, 2, 3, 1, 2, 3, 1, 2][j]] * 2
            pl = np.arange(int(0.45 * SR)) / SR
            note = np.sin(2 * np.pi * f * pl) * np.exp(-pl * 7) * 0.12
            end = min(n, p0 + len(note))
            y[p0:end] += note[: end - p0]
    y = lowpass(y, 2400)
    y = fade(y, 1.0, 2.0)
    return norm(y, 0.5)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    bank = {
        "pop": pop(), "pop_hi": pop(900, 420, 0.09, 0.4), "tick": tick(),
        "whoosh": whoosh(), "whoosh_rev": whoosh()[::-1].copy(), "thud": thud(), "zap": zap(),
        "ding": ding(), "error": error(), "sparkle": sparkle(), "riser": riser(),
        "rain": rain(), "hum": hum(),
    }
    for name, x in bank.items():
        save(os.path.join(out, f"{name}.wav"), x, stereo_width=0.3 if name in ("whoosh", "whoosh_rev", "rain", "sparkle") else 0)
        print("wrote", name)
    if "--music" in sys.argv:
        secs = float(sys.argv[sys.argv.index("--music") + 1])
        save(os.path.join(out, "music_bed.wav"), music_bed(secs), stereo_width=0.5)
        print("wrote music_bed", secs, "s")


if __name__ == "__main__":
    main()
