# Explainer reel: Remotion template

```bash
npm install
python3 ../scripts/make_sfx.py public/sfx --music 62     # SFX pack + 62 s music bed (run from the skill dir layout)
cp examples/demo-opening.json public/props.json          # or write your own (see ../references/props-api.md)
npx remotion studio --props=public/props.json            # preview
npx remotion render ExplainerReel out/reel.mp4 --props=public/props.json --codec=h264 --crf=18
```
`examples/demo-opening.json` needs `public/vo_fast.wav` (any voiceover) or remove the `voiceover` key.
`examples/storyboard-static-shock.json` is the full 60 s blueprint. Generate the listed `_assets` first.
