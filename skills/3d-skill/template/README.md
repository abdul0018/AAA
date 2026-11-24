# 3d-skill Remotion template (composition `Reel3D`)
```bash
ln -s <shared node_modules> node_modules   # or: npm install (remotion@4.0.540, react@18.3.1)
python3 examples/build_ev_health.py        # writes public/props.json from words.json (example builder)
npx remotion render Reel3D out/picture.mp4 --props=public/props.json --muted --crf=17
python3 -I ../scripts/reel3d_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json
python3 -I ../scripts/pro_mix.py --video out/picture.mp4 --vo public/vo.wav --cues cues.json --music public/music_C.wav --out out/final.mp4
```
In the sandbox add `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
