from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from build_character_redesign_previews import remove_generated_background, reduce_to_frame


PROJECT = Path(__file__).resolve().parent.parent
CHARACTER = "player"
BASE_DIR = Path()
OUTPUT = Path()
POSE_MASTER = Path()
CELL = (64, 96)
DIRECTIONS = ("down", "left", "right", "up")


def font(size: int, bold: bool = False):
    filename = "arialbd.ttf" if bold else "arial.ttf"
    path = Path("C:/Windows/Fonts") / filename
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def load_base(direction: str) -> Image.Image:
    return Image.open(BASE_DIR / f"idle_{direction}_0.png").convert("RGBA")


def split_pose_master() -> list[Image.Image]:
    source = remove_generated_background(Image.open(POSE_MASTER))
    poses: list[Image.Image] = []
    for row in range(3):
        for column in range(4):
            left = round(column * source.width / 4)
            right = round((column + 1) * source.width / 4)
            top = round(row * source.height / 3)
            bottom = round((row + 1) * source.height / 3)
            cell = source.crop((left, top, right, bottom))
            bounds = cell.getchannel("A").getbbox()
            if not bounds:
                raise RuntimeError(f"No {CHARACTER} pose found at row {row}, column {column}")
            poses.append(reduce_to_frame(cell, bounds, CELL, 16))
    return poses


def shift(frame: Image.Image, dx: int = 0, dy: int = 0) -> Image.Image:
    result = Image.new("RGBA", CELL, (0, 0, 0, 0))
    result.alpha_composite(frame, (dx, dy))
    return result


def upper_motion(frame: Image.Image, dx: int = 0, dy: int = 0, split: int = 72) -> Image.Image:
    result = frame.copy()
    result.paste((0, 0, 0, 0), (0, 0, CELL[0], split))
    upper = frame.crop((0, 0, CELL[0], split))
    result.alpha_composite(upper, (dx, dy))
    return result


def walk_motion(frame: Image.Image, phase: int, direction: str) -> Image.Image:
    sway = (-1, 0, 1, 0)[phase]
    bob = (0, -1, 0, -1)[phase]
    if direction != "down":
        # Side and rear silhouettes already encode both legs. A restrained
        # two-axis sway avoids tearing the face, hair and backpack.
        return shift(frame, sway, bob)

    left_leg_y = (-2, 0, 1, 0)[phase]
    right_leg_y = (1, 0, -2, 0)[phase]
    result = Image.new("RGBA", CELL, (0, 0, 0, 0))
    left_leg = frame.crop((0, 55, 33, 96))
    right_leg = frame.crop((31, 55, 64, 96))
    upper = frame.crop((0, 0, 64, 66))
    result.alpha_composite(left_leg, (sway, 55 + left_leg_y))
    result.alpha_composite(right_leg, (sway, 55 + right_leg_y))
    result.alpha_composite(upper, (sway, bob))
    return result


def save_gif(frames: list[Image.Image], path: Path, duration: int, scale: int = 4) -> None:
    enlarged = [frame.resize((CELL[0] * scale, CELL[1] * scale), Image.Resampling.NEAREST) for frame in frames]
    enlarged[0].save(path, save_all=True, append_images=enlarged[1:], loop=0, duration=duration, disposal=2)


def save_showcase_demo(frame_lookup: dict[str, Image.Image]) -> None:
    stages = [
        ("IDLE", ["idle_down_0", "idle_down_1"] * 2, 350),
        ("WALK", [f"walk_down_{i}" for i in range(4)] * 2, 125),
        ("TALK", ["talk_down_0", "talk_down_1"] * 3, 220),
        ("BREATHE", ["breathe_down_0", "breathe_down_1"] * 2, 550),
        ("HAPPY", ["happy_down_0"] * 4, 250),
    ]
    rendered: list[Image.Image] = []
    durations: list[int] = []
    for label, names, duration in stages:
        for frame_name in names:
            panel = Image.new("RGB", (384, 384), "#172638")
            draw = ImageDraw.Draw(panel)
            draw.rounded_rectangle((18, 18, 366, 366), radius=14, fill="#24384A", outline="#D9A234", width=2)
            draw.text((192, 36), f"{CHARACTER.upper()} • {label}", anchor="ma", fill="#EFE3CC", font=font(20, True))
            sprite = frame_lookup[frame_name].resize((192, 288), Image.Resampling.NEAREST)
            panel.paste(sprite, (96, 72), sprite)
            draw.line((76, 358, 308, 358), fill="#6D8052", width=3)
            rendered.append(panel)
            durations.append(duration)
    rendered[0].save(
        OUTPUT / f"{CHARACTER}-animation-showcase-v1.gif",
        save_all=True,
        append_images=rendered[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def build_frames() -> tuple[list[tuple[str, Image.Image]], dict[str, dict]]:
    bases = {direction: load_base(direction) for direction in DIRECTIONS}
    poses = split_pose_master()
    frames: list[tuple[str, Image.Image]] = []
    animations: dict[str, dict] = {}

    def add_animation(name: str, items: list[tuple[str, Image.Image]], frame_rate: int, repeat: int) -> None:
        frames.extend(items)
        animations[name] = {
            "frames": [f"{frame_name}.png" for frame_name, _ in items],
            "frameRate": frame_rate,
            "repeat": repeat,
        }

    for direction in DIRECTIONS:
        base = bases[direction]
        idle_frames = [
            (f"idle_{direction}_0", base.copy()),
            (f"idle_{direction}_1", poses[1].copy() if direction == "down" else upper_motion(base, 0, -1)),
        ]
        add_animation(f"idle_{direction}", idle_frames, 2, -1)

    for direction in DIRECTIONS:
        base = bases[direction]
        if direction == "down":
            walk_frames = [poses[2].copy(), upper_motion(base, 0, -1), poses[3].copy(), base.copy()]
        else:
            walk_frames = [walk_motion(base, phase, direction) for phase in range(4)]
        add_animation(
            f"walk_{direction}",
            [(f"walk_{direction}_{index}", frame) for index, frame in enumerate(walk_frames)],
            8,
            -1,
        )

    for direction in DIRECTIONS:
        base = bases[direction]
        if direction == "down":
            talk_frames = [poses[4].copy(), poses[5].copy()]
        else:
            talk_frames = [base.copy(), upper_motion(base, 1 if direction == "right" else -1 if direction == "left" else 0, -1)]
        add_animation(
            f"talk_{direction}",
            [(f"talk_{direction}_{index}", frame) for index, frame in enumerate(talk_frames)],
            4,
            -1,
        )

    add_animation("interact_down", [("interact_down_0", poses[4].copy()), ("interact_down_1", poses[6].copy())], 4, 0)
    add_animation("sit_down", [("sit_down_0", poses[7].copy())], 1, 0)
    add_animation("phone_down", [("phone_down_0", poses[8].copy())], 1, 0)
    add_animation("breathe_down", [("breathe_down_0", poses[1].copy()), ("breathe_down_1", poses[9].copy())], 1, -1)
    add_animation("concerned_down", [("concerned_down_0", poses[10].copy())], 1, 0)
    add_animation("happy_down", [("happy_down_0", poses[11].copy())], 1, 0)

    return frames, animations


def build_review_board(frame_lookup: dict[str, Image.Image]) -> None:
    board = Image.new("RGB", (1280, 1740), "#172638")
    draw = ImageDraw.Draw(board)
    draw.text((28, 20), f"PACETOWN {CHARACTER.upper()} ANIMATION V4", fill="#EFE3CC", font=font(24, True))
    draw.text((28, 52), "Exact 64x96 cells • portrait-faithful v3 identity • engine-ready frame names", fill="#C7B89B", font=font(14))

    groups = [
        ("Idle — four directions", [f"idle_{direction}_{phase}" for direction in DIRECTIONS for phase in range(2)]),
        ("Walk — down", [f"walk_down_{phase}" for phase in range(4)]),
        ("Walk — left / right / up", [f"walk_{direction}_{phase}" for direction in ("left", "right", "up") for phase in range(4)]),
        ("Talk — four directions", [f"talk_{direction}_{phase}" for direction in DIRECTIONS for phase in range(2)]),
        ("Interaction + recovery states", ["interact_down_0", "interact_down_1", "sit_down_0", "phone_down_0", "breathe_down_0", "breathe_down_1", "concerned_down_0", "happy_down_0"]),
    ]

    y = 92
    for title, names in groups:
        draw.text((32, y), title, fill="#EFE3CC", font=font(16, True))
        y += 24
        for index, name in enumerate(names):
            preview = frame_lookup[name].resize((128, 192), Image.Resampling.NEAREST)
            x = 32 + (index % 8) * 154
            row_y = y + (index // 8) * 214
            board.paste(preview, (x, row_y), preview)
            draw.text((x, row_y + 194), name.replace("_down", " D").replace("_left", " L").replace("_right", " R").replace("_up", " U"), fill="#C7B89B", font=font(10))
        y += ((len(names) - 1) // 8 + 1) * 214 + 14

    board.save(OUTPUT / f"{CHARACTER}-animation-v4-review-board.png")


def build_campus_motion_test(walk_frames: list[Image.Image]) -> None:
    scene = Image.new("RGB", (768, 432), "#52733F")
    draw = ImageDraw.Draw(scene)

    # PaceTown-owned QA scene: a calm campus path on the canonical 32px grid.
    for y in range(0, scene.height, 32):
        for x in range(0, scene.width, 32):
            tone = "#5F804A" if ((x // 32 + y // 32) % 2 == 0) else "#587945"
            draw.rectangle((x, y, x + 31, y + 31), fill=tone)
            draw.point((x + 8, y + 11), fill="#78935A")
            draw.point((x + 23, y + 25), fill="#456635")
    draw.rectangle((0, 156, 767, 283), fill="#C7B89B")
    for x in range(0, 768, 32):
        draw.line((x, 156, x, 283), fill="#AE9F84")
    for y in (156, 188, 220, 252, 283):
        draw.line((0, y, 767, y), fill="#AE9F84")

    for index, frame in enumerate(walk_frames):
        preview = frame.resize((128, 192), Image.Resampling.NEAREST)
        x = 82 + index * 170
        scene.paste(preview, (x, 102), preview)
        draw.text((x + 34, 306), f"phase {index + 1}", fill="#172638", font=font(14, True))
    draw.rounded_rectangle((18, 18, 430, 72), radius=8, fill="#172638")
    draw.text((34, 28), f"{CHARACTER.upper()} WALK — CAMPUS SCALE TEST", fill="#EFE3CC", font=font(18, True))
    draw.text((34, 51), "Frames shown at 2x; runtime cells remain 64x96", fill="#C7B89B", font=font(11))
    scene.save(OUTPUT / f"{CHARACTER}-campus-motion-test.png")


def main() -> None:
    global CHARACTER, BASE_DIR, OUTPUT, POSE_MASTER
    parser = argparse.ArgumentParser(description="Build a PaceTown 64x96 character animation package.")
    parser.add_argument("--character", default="player", choices=("player", "mira", "kai", "sol", "sky", "goh"))
    args = parser.parse_args()
    CHARACTER = args.character
    BASE_DIR = PROJECT / "assets" / "production" / "character-redesign-v3" / "recommended-64x96" / CHARACTER
    OUTPUT = PROJECT / "assets" / "production" / "character-redesign-v3" / "animated-64x96" / CHARACTER
    POSE_MASTER = PROJECT / "assets" / "generated" / "characters" / CHARACTER / f"{CHARACTER}-animation-pose-master-v4.png"
    OUTPUT.mkdir(parents=True, exist_ok=True)
    frames_dir = OUTPUT / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    frames, animations = build_frames()

    columns = 8
    rows = (len(frames) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns * CELL[0], rows * CELL[1]), (0, 0, 0, 0))
    atlas_frames: dict[str, dict] = {}
    frame_lookup: dict[str, Image.Image] = {}

    for index, (name, frame) in enumerate(frames):
        x = (index % columns) * CELL[0]
        y = (index // columns) * CELL[1]
        sheet.alpha_composite(frame, (x, y))
        frame.save(frames_dir / f"{name}.png")
        frame_lookup[name] = frame
        atlas_frames[f"{name}.png"] = {
            "frame": {"x": x, "y": y, "w": CELL[0], "h": CELL[1]},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL[0], "h": CELL[1]},
            "sourceSize": {"w": CELL[0], "h": CELL[1]},
        }

    sheet_name = f"{CHARACTER}-animation-sheet-v4.png"
    sheet.save(OUTPUT / sheet_name)
    atlas = {
        "frames": atlas_frames,
        "meta": {
            "app": f"PaceTown {CHARACTER} animation v4 builder",
            "version": "4.0",
            "image": sheet_name,
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": "1",
        },
    }
    (OUTPUT / f"{CHARACTER}-atlas-v4.json").write_text(json.dumps(atlas, indent=2), encoding="utf-8")
    (OUTPUT / f"{CHARACTER}-animations-v4.json").write_text(json.dumps(animations, indent=2), encoding="utf-8")
    manifest = {
        "character": CHARACTER,
        "cell": {"width": CELL[0], "height": CELL[1]},
        "frameCount": len(frames),
        "animationCount": len(animations),
        "columns": columns,
        "rows": rows,
        "identitySource": f"assets/generated/characters/{CHARACTER}/{CHARACTER}-sprite-style-master-v3.png",
        "poseSource": f"assets/generated/characters/{CHARACTER}/{CHARACTER}-animation-pose-master-v4.png",
        "notes": [
            f"Portrait-faithful v3 {CHARACTER} identity is preserved.",
            "All production frames use genuine transparency and exact 64x96 cells.",
            "The pose master supplies front-facing special states; side and rear motion is derived deterministically from approved directional bases.",
        ],
    }
    (OUTPUT / f"{CHARACTER}-animation-manifest-v4.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    save_gif([frame_lookup[f"walk_down_{index}"] for index in range(4)], OUTPUT / f"{CHARACTER}-walk-down-preview.gif", 125)
    save_gif([frame_lookup[f"idle_down_{index}"] for index in range(2)], OUTPUT / f"{CHARACTER}-idle-down-preview.gif", 500)
    save_gif([frame_lookup[f"talk_down_{index}"] for index in range(2)], OUTPUT / f"{CHARACTER}-talk-down-preview.gif", 250)
    build_review_board(frame_lookup)
    build_campus_motion_test([frame_lookup[f"walk_down_{index}"] for index in range(4)])
    save_showcase_demo(frame_lookup)

    print(f"Generated {len(frames)} {CHARACTER} frames and {len(animations)} animations in {OUTPUT}")


if __name__ == "__main__":
    main()
