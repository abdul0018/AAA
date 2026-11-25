# Lejachiy politseyskiyda tormozni qachon qo'yib yuborish kerak? (pure Remotion illustration)

Status: the script, the Adizzbek VO (35 s, `vo_raw.mp3`, `words.json`) and the 9-shot list with prompts
(`shots.json`) are ready. **Waiting on a Higgsfield top-up**: 0.57 credits left. About 11 credits are needed for the 9
images, plus about 22 more for 3 optional motion clips.
The style reference is the user's screenshot (`refs/p_*.jpg`: illustrated 3D street, white Cobalt, yellow-black
bump, x-ray red spring + blue shock, cut-away shock with orange oil). These are used only as `image_references`
for new generations.

Facts: braking transfers weight forward and compresses the front springs. Releasing the brake just before the
bump lets the suspension extend, so it has its full travel to absorb the hit. These are driving-technique sources
(forums and driving guides), not controlled tests.

## Done: fully drawn and animated in Remotion (no AI images, 0 credits)
- `src/Scene.tsx`: an SVG cel-shaded world styled on the reference: a cream wall, a yellow gas pipe, low-poly
  trees, a teal gate, a curb, cracked asphalt and a yellow-black speed bump (`roadY` profile). It also has a white
  sedan whose body pitches, an x-ray mode with a red spring, a blue shock and a lower arm, brake-light glow, and an
  impact flash. Plus a brake-pedal close-up and a speedometer.
- `src/BumpReel.tsx`: 11 scenes on the voice timings. The suspension model: braking dives the nose (+18 px), so on
  the bump the remaining travel (34 px) runs out and the body is shoved up and shakes. Releasing the brake lifts
  the nose, so the bump is absorbed. The cut-away shock is the toon-xray `Cutaway.tsx`.
- Sound: ElevenLabs foley (brake squeak, pedal, spring creak, soft bump) + pothole thud + kit pops/whooshes,
  mixed by `pro_mix.py` at -14 LUFS. 36.7 s.
