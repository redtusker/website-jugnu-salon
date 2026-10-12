"""One-off helper: builds src/data/images.json from contact-sheet indices (research/assets-index.json).
Kept for traceability of which original file each image came from. Edit the list, then run it and process-images.py.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
idx = {i: f for i, f, _ in json.loads((ROOT / "research/assets-index.json").read_text())}
UNSPLASH = {115, 118, 126}

# id, sheet index, aspect, focal_y, widths, alt, tags
L = [
    ("hero-bride", 67, (4, 5), .32, [480, 720, 960, 1200], "Bride in a deep-red and gold lehenga with a matha patti and dupatta, makeup by Jugnu's", ["bridal"]),
    ("brides-group", 47, (4, 5), .45, [400, 640, 900], "Four brides in gold, ivory and red bridal wear posing together", ["bridal"]),
    ("bride-gown-hair", 57, (4, 5), .35, [400, 640, 900], "Bride in a white lace gown with a tiara and long voluminous curls", ["bridal", "hair"]),
    ("bride-white", 84, (4, 5), .3, [400, 640, 900], "Bride in a white ball gown with a sparkling tiara inside the salon", ["bridal"]),
    ("bride-gold", 46, (4, 5), .4, [400, 640, 900], "Bride in an ivory and gold outfit with a sheer dupatta", ["bridal"]),
    ("bride-purple", 65, (4, 5), .3, [400, 640, 900], "Bride in a mauve embroidered dupatta with soft glam makeup", ["bridal"]),
    ("bride-green", 61, (4, 5), .3, [400, 640, 900], "Bride in pistachio green with a gold matha patti and choker", ["bridal", "party"]),
    ("bride-red", 69, (4, 5), .3, [400, 640, 900], "Bride in red with jhoomar, nath and bold eye makeup", ["bridal"]),
    ("mehndi-hands", 52, (1, 1), .5, [400, 640], "Bride showing intricate mehndi on both hands", ["bridal"]),
    ("party-braid", 86, (4, 5), .4, [400, 640], "Back view of a long, gold-accented braid on a guest in a colourful outfit", ["party", "hair"]),
    ("bride-60", 60, (4, 5), .3, [400, 640], "Bridal makeup with a statement maang tikka and layered necklaces", ["bridal"]),
    ("bride-63", 63, (4, 5), .3, [400, 640], "Barat bride in red and gold with traditional jewellery", ["bridal"]),
    ("bride-68", 68, (4, 5), .35, [400, 640], "Bride seated in a red bridal lehenga in the salon", ["bridal"]),
    ("bride-88", 88, (4, 5), .35, [400, 640], "Bride in red with gold jewellery photographed in the salon", ["bridal"]),
    ("bride-89", 89, (4, 5), .35, [400, 640], "Bride in an ivory and gold sharara holding a bouquet", ["bridal"]),
    ("bride-90", 90, (4, 5), .4, [400, 640], "Side profile of a bridal bun decorated with red roses", ["bridal", "hair"]),
    ("bride-100", 100, (4, 5), .3, [400, 640], "Bride in maroon with soft curls and gold jewellery", ["bridal"]),
    ("bride-109", 109, (4, 5), .3, [400, 640], "Mehndi bride in red and green with floral jewellery", ["bridal", "party"]),
    ("bun-92", 92, (4, 5), .4, [400, 640], "Stylist finishing a sleek bridal bun with pearl pins", ["hair", "bridal"]),
    ("hair-before-after", 54, (1, 1), .5, [400, 640, 900], "Before and after: straight brunette hair restyled into glossy reddish-brown curls", ["hair"]),
    ("hair-waves-before-after", 104, (1, 1), .5, [400, 640], "Before and after collage: brassy blonde hair corrected to soft honey-brown waves", ["hair"]),
    ("hair-102", 102, (1, 1), .5, [400, 640], "Before and after collage of long hair coloured to a soft ash blonde", ["hair"]),
    ("hair-106", 106, (1, 1), .5, [400, 640], "Before and after: dark hair given rich chocolate dimension and curls", ["hair"]),
    ("hair-83", 83, (4, 5), .5, [400, 640], "Long hair with honey-blonde balayage in loose waves", ["hair"]),
    ("hair-95", 95, (4, 5), .45, [400, 640], "Back view of shoulder-length hair with caramel balayage curls", ["hair"]),
    ("hair-97", 97, (4, 5), .45, [400, 640], "Long, sleek ash-brown hair after a smoothing treatment", ["hair"]),
    ("hair-38", 38, (4, 5), .4, [400, 640], "Copper-red hair colour with a glossy finish", ["hair"]),
    ("lashes", 98, (4, 5), .5, [400, 640], "Close-up of an eye with full, natural-looking lash extensions", ["skin"]),
    ("hydra-result", 111, (4, 3), .5, [400, 640], "Before and after HydraFacial: visibly smoother, clearer skin on the nose and cheek", ["skin"]),
    ("lash-before-after", 53, (1, 1), .5, [400, 640], "Before and after lash extensions showing fuller, curled lashes", ["skin"]),
    ("interior-wall", 76, (4, 5), .45, [480, 800, 1100], "Salon interior with a white feature wall reading HAIR, SKIN, MAKEUP beside Arabic calligraphy", ["salon"]),
    ("interior-floor", 78, (4, 5), .5, [400, 640, 900], "Bright salon floor with black styling chairs, round mirrors and LED lighting", ["salon"]),
    ("interior-lounge", 81, (4, 5), .55, [400, 640], "Reception lounge with a marble counter and pedicure stations", ["salon"]),
    ("interior-wash", 80, (4, 5), .55, [400, 640], "Hair-wash stations in a clean white room", ["salon"]),
    ("jugnu-waseem", 37, (4, 5), .35, [400, 640], "Jugnu Waseem, founder and chairman of Jugnu Salon, speaking to the media", ["team"]),
    ("nafeesa-hussain", 107, (4, 5), .3, [400, 640], "Nafeesa Hussain, CEO of Jugnu Salon, speaking at a beauty industry event", ["team"]),
    ("nails-nude", 115, (4, 5), .5, [400, 640], "Neat nude manicure resting on a soft white surface", ["nails"]),
    ("nails-red-art", 118, (4, 3), .5, [400, 640], "Glossy red nail art with heart details", ["nails"]),
    ("nails-polish", 126, (4, 5), .5, [400, 640], "Nail technician applying polish during a manicure", ["nails"]),
]
out = [dict(id=a, src=idx[i], aspect=list(asp), focal=fy, widths=w, alt=alt, tags=t,
            credit="Unsplash" if i in UNSPLASH else "Jugnu's Salon") for a, i, asp, fy, w, alt, t in L]
(ROOT / "src/data/images.json").write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
print(len(out), "images defined")
