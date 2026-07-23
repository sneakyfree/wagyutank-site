#!/usr/bin/env python3
"""Recut every foundation thumbnail to one house style, from Grant's spec:

  the forward half of the bull, filling the frame -- left edge at the navel /
  sheath, the WHOLE head in view. Horns and nose are never clipped; when the
  head is raised the crop zooms out (giving up some left extent) rather than
  cut a horn.

Per bull we hand-place three fractions read off a gridded source sheet:
  x0 = the navel / sheath  (desired left edge)
  x1 = just past the nose  (hard right edge -- never cross it)
  y0 = just above the horns / poll (hard top edge -- never cross it)
The 4:3 card height follows from the width. If that height would run past the
bottom of the source, we keep the nose and the horns fixed and slide the left
edge inward -- the head stays whole, we simply show a little less of the belly.
"""
from PIL import Image, ImageOps
import os

OUT_W, OUT_H = 900, 675          # 4:3, generous for retina cards
BOXES = {
    # name:            (x0_navel, x1_nose, y0_horntop)
    "AF107":           (0.44, 0.99, 0.09),
    "AF11":            (0.45, 0.995, 0.00),
    "AF109":           (0.46, 0.98, 0.07),
    "AF110":           (0.45, 0.99, 0.02),
    "AF6808":          (0.28, 1.00, 0.03),
    "EAF97014":        (0.42, 0.95, 0.10),
    "FB103":           (0.51, 0.97, 0.09),
    "FB104":           (0.45, 0.98, 0.04),
    "FB1614":          (0.340, 0.990, 0.040),
    "FB1615":          (0.48, 0.95, 0.09),
    "FB2100":          (0.48, 0.98, 0.04),
    "FB2101":          (0.44, 0.96, 0.02),
    "FB2102":          (0.200, 0.960, 0.080),
    "FB2126":          (0.45, 0.96, 0.07),
    "FB2289":          (0.49, 0.99, 0.09),
    "FB2422":          (0.340, 0.990, 0.130),
    "FB2461":          (0.250, 0.960, 0.080),
    "FB2501":          (0.46, 0.94, 0.12),
    "FB2892":          (0.350, 1.000, 0.010),
    "FB2907":          (0.46, 0.90, 0.11),
    "FB3683":          (0.40, 0.99, 0.02),
    "FB4697":          (0.350, 0.995, 0.030),
    "FB5200":          (0.50, 0.98, 0.02),
    "FB670":           (0.280, 0.970, 0.060),
    "FB681":           (0.50, 0.99, 0.03),
    "FB686":           (0.400, 0.960, 0.060),
    "TF146":           (0.42, 0.97, 0.01),
    "TF147":           (0.350, 0.985, 0.020),
    "TF148":           (0.46, 0.92, 0.02),
    "TF150":           (0.380, 1.000, 0.000),
    "TF151":           (0.330, 1.000, 0.070),
    "bar-r-sanjirou-44k": (0.50, 0.99, 0.28),
    "donarudo":        (0.50, 0.99, 0.24),
    "itohana-2":       (0.46, 0.98, 0.07),
    "kage":            (0.48, 0.99, 0.12),
    "kalanga-red-star-c402": (0.45, 0.97, 0.17),
    "rsc-fukuyasu-2613": (0.48, 0.99, 0.17),
    "shigefuku":       (0.300, 1.000, 0.000),
    "sr-y13-sanji":    (0.46, 0.98, 0.18),
    "ukb-dia6-kitaseki": (0.45, 0.97, 0.19),
    "ukb-mr-ume-homaru": (0.47, 0.99, 0.19),
    "z278-hirashigetayasu": (0.45, 0.98, 0.18),
}

# Source files whose primary isn't the bare basename.jpg.
SRC_OVERRIDE = {}

# Bulls photographed facing LEFT. The box is measured on the mirrored image so
# the (navel, nose, horntop) convention still applies; the crop is mirrored
# back afterwards, so the published thumb keeps the true orientation.
LEFT_FACING = set()  # AF11 (Big Al) source is now physically mirrored to face right, like the rest

def crop_box(W, H, x0f, x1f, y0f):
    x1 = x1f * W
    x0 = x0f * W
    y0 = y0f * H
    cw = x1 - x0
    ch = cw * OUT_H / OUT_W
    if y0 + ch > H:                       # would run off the bottom
        ch = H - y0
        cw = ch * OUT_W / OUT_H
        x0 = x1 - cw                      # keep nose + horns, give up left
    if x0 < 0:                            # ran off the left: pin left, drop height
        x0 = 0
        cw = x1 - x0
        ch = cw * OUT_H / OUT_W
        if y0 + ch > H:
            ch = H - y0
    return int(round(x0)), int(round(y0)), int(round(x0 + cw)), int(round(y0 + ch))

def brighten(im):
    g = im.convert("L")
    mean = sum(g.getdata()) / (g.width * g.height) / 255.0
    if mean < 0.45:
        im = im.point(lambda v: int(255 * (v / 255.0) ** (1 / 1.22)))
        im = ImageOps.autocontrast(im, cutoff=1)
    return im

SRC_DIR="public/foundation"; OUT_DIR="public/foundation/thumb"
os.makedirs(OUT_DIR, exist_ok=True)
missing = []
for name, (x0f, x1f, y0f) in BOXES.items():
    src = os.path.join(SRC_DIR, SRC_OVERRIDE.get(name, name + ".jpg"))
    if not os.path.exists(src):
        missing.append(name); continue
    im = Image.open(src).convert("RGB")
    flipped = name in LEFT_FACING
    if flipped:
        im = ImageOps.mirror(im)
    box = crop_box(im.width, im.height, x0f, x1f, y0f)
    c = im.crop(box).resize((OUT_W, OUT_H), Image.LANCZOS)
    if flipped:
        c = ImageOps.mirror(c)
    c = brighten(c)
    c.save(os.path.join(OUT_DIR, name + ".jpg"), quality=88)
print("rendered", len(BOXES) - len(missing), "missing:", missing)
