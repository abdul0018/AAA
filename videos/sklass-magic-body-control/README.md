# Bu mashina chuqurni sizdan oldin ko'radi: Mercedes S-Class "Magic Body Control"

An explainer-reel (dark-board illustration style) about an interesting foreign-car suspension, with the Adizzbek voice.

- **Length** 46.9 s, 1080x1920, 10 beats.
- **Facts** (checked across several sources):
  - the stereo camera behind the windscreen scans the road about 15 m ahead, with about 3 mm height accuracy
  - hydraulic Active Body Control adjusts each wheel in advance
  - works in daylight at up to 130 km/h
  - the Curve function leans the car into bends (about 2.5°; the script gives no number)
- **Real product first**: the S-Class illustrations were drawn from Wikimedia Commons photos of the W222:
  - `2014 Mercedes-Benz S 350 BlueTEC (W 222) sedan (2016-01-04) 01.jpg` and `... 02.jpg`
  - `Mercedes-Benz W222 FL S 350d 4MATIC AMG Line Diamond White Metallic (10).jpg`
  - The "ordinary car" is our illustrated Uzbek Cobalt.
- **VO**: `eleven_v4` Adizzbek, the regular settings (stability 0.45 / similarity 0.8 / style 0.3 / speed 1.1),
  `/with-timestamps`, with 4 pauses spliced in.
- **Kit**: layer `rotate` / `origin` / `moves[].rot` were added for the lean and the pothole drop. Scan beams use `flows`.
- **Sound**: auto cues from `sfx_cues.py`, plus ElevenLabs foley (scan sweep, pothole thud, hydraulic whir, glide,
  cornering), merged by `add_cues.py` and mixed by `pro_mix.py` at -14 LUFS.

## v2 (fixes after review)
- **Handle** changed to **@autopodveska.uz**.
- **Voice "skips" fixed.** The pauses had been inserted mid-gap, leaving tiny fragments between two silences.
  They are now spliced inside the real silences with 8 ms fades.
- **Transitions.** Hard cuts with a short whoosh replace the cross-fades, so titles and cars no longer
  double-expose.
- **Road position.** The pothole stays at the same x in every scene, so the road no longer jumps.
- **Headlines.** Every scene opens with a headline, with no empty 1-2 s gaps.
- **Visuals removed.** The stray glow in the 130 km/h scene and the rainbow-like arc over the leaning car are gone.
- **Added.** A close-up of the wheel dropping while the body stays level, "Pastga / Yuqoriga" tags on the strut,
  a "mototsiklchi kabi" tag, and cars that keep moving.
