# Style bible: the dark-board science explainer

Reference: a 59.6 s Uzbek reel, "Mashinadan tushganda nega tok uradi?" ("Why do you get shocked getting out of a car?").
720x1280, 30 fps, H.264 + AAC stereo. One continuous animated explainer with **no hard cuts**: every change is a
cross-fade or an element appearing on the same board. Stills: `assets/reference-*.jpg|png`.

## 1. The look in one paragraph
A charcoal technical-drawing board (`#1F2121`, faint 66 px grid, soft vignette). A single **flat, semi-realistic
vector illustration** (cream/white objects, soft cel shading, a drop shadow, no outlines) sits in the middle-lower
half. **One short ALL-CAPS headline** sits in the top fifth: white Manrope ExtraBold, and a **yellow underline**
(`#FFCC40`) when the word is the key idea of the beat. Physics is shown with tiny overlays: yellow "−" charge discs,
a yellow radial glow, blue rain drops, a white drawn check, a red X, a yellow-ringed magnifier circle, a white/red
spark. A tiny grey `@handle` watermark at the top and a dark Instagram pill at the bottom. Nothing else: no
gradients, no stock video, no emoji, no subtitles of the full narration.

## 2. Palette (sampled)
| Token | Hex | Use |
|---|---|---|
| bg | `#1F2121` (edges `#151616`) | board |
| grid | white @ 3.5 % | 66 px squares |
| white | `#F2F1EC` | headlines, check mark |
| dim | white @ 38 % | the headline's first 2-3 frames (it "lights up") |
| sub | `#9A9C9A` | small grey sub line ("ZARARI YO'Q") |
| yellow | `#FFCC40` | underline, charges, glow, magnifier ring, highlight box |
| red | `#FF4D4D` + red glow | impact word ("CHIRS!"), X mark, spark |
| blue | `#7FB8E6` | rain drops / humidity |
Illustrations: cream `#F2F0EA` paint, warm skin, grey/khaki clothes, tan boots. Keep everything desaturated except
yellow and red so the accents carry the meaning.

## 3. Typography
- Font: geometric grotesk, ExtraBold 800, ALL CAPS, tracking -1.5 %. Bundled: **Manrope** (`template/public/fonts`).
- 1-2 lines, **2-4 words**. Big: about **120-124 px** on 1080 wide (re-measured against the reference: 'TOK URADIMI?' spans ~78 % of the width). The kit multiplies `size` by 1.4 and auto-fits long lines to ≤ 1000 px.
- Kicker variant (small line above, 52 % size) only for the final question: "SIZNI BOSHQA NARSA HAM / TOK URADIMI?".
- Sub line: grey, 36 % size, appears about 0.5 s after the title ("10 000 VOLT" → "ZARARI YO'Q").
- Numbers count up/down with thin-space thousands ("10 000 VOLT") and a soft white glow.
- Impact word: red-tinted white with a red outer glow, punches in from 150 % scale ("CHIRS!").
- **The headline is NOT a subtitle.** It shows the single key noun/claim of the sentence being spoken, appears on
  that word, and stays until the next idea. About 15 headlines per minute.

## 4. Layout (1080x1920)
| Element | y (centre) | Notes |
|---|---|---|
| watermark `@handle` | 200 | 22 px, white @ 28 %; x jumps left/centre/right between scenes (anti-reupload) |
| headline block | 335 | centred |
| hero illustration | 1060 | 650-880 px wide; people 260-320 px wide when standing |
| ground line | 1290 | thin line + diagonal hatching, 780 px wide |
| Instagram pill | 1725 | fades in about 35 % into each scene |
The top 260 px and bottom 300 px stay almost empty (Instagram UI safe zones).

## 5. Motion vocabulary
| Move | Where in the reference | Kit |
|---|---|---|
| Headline lights up: dim → white, rises 12 px, de-blurs (7 frames) | every title | `titles[]` |
| Underline grows left → right (spring, about 10 frames) | key words | `underline: true` |
| Hand/arm slides in from the frame edge | 0.5 s, 50 s | `anim: slideLeft` |
| Person walks in with a bob | 32 s | `anim: walkIn` |
| Camera pull-back: close object → wide (door → whole car) by cross-fading a smaller wide shot over a zoomed one | 12.5 s, 47 s | `anim: zoomOut` + scene fade |
| Number counter, ease-out, ticking SFX | 4.5 s (3 → 10 000), 44 s (10 000 → 0) | `counters[]` |
| Yellow glow that flickers like energy | wherever charge exists | `glows[]` / `layer.glow` |
| Charges pop in one by one and wander; later stream away | 5 s, 18-21 s, 23 s, 45 s | `charges[]` (+ `flowTo`) |
| Rain falls, charges leave | 22-26 s | `rain[]` |
| Highlight box draws around the key part | 29 s (rubber sole) | `boxes[]` |
| Red X draws under it | 30.5 s ("does not pass to the ground") | `marks: cross` |
| White check draws above the subject | 15 s ("the car is not guilty") | `marks: check` |
| Magnifier circle with yellow ring and dotted leader line | 40 s (hand on the door frame) | `insets[]` |
| Spark plus shake on contact | 1 s, 35.5 s, 52 s | `marks: spark`, `shakeAt` |
| Question mark bobbing in the window | 9-12 s ("one simple action...") | `marks: question` |
Scene changes are 8-12 frame **cross-fades** (incoming at 104 % scale settling to 100 %). There are no wipes,
glitches or flashes.

## 6. Reference timeline (what each beat does)
| t (s) | VO (Uzbek, cleaned) | Visual | On-screen text |
|---|---|---|---|
| 0.0-4.5 | Mashinadan tushganda sizni ham tok uradimi? | door, hand slides in, tiny sparks | SIZNI HAM / TOK URADIMI? (underlined) |
| 4.5-9.0 | O'sha payt tanangizda taxminan 10 000 volt bo'ladi. Qo'rqmang, zarari yo'q. Lekin yoqimsiz. | glow + charges on the hand | 3 → 10 000 VOLT, sub ZARARI YO'Q |
| 9.0-12.5 | Bitta oddiy harakat bor, shuni qilsangiz urmaydi. | door alone, "?" in the window | BITTA HARAKAT |
| 12.5-15.5 | Aslida mashinaning aybi yo'q, | pull back to the whole car on the ground, check | MASHINA AYBDOR EMAS |
| 15.5-17.0 | tokni o'zingiz olib chiqasiz. | person by the car, glowing, charges | TOK SIZDA |
| 17.0-21.5 | Turayotganingizda kiyimingiz o'rindiqqa ishqalanadi. Shunda tanangizga zaryad to'planadi. | man in the seat, charges build up on the jacket, + on the seat | KIYIM ISHQALANADI → ZARYAD |
| 21.5-26.0 | Havo nam bo'lsa bu zaryad o'zi tarqab ketadi. | standing man in rain, charges float off | NAM HAVO |
| 26.0-27.5 | Lekin qishda havo quruq. | rain stops, glow returns | QISHDA HAVO QURUQ |
| 27.5-32.0 | Oyoq kiyimingizning tagi ham rezina, zaryadni yerga o'tkazmaydi. Zaryad tanangizda qoladi. | boot close-up, box around the sole, red X under it | REZINA |
| 32.0-36.5 | Temirga tegdingizmi? Tamom. Chirs! | man walks to the door, points, spark, shake | 10 000 VOLT → CHIRS! (red) |
| 36.5-47.0 | Endi o'sha harakat: o'rindiqdan turmasdan oldin eshikning temiridan ushlab oling. Oyog'ingiz yerga tegmaguncha qo'yib yubormang. Zaryad sezdirmay chiqib ketadi. | car with the man seated, door open, magnifier on the hand gripping the metal frame (frame glows yellow) | O'SHA HARAKAT → TEMIRDAN USHLANG → 10 000 → 0 VOLT |
| 47.0-54.0 | Esingizdan chiqdimi? Mashinaga avval kalitni tekkizing, uchqun barmoqqa emas, kalitga uradi. | back to the door; hand with a key slides in, tiny spark at the key | KALIT |
| 54.0-59.6 | Sizni mashinadan boshqa narsa ham tok uradimi? | car plus magnifier again | SIZNI BOSHQA NARSA HAM / TOK URADIMI? |
The last line asks the hook question again, so the reel **loops** seamlessly and invites comments.

## 7. What makes it work (keep these when adapting)
1. **Hook = the viewer's own experience as a question** in the first 2 s, with the object already on screen.
2. **Shock number** in the next 3 s (10 000 VOLT), then reassure ("harmless") and **promise one simple action**
   (held back until 70 % of the runtime, so people keep watching).
3. **Myth-bust** ("the car is not to blame"), then the real mechanism in 4-5 tiny steps, one picture per step.
4. **Payoff moment** with SFX (CHIRS!) right before the solution.
5. **Solution** shown concretely (magnifier on the exact grip), a counter going to 0, then a **bonus tip**.
6. **Loop ending** that asks the hook question again, widened ("anything else shock you?") → comments.
7. One idea per headline, a voice that never pauses for more than 0.6 s, and an image that changes every 3-5 s.
