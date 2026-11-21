# Illustrations (the hero assets)

The reference uses about 10 flat, semi-realistic vector illustrations, all isolated objects on transparency,
reused across beats: car door, pointing hand, hand with key, whole car (side view), the same man standing,
walking, pointing, seated at the wheel, seated in the open door gripping the frame, a boot close-up, and a circular
close-up of the grip. **Consistency of the character and the object is the whole trick.**

## Generator (verified): Higgsfield `gpt_image_2_6`
- Params: `quality:"medium"`, `background:"transparent"`, `aspect_ratio` "3:2" (objects), "2:3" (standing people),
  "1:1" (close-ups). About **1 credit per image** at medium. Use `generate_image_batch` for several prompts at once,
  then `jobs_wait` and curl the `result_url`s into `public/img/`.
- After download, **trim the transparent margin** so `w` in props means the visible width:
  ```bash
  python3 -c "from PIL import Image;import sys;[Image.open(p).crop(Image.open(p).split()[-1].getbbox()).save(p) for p in sys.argv[1:]]" public/img/*.png
  ```
- If the background comes out non-transparent, run `remove_background` on the job id.

## Style suffix (append to every prompt)
> Semi-realistic flat infographic illustration, clean crisp vector edges, soft subtle cel shading, gentle
> gradients, no outlines, no text, no shadow on the ground, isolated object on a transparent background,
> centered, full object visible. Muted warm palette: off-white/cream (#F2F0EA), warm skin, grey and khaki
> clothing, tan leather; no saturated colours.

## Character consistency
1. Generate the **character sheet first**: "a young man, short dark hair, light stubble, cream puffer jacket,
   grey trousers, tan lace-up boots, side view, standing, full body" + style suffix.
2. For every other pose, pass the sheet as a reference:
   `medias:[{"value":"<sheet job_id>","role":"image_references"}]`, with a prompt like
   "the same man from the reference, same clothes and proportions, now sitting in a car seat holding a steering
   wheel, side view facing right" + style suffix.
3. Do the same for objects: generate the whole car, then "the same car, front door only" and "the same car, driver
   door open" using it as a reference.
4. Always keep the same facing direction (subject faces **right**, toward the "future"/the action).

## Prompt starters (fill in for the topic)
| Asset | Prompt core |
|---|---|
| Object close-up | "a single <object> seen from the side, isolated, no surroundings" |
| Hand action | "a human hand <pointing / holding a key / gripping a metal frame>, side view, cream puffer jacket cuff at the left edge" |
| Person standing / walking / pointing | "the same man …, full body, side view facing right" |
| Person in a context object | "the same man sitting in the driver seat of the same white sedan, driver door open, legs out" |
| Close-up for the magnifier | "close-up of <the key detail>, tightly framed, square" (no transparency needed) |
| Body-part focus | "a tan leather boot with a thick black rubber sole, side view, grey trouser hem" |
Overlays (charges, glow, rain, marks, boxes, counters) are drawn by the kit. **Never bake them into the image.**

## Budget for a 60 s reel
8-12 images ≈ 8-12 credits, plus 2-4 retries. VO ≈ 3 credits. Optional music ≈ check the estimate. Total ≈ 15-25
credits on Higgsfield.

## No-credit fallback
Draw simple flat SVGs inline (rounded shapes, two-tone shading) and save them to `public/img/*.svg`. The kit
renders SVG the same as PNG. Or ask the user for their own PNGs.
