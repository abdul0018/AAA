#!/usr/bin/env python3
"""Audition every Uzbek voice in the user's OWN ElevenLabs account and rank them by Uzbek clarity.

  python3 audition_voices.py --out voices/                          # all account voices labelled/verified uz, eleven_v3
  python3 audition_voices.py --out voices/ --text "..."             # use the first 2 sentences of YOUR script
  python3 audition_voices.py --out voices/ --models eleven_v3,eleven_multilingual_v2

For each voice x model it saves <out>/<Name>__<model>.mp3 and prints:
  words / chars = how much of the Uzbek text Meta MMS (facebook/mms-1b-all, adapter uzb-script_latin) recovers.
                  Needs: pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install transformers
                  (the first run downloads ~4 GB). Whisper is NOT used: it is too weak in Uzbek and ranked voices wrongly.
  secs          = duration (>15 s for the default line is too slow for a reel)
Send the top 3-4 mp3s to the user and let them choose by ear; the numbers only pre-filter.
"""
import argparse, difflib, json, os, re, subprocess, urllib.request

DEFAULT_TEXT = ("Gibrid nima va nega u bunchalik kam benzin yeydi? Tong. Hovli. Mashinaga oʻtirasan, "
                "startni bosasan va motor jim. Mashina buzilmagan. U shunchaki elektrda yurib ketdi.")
KEY = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
APOS = "‘’ʻʼ'`"


def norm(s):
    s = s.lower()
    for c in APOS:
        s = s.replace(c, "")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z ]", "", s)).strip()


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
    vs = {"stability": 0.5, "similarity_boost": 0.8}
    if model != "eleven_v3":
        vs.update(style=0.0, use_speaker_boost=True, speed=1.0)
    body = json.dumps({"text": text, "model_id": model, "voice_settings": vs}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",
                                 data=body, headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    open(path, "wb").write(urllib.request.urlopen(req, timeout=180).read())


def pcm(path):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def load_judge():
    try:
        import torch
        from transformers import AutoProcessor, Wav2Vec2ForCTC
        proc = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="uzb-script_latin")
        mdl = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="uzb-script_latin", ignore_mismatched_sizes=True).eval()
    except Exception as e:
        print(f"(MMS judge unavailable: {e.__class__.__name__}; rendering samples only, judge by ear)")
        return None

    def judge(x):
        with torch.no_grad():
            ids = mdl(**proc(x, sampling_rate=16000, return_tensors="pt")).logits.argmax(-1)[0]
        return proc.decode(ids)

    return judge


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--text", default=DEFAULT_TEXT)
    ap.add_argument("--lang", default="uz")
    ap.add_argument("--models", default="eleven_v3")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    voices = account_voices(a.lang)
    print(f"{len(voices)} '{a.lang}' voices in this account")
    judge = load_judge()
    ref = norm(a.text)
    rows = []
    for v in voices:
        name = re.sub(r"\W+", "_", v["name"].split(" - ")[0]).strip("_") or v["voice_id"]
        for m in a.models.split(","):
            p = os.path.join(a.out, f"{name}__{m}.mp3")
            if not os.path.exists(p) or os.path.getsize(p) == 0:
                tts(v["voice_id"], a.text, m, p)
            x = pcm(p)
            wd = ch = 0.0
            if judge and len(x) > 16000:
                hyp = norm(judge(x))
                wd = difflib.SequenceMatcher(None, ref.split(), hyp.split()).ratio()
                ch = difflib.SequenceMatcher(None, ref, hyp).ratio()
            rows.append((wd, ch, name, m, len(x) / 16000, v["voice_id"], v.get("category"), p))
    print(f"{'words':>5} | {'chars':>5} | {'voice':<22} | {'model':<22} | secs | voice_id")
    for r in sorted(rows, reverse=True):
        print(f"{r[0]:5.2f} | {r[1]:5.2f} | {r[2]:<22} | {r[3]:<22} | {r[4]:4.1f} | {r[5]} ({r[6]})  {r[7]}")


if __name__ == "__main__":
    main()
