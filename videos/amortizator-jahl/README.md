# Amortizatoringiz taqillayapti?! (ANGRY rant style, pure Remotion illustration)

40.9 s, Adizzbek voice, @autopodveska.uz. No AI images (0 Higgsfield credits).

**Angry voice:** `eleven_v4` Adizzbek with emotion tags in the text (`[shouting]`, `[angry]`, `[frustrated]`).
The tags are not read aloud and v4 honours them with uz. Settings: stability 0.3 / similarity 0.8 / style 0.8 /
speed 1.12. Measured against the regular settings: pitch 253 vs 202 Hz, a brighter tone, and 3x the loudness range.

**Angry visuals** (`src/AngryReel.tsx`, reusing the illustrated world `src/Scene.tsx` from lejachiy-tormoz):
- audio-reactive camera shake and a red rage vignette driven by the voice loudness envelope (`env` in props.json)
- a punch zoom and red flash on every cut
- huge 1-3 word captions: stroked, slightly rotated, key words yellow with a red glow
- stamps ("TUZALMAYDI!", "ESKIRGAN", "TORMOZ YO'Q") and a red full-screen "HALI YURADI" crossed out

**Scenes:**
1. knocking shock while the music plays
2. volume up → "TUZALMAYDI!"
3. leaking cut-away shock
4. x-ray wheel bouncing off the road ("HAVODA!")
5. braking in the air
6. two lanes: +6 m stopping distance
7. ABS/ESP warning lights
8. body roll in the rain
9. "hali yuradi" struck out
10. safety shield
11. "Qachon tekshirgansiz?"

**Sound:**
- a looping aggressive trap beat, made with ElevenLabs sound-generation (the key lacks music_generation),
  mixed at -6 dB with 6 dB ducking
- booms on every shouted line, plus knock, skid, alarm, record-scratch, rain and radio foley
- master -14 LUFS

**Facts:**
- Tenneco/Monroe test: shocks 50 % worn → about 6 m longer stopping distance from 80 km/h
  (a manufacturer test, so the video says "ishlab chiqaruvchi sinovi").
- TÜV/GTS tests: worn shocks reduce ABS/ESP effectiveness.
