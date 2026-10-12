"""Turn the curated originals (research/assets-old, downloaded from the old site) into responsive AVIF + WebP.

Usage (from the project root):  python tools/process-images.py
Reads src/data/images.json; writes src/static/img/g/<id>-<w>.avif|webp and the logo/icon set.
research/assets-old is not committed (30 MB). Re-download it with the research steps if needed.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "research" / "assets-old"
OUT = ROOT / "src" / "static" / "img"
(OUT / "g").mkdir(parents=True, exist_ok=True)


def crop_to(im, aw, ah, fy):
    w, h = im.size
    target = aw / ah
    if w / h > target:  # too wide: crop the sides around the centre
        nw = round(h * target)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w / target)  # too tall: crop around the focal height
    y = min(max(0, round(fy * h - nh / 2)), h - nh)
    return im.crop((0, y, w, y + nh))


for item in json.loads((ROOT / "src/data/images.json").read_text(encoding="utf-8")):
    im = ImageOps.exif_transpose(Image.open(SRC / item["src"])).convert("RGB")
    im = crop_to(im, *item["aspect"], item["focal"])
    made = []
    for w in item["widths"]:
        if w > im.width:
            continue
        r = im.resize((w, round(w * item["aspect"][1] / item["aspect"][0])), Image.LANCZOS)
        r.save(OUT / "g" / f"{item['id']}-{w}.avif", quality=50)
        r.save(OUT / "g" / f"{item['id']}-{w}.webp", quality=72, method=6)
        made.append(w)
    print("ok", item["id"], im.size, made)

# Logo (official transparent PNG) + icons (official emerald app icon)
logo = Image.open(ROOT / "src" / "brand" / "logo-transparent.png").convert("RGBA")  # official logo from the old site
logo = logo.crop(logo.getbbox())
for w in (96, 192, 384):
    l = logo.resize((w, round(w * logo.height / logo.width)), Image.LANCZOS)
    l.save(OUT / f"logo-{w}.webp", quality=88, method=6)
    l.save(OUT / f"logo-{w}.png", optimize=True)
icon = Image.open(ROOT / "src" / "brand" / "app-icon-emerald.png").convert("RGB")  # official site icon
for size, name in [(512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png"), (48, "favicon-48.png")]:
    icon.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
print("logo + icons ok", logo.size)
