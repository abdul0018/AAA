#!/usr/bin/env python3
"""Professional audio post for an explainer reel: voice chain, SFX bus from a cue sheet, sidechain-ducked music,
bus glue + limiter + two-pass loudness normalisation, then mux onto the (silent) rendered video.

Usage:
  python3 -I pro_mix.py --video out/silent.mp4 --vo public/vo.wav --cues cues.json \
      [--music public/music.mp3] [--music-db -9] [--duck-db 7] [--lufs -14] --out out/final.mp4 [--stems out/stems]

Chain (what an editor would do in Premiere/Resolve/Audition):
  VOICE  high-pass 80 Hz -> -2 dB @250 Hz (mud) -> +2.5 dB @3.5 kHz (presence) -> de-ess -> 3:1 compression -> -16 LUFS
  SFX    each cue placed at start (s), rate-shifted, gained, and lowered by its under_voiceover_db while the voice talks
  MUSIC  EQ pocket (-3 dB low shelf, -4 dB @3 kHz), normalised, sits --music-db under the voice, ducks a further --duck-db under speech (60 ms attack / 400 ms
         release, like a sidechain compressor), 0.4 s fade in, 2 s fade out
  MASTER gentle 2:1 glue compression -> true-peak limiter -> loudnorm 2-pass to --lufs (default -14 LUFS, -1.5 dBTP)
Needs ffmpeg + numpy.
"""
import argparse, json, os, subprocess, tempfile
import numpy as np

SR = 48000
HOP = 480  # 10 ms analysis frames


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f"ffmpeg failed: {' '.join(cmd)}\n{r.stderr[-1500:]}")
    return r


def decode(path, af="", seconds=None, loop=False):
    """Decode any audio to float32 stereo @48k, optional filter chain."""
    cmd = ["ffmpeg", "-v", "error"]
    if loop:
        cmd += ["-stream_loop", "-1"]
    cmd += ["-i", path]
    if seconds:
        cmd += ["-t", f"{seconds:.4f}"]
    chain = f"aresample={SR}" + (f",{af}" if af else "")
    cmd += ["-af", chain, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def write_wav(path, x):
    with tempfile.NamedTemporaryFile(suffix=".f32", delete=False) as f:
        f.write(np.ascontiguousarray(x, np.float32).tobytes())
        raw = f.name
    run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-c:a", "pcm_s24le", path])
    os.unlink(raw)


def db(x):
    return 10 ** (x / 20)


def frame_rms_db(x):
    m = x.mean(1)
    n = len(m) // HOP
    r = np.sqrt((m[: n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)
    return 20 * np.log10(r)


def smooth(target, attack_ms, release_ms):
    """One-pole envelope follower on 10 ms frames (rising = attack, falling = release)."""
    a = np.exp(-10 / max(attack_ms, 1))
    r = np.exp(-10 / max(release_ms, 1))
    y = np.zeros_like(target)
    v = 0.0
    for i, t in enumerate(target):
        k = a if t > v else r
        v = k * v + (1 - k) * t
        y[i] = v
    return y


def to_samples(env, n):
    idx = np.arange(n) / HOP
    return np.interp(idx, np.arange(len(env)), env).astype(np.float32)


def place(bus, x, start):
    s = int(round(start * SR))
    if s >= len(bus):
        return
    e = min(len(bus), s + len(x))
    bus[s:e] += x[: e - s]


def loudness(path):
    r = subprocess.run(["ffmpeg", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    for ln in r.splitlines()[::-1]:
        if ln.strip().startswith("I:"):
            return ln.strip()
    return "?"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--vo", required=True)
    ap.add_argument("--cues", required=True)
    ap.add_argument("--music")
    ap.add_argument("--music-db", type=float, default=-9.0, help="music level vs voice while nobody talks")
    ap.add_argument("--duck-db", type=float, default=7.0, help="extra music reduction under speech")
    ap.add_argument("--sfx-db", type=float, default=0.0, help="master SFX trim")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--out", required=True)
    ap.add_argument("--stems")
    a = ap.parse_args()

    C = json.load(open(a.cues))
    dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.video]).stdout.strip())
    N = int(dur * SR)

    # ---- VOICE
    voice_chain = ("highpass=f=80,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1:g=2.5,deesser=i=0.35,"
                   "acompressor=threshold=-20dB:ratio=3:attack=4:release=60:makeup=2,loudnorm=I=-16:TP=-2:LRA=6")
    v = decode(a.vo, voice_chain)
    voice = np.zeros((N, 2), np.float32)
    voice[: min(N, len(v))] = v[:N]

    # speech mask (0..1) from the processed voice
    rms = frame_rms_db(voice)
    talk = (rms > rms.max() - 32).astype(float)
    # bridge gaps shorter than 250 ms (between words) so the music doesn't pump
    gap = 0
    for i in range(len(talk)):
        if talk[i]:
            if 0 < gap < 25:
                talk[i - gap:i] = 1
            gap = 0
        else:
            gap += 1
    mask_frames = smooth(talk, 60, 400)
    mask = to_samples(mask_frames, N)[:, None]

    # ---- SFX
    sfx = np.zeros((N, 2), np.float32)
    for c in C["cues"]:
        af = []
        if c.get("rate", 1) != 1:
            af += [f"asetrate={SR * c['rate']:.0f}", f"aresample={SR}"]
        if c.get("trim"):
            af += [f"atrim=start={c['trim'] / c.get('rate', 1):.4f}", "asetpts=PTS-STARTPTS", "afade=t=in:d=0.015"]
        if c.get("max_len") and not c.get("loop"):
            ml = c["max_len"]
            af += [f"atrim=end={ml:.4f}", f"afade=t=out:st={max(0, ml - 0.05):.4f}:d=0.05"]
        x = decode(c["file"], ",".join(af), seconds=c.get("max_len") if c.get("loop") else None, loop=bool(c.get("loop")))
        if c.get("loop") and len(x) > 0:  # fade loop ends
            f = min(len(x) // 4, int(0.3 * SR))
            x[:f] *= np.linspace(0, 1, f)[:, None]
            x[-f:] *= np.linspace(1, 0, f)[:, None]
        x = x * db(c.get("gain_db", 0) + a.sfx_db)
        s = int(round(c["start"] * SR))
        seg = mask[s: s + len(x)]
        if len(seg):  # under_voiceover_db applied in proportion to how much the voice is talking
            x[: len(seg)] *= db(c.get("uvo_db", -3) * seg)
        place(sfx, x, c["start"])

    # ---- MUSIC (sidechain ducked)
    music = np.zeros((N, 2), np.float32)
    if a.music:
        # EQ pocket: tame the sub, scoop the 2-4 kHz speech band so the voice cuts through on phone speakers
        m = decode(a.music, "highpass=f=40,lowshelf=g=-3:f=120,equalizer=f=3000:t=q:w=1.2:g=-4,loudnorm=I=-16:TP=-2:LRA=11", seconds=dur, loop=True)[:N]
        m = m * db(a.music_db)
        m *= db(-a.duck_db * mask[: len(m)])
        fi, fo = int(0.4 * SR), int(2.0 * SR)
        m[:fi] *= np.linspace(0, 1, fi)[:, None]
        m[-fo:] *= np.linspace(1, 0, fo)[:, None]
        music[: len(m)] = m

    mixdown = voice + sfx + music
    tmp = tempfile.mkdtemp()
    pre = os.path.join(tmp, "premaster.wav")
    write_wav(pre, mixdown)
    if a.stems:
        os.makedirs(a.stems, exist_ok=True)
        for name, x in (("voice", voice), ("sfx", sfx), ("music", music)):
            write_wav(os.path.join(a.stems, f"{name}.wav"), x)

    # ---- MASTER: glue -> limiter -> 2-pass loudnorm
    glue = "acompressor=threshold=-14dB:ratio=2:attack=15:release=180:makeup=1,alimiter=limit=0.89:attack=3:release=60:level=disabled"
    r = run(["ffmpeg", "-v", "info", "-y", "-i", pre, "-af", f"{glue},loudnorm=I={a.lufs}:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"])
    js = r.stderr[r.stderr.rfind("{"): r.stderr.rfind("}") + 1]
    L = json.loads(js)
    ln2 = (f"loudnorm=I={a.lufs}:TP=-1.5:LRA=9:measured_I={L['input_i']}:measured_TP={L['input_tp']}:"
           f"measured_LRA={L['input_lra']}:measured_thresh={L['input_thresh']}:offset={L['target_offset']}:linear=true")
    master = os.path.join(tmp, "master.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", f"{glue},{ln2},aresample=48000", "-c:a", "pcm_s24le", master])
    run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-i", master, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", a.out])
    print(f"{len(C['cues'])} SFX cues | music {'yes' if a.music else 'no'} | master {loudness(a.out)}")
    if a.stems:
        for n in ("voice", "sfx", "music"):
            print(f"  stem {n:6}: {loudness(os.path.join(a.stems, n + '.wav'))}")
    print("wrote", a.out)


if __name__ == "__main__":
    main()
