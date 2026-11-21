---
name: sfx-kit
description: "320 professional CC0 sound effects (WAV 48 kHz/24-bit: whooshes, reverse whooshes, risers, impacts, cinematic hits, booms, pops, UI clicks, writing, notifications, shimmers, data count-ups, digital, logo stings) with per-sound sync points, matched loudness and under-voiceover gains. Use whenever a video, reel, animation or UI needs sound effects or sound design: picking the right sound for an on-screen moment, syncing it frame-accurately and mixing it under a voiceover. Free for commercial use, no credit needed."
---

# SFX Kit (Wyzowl, CC0)

Source: https://github.com/wyzowl/sfx-kit (also on Hugging Face `wyzowl/sfx-kit`). License: CC0 1.0, so any use, commercial
included, with no attribution. Installed here with the full sound files. If `sounds/` is missing (e.g. a fresh machine), run `bash fetch.sh` in this folder first.

## Use it in 3 steps
1. **Find**: read `GUIDE.md` §1 (on-screen moment → sound table) and `catalogue.md` (one line per sound). In code, load
   `sounds.json` (`use_for`, `avoid_for`, `tags`, `fits_seconds`).
2. **Place**: `start = moment − sync.at`. `sync.meets` tells you which moment: `instant` (the frame it happens),
   `action-start`, `move-peak` (a whoosh's fastest point: ease-out ≈ 25 % into the move, ease-in-out = the middle),
   `arrival` (the reveal/cut a riser or reverse-whoosh builds into), `release`.
3. **Level**: files are loudness-matched (a medium effect ≈ −20.5 LUFS short-term at 0 dB). Lower each by its
   `under_voiceover_db` wherever its body overlaps speech. Don't put `avoid_for: "On top of speech…"` sounds (booms,
   stings, cinematic hits) under talking unless it's the one payoff moment.

Rate changes move the pitch and the timing: divide `sync.at` by the rate. Fit a length with rate = `span_seconds` / moment,
within `adapt.rate`. Trimmed starts need 10-30 ms fades, cut ends 20-50 ms.

## Pro sound-design rules (how editors use a kit like this)
- **Less is more**: one sound per meaningful event, never one per element. Movement gets a whoosh, appearance a pop,
  landing an impact, a reveal a riser into a hit, correct/wrong a notification.
- **Layer the big moments**: reverse-whoosh (arrival) → impact/cinematic hit (instant) → a short tail (sub drop or
  shimmer). Small moments get a single quiet sound.
- **Match intensity to the video**: soft/subtle variants for voiceover-led explainers, hard ones only for punches.
- **Keep the voice on top**: duck the music 8-12 dB under speech (sidechain), apply `under_voiceover_db` to SFX, and
  high-pass everything except the booms.
- **Stay in key**: tuned sounds are C major pentatonic, which sits with music in C/G/F major or A/D/E minor.
- **Master**: −14 LUFS integrated, −1.5 dBTP for Instagram/TikTok/YouTube Shorts.

For automatic placement from an `explainer-reel` props.json, use
`explainer-reel/scripts/sfx_cues.py` + `explainer-reel/scripts/pro_mix.py` (they read this kit's `sounds.json`).
