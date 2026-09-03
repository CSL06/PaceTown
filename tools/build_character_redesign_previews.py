from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


PROJECT = Path(__file__).resolve().parent.parent
OUTPUT = PROJECT / "assets" / "production" / "character-redesign-v3"
CHARACTERS = ["player", "mira", "kai", "sol", "sky", "goh"]
DIRECTIONS = ["down", "left", "right", "up"]


def remove_generated_background(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    corners = [
        image.getpixel((0, 0)),
        image.getpixel((image.width - 1, 0)),
        image.getpixel((0, image.height - 1)),
        image.getpixel((image.width - 1, image.height - 1)),
    ]
    if min(pixel[3] for pixel in corners) < 16:
        return image

    # Some built-in generations render their transparency preview as a pale
    # checkerboard. Flood-filling from every corner removes only the connected
    # background and preserves enclosed cream clothing and eye highlights.
    for point in ((0, 0), (image.width - 1, 0), (0, image.height - 1), (image.width - 1, image.height - 1)):
        ImageDraw.floodfill(image, point, (0, 0, 0, 0), thresh=45)
    return image


def figure_bounds(image: Image.Image) -> list[tuple[int, int, int, int]]:
    alpha = image.getchannel("A")
    active = []
    for x in range(image.width):
        count = sum(alpha.getpixel((x, y)) >= 48 for y in range(0, image.height, 2))
        active.append(count >= 8)

    bands: list[tuple[int, int]] = []
    start = None
    gap = 0
    for x, is_active in enumerate(active):
        if is_active:
            start = x if start is None else start
            gap = 0
        elif start is not None:
            gap += 1
            if gap > 12:
                end = x - gap
                if end - start > 80:
                    bands.append((start, end))
                start = None
                gap = 0
    if start is not None:
        bands.append((start, image.width - 1))

    boxes = []
    for left, right in bands:
        crop_alpha = alpha.crop((left, 0, right + 1, image.height))
        bbox = crop_alpha.getbbox()
        if bbox:
            boxes.append((left + bbox[0], bbox[1], left + bbox[2], bbox[3]))
    return boxes[:4]


def reduce_to_frame(
    image: Image.Image,
    bounds: tuple[int, int, int, int],
    canvas_size: tuple[int, int],
    color_step: int,
) -> Image.Image:
    crop = image.crop(bounds)
    canvas_width, canvas_height = canvas_size
    scale = min((canvas_width - 4) / crop.width, (canvas_height - 4) / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    reduced = crop.resize(size, Image.Resampling.LANCZOS)

    # Convert smooth reduction into deliberately limited, hard-edged pixel
    # clusters. Alpha is binary so runtime edges never shimmer.
    pixels = reduced.load()
    for y in range(reduced.height):
        for x in range(reduced.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha < 92:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                step = color_step
                pixels[x, y] = (
                    min(255, round(red / step) * step),
                    min(255, round(green / step) * step),
                    min(255, round(blue / step) * step),
                    255,
                )

    frame = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    frame.alpha_composite(reduced, ((canvas_width - reduced.width) // 2, canvas_height - 2 - reduced.height))
    return frame


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    filename = "arialbd.ttf" if bold else "arial.ttf"
    path = Path("C:/Windows/Fonts") / filename
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    generated_32: dict[str, list[Image.Image]] = {}
    generated_64: dict[str, list[Image.Image]] = {}

    for name in CHARACTERS:
        source_path = PROJECT / "assets" / "generated" / "characters" / name / f"{name}-sprite-style-master-v3.png"
        source = remove_generated_background(Image.open(source_path))
        bounds = figure_bounds(source)
        if len(bounds) != 4:
            raise RuntimeError(f"{name}: expected four figure views, found {len(bounds)}")

        frames_32 = [reduce_to_frame(source, box, (32, 48), 24) for box in bounds]
        frames_64 = [reduce_to_frame(source, box, (64, 96), 16) for box in bounds]
        generated_32[name] = frames_32
        generated_64[name] = frames_64
        character_dir = OUTPUT / name
        character_dir.mkdir(parents=True, exist_ok=True)
        sheet = Image.new("RGBA", (128, 48), (0, 0, 0, 0))
        for index, (direction, frame) in enumerate(zip(DIRECTIONS, frames_32)):
            frame.save(character_dir / f"idle_{direction}_0.png")
            sheet.alpha_composite(frame, (index * 32, 0))
        sheet.save(character_dir / f"{name}-direction-preview-v3.png")

        recommended_dir = OUTPUT / "base-sprites-64x96" / name
        recommended_dir.mkdir(parents=True, exist_ok=True)
        recommended_sheet = Image.new("RGBA", (256, 96), (0, 0, 0, 0))
        for index, (direction, frame) in enumerate(zip(DIRECTIONS, frames_64)):
            frame.save(recommended_dir / f"idle_{direction}_0.png")
            recommended_sheet.alpha_composite(frame, (index * 64, 0))
        recommended_sheet.save(recommended_dir / f"{name}-direction-preview-v3-64x96.png")

    board = Image.new("RGB", (1024, 640), "#172638")
    draw = ImageDraw.Draw(board)
    draw.text((28, 18), "PACETOWN CHARACTER REDESIGN V3 — RECOMMENDED 64x96", fill="#EFE3CC", font=font(20, True))
    draw.text((28, 44), "Original portrait identities • exact 32px world-grid alignment • four directions", fill="#C7B89B", font=font(13))

    for index, name in enumerate(CHARACTERS):
        column, row = index % 3, index // 3
        x, y = 28 + column * 330, 74 + row * 276
        draw.rounded_rectangle((x, y, x + 308, y + 252), radius=8, fill="#263A4C")
        draw.text((x + 12, y + 10), name.title(), fill="#EFE3CC", font=font(15, True))
        for view_index, frame in enumerate(generated_64[name]):
            board.paste(frame, (x + 22 + view_index * 70, y + 38), frame)
        front = generated_64[name][0].resize((128, 192), Image.Resampling.NEAREST)
        board.paste(front, (x + 90, y + 58), front)

    board.save(OUTPUT / "pacetown-character-redesign-v3-board.png")
    print(f"Generated six exact-grid character previews in {OUTPUT}")


if __name__ == "__main__":
    main()
