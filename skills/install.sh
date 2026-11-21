#!/usr/bin/env bash
# Install the explainer-reel skill + the official Remotion agent skills globally for Claude Code.
# Usage (from the repo root):  bash skills/install.sh
set -euo pipefail
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DEST"
rm -rf "$DEST/explainer-reel" && cp -r "$HERE/explainer-reel" "$DEST/"
echo "installed explainer-reel -> $DEST/explainer-reel"
TMP="$(mktemp -d)"
git clone --depth 1 https://github.com/remotion-dev/skills.git "$TMP/remotion-skills" >/dev/null 2>&1 && {
  for s in remotion-best-practices remotion-create remotion-markup remotion-multimedia remotion-render remotion-captions remotion-studio remotion-docs; do
    rm -rf "$DEST/$s" && cp -r "$TMP/remotion-skills/skills/$s" "$DEST/"
  done
  echo "installed Remotion skills -> $DEST"
} || echo "could not clone remotion-dev/skills (offline?) - run: npx skills add remotion-dev/skills -g"
rm -rf "$TMP"
python3 -m pip install -q faster-whisper 2>/dev/null && echo "installed faster-whisper (VO timing)" || echo "pip install faster-whisper  # needed for scripts/vo_timing.py"
