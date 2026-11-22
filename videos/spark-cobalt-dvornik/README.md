# Nega Sparkda orqa dvornik bor, Cobaltda yo'q? (explainer-reel style)

The reference reel's script, word for word, rebuilt in the @autopodveska.uzb dark-board style with the Adizzbek voice.

- **Length** 35.1 s, 1080x1920, 30 fps, 14 beats.
- **VO**: ElevenLabs `eleven_v4`, voice Adizzbek `v4cqTf6wc2CXwA2tR7TF`, uz, speed 1.1, `/with-timestamps`.
  Sped up with atempo 1.06 → `public/vo.wav`. `words.json` holds the word times after that factor.
- **Art**: gpt_image_2_6 cut-outs, style-locked to the house `car_side.png`. The wiper baked into
  `spark_rear.png` was painted out, so the animated wiper can sweep.
- **Overlays**: the explainer-reel v2 aero kit (`flows`, `vortices`, `mud` with `film`/`wipe`, `wipers`, `tags`).
  Streamlines are traced from each car's alpha contour by `build_props.py`.
- **Sound**: SFX Kit cues plus ElevenLabs foley (`sfx/air|vortex|mud|wiper.wav`), mixed by `pro_mix.py` with the
  C-major music bed: voice -16 LUFS, master -14 LUFS / -1.5 dBTP.

Rebuild (inside an explainer-reel template project with these files in `public/`):
```bash
python3 build_props.py                                    # words.json + public/img -> public/props.json
npx remotion render ExplainerReel out/picture.mp4 --props=public/props.json --muted
python3 -I scripts/sfx_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json
python3 -I scripts/pro_mix.py --video out/picture.mp4 --vo public/vo.wav --cues cues.json --music public/music_C.wav --out out/final.mp4
```
