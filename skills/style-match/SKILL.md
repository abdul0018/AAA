---
name: style-match
description: "Make a video look like a reference video: same rendering style, world design, palette, camera angles, staging and grade, with newly generated shots (never the creator's own footage). Style-locked image/video generation from de-watermarked reference frames, auto colour-matching with a fitted 3D LUT, and a measured side-by-side QA (ΔE colour distance, chroma, line-art density). Use whenever the user says 'make it look exactly like this video', 'the visual is different', 'match the style/look/visual', 'same visual as the reference', or before remaking any reference reel."
---

# Style match: make our reel look like the reference

Text prompts alone drift: "toon street with a car" gives *a* toon street, not *that* one. This skill locks the look
in three layers: **(1) generation conditioned on the reference frames, (2) a measured colour match, (3) a
numeric + visual QA loop.** Verified 2026-11-21 on the "lejachiy / amortizator" remake.

Companion skills (installed): `visual-style-replicator` (style-DNA analysis → master prompt), `image-to-prompt`
(reverse-engineer a frame), `car-angle-extractor` (shot DNA for car angles), `seedance-higgsfield` (video prompt
direction), `color-grade-luts` (LUT workflow, look comparison), plus `toon-xray-reel` / `explainer-reel` for the build.

## Boundary (always)
Match the *style, world, angles and staging* with **new generations**. Don't edit, trace, rotoscope or V2V-restyle the
reference creator's footage, and don't reproduce their watermark/handle. That's reusing someone else's video, and
platforms down-rank re-uploads. Say this briefly if the user asks for a literal copy.

## Workflow
1. **Pick reference frames** (one per beat, watermark blurred):
   `python3 -I scripts/ref_frames.py ref.mp4 refs/ --n 8` → `refs/refs_sheet.png`. Read the sheet. Hand-pick extra
   frames for key beats (wide street, x-ray, cutaway, worn part, ending) with ffmpeg if needed, and blur the watermark
   zone too.
2. **Style DNA** (2 minutes): for each beat write 1 line: camera (height, angle, lens), world elements (wall colour,
   pipe, trees, gates, road texture), object design (car model class, colours), line weight, shading, texture, palette,
   light. (`visual-style-replicator` / `image-to-prompt` give the vocabulary.) Keep it in the props `_style` note.
3. **Upload refs to Higgsfield**: `media_upload` (batch) → curl PUT each `upload_url` **from a file of the URL**
   (`curl -X PUT -H 'Content-Type: image/png' --data-binary @f.png "$(cat url.txt)"`; long presigned URLs pasted
   inline can break and return 400) → `media_confirm`.
4. **Style-locked key art**: `gpt_image_2_6` (quality high, 9:16) with 2 reference frames of the SAME beat as
   `image_references`, and a prompt that names the DNA and says: *"A new frame in exactly the same art style,
   rendering, palette, line weight, paper texture and camera angle as the reference images … same world, fresh
   composition (do not copy 1:1). No text, no watermark."* One key frame per beat (wide, x-ray, close-up part…).
   Compare against the reference immediately (side-by-side PIL sheet). Regenerate any frame where the world or angle
   drifted.
5. **Motion**: image-to-video from those key frames (Kling 3.0 Turbo `start_image`; MiniMax H3 / Seedance 2.5
   `image_references` when a model must keep a style across new content). Describe one action + camera. Check each clip
   with a contact strip and a motion trace.
6. **Build** in the matching engine (`toon-xray-reel`: x-ray layers, cutaway with `glass`/`springSide` options for this
   reference family; `explainer-reel` for board styles).
7. **Colour match**: `python3 -I scripts/color_match.py --ref ref.mp4 --src out/final.mp4 --cube match.cube --strength 0.8 --apply out/final_matched.mp4`
   (Lab quantile mapping baked into a 33³ .cube → ffmpeg `lut3d`). Use strength 0.6-0.9. Higher values can posterize
   flat cartoon colours.
8. **QA**: `python3 -I scripts/compare.py --ref ref.mp4 --ours out/final_matched.mp4 --pairs "0.8:1.0,5.2:5.0,11:10.5,18.6:18.5,24.5:24.3" --out compare.png`
   → Read it. Targets: average ΔE < 6, chroma ratio 0.85-1.15, edge-density ratio 0.75-1.25 (line weight). Fix
   the biggest offender (usually a drifted key frame or an un-graded insert) and re-run.

## What usually breaks a match (check in this order)
1. Camera angle (side view vs rear three-quarter) is the most visible difference. Lock it per beat.
2. World signature props (wall colour + pipe + tree species + gate colour).
3. Object design (car silhouette, colour of the parts: red spring, blue shock).
4. X-ray rendering (glass body opacity, outline weight), and keeping the scene behind the cutaway instead of a blur.
5. Grade (warmth, haze, black level): fixed by `color_match.py`.
6. Grain/vignette amount and watermark position.

## Verified example (2026-11-21, lejachiy/amortizator remake)
| Version | avg ΔE | chroma ratio | edge ratio |
|---|---|---|---|
| v1: own world, text-prompted (golden-hour street, side-view x-ray) | 16.9 | 2.10 | 1.52 |
| v2: style-locked key art + refs, x-ray from rear 3/4, in-scene glass cutaway | 8.0 | 1.06 | 1.30 |
| v2 + `color_match.py` strength 0.6 | **5.6** | **0.98** | 1.39 |
Street shots reached ΔE 1.9-2.6. The remaining gap is x-ray framing (ours is tighter) and finer line detail in the AI shots.
Note: strength ≥ 0.85 shifted the red spring toward orange, so 0.6 is the safer default for cartoons with saturated accents.
Assets: `assets/example-compare-before.png`, `example-compare-after.png`, `example-keyart-vs-ref.png`, `example-match.cube`.
