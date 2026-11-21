#!/usr/bin/env bash
# Install the explainer-reel skill + the official Remotion agent skills globally for Claude Code.
# Usage (from the repo root):  bash skills/install.sh
set -euo pipefail
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DEST"
rm -rf "$DEST/explainer-reel" && cp -r "$HERE/explainer-reel" "$DEST/"
echo "installed explainer-reel -> $DEST/explainer-reel"
rm -rf "$DEST/toon-xray-reel" && cp -r "$HERE/toon-xray-reel" "$DEST/" && echo "installed toon-xray-reel"
rm -rf "$DEST/sfx-kit" && cp -r "$HERE/sfx-kit" "$DEST/" && bash "$DEST/sfx-kit/fetch.sh"
TMP="$(mktemp -d)"
git clone --depth 1 https://github.com/remotion-dev/skills.git "$TMP/remotion-skills" >/dev/null 2>&1 && {
  for s in remotion-best-practices remotion-create remotion-markup remotion-multimedia remotion-render remotion-captions remotion-studio remotion-docs; do
    rm -rf "$DEST/$s" && cp -r "$TMP/remotion-skills/skills/$s" "$DEST/"
  done
  echo "installed Remotion skills -> $DEST"
} || echo "could not clone remotion-dev/skills (offline?) - run: npx skills add remotion-dev/skills -g"
git clone --depth 1 https://github.com/elevenlabs/skills.git "$TMP/el" >/dev/null 2>&1 && {
  for s in sound-effects music text-to-speech voice-isolator setup-api-key; do rm -rf "$DEST/elevenlabs-$s" && cp -r "$TMP/el/$s" "$DEST/elevenlabs-$s"; done
  echo "installed ElevenLabs skills (need ELEVENLABS_API_KEY)"
} || echo "could not clone elevenlabs/skills - run: npx skills add elevenlabs/skills -g"
rm -rf "$TMP"
python3 -m pip install -q faster-whisper 2>/dev/null && echo "installed faster-whisper (VO timing)" || echo "pip install faster-whisper  # needed for scripts/vo_timing.py"
