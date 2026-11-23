# "Ertalab 10 daqiqa qizdirasizmi?" (1:1 remake, Smart-Avto-style motion graphics)

A beat-for-beat remake of a 66 s reference reel, with the reference's script, the Adizzbek voice, and all-new visuals
(no frames or branding from the original; our watermark/handle/plate text).

- **Length** 64.1 s, 1080x1920, 30 fps, 12 scenes, word-by-word Oswald captions, Montserrat headlines.
- **VO**: ElevenLabs `eleven_v4`, Adizzbek `v4cqTf6wc2CXwA2tR7TF`, uz, stability 0.30 / similarity 0.80 / style 0.50 /
  speed 1.03 / speaker boost (the most natural of 3 takes), `/with-timestamps`. 11 dramatic pauses (0.3-0.75 s) were
  spliced in at sentence ends (e.g. before "Siz-chi?"). `words.json` holds the final word times.
- **Art** (gpt_image_2_6):
  - `cobalt_front.png` and `cobalt_side.png` are photoreal cut-outs drawn from real Uzbek Cobalt photos
    (Wikimedia Commons `Kobaltuz.jpg`, `Cobalt avtomobili.jpg`, `Chevrolet Cobalt, Toshkent.jpg`).
  - `engine.png` (empty bore), `piston.png`, `sump.png` and `reductor.png` are 3D renders style-locked to crops of
    the reference.
- **Animation** (`src/Warmup.tsx`):
  - timers, fuel gauge, speed/rpm gauges, temperature bars, 3 km bar
  - the piston running in the bore, oil climbing the pump pipe, camshaft and cylinder walls getting oiled
  - fuel spray dripping into the sump and thinning the oil
  - fuel can draining "havoga uchadi"; gas flow and frost on the reducer
  - exhaust smoke, a drifting star background, IG outro
- **Sound**: `build_cues.py` → `cues.json`, mixed by `pro_mix.py`:
  - ElevenLabs foley: cold start, idle, ticking timer, injector spray, gas hiss, freezing crackle, drive-by,
    thick oil
  - SFX Kit pops, whooshes, risers, number lands and an outro sting
  - the C-major music bed at -11 dB, ducked under the voice
  - master -14 LUFS / -1.5 dBTP

Rebuild: put `img/`, `sfx/`, `props.json` and `vo.wav` (from `vo_raw.mp3` plus the pauses) in `public/`, plus the
Montserrat 700/800 and Oswald 600/700 woff2 files in `public/fonts/`. Then:
`npx remotion render Warmup out/picture.mp4 --props=public/props.json --muted`, then `python3 -I build_cues.py`, then
`pro_mix.py --video out/picture.mp4 --vo public/vo.wav --cues cues.json --music public/music_C.wav --music-db -11`.
