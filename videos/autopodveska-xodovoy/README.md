# Mashina xodovoyi: amortizator explainer (@autopodveska.uzb)

Built with the `explainer-reel` skill. To re-render: copy `skills/explainer-reel/template` → put `img/`, `vo.mp3`, `props.json` into its `public/`,
run `python3 ../scripts/make_sfx.py public/sfx --music 57`, then `npx remotion render ExplainerReel out/reel.mp4 --props=public/props.json`.

Script (54.9 s): Chuqurga tushganda mashinangiz ham taqillaydimi? … Sizning mashinangiz qayerdan taqillaydi? Izohda yozing.

## Pro audio version (autopodveska_pro.mp4)
`props.json` has `muteAll: true`; audio = `sfx_cues.py` (68 cues: SFX Kit + 5 ElevenLabs car sounds in `sfx_pro/`) +
`pro_mix.py --music music_C.mp3` (ElevenLabs Music, shifted to C major). Master -14 LUFS / -1.5 dBTP.
