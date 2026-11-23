#!/usr/bin/env python3
"""Uzbek voiceover (ElevenLabs, with timestamps) + plan.json  ->  public/vo.mp3 + public/props.json

Usage:
  python3 build_props.py plan.json --public ../template/public          # TTS + props
  python3 build_props.py plan.json --public ../template/public --sample # only first chapter, for voice audition

The ElevenLabs key is injected by the session proxy (any dummy value works) or read from
ELEVENLABS_API_KEY. TTS results are cached in <public>/.tts_cache/ keyed by text+voice, so
re-running after editing overlays/timing costs nothing.
"""
import argparse, base64, hashlib, json, os, re, subprocess, sys, urllib.request

API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"
APOS = str.maketrans({"‘": "'", "’": "'", "ʻ": "'", "ʼ": "'", "`": "'"})
EDGE_PUNCT = "«»\"“”„.,:;!?—–-()…"


def norm(w):
    return w.translate(APOS).strip(EDGE_PUNCT + "'").lower()


def tts(text, voice, prev=None, nxt=None, cache_dir=None):
    model = voice.get("model_id", "eleven_v3")
    if model == "eleven_v3":
        # v3 is the only ElevenLabs model that pronounces Uzbek clearly (see voiceover-breakdown.md).
        # Natural defaults: stability 0.5 ("Natural"; v3 accepts 0.0 / 0.5 / 1.0), no style/speed tricks.
        vs = {"stability": voice.get("stability", 0.5), "similarity_boost": voice.get("similarity_boost", 0.8)}
    else:
        vs = {
            "stability": voice.get("stability", 0.55),
            "similarity_boost": voice.get("similarity_boost", 0.8),
            "style": voice.get("style", 0.0),
            "use_speaker_boost": True,
            "speed": voice.get("speed", 1.0),
        }
    body = {"text": text, "model_id": model, "voice_settings": vs}
    if voice.get("language_code"):  # note: no ElevenLabs model accepts "uz" here (2026-11); leave unset for Uzbek
        body["language_code"] = voice["language_code"]
    if prev and model != "eleven_v3":  # v3 rejects previous_text/next_text
        body["previous_text"] = prev
    if nxt and model != "eleven_v3":
        body["next_text"] = nxt
    key = hashlib.sha1(json.dumps([voice.get("voice_id"), body], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]
    cpath = os.path.join(cache_dir, key + ".json")
    if os.path.exists(cpath):
        return json.load(open(cpath))
    req = urllib.request.Request(
        API.format(voice=voice["voice_id"]),
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")},
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs error {e.code}: {e.read().decode()[:500]}")
    json.dump(d, open(cpath, "w"))
    return d


def words_from_alignment(text, al, offset):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    if "".join(chars) != text:  # should not happen with `alignment` (not normalized_alignment)
        print("warning: alignment text differs from input; timings approximate", file=sys.stderr)
    out = []
    for m in re.finditer(r"\S+", text):
        a, b = m.start(), min(m.end(), len(st)) - 1
        if a >= len(st):
            break
        out.append({"text": m.group(), "start": round(st[a] + offset, 3), "end": round(en[b] + offset, 3), "pos": a})
    return out


def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())


def resolve(at, scene, sw, default):
    if at is None:
        return round(default, 3)
    if isinstance(at, (int, float)):
        return round(scene["start"] + at, 3)
    m = re.match(r"^@(.+?)(?:([+-]\d+(?:\.\d+)?))?$", str(at))
    if not m:
        sys.exit(f"bad time anchor: {at!r} (use seconds-from-scene-start or '@word' / '@word+0.2')")
    stem, off = norm(m.group(1)), float(m.group(2) or 0)
    for w in sw:
        if norm(w["text"]).startswith(stem):
            return round(w["start"] + off, 3)
    sys.exit(f"anchor {at!r} not found in scene: {' '.join(w['text'] for w in sw)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan")
    ap.add_argument("--public", required=True)
    ap.add_argument("--sample", action="store_true", help="first chapter only")
    ap.add_argument("--tail", type=float, default=1.0, help="seconds of silence after the last word")
    a = ap.parse_args()

    plan = json.load(open(a.plan))
    chapters = plan["chapters"][:1] if a.sample else plan["chapters"]
    os.makedirs(a.public, exist_ok=True)
    cache = os.path.join(a.public, ".tts_cache")
    os.makedirs(cache, exist_ok=True)
    keys = [norm(k) for k in plan.get("keys", [])]
    voice = plan["voice"]

    # Flatten scenes and build per-chapter text blocks (one TTS request per chunk keeps prosody natural)
    scenes, blocks = [], []
    for ci, ch in enumerate(chapters, 1):
        parts = []
        for sc in ch["scenes"]:
            sc = dict(sc, chapter=ci, chapterLabel=ch["label"])
            sc["_ci"] = len(blocks)
            sc["_off"] = sum(len(p) + 1 for p in parts)
            parts.append(sc["vo"].strip())
            scenes.append(sc)
        blocks.append(" ".join(parts))

    full = " ".join(blocks)
    limit = 2800 if voice.get("model_id", "eleven_v3") == "eleven_v3" else 4500  # v3 max request is ~3000 chars
    chunks = [full] if len(full) <= limit else blocks  # long scripts: chapter-sized requests with context
    words, mp3s, t0 = [], [], 0.0
    for i, text in enumerate(chunks):
        prev = chunks[i - 1][-300:] if len(chunks) > 1 and i else None
        nxt = chunks[i + 1][:300] if len(chunks) > 1 and i + 1 < len(chunks) else None
        d = tts(text, voice, prev, nxt, cache)
        p = os.path.join(cache, f"part{i}.mp3")
        open(p, "wb").write(base64.b64decode(d["audio_base64"]))
        ws = words_from_alignment(text, d["alignment"], t0)
        for w in ws:
            w["chunk"] = i
        words += ws
        mp3s.append(p)
        t0 += duration(p)

    vo = os.path.join(a.public, "vo.mp3")
    if len(mp3s) == 1:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3s[0], "-c", "copy", vo], check=True)
    else:
        lst = os.path.join(cache, "list.txt")
        open(lst, "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in mp3s))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "libmp3lame", "-b:a", "192k", vo], check=True)
    # Loudness-normalise the voice to -14 LUFS (v3 comes out ~-20 LUFS, which sounds too quiet on phones).
    tmp = vo + ".norm.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vo, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", tmp], check=True)
    os.replace(tmp, vo)
    total = duration(vo)

    # Assign words to scenes by character position
    starts = []
    for sc in scenes:
        if len(chunks) == 1:
            base = sum(len(b) + 1 for b in blocks[: sc["_ci"]]) + sc["_off"]
            chunk = 0
        else:
            base, chunk = sc["_off"], sc["_ci"]
        starts.append((chunk, base))
    for w in words:
        idx = max(i for i, (c, b) in enumerate(starts) if (c, b) <= (w["chunk"], w["pos"]))
        w["scene"] = idx
        w["key"] = any(norm(w["text"]).startswith(k) for k in keys)

    for i, sc in enumerate(scenes):
        sw = [w for w in words if w["scene"] == i]
        sc["start"] = 0.0 if i == 0 else round(sw[0]["start"] - 0.05, 3)
    for i, sc in enumerate(scenes):
        sc["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else round(total + a.tail, 3)

    out_scenes = []
    for i, sc in enumerate(scenes):
        sw = [w for w in words if w["scene"] == i]
        ovs = []
        for o in sc.get("overlays", []):
            o = dict(o)
            o["at"] = resolve(o.get("at"), sc, sw, sc["start"] + 0.15)
            if "until" in o:
                o["until"] = resolve(o["until"], sc, sw, sc["end"])
            ovs.append(o)
        out_scenes.append({k: v for k, v in {
            "start": sc["start"], "end": sc["end"], "chapter": sc["chapter"], "chapterLabel": sc["chapterLabel"],
            "hook": sc.get("hook"), "bg": sc.get("bg"), "transition": sc.get("transition"), "overlays": ovs,
        }.items() if v is not None})

    props = {
        "brand": plan["brand"],
        "totalChapters": len(plan["chapters"]),
        "duration": out_scenes[-1]["end"],
        "words": [{"text": w["text"], "start": w["start"], "end": w["end"], **({"key": True} if w["key"] else {})} for w in words],
        "scenes": out_scenes,
        "audio": {"vo": "vo.mp3", **({"music": plan["music"], "musicVolume": plan.get("musicVolume", 0.12)} if plan.get("music") else {})},
    }
    json.dump(props, open(os.path.join(a.public, "props.json"), "w"), ensure_ascii=False, indent=1)
    wpm = len(words) / max(0.1, words[-1]["end"] - words[0]["start"]) * 60
    print(f"vo.mp3 {total:.1f}s | {len(words)} words | {wpm:.0f} wpm | {len(out_scenes)} scenes | video {props['duration']:.1f}s")
    for s in out_scenes:
        print(f"  {s['start']:6.2f}-{s['end']:6.2f}  ch{s['chapter']:02d} {s['chapterLabel']:<12} {len(s['overlays'])} overlays")


if __name__ == "__main__":
    main()
