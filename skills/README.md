# Claude skills

| Skill | What it does |
|---|---|
| [`explainer-reel`](explainer-reel/SKILL.md) | 9:16 animated "why does this happen?" explainer reels in the dark-board style (Uzbek AI voiceover, flat illustrations, yellow-underline headlines, counters, charge particles, SFX + music), built in Remotion. Trigger: "make a video like the tok uradi one" or `/explainer-reel`. |

| [`sfx-kit`](sfx-kit/SKILL.md) | 320 professional CC0 sound effects (Wyzowl SFX Kit) with sync points and mix levels; `fetch.sh` downloads the WAVs. Used automatically by explainer-reel's `sfx_cues.py` + `pro_mix.py`. |

Also installed by `install.sh`: the official Remotion skills and ElevenLabs skills (sound-effects, music, text-to-speech, voice-isolator).

Install globally on a computer with Claude Code: `bash skills/install.sh` (copies to `~/.claude/skills`, plus the
official Remotion skills). For claude.ai / the desktop app, upload `explainer-reel.skill` (a zip of the folder) in
Settings → Capabilities → Skills.
