# Voiceover breakdown and the Uzbek voice recipe

## What the original voice does (measured)

- A **male** narrator, young or middle-aged, with an energetic "smart friend explaining" tone (not an announcer).
- The pitch median is about 165 Hz with a wide 104-246 Hz range, so the delivery is very expressive. It rises on questions and drops and slows on punchlines ("молчит.", "Бесплатно.", "это миф.").
- **About 141 words/min** in Russian (209 words in 88.6 s), with no dead air at the start: the first word is at 0.00 s.
- Sentences are short. There are **0.3-0.55 s pauses** after every full stop and question mark, and about 0.25 s after commas and dashes.
- **Second person, present tense**: "ты садишься, жмёшь старт…" (you sit down, you press start…). It ends on a direct question plus "Подпишись и перешли тому, кто…" (subscribe and send this to someone who…).
- Mix: the voice sits about **15 dB above a soft, low-frequency music bed**. Integrated loudness is about −14 LUFS and the gaps sit at −28 to −33 dBFS (the music bed, never silence). The music cuts out at the very end (the last 1.8 s is digital silence).

## Script formula (copy this structure)

1. **Hook question** (≤ 3 s): "What is X, and why does it [surprising benefit]?"
2. **Cold-open scene** in second person, present tense, with 3-word sentences: "Morning. Courtyard. You get in, press start — and the engine… is silent."
3. **Reframe**: "It didn't break. It's just [the real thing]."
4. **Core metaphor**: "X is two hearts: A and B. And C is in charge."
5. **How it works**, 3 modes: when A, when B, when both, one sentence each.
6. **"But the main secret is…"**, the most counter-intuitive mechanism, with a payoff word ("Free.").
7. **Real-life consequence** ("That's why in traffic…").
8. **One hard number** with a source ("Toyota says 41 %… one of the best in the world").
9. **"The most interesting part:"**, a history fact with 2 years.
10. **Local angle**: a country plus a stat ("last year every third new Camry…").
11. **Life-hack / myth-bust**: "'X dies in 3 years' — that's a myth." plus the real fact.
12. **Question to the viewer** plus **share CTA** aimed at a persona ("send it to someone who counts every litre").

Target 75-90 s, 10 chapters, and about 190-210 words in Uzbek (Uzbek words are longer, so a 200-word Uzbek script is about 80 s at speed 1.05).

## Original transcript (Russian, with timings)

```
[ 0.00] Что такое гибрид и почему он так мало ест бензина?
[ 3.66] Утро, двор, ты садишься в Камри, жмёшь старт, а мотор молчит.
[ 8.66] Машина не сломалась, она просто поехала на электричестве.
[12.52] Гибрид это два сердца: обычный бензиновый мотор и электромотор с батареей, а командует ими компьютер.
[20.10] Трогаешься с места — тянет электромотор, бензиновый спит.
[23.90] На трассе включается бензин и по пути подзаряжает батарею.
[27.20] А когда нужно резко разогнаться, работают оба сразу.
[31.12] Но главный секрет – торможение.
[33.54] В обычной машине энергия торможения просто уходит в тепло колодок.
[37.38] А гибрид сначала тормозит электромотором, и тот превращается в генератор.
[42.24] Энергия возвращается в батарею. Бесплатно.
[45.38] Поэтому в пробке, где обычная машина ест больше всего, гибрид часто едет на одном электричестве.
[51.22] И мотор у него особый.
[52.92] Тойота заявляет, что он превращает в движение 41% энергии бензина – это один из лучших результатов в мире.
[60.10] Самое интересное – первый гибрид собрал Фердинанд Порше ещё в 1900 году, а первый массовый – Приус в 97-м.
[68.60] В Казахстане гибриды тоже распробовали.
[71.00] В прошлом году каждая третья новая Камри была гибридом.
[74.70] И лайфхак.
[75.68] «Батарея умрёт через 3 года» – это миф.
[78.64] В Европе Тойота даёт на неё гарантию до 10 лет, если каждый год проходить проверку.
[83.58] А ты бы взял гибрид?
[85.54] Подпишись и перешли тому, кто считает каждый литр.
```

The Uzbek adaptation of this script is in `template/plan.example.json`. It was tested: 78 s, 192 words, 147 wpm.

## Writing Uzbek for TTS (important)

- Use **Uzbek Latin** with the proper `o‘ g‘` (U+2018 ‘) and `’` for tutuq belgisi (ma’lumot).
- **Spell numbers out in words** in the `vo` text: "qirq bir foiz", "ming to‘qqiz yuzinchi yilda", "to‘qson yettinchi yilda", "o‘n yilgacha". Digits get misread. Show the digits on screen with `bigNumber`, `donut` or `statCard` instead. The caption shows what is *said*, which is also what the reference does ("сорок процент").
- Use the informal "sen" register (o‘tirasan, bosasan, olarmiding?, obuna bo‘l), matching the Russian "ты".
- Keep it **natural spoken Uzbek, not a word-for-word translation**. Reorder into SOV and drop filler. Loan words stay as Uzbek speakers say them: gibrid, elektromotor, probka, layfxak, trassa, kolodka.
- Use short sentences and put a full stop where the reference pauses. "Tong. Hovli." gives the dramatic micro-pauses. An em dash "—" before the punchline gives a lift and a pause.
- Localise the "local angle" to Uzbekistan **only with a fact you can verify**. Otherwise keep the source's fact as is.

## Voice: ElevenLabs settings that sound real in Uzbek

Model: **`eleven_multilingual_v2`**. In a round-trip test (TTS → Whisper), its Uzbek pronunciation was clearly cleaner than `eleven_v3`, which drifted toward a Kazakh-like accent with these voices.

Native Uzbek voices in the shared library (all male):

| voice_id | Name | Character |
|---|---|---|
| `agoC45V78njTIxYzwmSb` | Davronbek – Journalist | confident, middle-aged, **closest to the reference** (default) |
| `rwtcHtZgYU6HN2zLNBlf` | SARHAD-SIZ Narrator | young, confident storyteller |
| `v4cqTf6wc2CXwA2tR7TF` | Adizzbek – hikoya va instagram video | casual, young, made for reels |
| `UjuEL3hLLUaDED9iW4Yb` | Sardor – Cheerful, Playful, Bright | upbeat social-media energy |
| `xDwfBjUEPdIoQekNOXAX` | Jahongir – Calm, Proud, Deep | deep, slower, documentary |
| `fytsqG6MLzC2aCSw7MLa` | Asilbek | chill advertisement |

To find more, use `GET /v2/voices?search=uzbek` or the voice library. Always audition 2-3 of them with `--sample` and let the user pick by ear.

Settings: `stability 0.42` (lower is more expressive, but below 0.35 it starts to wobble), `similarity_boost 0.85`, `style 0.35`, `use_speaker_boost true`, `speed 1.05`. Generate **the whole script in one request** (≤ 4500 chars) so the intonation stays consistent across sentences. The builder does this, and falls back to per-chapter requests with `previous_text`/`next_text` for long scripts. The free tier allows `mp3_44100_128` only.

## Mix

- VO at full level. Put a music bed under it at `musicVolume` 0.10-0.14: a dark, minimal, slightly tense electronic/ambient track with soft low end and no vocals.
- Optional SFX (if the user has them): a soft whoosh on cuts, a "thock" on stamps, a tick on counters. Keep them at −18 dB or lower.
- The final mix target is about −14 LUFS: `ffmpeg -i out/reel.mp4 -af loudnorm=I=-14:TP=-1:LRA=9 -c:v copy out/reel-final.mp4`.
