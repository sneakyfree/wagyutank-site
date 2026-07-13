#!/usr/bin/env bash
# POSTBUILD (after tankify): for a NON-wagyu tank, replace the two binary brand
# assets tankify can't rewrite — og-image.png (social card) and favicon.svg
# (medallion) — with generated ones from the tank's baked config (colors,
# wordmark, logoText, tagline). Writes into out/ ONLY: public/ keeps WagyuTank's
# hand-crafted originals, so alternating wagyu/clone builds never cross-poison.
# A designer's per-breed art dropped into tanks/<key>/public/ wins over these
# (the hatchery copies it in after this step if present).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="$HERE/lib/tank.config.json"
OUT="$HERE/out"

KEY=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['key'])" "$CFG")
if [ "$KEY" = "wagyu" ]; then
  echo "brand-assets: wagyu keeps its hand-crafted og-image + favicon."
  exit 0
fi
[ -d "$OUT" ] || { echo "brand-assets: no out/ — run after next build"; exit 0; }

NAME=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['brand']['name'])" "$CFG")
GOLD=$(python3 -c "import json,sys;b=json.load(open(sys.argv[1]))['brand'];print((b.get('colors') or {}).get('gold','#8a6d2b'))" "$CFG")
TAG=$(python3 -c "
import json, sys
b = json.load(open(sys.argv[1]))['brand']
t = (b.get('tagline') or '').strip()
if len(t) > 96:  # keep it readable; cut on a word boundary
    t = t[:96].rsplit(' ', 1)[0] + '…'
print(t)" "$CFG")
W1=$(python3 -c "import json,sys;b=json.load(open(sys.argv[1]))['brand'];wm=b.get('wordmark') or [b['name'].upper(),''];print(wm[0])" "$CFG")
W2=$(python3 -c "import json,sys;b=json.load(open(sys.argv[1]))['brand'];wm=b.get('wordmark') or ['',''];print(wm[1] if len(wm)>1 else '')" "$CFG")
MONO=$(python3 -c "import json,sys;b=json.load(open(sys.argv[1]))['brand'];print(b.get('logoText') or b['name'][:2].upper())" "$CFG")

# 1200×630 social card: dark field, tank-gold rules, wordmark + tagline.
magick -size 1200x630 xc:"#101014" \
  -fill "$GOLD" -draw "rectangle 0,0 1200,10" -draw "rectangle 0,620 1200,630" \
  \( -size 1100x200 -background none -fill "$GOLD" -font DejaVu-Sans-Bold \
     -gravity center label:"$W1 $W2" \) -gravity center -geometry +0-60 -composite \
  \( -size 1000x80 -background none -fill "#d8d8de" -font DejaVu-Sans \
     -gravity center caption:"$TAG" \) -gravity center -geometry +0+70 -composite \
  "$OUT/og-image.png"

# Simple branded medallion favicon: tank-gold ring + monogram.
cat > "$OUT/favicon.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#16161c" stroke="$GOLD" stroke-width="3.5"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="$GOLD" stroke-width="1" opacity="0.45"/>
  <text x="32" y="40" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="24" font-weight="bold" fill="$GOLD">$MONO</text>
</svg>
SVG
echo "brand-assets: generated og-image + favicon for $NAME ($GOLD)"
