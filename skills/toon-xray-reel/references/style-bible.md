# Style bible: cel-shaded 3D "x-ray" explainer (style #2)

Reference: a 26.7 s Uzbek reel, "Lejachiydan keyin mashina qayiqdek chayqalsa, amortizator o'lgan" (if the car rocks
like a boat after a speed bump, the shock absorber is dead). 720x1280, 30 fps. Stills: `assets/reference-*`.

## The look
- **Toon-shaded 3D**: stylized 3D renders with cel shading, **bold black ink outlines on every edge**, one or two
  flat shade tones, a subtle paper/halftone grain, warm desaturated palette (cream walls, olive trees, grey asphalt,
  white car, yellow-black speed bump, a red spring and a blue/grey shock as the colour accents).
- **Full-bleed environments**: no board and no frames. The world fills the screen: a residential street, a wall with a
  yellow gas pipe, trees, gates, a speed bump.
- **No on-screen text at all**: no headlines and no subtitles. The pictures and the voice carry everything. The only
  graphic is a small watermark top-right (icon + @handle, white with a soft shadow).
- **Grade**: warm, slightly hazy, vignette, fine grain.

## The motion language
| Move | What it looks like | How we build it |
|---|---|---|
| Live camera | slow follow / dolly over a car driving, braking, bouncing | AI image-to-video (Kling 3.0 Turbo, 1080p, 5-8 s) from our own key art |
| Push-in to the part | camera creeps toward the wheel while the VO names the problem | `camera.zoom/x/y` tracks on a still |
| **X-ray ghost** | the car turns semi-transparent, and the spring/shock inside appears opaque and glowing | car layer `opacity 1→0.3` over an empty street plate + part PNG with `glow` |
| Swap to focus | the spring fades away so only the shock stays (highlighted) | cross-fade strut → shock, red glow → yellow glow |
| Pull-out / exploded | the part slides out of the car, grows, the background blurs and darkens | `scale/x/y` tracks + background `blur` and `tint` |
| **Cutaway** | the shock cut open: orange oil, piston with holes, oil streaks squeezing through, the spring compressing | the `cutaway` layer (procedural SVG): `piston` track, `flowAt`, `oil`, `leakAt`, `spring` |
| Failure | the seal fails, oil leaks out, and the piston moves freely with no damping | `leakAt`, an `oil` track going down, big undamped piston strokes |
| Back to the world | match-dissolve back to the street, and the car rocks like a boat | cross-fade + 2.5D boat rocking (car cut-out `y` + `rotate` tracks) or an AI shot |
| Loop | it ends on the opening street shot | the last shot re-uses the first clip |
Transitions are 10-14 frame cross-fades (camera keeps moving through them) and the occasional hard cut into an
x-ray. There are never wipes or flashy effects.

## Sound
Voice on top (about -16 LUFS). Quiet street ambience under exterior shots. Mechanical foley on the action (bump, brake
dive, body creak, metal slide, oil squelch, drips). Optional music bed very low. In the cutaway, the ambience drops
away so the mechanism sounds come forward.

## Script shape (works with explainer-reel's script formula)
Hook as a symptom ("if the car rocks like a boat…") → what the spring does vs the shock → inside the shock (oil,
piston, holes) → what happens when it's worn → the test or how a mechanic spots it → loop.
