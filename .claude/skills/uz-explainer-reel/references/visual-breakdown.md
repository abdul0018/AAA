# Visual breakdown of the reference reel

Reference: a 90.4 s, 720×1280, 30 fps vertical explainer about hybrid cars from an auto channel. It is in Russian, with a glossy black sedan rendered in a dark 3D studio and flat infographics. See `stills/` for the frames named below and `stills/contact-*.jpg` for 1 fps sheets of the whole video.

## The system in one paragraph

The reel is a **"chaptered explainer"**. A fixed header sits at the top: logo, handle, topic, `глава 03/10` and the chapter name in crimson, plus a 10-segment progress bar that fills chapter by chapter. Under it, a **single line of kinetic caption** is spoken word by word, and key nouns are boxed like a Figma selection. The middle of the screen is the **visual proof** of what is being said. It is either a slow-moving 3D render (cutaway / x-ray car, glowing energy flow) or a flat dark infographic (donut %, big year number, battery, stat card, top-down traffic). A small **pill chip** near the bottom summarises the beat in 3-5 words. **Stamps** (rotated, crimson outline) hit the punchline words. Everything is near-black and crimson, with white text and nothing else.

## Palette (sampled)

| Token | Hex | Use |
|---|---|---|
| bg | `#161618` → `#1d1e21` | radial background, never pure black |
| crimson | `#B8304F` (≈ `#A72D46`–`#B8304F`) | progress fill, donut arc, battery fill, key-word box, big numbers, CTA button |
| crimson hot | `#E0566F` | crimson *text* on dark (chips, stamps, glows) |
| white | `#F2F2F0` | captions, numbers |
| grey | `#8C8D91` | secondary text, "chapter 03/10", footers |
| panel | `rgba(38,39,43,.88)` | chips, cards |
| track | `#2b2c30` | progress bar track, donut track |

A soft crimson glow sits off-screen at the left, a few dust specks drift, and there is a faint vignette.

## Typography

- **Hook title**: extended ultra-heavy uppercase (Druk Wide / Unbounded 900 look), about 105 px at 1080 w, 3-4 stacked lines, with the key word in crimson ("ГИБРИД"). It builds word by word over the 3D shot.
- **Caption**: rounded geometric bold sans (Gilroy / Montserrat 700), 50 px, white, centred at y ≈ 340 (1080×1920). The line holds **at most about 4 words** and breaks at punctuation.
- **Key-word box**: a 2 px crimson border, a 20 % crimson fill and 4 tiny square "handles" at the corners, like a design-tool selection. Key words are the nouns and verbs carrying the meaning (гибрид, электричестве, торможение, бесплатно, миф…).
- **Ghost word**: the next word appears at about 28 % opacity a beat before it is spoken (visible in "Подпишись и *перешли*").
- **Mono**: small grey mono for `глава 01/10`, the topic under the handle, and the x-ray callout labels (БАТАРЕЯ, ЭЛЕКТРОМОТОР, БЕНЗИНОВЫЙ МОТОР).
- **Numbers**: the extended heavy face again (41 %, 1900, 10).

## Layout (1080×1920)

```
 y=70   (ars) @handle            глава 03/10
            topic (mono grey)        режимы   ← crimson
 y=200  ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬            ← 10 segments
 y=340          kinetic caption [key]
 y=400-1300     VISUAL: 3D render / infographic (centre)
 y=1450         (  summary chip  )
```
The side gutter is 66 px. Nothing important sits below y ≈ 1500 (that zone is covered by the platform UI).

## Beat-by-beat (original timings)

| t (s) | Chapter | Visual | Overlay |
|---|---|---|---|
| 0.0-3.6 | 01 вопрос | Snowy courtyard, black sedan, slow push-in (bright 3D) | Hook title builds word by word |
| 3.6-12.4 | 01 вопрос | Cut to **stylised dashboard**: steering wheel, READY/EV cluster, glowing ENGINE START button, a finger presses it | Chip "мотор молчит: 0 оборотов", then "не сломалась — просто тихо" |
| 10.7 | | Hard cut to the car rolling silently out of the courtyard | Chip "едет на электричестве" |
| 12.4-20 | 02 два сердца | Dark studio; the car body fades to **x-ray**, revealing the engine, the motor (copper) and the battery (crimson cells) | Mono callouts pop on each part as it is named; chip "2 сердца", "компьютер решает, кто работает" |
| 20-31 | 03 режимы | Camera dives into the chassis: **glowing particles flow** battery → motor (start), engine lights up (highway), both pulse (acceleration) | Chips track the mode; **stamp "ОБА СРАЗУ"** |
| 31-45 | 04 торможение | Macro on the wheel/motor: red heat glow (normal car), then energy flows back to the battery; a battery widget goes 62 % → 78 % | Chips; **stamp "БЕСПЛАТНО"** |
| 45-51 | 05 пробка | **Top-down flat traffic**: lanes of white cars, our car outlined in crimson with an "EV" tag | Chip "гибрид — на одном электричестве" |
| 51-60 | 06 41 % | Empty dark background | "Тойота заявляет" muted chip; **donut** counts 12 % → 41 %; chip "☆ один из лучших в мире" |
| 60-68 | 07 история | **Big year** 1880 → 1900 counts up over a flat carriage icon, then 1957 → 1997 over a flat car; a light-streak wipe | Chips "первый гибрид — Фердинанд Порше", "Приус — первый массовый" |
| 68-75 | 08 Казахстан | Flag chip "Казахстан · 2025"; 3 grey car icons appear one by one, and the 3rd turns white with a crimson "ГИБРИД" tag | Chip "каждая третья новая Камри — гибрид" |
| 75-83 | 09 лайфхак | Crimson "лайфхак" pill; a **big battery** drains, then **stamp "МИФ"**; a stat card "гарантия на батарею 0 → до **10** лет" | Chip "🔧 если каждый год проверка" |
| 83-90 | 10 итог | The car front, darkened; **poll** "ВЗЯЛ БЫ ГИБРИД?" Да / Нет, "пиши в комментариях"; then the **logo CTA** "ars." with a crimson "Подписаться" button that flips to "Вы подписаны ✓" | — |

## Motion rules

- **The camera never stops.** Every 3D shot has a slow dolly or zoom (1.0 → 1.1 over the beat), and the cuts land on spoken nouns.
- Overlays **spring in** (about 0.35 s, slight overshoot) and **cut out** with the beat. There are no long fades.
- Numbers **count up** over about 0.7-1 s (12 → 41 %, 1880 → 1900). Batteries fill or drain over about 1.2 s.
- Stamps slam in at scale 1.7 → 1 with a tiny shake, rotated about −6°.
- The progress bar fills continuously inside the current chapter. Past chapters stay dim crimson.
- Transitions are mostly hard cuts. There is one light-streak wipe (the 1997 → Kazakhstan cut) and a short fade between the two "history" cards.
- Pacing: a new visual idea arrives every **2-4 s**. Chapters run 6-12 s.

## How to get the 3D-looking visuals

The reference used real 3D (Blender-style renders). Options, from best to fastest:
1. The user supplies footage or renders.
2. Generate stills or short clips with an image/video model (for example Higgsfield `generate_image` / `generate_video`, **only with the user's OK, since it costs credits**). Use prompts like: *"glossy black sedan in a dark charcoal studio, x-ray cutaway showing crimson glowing battery cells under the floor and a copper electric motor at the front axle, thin glowing red energy lines, cinematic, 9:16, low key lighting, #161618 background"*. Keep every prompt on the same palette.
3. Skip media. The infographic beats (donut, year, battery, stat card, poll, CTA) need none, and about half of the reference is pure infographic on the dark background.
