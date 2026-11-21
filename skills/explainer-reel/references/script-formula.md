# Script formula (45-60 s, about 130-160 words)

Write in the user's language (default: **Uzbek Latin**, with proper `o'` `g'` and `sh`/`ch`). Talk to the viewer
as "siz", in short spoken sentences of 4-9 words, with no intro, no greeting and no "subscribe" request.

## Beat sheet
| # | Beat | Share | Job | Pattern (Uzbek) |
|---|---|---|---|---|
| 1 | HOOK | 0-8 % | the viewer's own experience as a yes/no question | "…da sizni ham … ?" / "Nega … ?" |
| 2 | SHOCK FACT | 8-15 % | one surprising number or fact | "O'sha payt … taxminan 10 000 … bo'ladi." |
| 3 | REASSURE + PROMISE | 15-22 % | lower the fear, promise ONE simple action (keep it secret for now) | "Qo'rqmang, zarari yo'q. Lekin … Bitta oddiy harakat bor, shuni qilsangiz …" |
| 4 | MYTH-BUST | 22-28 % | who people blame vs the truth | "Aslida …ning aybi yo'q, … o'zingiz …" |
| 5 | MECHANISM 1-3 | 28-55 % | cause → effect chain, one image per link | "… ishqalanadi. Shunda … to'planadi." |
| 6 | CONDITION / CONTRAST | 55-62 % | when it does NOT happen vs when it does | "Havo nam bo'lsa … Lekin qishda havo quruq." |
| 7 | PAYOFF | 62-70 % | the moment it happens, an onomatopoeia with SFX | "…ga tegdingizmi? Tamom. Chirs!" |
| 8 | SOLUTION | 70-85 % | the promised action, concrete and step by step | "Endi o'sha harakat: … oldin … ushlab oling. … qo'yib yubormang." |
| 9 | BONUS TIP | 85-93 % | a second, simpler hack | "Esingizdan chiqdimi? … avval … tekkizing." |
| 10 | LOOP CTA | 93-100 % | the hook question widened → comments, seamless loop | "Sizni … dan boshqa narsa ham … ?" |

## Rules
- About 2.6-2.8 words per second when spoken. 60 s ≈ 150 words. Leave a 0.8 s breath only before the payoff and
  before the solution.
- Every sentence must be **drawable**: if you can't name the picture, rewrite the sentence.
- For each sentence, pick the **headline**: the 1-3 word key idea (noun or claim), not a transcript.
  Underline it when it is the core concept (TOK SIZDA, ZARYAD, REZINA, TEMIRDAN USHLANG, KALIT).
- Use numbers (10 000 VOLT, 0 VOLT) as counters: they are the most rewatched frames.
- End on the same question as the hook so the loop is invisible.
- Facts must be true. Check the physics/medicine/finance claim before writing it, and soften it ("taxminan") when
  it is an estimate.

## Output format to hand to the build step
A markdown table, one row per visual beat:
`| # | start-end (s, estimate) | VO sentence(s) | Picture (asset ids) | Headline (+underline?) | Overlays (counter/charges/glow/inset/marks) |`
plus an **asset list** (one line per illustration: id, prompt idea, orientation).

## The reference script (reconstructed, 59.6 s)
> Mashinadan tushganda sizni ham tok uradimi? O'sha payt tanangizda taxminan o'n ming volt bo'ladi. Qo'rqmang,
> zarari yo'q. Lekin yoqimsiz. Bitta oddiy harakat bor, shuni qilsangiz urmaydi. Aslida mashinaning aybi yo'q,
> tokni o'zingiz olib chiqasiz. Turayotganingizda kiyimingiz o'rindiqqa ishqalanadi. Shunda tanangizga zaryad
> to'planadi. Havo nam bo'lsa, bu zaryad o'zi tarqab ketadi. Lekin qishda havo quruq. Oyoq kiyimingizning tagi ham
> rezina, zaryadni yerga o'tkazmaydi. Zaryad tanangizda qoladi. Temirga tegdingizmi? Tamom. Chirs! Endi o'sha
> harakat: o'rindiqdan turmasdan oldin eshikning temiridan ushlab oling. Oyog'ingiz yerga tegmaguncha qo'yib
> yubormang. Zaryad sezdirmay chiqib ketadi. Esingizdan chiqdimi? Mashinaga avval kalitni tekkizing. Uchqun
> barmoqqa emas, kalitga uradi. Sizni mashinadan boshqa narsa ham tok uradimi?

## Topic ideas that fit the format (everyday physics/body/tech "why" questions)
- Nega sovuqda telefon tez o'chadi? (lithium-ion chemistry in the cold; the fix: keep it in an inner pocket)
- Nega choynak "shovqin" qiladi, keyin tinchiydi? (bubbles collapsing before the boil)
- Nega samolyotda quloq bitadi? (pressure difference; the fix: swallow or yawn)
- Nega muzlatgichdagi non tez qotadi? (starch retrogradation; the fix: freezer, not fridge)
- Nega oynani ichkaridan ter bosadi? (dew point; the fix: air recirculation off + A/C)
- Nega shirin narsadan keyin yana shirin xohlaysiz? (glucose spike and crash)
- Nega Wi-Fi bir xonada yomon? (2.4 vs 5 GHz, walls, router placement)
