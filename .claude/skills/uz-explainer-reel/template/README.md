# uz-explainer-reel template (Remotion 4)

```bash
npm i
bash ../scripts/fetch_fonts.sh public                         # local fonts (required)
cp plan.example.json plan.json                                 # edit: brand, voice, keys, chapters/scenes/overlays
python3 ../scripts/build_props.py plan.json --public public    # -> public/vo.mp3 + public/props.json
npx remotion studio src/index.ts                               # preview
npx remotion render src/index.ts Reel out/reel.mp4 --codec=h264 --crf=18
```

- `src/types.ts`: the props / overlay schema
- `src/theme.ts`: palette, fonts, layout constants
- `src/Reel.tsx`: background, header with chapter progress, kinetic caption with key-word boxes, hook title, scenes, audio
- `src/Overlays.tsx`: chip, stamp, bigNumber, donut, battery, statCard, poll, cta, image, label
- Media for `bg` / `image` overlays goes in `public/media/`
- `public/props.json` is a placeholder until `build_props.py` overwrites it
