---
name: uz-explainer-reel
description: Make a dark, chaptered 9:16 explainer reel (75-90 s) with a realistic UZBEK voiceover. Near-black and crimson look, a "bob 03/10" header with a progress bar, word-by-word captions with boxed key words, 3D or infographic proof shots, donut/year/battery/stat-card/stamp overlays, and a poll plus subscribe CTA. Use when the user asks for "this style", an explainer/educational reel, a "how does X work" video, a video like the hybrid-car reel, or any reel that needs an Uzbek voiceover.
---

# Uzbek chaptered explainer reel

This skill recreates the style of a reference reel: a 90 s Russian hybrid-car explainer from an auto channel. It changes one thing: **the voiceover is Uzbek**, made with ElevenLabs native Uzbek voices. The visuals are rebuilt in Remotion, and the voice is generated with word-level timestamps so every caption word, key-word box, chip, stamp and counter lands exactly when it is spoken.

Read before building:
- `references/visual-breakdown.md`: palette, fonts, layout, beat table, motion rules. Look at `references/stills/*.jpg`.
- `references/voiceover-breakdown.md`: voice analysis, the 12-step script formula, the original transcript, Uzbek TTS writing rules, voice IDs and settings, and the mix.

## The style in 10 rules

1. Use a near-black radial background (`#161618`) and **one accent, crimson `#B8304F`** (`#E0566F` for crimson text). White text, grey secondary text. No other colours.
2. The **fixed header** never moves: a logo ring, `@handle`, the topic in mono, `bob 03/10` in grey mono, the chapter name in crimson, and **10 progress segments** that fill through the current chapter.
3. **One caption line** at y≈340, at most about 4 words, breaking at punctuation. Words appear **as spoken**, the next word ghosts in at 28 %, and **key words get a crimson selection box with corner handles**.
4. The middle of the screen always **proves** the sentence: a moving 3D or photo shot, or a flat infographic.
5. A small **summary chip** (pill) near the bottom restates the beat in 3-5 words.
6. **Stamps** (rotated, crimson outline, extended heavy caps) land on punchline words: IKKALASI BIRGA, BEPUL, AFSONA.
7. Numbers **count up** (donut 0→41 %, year 1880→1900, battery 62→78 %).
8. Keep the **camera moving** (zoom 1.0→1.1 on every shot). Cut on the spoken noun, with a new idea every 2-4 s.
9. The hook (first scene) is a **huge extended-font title** built word by word over a bright shot, with the key word in crimson.
10. End with a **poll** ("Gibrid olarmiding?" Ha / Yo‘q, "izohlarda yoz") and then a **logo CTA** whose crimson "Obuna bo‘lish" button flips to "Obuna bo‘ldingiz ✓".

## Workflow

1. **Get the topic and the brand.** Ask only for what is missing: the topic, a channel handle, a short logo word, and any facts or sources the user wants included. Footage, renders or a music track are optional.
2. **Write the Uzbek script** with the 12-step formula in `voiceover-breakdown.md`: 10 chapters, about 190-210 words, informal "sen", numbers spelled out, short sentences. Show it to the user with the chapter names. Verify every fact. Do not invent statistics: if a number cannot be verified, cut it or ask.
3. **Write `plan.json`.** Copy `template/plan.example.json`, which is a complete working 10-chapter example. Each chapter has a `label` and `scenes`. Each scene has `vo` (Uzbek text), an optional `bg` (image or video in `public/`), `hook`, `transition` (`cut`|`fade`|`streak`) and `overlays`. Set an overlay's `at` and `until` as **word anchors**: `"@bepul"` is the moment the word starting with "bepul" is spoken, and `"@bepul+0.2"` or a number of seconds from the scene start also work. `keys` lists the word stems that get the selection box.
   Overlay kinds: `chip`, `stamp`, `bigNumber`, `donut`, `battery`, `statCard`, `poll`, `cta`, `image`, `label` (a mono x-ray callout at x/y). Fields are in `template/src/types.ts`.
4. **Audition the voice, using the user's own ElevenLabs voices.** The connected key is the user's account. Run `python3 <skill>/scripts/audition_voices.py --out voices/ --text "<your hook + cold open>"`. It renders the line with every Uzbek voice in their account and ranks them by clarity, pace and pitch. Send the top 3-4 mp3s and let the user pick by ear. Default to **Sardor `UjuEL3hLLUaDED9iW4Yb`** on `eleven_multilingual_v2` (measured closest to the reference; table in `voiceover-breakdown.md`). Never use v3 for Uzbek unless asked. The key is injected by the proxy, or read from `ELEVENLABS_API_KEY`.
5. **Prepare the visuals.** Put the user's footage or renders in `public/media/`. Without footage you can either (a) offer to generate stills or clips with an image/video tool, using the palette prompt in `visual-breakdown.md`, and **ask first because it costs credits**, or (b) drop `bg` and let the infographic overlays carry the scene. Icons for `image` overlays should be flat white or grey with crimson accents, as transparent PNGs.
6. **Build.** Set up the project:
   ```bash
   cp -r <skill>/template ./reel && cd reel && npm i
   bash <skill>/scripts/fetch_fonts.sh public          # Unbounded / Montserrat / JetBrains Mono, local
   python3 <skill>/scripts/build_props.py plan.json --public public   # vo.mp3 + props.json (TTS cached)
   ```
   The builder prints the wpm and the scene timings. The target is 135-155 wpm and 75-90 s. If the video runs long, cut words rather than raising the speed above 1.1.
7. **Check the frames.** Render a still inside each chapter with `npx remotion still src/index.ts Reel out/f.png --frame=N --scale=0.5` and look at each one. Check for caption overflow, overlays colliding with the caption or chips, and legibility over bright backgrounds (raise `bg.dim`). Then make a contact sheet: `ffmpeg -pattern_type glob -i 'out/*.png' -vf "scale=270:-1,tile=8x2" -frames:v 1 sheet.jpg`.
8. **Render and mix.** Run `npx remotion render src/index.ts Reel out/reel.mp4 --codec=h264 --crf=18`. If there is music, set `"music": "music.mp3"` in the plan (bed at 0.10-0.14), then loudnorm to −14 LUFS (command in `voiceover-breakdown.md`). Send the mp4 with a post caption in Uzbek: hook question, 1-line value, "Izohlarda yozing 👇".

## Environment notes

- In cloud containers Chrome does not trust the proxy CA, so Google-Fonts CDN loads fail and the render hangs. That is why fonts are local (`fetch_fonts.sh` uses curl, which trusts the CA). Pass the preinstalled browser with `--browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell` and `--timeout=60000`.
- Pin all `remotion` / `@remotion/*` packages to the same version (template: 4.0.545).
- ElevenLabs on the free tier allows `mp3_44100_128` only. The speech-to-text permission may be missing; use local `faster-whisper` to transcribe a reference video, decoding to 16 kHz with ffmpeg and passing a numpy array.
- TTS responses are cached in `public/.tts_cache/` by text and voice, so re-running after editing overlays costs nothing. Editing any `vo` text re-bills only that request.

## Learning a new reference video in this family

Run `ffmpeg -i ref.mp4 -vf fps=1,scale=360:-1 f_%03d.jpg` and tile the frames into contact sheets to read the beats. Transcribe with faster-whisper (word timestamps) to get the wpm, the pauses and the script structure. Sample the colours from stills with PIL. Then map each beat onto the overlay kinds above, adding a new kind in `Overlays.tsx` only if nothing fits.
