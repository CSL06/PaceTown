from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from build_character_redesign_previews import remove_generated_background


ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "assets" / "production" / "character-redesign-v3" / "recommended-64x96" / "sky"
POSE_MASTER = ROOT / "assets" / "generated" / "characters" / "sky" / "sky-animation-pose-master-v5-clean.png"
OUT = ROOT / "assets" / "production" / "character-redesign-v3" / "animated-64x96-v5" / "sky"
CELL = (64, 96)
DIRECTIONS = ("down", "left", "right", "up")
COLORS = [
    (23, 38, 56), (18, 18, 24), (38, 35, 43), (61, 54, 62),
    (239, 227, 204), (255, 249, 233), (199, 184, 155),
    (146, 86, 106), (112, 66, 84), (177, 111, 131),
    (78, 126, 168), (58, 99, 144), (103, 151, 190), (31, 97, 112), (78, 159, 168),
    (104, 70, 52), (75, 49, 43), (139, 92, 65),
    (255, 196, 148), (238, 157, 108), (204, 119, 76), (168, 84, 59),
    (217, 162, 52), (109, 128, 82),
]


def font(size: int, bold=False):
    path = Path("C:/Windows/Fonts") / ("arialbd.ttf" if bold else "arial.ttf")
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def palette_image() -> Image.Image:
    pal = Image.new("P", (1, 1))
    values = sum(([r, g, b] for r, g, b in COLORS), []) + [0] * (768 - len(COLORS) * 3)
    pal.putpalette(values)
    return pal


def clean_reduce(source: Image.Image, bounds: tuple[int, int, int, int]) -> Image.Image:
    crop = source.crop(bounds).convert("RGBA")
    scale = min(60 / crop.width, 92 / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    rgb = crop.convert("RGB").resize(size, Image.Resampling.BOX)
    reduced = rgb.quantize(palette=palette_image(), dither=Image.Dither.NONE).convert("RGBA")
    alpha = crop.getchannel("A").resize(size, Image.Resampling.BOX).point(lambda value: 255 if value >= 112 else 0)
    reduced.putalpha(alpha)
    frame = Image.new("RGBA", CELL, (0, 0, 0, 0))
    frame.alpha_composite(reduced, ((64 - size[0]) // 2, 94 - size[1]))
    return frame


def split_poses() -> list[Image.Image]:
    source = remove_generated_background(Image.open(POSE_MASTER))
    poses = []
    for row in range(3):
        for column in range(4):
            box = (
                round(column * source.width / 4), round(row * source.height / 3),
                round((column + 1) * source.width / 4), round((row + 1) * source.height / 3),
            )
            cell = source.crop(box)
            bounds = cell.getchannel("A").getbbox()
            if not bounds: raise RuntimeError(f"Missing pose at {row},{column}")
            poses.append(clean_reduce(cell, bounds))
    return poses


def shift(frame: Image.Image, dx=0, dy=0) -> Image.Image:
    result = Image.new("RGBA", CELL, (0, 0, 0, 0)); result.alpha_composite(frame, (dx, dy)); return result


def subtle(frame: Image.Image, phase: int, direction: str) -> Image.Image:
    dx = (-1, 0, 1, 0)[phase]; dy = (0, -1, 0, -1)[phase]
    if direction != "down": return shift(frame, dx, dy)
    result = Image.new("RGBA", CELL, (0, 0, 0, 0))
    result.alpha_composite(frame.crop((0, 0, 64, 67)), (dx, dy))
    result.alpha_composite(frame.crop((0, 62, 33, 96)), (dx, 62 + (-1, 0, 1, 0)[phase]))
    result.alpha_composite(frame.crop((31, 62, 64, 96)), (dx, 62 + (1, 0, -1, 0)[phase]))
    return result


def build_frames():
    poses = split_poses()
    bases = {d: Image.open(BASE / f"idle_{d}_0.png").convert("RGBA") for d in DIRECTIONS}
    bases["down"] = poses[0]
    frames = []; animations = {}

    def add(key, items, rate, repeat):
        frames.extend(items); animations[key] = {"frames": [f"{n}.png" for n, _ in items], "frameRate": rate, "repeat": repeat}

    for direction in DIRECTIONS:
        base = bases[direction]
        items = [(f"idle_{direction}_0", base), (f"idle_{direction}_1", poses[1] if direction == "down" else shift(base, 0, -1))]
        add(f"idle_{direction}", items, 2, -1)
    for direction in DIRECTIONS:
        base = bases[direction]
        values = [poses[2], subtle(base, 1, direction), poses[3], subtle(base, 3, direction)] if direction == "down" else [subtle(base, i, direction) for i in range(4)]
        add(f"walk_{direction}", [(f"walk_{direction}_{i}", value) for i, value in enumerate(values)], 8, -1)
    for direction in DIRECTIONS:
        base = bases[direction]
        values = [poses[4], poses[5]] if direction == "down" else [base, shift(base, 0, -1)]
        add(f"talk_{direction}", [(f"talk_{direction}_{i}", value) for i, value in enumerate(values)], 4, -1)
    add("interact_down", [("interact_down_0", poses[4]), ("interact_down_1", poses[6])], 4, 0)
    for key, index in (("sit_down", 7), ("phone_down", 8), ("concerned_down", 10), ("happy_down", 11)):
        add(key, [(f"{key}_0", poses[index])], 1, 0)
    add("breathe_down", [("breathe_down_0", poses[1]), ("breathe_down_1", poses[9])], 1, -1)
    return frames, animations


def demo(lookup: dict[str, Image.Image]):
    stages = [
        ("IDLE", ["idle_down_0", "idle_down_1"] * 2, 350),
        ("WALK", [f"walk_down_{i}" for i in range(4)] * 2, 125),
        ("TALK", ["talk_down_0", "talk_down_1"] * 3, 220),
        ("BREATHE", ["breathe_down_0", "breathe_down_1"] * 2, 550),
        ("HAPPY", ["happy_down_0"] * 4, 250),
    ]
    images, durations = [], []
    for label, names, duration in stages:
        for name in names:
            panel = Image.new("RGB", (384, 384), "#172638"); d = ImageDraw.Draw(panel)
            d.rounded_rectangle((18, 18, 366, 366), 14, fill="#24384A", outline="#D9A234", width=2)
            d.text((192, 36), f"SKY • {label}", anchor="ma", fill="#EFE3CC", font=font(20, True))
            sprite = lookup[name].resize((192, 288), Image.Resampling.NEAREST); panel.paste(sprite, (96, 72), sprite)
            d.line((76, 358, 308, 358), fill="#6D8052", width=3); images.append(panel); durations.append(duration)
    images[0].save(OUT / "sky-animation-showcase-v5.gif", save_all=True, append_images=images[1:], duration=durations, loop=0, disposal=2)


def main():
    OUT.mkdir(parents=True, exist_ok=True); (OUT / "frames").mkdir(exist_ok=True)
    frames, animations = build_frames(); sheet = Image.new("RGBA", (512, 480), (0, 0, 0, 0)); atlas = {}; lookup = {}
    for i, (name, frame) in enumerate(frames):
        x, y = i % 8 * 64, i // 8 * 96; sheet.alpha_composite(frame, (x, y)); frame.save(OUT / "frames" / f"{name}.png"); lookup[name] = frame
        atlas[f"{name}.png"] = {"frame": {"x": x, "y": y, "w": 64, "h": 96}, "rotated": False, "trimmed": False, "spriteSourceSize": {"x": 0, "y": 0, "w": 64, "h": 96}, "sourceSize": {"w": 64, "h": 96}}
    sheet.save(OUT / "sky-animation-sheet-v5.png")
    (OUT / "sky-atlas-v5.json").write_text(json.dumps({"frames": atlas, "meta": {"image": "sky-animation-sheet-v5.png", "size": {"w": 512, "h": 480}, "format": "RGBA8888", "scale": "1"}}, indent=2), encoding="utf-8")
    (OUT / "sky-animations-v5.json").write_text(json.dumps(animations, indent=2), encoding="utf-8")
    manifest = {"character": "sky", "version": 5, "cell": {"width": 64, "height": 96}, "frameCount": 40, "animationCount": 18, "identitySource": "assets/generated/references/sky-user-reference.png", "poseSource": "assets/generated/characters/sky/sky-animation-pose-master-v5-clean.png", "cleanup": ["fixed 24-color palette", "binary alpha", "BOX reduction", "consistent pose scale and baseline"]}
    (OUT / "sky-animation-manifest-v5.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    demo(lookup); print(f"Generated clean Sky v5 package in {OUT}")


if __name__ == "__main__": main()
