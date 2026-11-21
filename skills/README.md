# Claude skills

| Skill | What it does |
|---|---|
| [`explainer-reel`](explainer-reel/SKILL.md) | 9:16 animated "why does this happen?" explainer reels in the dark-board style (Uzbek AI voiceover, flat illustrations, yellow-underline headlines, counters, charge particles, SFX + music), built in Remotion. Trigger: "make a video like the tok uradi one" or `/explainer-reel`. |

| [`toon-xray-reel`](toon-xray-reel/SKILL.md) | **Style #2**: text-free cel-shaded 3D explainer — AI camera shots (Kling), x-ray ghost reveal, part pull-out, animated SVG cut-away, warm grade, watermark; shares voice/SFX/mix with explainer-reel. |
| [`style-match`](style-match/SKILL.md) | Make a reel look like a reference: style-locked generation from de-watermarked reference frames, fitted 3D-LUT colour match, measured side-by-side QA (ΔE / chroma / line density). |
| [`sfx-kit`](sfx-kit/SKILL.md) | 320 professional CC0 sound effects (Wyzowl SFX Kit) with sync points and mix levels; `fetch.sh` downloads the WAVs. Used automatically by explainer-reel's `sfx_cues.py` + `pro_mix.py`. |

Also installed by `install.sh`: laniameda style skills (visual-style-replicator, image-to-prompt, car-angle-extractor, seedance-higgsfield), color-grade-luts (agamm/video-agent, MIT), the official Remotion skills and ElevenLabs skills (sound-effects, music, text-to-speech, voice-isolator).

Install globally on a computer with Claude Code: `bash skills/install.sh` (copies to `~/.claude/skills`, plus the
official Remotion skills). For claude.ai / the desktop app, upload `explainer-reel.skill` (a zip of the folder) in
Settings → Capabilities → Skills.
