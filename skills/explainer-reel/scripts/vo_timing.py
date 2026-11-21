#!/usr/bin/env python3
"""Word-level timing for a voiceover, so titles/counters land exactly on the spoken word.

Usage:
  python3 -I vo_timing.py <voiceover.(mp3|wav)> [--lang uz] [--model medium] [--out timing.json]
                          [--find "tok uradimi" --find "o'n ming" ...]

Prints every word with start/end seconds and writes timing.json:
  {"duration": 59.6, "words": [{"w": "Mashinadan", "s": 0.12, "e": 0.71}, ...],
   "segments": [{"text": "...", "s": 0.0, "e": 6.3}], "found": {"tok uradimi": 1.84}}

--find does a fuzzy (accent/apostrophe-insensitive) search for a phrase and reports the start
time of its first word: use these as `at` values for titles in props.json. Whisper misspells
Uzbek a lot (o' -> o, sh -> ş, q -> k); the fuzzy match tolerates that.

Needs: pip install faster-whisper   (model downloads from huggingface on first run).
"""
import argparse, difflib, json, re, subprocess, sys, tempfile, unicodedata, wave
import numpy as np


def load_audio(path):
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", "16000", tmp], check=True)
    w = wave.open(tmp)
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    return a, w.getnframes() / 16000


def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("ş", "sh").replace("ç", "ch").replace("ı", "i")
    s = re.sub(r"[ʻʼ'`‘’]", "", s)
    s = s.replace("q", "k").replace("x", "h").replace("w", "v")
    return re.sub(r"[^a-z0-9 ]", "", s)


def find_phrase(words, phrase):
    target = norm(phrase).split()
    n = len(target)
    best, best_t = 0.0, None
    for i in range(len(words) - n + 1):
        cand = " ".join(norm(w["w"]) for w in words[i:i + n])
        r = difflib.SequenceMatcher(None, cand, " ".join(target)).ratio()
        if r > best:
            best, best_t = r, words[i]["s"]
    return best_t, best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--lang", default="uz")
    ap.add_argument("--model", default="medium")
    ap.add_argument("--out", default="timing.json")
    ap.add_argument("--find", action="append", default=[])
    a = ap.parse_args()

    from faster_whisper import WhisperModel  # imported late so --help works without it

    audio, dur = load_audio(a.audio)
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    # condition_on_previous_text=False + VAD: stops Whisper's repetition/hallucination collapse on long files
    segs, _ = model.transcribe(audio, language=a.lang, word_timestamps=True, condition_on_previous_text=False,
                               vad_filter=True, vad_parameters={"min_silence_duration_ms": 250})
    words, segments = [], []
    for s in segs:
        segments.append({"text": s.text.strip(), "s": round(s.start, 2), "e": round(s.end, 2)})
        for w in s.words or []:
            words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
    found = {}
    for ph in a.find:
        t, score = find_phrase(words, ph)
        found[ph] = t
        print(f"FIND {ph!r:30} -> {t}s (match {score:.2f})")
    for s in segments:
        print(f"[{s['s']:6.2f}-{s['e']:6.2f}] {s['text']}")
    json.dump({"duration": round(dur, 2), "words": words, "segments": segments, "found": found}, open(a.out, "w"), ensure_ascii=False, indent=1)
    print("wrote", a.out, f"({len(words)} words, {dur:.2f}s)")


if __name__ == "__main__":
    main()
