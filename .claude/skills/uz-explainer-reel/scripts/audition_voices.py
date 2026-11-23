#!/usr/bin/env python3
"""Audition every Uzbek voice in the user's OWN ElevenLabs account and rank them.

  python3 audition_voices.py --out voices/                 # all account voices labelled uz (or verified uz)
  python3 audition_voices.py --out voices/ --text "..."    # custom line (use the script's hook + cold open)
  python3 audition_voices.py --out voices/ --models eleven_multilingual_v2,eleven_v3

For each voice x model it saves <out>/<Name>__<model>.mp3 and prints:
  clarity  = how well Whisper recovers the Uzbek text (0..1; needs `pip install faster-whisper`)
  secs     = duration (reel pace for the default line is ~9-11 s; >15 s is too slow)
  f0 / expr= median pitch and pitch spread in semitones (reference narrator: ~165 Hz, ~6 st)
Send the top 3-4 mp3s to the user and let them choose by ear; the numbers only pre-filter.
"""
import argparse, difflib, json, os, re, subprocess, urllib.request

DEFAULT_TEXT = ("Gibrid nima va nega u bunchalik kam benzin yeydi? Tong. Hovli. Mashinaga o‘tirasan, "
                "startni bosasan — motor esa jim. Mashina buzilmagan. U shunchaki elektrda yurib ketdi.")
KEY = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")


def get(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"xi-api-key": KEY}), timeout=60))


def account_voices(lang):
    out, tok = [], None
    while True:
        d = get("https://api.elevenlabs.io/v2/voices?page_size=100" + (f"&next_page_token={tok}" if tok else ""))
        out += d["voices"]
        if not d.get("has_more"):
            break
        tok = d["next_page_token"]
    def is_lang(v):
        l = (v.get("labels") or {}).get("language")
        return l == lang or any(x.get("language") == lang for x in (v.get("verified_languages") or []))
    return [v for v in out if is_lang(v)]


def tts(vid, text, model, path):
    vs = {"stability": 0.5, "similarity_boost": 0.85}
    if model != "eleven_v3":
        vs.update(style=0.35, use_speaker_boost=True, speed=1.05)
    body = json.dumps({"text": text, "model_id": model, "voice_settings": vs}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",
                                 data=body, headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    open(path, "wb").write(urllib.request.urlopen(req, timeout=180).read())


def pcm(path):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def pitch(a, sr=16000):
    import numpy as np
    f = []
    for i in range(0, len(a) - 1024, 800):
        fr = a[i:i + 1024]
        if np.sqrt((fr ** 2).mean()) < 0.03:
            continue
        fr = fr - fr.mean(); c = np.correlate(fr, fr, "full")[1023:]; lo, hi = sr // 400, sr // 70
        k = np.argmax(c[lo:hi]) + lo
        if c[k] > 0.3 * c[0]:
            f.append(sr / k)
    f = np.array(f)
    return float(np.median(f)), float(np.std(12 * np.log2(f / np.median(f))))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--text", default=DEFAULT_TEXT)
    ap.add_argument("--lang", default="uz")
    ap.add_argument("--models", default="eleven_multilingual_v2")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    voices = account_voices(a.lang)
    print(f"{len(voices)} '{a.lang}' voices in this account")
    try:
        from faster_whisper import WhisperModel
        wm = WhisperModel("small", device="cpu", compute_type="int8")
    except Exception:
        wm = None
        print("(faster-whisper not installed: skipping clarity score)")
    norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("‘", "").replace("'", "").replace("ʻ", ""))
    rows = []
    for v in voices:
        name = re.sub(r"\W+", "_", v["name"].split(" - ")[0]).strip("_") or v["voice_id"]
        for m in a.models.split(","):
            p = os.path.join(a.out, f"{name}__{m}.mp3")
            if not os.path.exists(p):
                tts(v["voice_id"], a.text, m, p)
            x = pcm(p)
            clar = None
            if wm:
                segs, _ = wm.transcribe(x, language=a.lang, beam_size=5)
                clar = difflib.SequenceMatcher(None, norm(a.text), norm(" ".join(s.text for s in segs))).ratio()
            f0, ex = pitch(x)
            rows.append((clar or 0, name, m, len(x) / 16000, f0, ex, v["voice_id"], v.get("category")))
    print(f"{'clarity':>7} | {'voice':<22} | {'model':<22} | secs | f0  | expr | voice_id")
    for r in sorted(rows, reverse=True):
        print(f"{r[0]:7.3f} | {r[1]:<22} | {r[2]:<22} | {r[3]:4.1f} | {r[4]:3.0f} | {r[5]:4.1f} | {r[6]} ({r[7]})")


if __name__ == "__main__":
    main()
