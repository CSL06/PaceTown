from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

from build_sky_animation_v5 import CELL, ROOT, font, shift, split_poses


OUT = ROOT / "assets" / "production" / "character-redesign-v3" / "guardian-lite-v6" / "sky"


def tea_serve(frame: Image.Image) -> Image.Image:
    result = frame.copy()
    draw = ImageDraw.Draw(result)
    # Tiny cup placed near Sky's extended hand. It is deliberately simple so
    # the interaction stays readable at native 64x96 resolution.
    draw.rectangle((7, 48, 14, 53), fill="#EFE3CC", outline="#172638")
    draw.arc((12, 48, 18, 54), 270, 90, fill="#172638")
    draw.point((9, 47), fill="#4E9FA8")
    return result


def build_frames():
    poses = split_poses()
    base = poses[0]
    frames = [
        ("idle_0", base),
        ("idle_1", shift(base, 0, -1)),
        ("talk_0", poses[4]),
        ("talk_1", poses[5]),
        ("tea_serve_0", poses[4]),
        ("tea_serve_1", tea_serve(poses[6])),
        ("breathe_0", base),
        ("breathe_1", poses[9]),
        ("sit_0", poses[7]),
        ("phone_0", poses[8]),
        ("concerned_0", poses[10]),
        ("happy_0", poses[11]),
    ]
    animations = {
        "idle": {"frames": ["idle_0.png", "idle_1.png"], "frameRate": 2, "repeat": -1},
        "talk": {"frames": ["talk_0.png", "talk_1.png"], "frameRate": 4, "repeat": -1},
        "tea_serve": {"frames": ["tea_serve_0.png", "tea_serve_1.png"], "frameRate": 3, "repeat": 0},
        "breathe": {"frames": ["breathe_0.png", "breathe_1.png"], "frameRate": 1, "repeat": -1},
        "sit": {"frames": ["sit_0.png"], "frameRate": 1, "repeat": 0},
        "phone": {"frames": ["phone_0.png"], "frameRate": 1, "repeat": 0},
        "concerned": {"frames": ["concerned_0.png"], "frameRate": 1, "repeat": 0},
        "happy": {"frames": ["happy_0.png"], "frameRate": 1, "repeat": 0},
    }
    return frames, animations


def save_demo(lookup: dict[str, Image.Image]) -> None:
    stages = [
        ("IDLE", ["idle_0", "idle_1"] * 2, 350),
        ("TALK", ["talk_0", "talk_1"] * 3, 220),
        ("SERVE TEA", ["tea_serve_0", "tea_serve_1"] * 2, 400),
        ("BREATHE", ["breathe_0", "breathe_1"] * 2, 550),
        ("HAPPY", ["happy_0"] * 4, 250),
    ]
    images, durations = [], []
    for label, names, duration in stages:
        for name in names:
            panel = Image.new("RGB", (384, 384), "#172638")
            draw = ImageDraw.Draw(panel)
            draw.rounded_rectangle((18, 18, 366, 366), 14, fill="#24384A", outline="#D9A234", width=2)
            draw.text((192, 36), f"SKY • {label}", anchor="ma", fill="#EFE3CC", font=font(20, True))
            sprite = lookup[name].resize((192, 288), Image.Resampling.NEAREST)
            panel.paste(sprite, (96, 72), sprite)
            draw.line((76, 358, 308, 358), fill="#6D8052", width=3)
            images.append(panel); durations.append(duration)
    images[0].save(OUT / "sky-guardian-lite-demo-v6.gif", save_all=True, append_images=images[1:], duration=durations, loop=0, disposal=2)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    frames_dir = OUT / "frames"; frames_dir.mkdir(exist_ok=True)
    frames, animations = build_frames()
    sheet = Image.new("RGBA", (256, 288), (0, 0, 0, 0)); atlas = {}; lookup = {}
    for index, (name, frame) in enumerate(frames):
        x, y = index % 4 * CELL[0], index // 4 * CELL[1]
        sheet.alpha_composite(frame, (x, y)); frame.save(frames_dir / f"{name}.png"); lookup[name] = frame
        atlas[f"{name}.png"] = {
            "frame": {"x": x, "y": y, "w": 64, "h": 96}, "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": 64, "h": 96}, "sourceSize": {"w": 64, "h": 96},
        }
    sheet.save(OUT / "sky-guardian-lite-sheet-v6.png")
    (OUT / "sky-guardian-lite-atlas-v6.json").write_text(json.dumps({"frames": atlas, "meta": {"image": "sky-guardian-lite-sheet-v6.png", "format": "RGBA8888", "size": {"w": 256, "h": 288}, "scale": "1"}}, indent=2), encoding="utf-8")
    (OUT / "sky-guardian-lite-animations-v6.json").write_text(json.dumps(animations, indent=2), encoding="utf-8")
    manifest = {
        "character": "sky", "package": "guardian-lite", "version": 6,
        "cell": {"width": 64, "height": 96}, "frameCount": 12, "animationCount": 8,
        "intendedRole": "stationary tea-counter guardian",
        "movementPolicy": "No walk cycle. Move the complete sprite only if staging requires repositioning.",
        "source": "assets/generated/characters/sky/sky-animation-pose-master-v5-clean.png",
        "savings": "Reuses existing art and omits 28 unnecessary directional movement frames.",
    }
    (OUT / "sky-guardian-lite-manifest-v6.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    save_demo(lookup)
    print(f"Generated {len(frames)} whole-body Sky frames and {len(animations)} animations in {OUT}")


if __name__ == "__main__":
    main()
