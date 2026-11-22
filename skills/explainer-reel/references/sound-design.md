# Sound design (pro pipeline)

## What's in the reference mix
- **Voice** on top, about -14 to -16 LUFS, dry and compressed.
- **Music bed**: calm, minor/neutral, about **14-15 dB under the voice**. It is never dramatic and has no beat drops.
- **SFX**: a soft pop/whoosh on headlines and transitions, ticks on counters, and a layered electric zap + sting on the
  payoff. Every sound sits 6-12 dB under the voice.

## The professional chain (default; verified 2026-11-21)
```
render picture only  ->  sfx_cues.py (props -> frame-accurate cue sheet)  ->  pro_mix.py (voice chain + SFX bus +
ducked music + master)  ->  final.mp4 (-14 LUFS, -1.5 dBTP, AAC 256k/48k)
```
```bash
K=~/.claude/skills/explainer-reel/scripts
# props.json needs "muteAll": true  (Remotion renders picture only)
npx remotion render ExplainerReel out/silent.mp4 --props=public/props.json --codec=h264 --crf=17 --muted $BROWSER
python3 -I $K/sfx_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json
python3 -I $K/pro_mix.py --video out/silent.mp4 --vo public/vo.wav --cues cues.json --music public/music.wav \
        --out out/final.mp4 --stems out/stems
```
Read the printed cue list: every sound has a reason ("title …", "counter runs", "scene 5 transition"). Remove or
retune anything that would feel busy.

### Sources, best first
1. **SFX Kit** (skill `sfx-kit`, Wyzowl, CC0, 320 sounds, 48 kHz/24-bit): sync points, matched loudness and
   under-voiceover gains. `sfx_cues.py` picks from it automatically:
   | Event | Kit sound(s) |
   |---|---|
   | scene cross-fade | `whoosh-slow-soft` peaking mid-fade (-5 dB) |
   | headline | `pop-small-in` (-2), and an underline adds `writing-highlighter` fitted to the draw |
   | red impact word | `reverse-whoosh-short-strong` → `impact-deep-hard` + `bass-sub-drop-short` |
   | counter | `data-countup/decrease-short/medium/long` rate-fitted to the count + `data-number-land` |
   | charges / flowTo | `shimmer-short-soft` / `whoosh-medium-soft` |
   | magnifier inset | `move-zoom-in` (arrival when it settles) |
   | highlight box | `writing-marker-draw` (cut to 0.5 s) |
   | check / cross / question | `notification-success-soft` / `notification-failure-knock` / `pop-medium-bubble` |
   | slide-in / walk-in / zoomOut / pop / drop | whoosh sized to the move / slow whoosh / `move-zoom-out` / `pop-medium-in` / `impact-light-soft` |
   | shake (not on a red title) | `impact-heavy-firm` |
   | spark | procedural `sfx/zap.wav` + `impact-light-hard` |
   Custom per scene: `"sfx": [{"src": "kit:<id>", "at": s, "gain_db": -4, "fit": len, "max_len": s}]`.
2. **ElevenLabs Sound Effects** (the user has a subscription; the key is saved as a network secret for
   `api.elevenlabs.io`, so send the header `xi-api-key: proxy-injected` and the proxy injects the real key) for
   **topic-specific** sounds the kit lacks (car suspension clunk, oil squelch, engine, door, rain on a roof…):
   ```bash
   curl -s -o public/sfx_el/clunk.mp3 -X POST "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192" \
     -H "xi-api-key: proxy-injected" -H "Content-Type: application/json" \
     -d '{"text":"A single loud metallic clunk from a worn car suspension hitting a pothole, close-up, dry, no music","duration_seconds":1.0,"prompt_influence":0.6}'
   python3 -I $K/match_sfx.py public/sfx_el/*.mp3 --out public/sfx_pro   # trim silence + kit loudness scale
   ```
   Then `"sfx": [{"src": "sfx_pro/clunk.wav", "at": 1.9, "gain_db": -3}]`. Max **4 concurrent requests** on the user's
   plan: generate in batches of 4 or fewer. Describe one event, its material, distance ("close-up"), "dry, no music".
   The official ElevenLabs skills are installed too (`elevenlabs-sound-effects`, `elevenlabs-music`,
   `elevenlabs-text-to-speech`, `elevenlabs-voice-isolator`). Their SDK code reads `ELEVENLABS_API_KEY`: set it to
   `proxy-injected` for the command (the proxy overwrites the header).
3. **Procedural pack** (`make_sfx.py`): only for electricity (`zap.wav`), `rain.wav` and `hum.wav`, or when offline.

### Music
- Best: **ElevenLabs Music**, via Higgsfield `elevenlabs_music_v2_5` (≈8.4 credits per 58 s track) or the user's
  ElevenLabs key (`POST https://api.elevenlabs.io/v1/music` with `{"prompt", "music_length_ms", "force_instrumental": true}`;
  see the `elevenlabs-music` skill). Use `force_instrumental`, a duration of the reel + 3 s, and a prompt like *"modern minimal
  background for an educational explainer under a voiceover, warm plucked synth + soft electric piano, deep sub,
  light tight lo-fi groove, 100 bpm, even energy, no drops, no risers, no vocals, no lead melody"*.
- **Key-match it to the kit**: the kit's tuned sounds are C major pentatonic. Detect the music's key and shift it to
  C major / A minor without changing the tempo (shift down 2 semitones for D major/B minor, for example):
  `ffmpeg -i music.mp3 -af "rubberband=pitch=0.890899:pitchq=quality:transients=crisp" -ar 48000 music_C.wav`
  (pitch = 2^(semitones/12)).
- `pro_mix.py` handles the rest: an EQ pocket (−3 dB low shelf, −4 dB @3 kHz), music 9 dB under the voice in gaps,
  ducked another 7 dB under speech (sidechain-style 60/400 ms), 0.4 s fade in and 2 s fade out.

### Voice chain (in pro_mix.py)
High-pass 80 Hz → −2 dB @250 Hz → +2.5 dB @3.5 kHz → de-esser → 3:1 compressor → −16 LUFS.

### Master and QA (in pro_mix.py)
2:1 glue compressor → limiter → 2-pass loudnorm to **−14 LUFS / −1.5 dBTP**. QA targets: the voice stem ≈ −16 LUFS,
the music stem ≈ −31 LUFS (about 15 dB under), SFX peaks 8-12 dB under the voice, LRA under 3 LU. To check
intelligibility, transcribe the final in 15 s chunks or with `condition_on_previous_text=False`: Whisper hallucinates on
long music-backed files, which is not a mix problem.

## Pro rules
- One sound per meaningful event. Layer only the payoff (build → hit → tail).
- Soft variants for explainers. Hard/cinematic ones only for the one punch moment.
- Name every custom sound by its job (`pothole_drop`, `metal_knock_big`) and keep the `why` field. The cue print-out
  is the editor's spotting sheet.
- Keep `sfx/zap.wav` for electricity, because the kit has none.

## ElevenLabs foley for the aero overlays (v2)
`POST /v1/sound-generation` (`xi-api-key: proxy-injected`, `output_format=mp3_44100_128`, `prompt_influence` 0.6),
then `ffmpeg -i x.mp3 -ar 48000 -ac 2 public/sfx/<name>.wav`:
| file | duration | prompt |
|---|---|---|
| air.wav | 4 | Smooth airflow wind rushing past a moving car, steady whoosh, clean, no engine |
| vortex.wav | 2 | Swirling turbulent wind vortex, rotating whoosh, short |
| mud.wav | 1.5 | A few wet mud splats hitting a car glass window, short squelchy splatter, close mic, no music |
| wiper.wav | 1.6 | Single sweep of a car rear window wiper across wet glass, rubber squeak and motor whirr, close up |
