# Mashina raqami: Google Flow version (matches the original's 3D look)

The user generated 11 clips (6 s, 1080x1920, 24 fps) in Google Flow with the prompts from this session and the
reference frame; this folder assembles them in Remotion with the Adizzbek VO (81.2 s).
The clips themselves are not committed (≈110 MB). Keep them as clips/c1..c11.mp4:
c1 ambulance 318 STY · c2 silver Cobalt H 048213 · c3 white Cobalt A 482 KA · c4 white Cobalt without plate ·
c5 black Cobalt 024 DAV · c6 grey Cobalt PPP 164 · c7 black Maybach APC 031 · c8 black Cobalt PAA 215 ·
c9 white Maybach 10 777 ZZZ · c10 navy Maybach CMD 4501 · c11 white BYD Song Plus 01 B 271 EA (green).

- `retime.py` fits each clip to its shot length from the voice timings (`shots.json`). Long shots get smooth
  slow motion with ffmpeg `minterpolate` (motion-compensated); the others are only resampled to 30 fps.
- `tracks.json`: plate positions per source frame, found by detecting the white plate rectangle in each frame.
  `FlowReel.tsx` draws the yellow rings that follow the plate (green 01, STY, DAV).
- Also in `FlowReel.tsx`: a punch-in on "raqam sizniki emas", a drawn A 482 KA plate tumbling off the plateless
  Cobalt, the auction price with "= 9 ta Cobalt", and the handle chip.
- Sound: `build_cues.py` (road loop, whooshes, siren, horn, EV click, ka-ching, plate click) and `pro_mix.py`, at -14 LUFS.
