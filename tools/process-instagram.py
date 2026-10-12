"""Instagram snapshot → responsive images + src/data/instagram.json for the homepage coverflow.

Usage (from the project root):  python tools/process-instagram.py
Reads research/instagram-i8markaz.json (captured post list) and the thumbnails already downloaded to
research/ig-i8/ (re-download with the signed URLs in the JSON if missing; they expire after some days).
Cards are normalised to 4:5. Each card links back to the original post on Instagram.
"""
import io
import json
import urllib.request
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "ig-i8"
OUT = ROOT / "src" / "static" / "img" / "ig"
OUT.mkdir(parents=True, exist_ok=True)
src = json.loads((ROOT / "research" / "instagram-i8markaz.json").read_text(encoding="utf-8"))


def load(name, url):
    p = RAW / f"{name}.jpg"
    if p.exists():
        return Image.open(p).convert("RGB")
    data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read()
    p.write_bytes(data)
    return Image.open(io.BytesIO(data)).convert("RGB")


def to_4x5(im):
    w, h = im.size
    th = round(w * 5 / 4)
    if h >= th:
        y = (h - th) // 2
        return im.crop((0, y, w, y + th))
    tw = round(h * 4 / 5)
    x = (w - tw) // 2
    return im.crop((x, 0, x + tw, h))


posts = []
for p in src["posts"]:
    im = to_4x5(load(p["id"], p["src"]))
    for w in (240, 360):
        r = im.resize((w, round(w * 5 / 4)), Image.LANCZOS)
        r.save(OUT / f"{p['id']}-{w}.avif", quality=52)
        r.save(OUT / f"{p['id']}-{w}.webp", quality=74, method=6)
    kind = "reel" if "/reel/" in p["href"] else "post"
    posts.append({"id": p["id"], "href": p["href"], "date": p["date"], "kind": kind,
                  "label": date.fromisoformat(p["date"]).strftime("%d %b").lstrip("0")})

stories = []
for h in src["highlightCovers"]:
    slug = "hl-" + h["title"].lower().replace(" ", "-")
    load(slug, h["src"]).resize((150, 150), Image.LANCZOS).save(OUT / f"{slug}.webp", quality=80, method=6)
    stories.append({"title": h["title"], "img": f"{slug}.webp"})
load("profile", src["profilePic"]).save(OUT / "profile.webp", quality=82, method=6)

# newest first
posts.sort(key=lambda x: x["date"], reverse=True)
data = {"profile": src["profile"], "handle": "jugnusaloni8markaz", "name": src["name"],
        "followers": src["followers"], "posts_count": src["posts_count"], "captured": "2026-10-11",
        "posts": posts, "stories": stories}
(ROOT / "src/data/instagram.json").write_text(json.dumps(data, indent=1), encoding="utf-8")
print(f"{len(posts)} posts, {len(stories)} stories")
