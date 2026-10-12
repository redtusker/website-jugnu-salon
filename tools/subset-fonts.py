"""Subset the site's variable fonts to the characters the site uses (keeps all variation axes).

Usage (from this site folder):  python tools/subset-fonts.py
Needs: pip install fonttools brotli
Reads full latin files from tools/font-src/ (written by fetch-fonts.mjs, then moved there)
and writes trimmed woff2 files to site/assets/fonts/.
If you add copy with new characters (e.g. Urdu, accented names), extend UNICODES and re-run.
"""
from pathlib import Path
from fontTools import subset
from fontTools.varLib import instancer

# Limit variation axes to the ranges main.css uses (smaller files). None = keep the full axis.
AXES = {
    "cormorant.woff2": {"wght": (400, 600)},
    "cormorant-italic.woff2": {"wght": 500},   # italic accents only
    "montserrat.woff2": {"wght": (400, 700)},
    "great-vibes.woff2": None,                 # static script; trimmed to letters
}

HERE = Path(__file__).resolve().parent
SRC = HERE / "font-src"
OUT = HERE.parent / "src" / "static" / "fonts"

# Printable ASCII + nbsp, ©, ·, ×, en/em dash, curly quotes, ellipsis, minus, arrows.
# The signature script is only used for short accent words.
SCRIPT_UNICODES = "U+0020,U+0026,U+0027,U+002E,U+0041-005A,U+0061-007A,U+2019"
UNICODES = "U+0020-007E,U+00A0,U+00A9,U+00B7,U+00D7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2212,U+2192"

for name in AXES:
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "calt", "lnum", "tnum", "onum"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(str(SRC / name), opts, lazy=False)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(SCRIPT_UNICODES if name == "great-vibes.woff2" else UNICODES))
    sub.subset(font)  # subset first: instancing first trips over glyphs without gvar data
    if AXES[name]:
        font = instancer.instantiateVariableFont(font, AXES[name])
    subset.save_font(font, str(OUT / name), opts)
    print(f"{name}: {(SRC / name).stat().st_size // 1024} KB -> {(OUT / name).stat().st_size // 1024} KB")
