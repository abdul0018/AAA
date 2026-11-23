#!/usr/bin/env bash
# Download the reel's fonts (latin + latin-ext + cyrillic woff2) into <public>/fonts and write fonts.css.
# Local fonts make renders deterministic and avoid Chrome failing on fonts.gstatic.com behind a proxy.
# Usage: bash fetch_fonts.sh path/to/template/public
set -euo pipefail
PUB=${1:?public dir}; mkdir -p "$PUB/fonts"; CSS="$PUB/fonts/fonts.css"; : > "$CSS"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
URL='https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800;900&family=Montserrat:ital,wght@0,500;0,600;0,700;0,800;1,500&family=JetBrains+Mono:wght@400;500&display=block'
curl -fsSL -A "$UA" "$URL" -o "$PUB/fonts/google.css"
# keep only the subsets we need, download each file, rewrite urls to local names
python3 -I - "$PUB/fonts" <<'PY'
import re,sys,os,urllib.request,hashlib
d=sys.argv[1];css=open(os.path.join(d,'google.css')).read();out=[]
for sub,block in re.findall(r'/\* ([\w-]+) \*/\s*(@font-face\s*{[^}]*})',css):
    if sub not in ('latin','latin-ext','cyrillic','cyrillic-ext'): continue
    url=re.search(r'url\((https://[^)]+)\)',block).group(1)
    name=hashlib.sha1(url.encode()).hexdigest()[:12]+'.woff2'
    p=os.path.join(d,name)
    if not os.path.exists(p): urllib.request.urlretrieve(url,p)
    out.append(block.replace(url,name))
open(os.path.join(d,'fonts.css'),'w').write('\n'.join(out)+'\n')
os.remove(os.path.join(d,'google.css'))
print(len(out),'font faces ->',d)
PY
