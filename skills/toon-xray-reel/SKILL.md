---
name: toon-xray-reel
description: "Style #2. Make vertical 9:16 text-free explainer reels in the cel-shaded 3D 'x-ray' style: full-bleed toon-shaded scenes with black ink outlines, live AI camera shots (car driving, braking, bouncing), push-ins to the part, the car turning into a transparent ghost to reveal the glowing mechanism, parts pulled out, an animated cut-away (piston, orange oil squeezing through holes, failing seal), warm film grade, watermark only, voice + foley + ambience. Use for 'the second style', 'x-ray style', 'tomchi style', 'like the lejachi/amortizator video', 'toon 3D explainer', or /toon-xray-reel."
---

# Toon x-ray reel (style #2)

A 3D-cartoon mechanism explainer with **no on-screen text**: the camera and the x-ray reveal tell the story.
It was verified end to end on 2026-11-21 with the suspension reel (`assets/demo-*`). Read `references/style-bible.md` first.

Shares the audio and voice stack with **explainer-reel** (style #1): the same script formula, ElevenLabs v4 native
Uzbek voices with exact timestamps (`explainer-reel/references/voiceover.md`), `sfx-kit`, ElevenLabs SFX,
`match_sfx.py` and `pro_mix.py`.

## Inputs (ask only for what's missing)
Topic and script (or re-use a script/voiceover from style #1), @handle, and the voice (default Adizzbek
`v4cqTf6wc2CXwA2tR7TF`, eleven_v4, uz). Budget on Higgsfield: ≈10 credits per 5 s AI shot (Kling 3.0 Turbo 1080p,
16 for 8 s) + about 1 per still. A 50 s reel ≈ 4 AI shots + 8-10 stills ≈ 55-70 credits.

## Workflow
1. **Script → shot list.** For each VO sentence pick one of: AI live shot · still + camera push · x-ray · pull-out ·
   cutaway · 2.5D action (cut-out + tracks). Aim for 8-12 shots per 50 s, a new picture every 3-6 s, and the cutaway as
   the centrepiece.
2. **Key art** (Higgsfield `gpt_image_2_6`, quality high). Style suffix for every prompt:
   > Stylized 3D render with cel shading (toon shader), bold clean black ink outlines on every edge, flat soft
   > shading with one shadow tone, subtle paper grain texture, muted warm palette, soft late-afternoon light. No text.
   - wide establishing shot (9:16), an **empty background plate** of the side view, the hero object as a **transparent
     cut-out** (exact side view), the inner parts as transparent cut-outs (e.g. strut, shock), a dirty/close-up detail
     still.
   - **Composites by reference**: "place the exact car from ref 2 onto the street from ref 1" (`medias` with both job
     ids) gives a start frame that matches the plate, so the x-ray ghost lines up.
   - Variants (a mechanic pressing the car…) from that composite as the reference.
   - Trim the alpha margin of the cut-outs. Look at every image before using it.
3. **AI live shots**: `generate_video` with `kling3_0_turbo`, `start_image` = a key-art job id, 9:16, 1080p, 5 or 8 s.
   Describe one physical action + the camera, and end with "keep the exact stylized cel-shaded 3D toon look… no
   style change, no text". **Check every clip** with a 4 fps contact strip and a motion trace: Kling can cut away,
   re-enter or under-act. Use `startFrom`, `rate`, `freezeAt` to keep only the good part, or replace a weak action with
   2.5D animation (cut-out + `y`/`rotate` tracks + `shadow`).
4. **Voice**: ElevenLabs `/with-timestamps` → exact word times (explainer-reel voiceover.md). Cut shots on sentence
   boundaries. Land x-ray/glow/swap moments on the noun that names the part.
5. **Build props** (`template/examples/suspension.json` is the verified blueprint; schema in `template/src/types.ts`):
   - `camera`: zoom/x/y tracks per shot (keep x ≥ 540/zoom so the frame never shows outside the image)
   - layers: `image` / `video` (`full: true` for plates) / `cutaway` / `drips`, all with keyframe tracks
     `[[t, v], ...]`
   - x-ray recipe: plate (tint 0→0.35) + composite car (opacity 1 → 0.3 at 0.4-1.2 s) + part PNG at the wheel (opacity in,
     `glow` red), then swap part (glow yellow); camera zoom 1.6 → 2.3 on the part
   - cutaway recipe: blurred, darkened background + the part PNG cross-fading into a `cutaway` of matching size, with
     piston strokes on "siqib o'tkazadi", decaying to rest on "so'ndiradi", then `leakAt` + falling `oil` + big free
     strokes for "the worn one"
   - `beds`: ambience loops (absolute seconds), muted during the cutaway
   - `muteAll: true`
6. **Sound**: ElevenLabs SFX for the topic foley (4 or fewer concurrent, `mp3_44100_128`) → `match_sfx.py` → per-shot
   `sfx`. Kit sounds for the reveals (`whoosh-medium-soft`, `shimmer-*`, `transform-*`, `move-spring`, impacts). Then:
```bash
K1=~/.claude/skills/explainer-reel/scripts; K2=~/.claude/skills/toon-xray-reel/scripts
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64 2>/dev/null | head -1)/chrome-headless-shell
npx remotion render ToonReel out/silent.mp4 --props=public/props.json --codec=h264 --crf=17 --muted ${B:+--browser-executable=$B}
python3 -I $K2/toon_cues.py public/props.json --out cues.json
python3 -I $K1/pro_mix.py --video out/silent.mp4 --vo public/vo.wav --cues cues.json --music public/music.wav --music-db -13 --out out/final.mp4 --stems out/stems
```
7. **QA**: stills from every shot as a sheet (Read it), a 1 fps contact sheet of the final, stems (voice ≈ -16 LUFS,
   master -14), and check the x-ray part sits on the wheel and nothing shows outside the frame. Deliver with
   SendUserFile.

## Gotchas
- Kling clips are 24 fps, 1076x1924: `full: true` covers them. `rate < 0.75` looks floaty, so prefer `freezeAt` + a camera
  push for extra length.
- The composite car and the empty plate are not pixel-identical: the 0.3-opacity ghost shows a slight double image,
  which reads as "x-ray". Keep the plate tinted so it doesn't distract.
- `gpt_image_2_6` sometimes returns 429: resubmit the failed items alone.
- Music is optional here (the reference has none). With music, keep it ~13 dB under the voice.

## Files
`template/` (Remotion: `src/ToonReel.tsx` engine, `Cutaway.tsx` SVG cut-away, `types.ts`, examples) ·
`scripts/toon_cues.py` · `references/style-bible.md` · `assets/` (reference + demo sheets).
