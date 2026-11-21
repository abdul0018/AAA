#!/usr/bin/env bash
# Download the 320 CC0 sounds into this skill folder if they are missing (67 MB).
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
[ -f "$D/sounds.json" ] && [ -d "$D/sounds/whooshes" ] && { echo "sfx-kit already present"; exit 0; }
T="$(mktemp -d)"; git clone --depth 1 https://github.com/wyzowl/sfx-kit.git "$T/k"
(cd "$T/k" && tar --exclude=.git -cf - .) | (cd "$D" && tar xf -); rm -rf "$T"; echo "sfx-kit installed in $D"
