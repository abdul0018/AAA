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
    if voice.get("_seed") is not None:  # different seed = different take (and its own cache entry)
        body["seed"] = voice["_seed"]
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


def words_from_alignment(text, al, offset, shift=0):
    """Word timings from ElevenLabs char alignment. Bracketed v3 audio tags ([excited], [laughs] ...) are
    spoken as delivery cues, not words, so they are excluded from captions. `shift` = length of a prefix
    (voice-level tags) that is not part of the plan text; returned `pos` is relative to the plan text."""
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    if "".join(chars) != text:  # should not happen with `alignment` (not normalized_alignment)
        print("warning: alignment text differs from input; timings approximate", file=sys.stderr)
    tags = [(m.start(), m.end()) for m in re.finditer(r"\[[^\]]*\]", text)]
    out = []
    for m in re.finditer(r"\S+", text):
        a, b = m.start(), min(m.end(), len(st)) - 1
        if a >= len(st):
            break
        word = re.sub(r"\[[^\]]*\]", "", m.group())
        if a < shift or not word or any(ta <= a < tb and m.end() <= tb for ta, tb in tags):
            continue
        out.append({"text": word, "start": round(st[a] + offset, 3), "end": round(en[b] + offset, 3), "pos": a - shift})
    return out


def trim_pauses(path, words, max_pause, lead=0.05):
    """Shorten every pause longer than `max_pause` (cut from the middle of the silence, so no speech is
    touched) and remap word times. Gives faster, punchier pacing without time-stretching the voice."""
    cuts = []
    if words and words[0]["start"] > lead:
        cuts.append((0.0, words[0]["start"] - lead))
    for w, nx in zip(words, words[1:]):
        gap = nx["start"] - w["end"]
        if gap > max_pause:
            cuts.append((w["end"] + max_pause / 2, nx["start"] - max_pause / 2))
    if not cuts:
        return 0.0
    keep, t = [], 0.0
    for a, b in cuts:
        keep.append((t, a)); t = b
    keep.append((t, 1e9))
    expr = "+".join(f"between(t,{a:.4f},{b:.4f})" for a, b in keep if b > a)
    tmp = path + ".trim.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-af", f"aselect='{expr}',asetpts=N/SR/TB",
                    "-c:a", "libmp3lame", "-b:a", "192k", tmp], check=True)
    os.replace(tmp, path)
    def remap(x):
        return round(x - sum(min(b, x) - a for a, b in cuts if x > a), 3)
    for w in words:
        w["start"], w["end"] = remap(w["start"]), remap(w["end"])
    return sum(b - a for a, b in cuts)


_MMS = None


def judge_clarity(path, text):
    """Clarity 0..1 (character match) via Meta MMS Uzbek ASR (optional: needs CPU torch + transformers)."""
    global _MMS
    try:
        import numpy as np, torch, difflib
        from transformers import AutoProcessor, Wav2Vec2ForCTC
        if _MMS is None:
            pr = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="uzb-script_latin")
            md = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="uzb-script_latin", ignore_mismatched_sizes=True).eval()
            _MMS = (pr, md)
        pr, md = _MMS
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
        x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        with torch.no_grad():
            hyp = pr.decode(md(**pr(x, sampling_rate=16000, return_tensors="pt")).logits.argmax(-1)[0])
        # character match ignoring spaces/hyphens/apostrophes (MMS often splits or joins Uzbek words differently)
        clean = lambda s: re.sub(r"[^a-z]", "", s.lower().translate(APOS).replace("'", ""))
        return difflib.SequenceMatcher(None, clean(text), clean(hyp)).ratio()
    except ImportError:
        return 1.0


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

    prefix = (voice["tags"].strip() + " ") if voice.get("tags") else ""  # v3 audio tags, e.g. "[excited][speaking fast]"
    vo = os.path.join(a.public, "vo.mp3")
    if voice.get("per_scene"):
        # Energetic mode: one short TTS request per scene, each with the delivery tags (v3 tags fade over a long
        # request), every clip trimmed to its speech and joined with a tight, fixed gap. Exact pacing control.
        gap = float(voice.get("gap", 0.1))
        words, wavs, t0 = [], [], 0.0
        for i, sc in enumerate(scenes):
            text = sc["vo"].strip()
            # best-of-N takes: v3 pacing varies a lot per take; keep the fastest take that is still clear
            best = None
            n_takes, max_takes = int(voice.get("takes", 1)), int(voice.get("max_takes", 6))
            for k in range(max_takes):
                if k >= n_takes and best is not None and best[0][0]:
                    break  # enough takes and the best one is clear
                if k >= n_takes and not voice.get("judge"):
                    break
                d = tts(prefix + text, dict(voice, _seed=1000 + k), None, None, cache)
                raw_k = os.path.join(cache, f"scene{i}_take{k}.mp3")
                open(raw_k, "wb").write(base64.b64decode(d["audio_base64"]))
                ws_k = words_from_alignment(prefix + text, d["alignment"], 0.0, shift=len(prefix))
                if not ws_k:
                    continue
                span = ws_k[-1]["end"] - ws_k[0]["start"]
                rate = len(text) / max(0.3, span)
                clar = judge_clarity(raw_k, text) if voice.get("judge") else 1.0
                ok = clar >= float(voice.get("min_clarity", 0.8))
                score = (ok, rate if ok else clar)
                if best is None or score > best[0]:
                    best = (score, raw_k, ws_k, rate, clar)
            if best is None:
                sys.exit(f"no words aligned for scene {i}: {text!r}")
            _, raw, ws, rate, clar = best
            if int(voice.get("takes", 1)) > 1:
                print(f"  scene {i:2}: picked take {raw[-5]} ({rate:.1f} chars/s{', clarity %.2f' % clar if voice.get('judge') else ''})")
            cs, ce = max(0.0, ws[0]["start"] - 0.03), min(duration(raw), ws[-1]["end"] + 0.08)
            clip = os.path.join(cache, f"scene{i}.wav")
            pad = gap if i + 1 < len(scenes) else 0.0
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                            f"atrim={cs:.3f}:{ce:.3f},asetpts=N/SR/TB,afade=t=in:d=0.01,afade=t=out:st={max(0, ce - cs - 0.02):.3f}:d=0.02,apad=pad_dur={pad:.3f}",
                            "-ar", "44100", "-ac", "1", clip], check=True)
            for w in ws:
                w["start"] = round(w["start"] - cs + t0, 3)
                w["end"] = round(w["end"] - cs + t0, 3)
                w["scene"] = i
            words += ws
            wavs.append(clip)
            t0 += duration(clip)
        lst = os.path.join(cache, "list.txt")
        open(lst, "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in wavs))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "libmp3lame", "-b:a", "192k", vo], check=True)
    else:
        full = " ".join(blocks)
        limit = 2800 if voice.get("model_id", "eleven_v3") == "eleven_v3" else 4500  # v3 max request is ~3000 chars
        chunks = [full] if len(full) <= limit else blocks  # long scripts: chapter-sized requests
        words, mp3s, t0 = [], [], 0.0
        for i, text in enumerate(chunks):
            prev = chunks[i - 1][-300:] if len(chunks) > 1 and i else None
            nxt = chunks[i + 1][:300] if len(chunks) > 1 and i + 1 < len(chunks) else None
            d = tts(prefix + text, voice, prev, nxt, cache)
            p = os.path.join(cache, f"part{i}.mp3")
            open(p, "wb").write(base64.b64decode(d["audio_base64"]))
            ws = words_from_alignment(prefix + text, d["alignment"], t0, shift=len(prefix))
            for w in ws:
                w["chunk"] = i
            words += ws
            mp3s.append(p)
            t0 += duration(p)
        if len(mp3s) == 1:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3s[0], "-c", "copy", vo], check=True)
        else:
            lst = os.path.join(cache, "list.txt")
            open(lst, "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in mp3s))
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "libmp3lame", "-b:a", "192k", vo], check=True)
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
            w["scene"] = max(i for i, (c, b) in enumerate(starts) if (c, b) <= (w["chunk"], w["pos"]))

    for w in words:
        w["key"] = any(norm(w["text"]).startswith(k) for k in keys)
    if voice.get("max_pause"):
        saved = trim_pauses(vo, words, float(voice["max_pause"]))
        print(f"trimmed {saved:.1f}s of pauses (max pause {voice['max_pause']}s)")
    # Loudness-normalise the voice to -14 LUFS (v3 comes out ~-20 LUFS, which sounds too quiet on phones).
    tmp = vo + ".norm.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vo, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", tmp], check=True)
    os.replace(tmp, vo)
    total = duration(vo)

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
        "pace": plan.get("pace", "energetic"),
        "sfx": bool(plan.get("sfx", False)),
        "audio": {"vo": "vo.mp3", **({"music": plan["music"], "musicVolume": plan.get("musicVolume", 0.12)} if plan.get("music") else {})},
    }
    json.dump(props, open(os.path.join(a.public, "props.json"), "w"), ensure_ascii=False, indent=1)
    wpm = len(words) / max(0.1, words[-1]["end"] - words[0]["start"]) * 60
    print(f"vo.mp3 {total:.1f}s | {len(words)} words | {wpm:.0f} wpm | {len(out_scenes)} scenes | video {props['duration']:.1f}s")
    for s in out_scenes:
        print(f"  {s['start']:6.2f}-{s['end']:6.2f}  ch{s['chapter']:02d} {s['chapterLabel']:<12} {len(s['overlays'])} overlays")


if __name__ == "__main__":
    main()
