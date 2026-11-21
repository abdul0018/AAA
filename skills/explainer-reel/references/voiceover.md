# Voiceover

## What the reference voice is
A young adult male, conversational and confident, with an "I'm telling you a secret" energy. Close-mic and dry (no
room), heavily compressed, about 2.7 words per second, with pauses of 0.3 s or less except right before "Chirs!".
Loudness -14 to -16 LUFS, with a music bed about 14-18 dB under it.
**Do not clone the reference creator's voice.** Use a preset voice, or clone the USER's own voice from their recording.

## Default route: Higgsfield MCP → ElevenLabs v4 (verified working for Uzbek)
Tested on 2026-11-21: `elevenlabs_v4_turbo` with preset voice **Grady** read the Uzbek Latin test lines correctly
(a Whisper round-trip recovered every word). Cost: about **0.3 credits per 100 characters**. A full 60 s script
(≈900 chars) costs about 3 credits.

1. Write the script as plain Uzbek Latin. Spell numbers as words ("o'n ming", not "10 000") so they are read
   correctly, and use straight `'` for o'/g'.
2. Price it with `estimate_audio_cost`, then generate (always pass `use_unlim:false` unless the user picks unlim):
   ```json
   {"model": "elevenlabs_v4_turbo", "prompt": "Uzbek explainer VO",
    "dialogue": [{"text": "<whole script>", "voice_type": "preset", "voice_id": "<id>"}],
    "use_unlim": false}
   ```
   Use `elevenlabs_v4` (not turbo) for more expressive delivery, and `batch_size: 2-3` to pick the best take.
   Then `jobs_wait`, and download the `result_url` with curl into `public/vo_raw.mp3`.
3. Male voices worth auditioning (`list_voices` gives preview URLs): Grady `e2a2d2e6-9ed2-59cd-82af-feaa27f8a678`
   (tested), Holden `3c9d6053-6334-592c-8997-4e325286af3f`, Dylan `b847bc29-f184-583a-8ad9-d1f1e16d1a60`,
   Jasper `a7b8abe9-47f1-553e-a9df-87945a7e5bc8`, Miles `e18664a7-ee4f-5273-acf8-533eb24cd366`,
   Knox `195e386a-cb61-5c1b-a53b-0e2f0669c408`. Female: Faye, Isla, Maeve.
4. **The user's own voice** (best for a personal brand): get a 30-60 s clean recording, `media_upload` it, run
   `create_voice` (or `create_voice_from_confirmed_audio`), then use `voice_type:"element"` with the returned id.
   Only clone a voice the user owns or has consent for.

## Pace and mastering (always run)
ElevenLabs reads Uzbek at about 2.0 words/s. The style needs about 2.7, so speed it up without changing the pitch,
then compress and normalise:
```bash
ffmpeg -y -i public/vo_raw.mp3 -af "atempo=1.15,highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80:makeup=3dB,loudnorm=I=-14:TP=-1.5:LRA=7" -ar 44100 public/vo.wav
```
Use atempo 1.10-1.25 and target a final length of 0.37-0.40 s per word. Trim silences over 0.5 s with
`silenceremove=stop_periods=-1:stop_duration=0.45:stop_threshold=-40dB` if the take is slow.

## Timing → props
```bash
python3 -I scripts/vo_timing.py public/vo.wav --lang uz --out timing.json --find "tok uradimi" --find "o'n ming volt" ...
```
Use each `found` time as the `at` of the matching headline/counter (scene-relative: subtract the scene's start).
Put headlines 0-0.15 s **before** the word (they read faster than they are heard). Whisper misspells Uzbek
(o→o', q→k, ş): the fuzzy finder copes, but read the word list if a match score is below 0.5.

## The user's ElevenLabs subscription (direct API, key already configured)
The key is a network secret for `api.elevenlabs.io`: send `-H "xi-api-key: proxy-injected"` and the proxy swaps in the
real key. The key lacks `user_read`, so don't call `/v1/user`. Use it for: `eleven_v3` / the newest multilingual model with
voice-library voices (search native Uzbek voices: `GET /v1/shared-voices?language=uz`), voice cloning of the user's
own voice, `/v1/sound-generation` (SFX), `/v1/music`, and `/v1/audio-isolation` to clean a phone recording. TTS:
```bash
curl -s -o public/vo_raw.mp3 -X POST "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>?output_format=mp3_44100_192" \
  -H "xi-api-key: proxy-injected" -H "Content-Type: application/json" \
  -d '{"text":"<script>","model_id":"eleven_v3","language_code":"uz"}'
```
Max 4 concurrent requests on this plan.

## Alternatives (only if Higgsfield is unavailable)
| Option | Uzbek | Needs from the user |
|---|---|---|
| ElevenLabs API direct (`eleven_v3` / v4) | yes | ElevenLabs API key (Starter plan $5/mo is enough for about 30 reels) |
| Microsoft Edge TTS `uz-UZ-SardorNeural` / `uz-UZ-MadinaNeural` (free) | yes, robotic | runs locally on the user's PC (`pip install edge-tts`). Cloud sandboxes block its WebSocket |
| Google Cloud TTS | check the current list | GCP key |
| The user records it on a phone | perfect | a quiet room; then run the mastering chain above |
