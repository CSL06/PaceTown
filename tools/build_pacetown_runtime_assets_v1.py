from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "production" / "runtime-assets-v1"
CHAR_ROOT = ROOT / "assets" / "production" / "character-redesign-v3" / "game-ready-animations-64x96"
P = {
    "navy": "#172638", "sage": "#6D8052", "teal": "#1F6170", "amber": "#D9A234",
    "rose": "#92566A", "cream": "#EFE3CC", "plum": "#503D62", "stone": "#C7B89B",
    "water": "#4E9FA8", "brown": "#684634", "green": "#557544", "white": "#FFF9E9",
}
MASTER: dict[str, dict] = {"version": "1.0", "grid": 32, "palette": P, "sheets": {}}


def font(size: int, bold: bool = False):
    path = Path("C:/Windows/Fonts") / ("arialbd.ttf" if bold else "arial.ttf")
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def img(size=(64, 64), color=(0, 0, 0, 0)):
    return Image.new("RGBA", size, color)


def sparkle(d: ImageDraw.ImageDraw, x: int, y: int, c=P["amber"]):
    d.point((x, y), fill=c); d.point((x - 1, y), fill=c); d.point((x + 1, y), fill=c)
    d.point((x, y - 1), fill=c); d.point((x, y + 1), fill=c)


def state_finish(im: Image.Image, state: str) -> Image.Image:
    d = ImageDraw.Draw(im)
    if state == "highlighted":
        d.rectangle((1, 1, im.width - 2, im.height - 2), outline=P["amber"], width=1)
        sparkle(d, 7, 8); sparkle(d, im.width - 8, 11)
    elif state == "active":
        for x, y in ((7, 7), (im.width - 8, 9), (10, im.height - 9), (im.width - 10, im.height - 8)):
            sparkle(d, x, y, P["water"])
    elif state == "reduced_motion":
        d.rectangle((3, im.height - 7, im.width - 4, im.height - 4), fill=P["teal"])
    return im


def object_sprite(kind: str, state: str) -> Image.Image:
    im = img(); d = ImageDraw.Draw(im)
    o, c = P["navy"], P["cream"]
    if kind == "enchanted-storybook":
        d.polygon([(13, 20), (31, 16), (31, 48), (13, 52)], fill=P["plum"], outline=o)
        d.polygon([(32, 16), (51, 20), (51, 52), (32, 48)], fill=P["rose"], outline=o)
        d.line((32, 17, 32, 48), fill=P["amber"]); sparkle(d, 24, 31)
    elif kind == "musical-clock":
        d.ellipse((14, 13, 50, 49), fill=P["stone"], outline=o); d.ellipse((19, 18, 45, 44), fill=c, outline=o)
        d.line((32, 31, 32, 22), fill=P["teal"], width=2); d.line((32, 31, 40, 35), fill=P["rose"], width=2)
        d.arc((8, 8, 22, 26), 190, 340, fill=P["amber"]); d.arc((42, 8, 56, 26), 200, 350, fill=P["amber"])
    elif kind == "ripple-fountain":
        d.ellipse((8, 39, 56, 55), fill=P["teal"], outline=o); d.ellipse((14, 36, 50, 49), fill=P["water"], outline=o)
        d.rectangle((28, 21, 36, 40), fill=P["stone"], outline=o); d.ellipse((22, 16, 42, 28), fill=P["stone"], outline=o)
        d.arc((20, 28, 44, 45), 0, 180, fill=c)
    elif kind == "tea-counter":
        d.rectangle((8, 31, 56, 53), fill=P["brown"], outline=o); d.rectangle((6, 27, 58, 34), fill=P["stone"], outline=o)
        d.rectangle((16, 20, 28, 28), fill=P["cream"], outline=o); d.arc((26, 21, 34, 28), 270, 90, fill=o)
        d.line((42, 26, 46, 18), fill=P["teal"], width=2); d.ellipse((40, 15, 48, 22), fill=P["sage"], outline=o)
    elif kind == "lantern-stall":
        d.rectangle((8, 25, 56, 53), fill=P["brown"], outline=o); d.polygon([(6, 25), (16, 13), (48, 13), (58, 25)], fill=P["rose"], outline=o)
        for x in (19, 32, 45):
            d.line((x, 18, x, 28), fill=o); d.rectangle((x - 4, 27, x + 4, 40), fill=P["amber"], outline=o)
    elif kind == "backpack-inspection":
        d.rounded_rectangle((17, 13, 47, 54), 6, fill=P["teal"], outline=o); d.arc((23, 6, 41, 25), 180, 360, fill=o, width=2)
        d.rectangle((22, 33, 42, 47), fill=P["sage"], outline=o); d.line((17, 27, 10, 39), fill=o, width=2); d.line((47, 27, 54, 39), fill=o, width=2)
    elif kind == "council-bell":
        d.polygon([(18, 42), (22, 22), (42, 22), (46, 42)], fill=P["amber"], outline=o); d.ellipse((16, 38, 48, 48), fill=P["amber"], outline=o)
        d.ellipse((29, 45, 35, 52), fill=P["rose"], outline=o); d.arc((23, 12, 41, 28), 180, 360, fill=o, width=2)
    elif kind == "garden-plot":
        d.polygon([(10, 35), (31, 25), (55, 35), (33, 49)], fill=P["brown"], outline=o)
        for x, y in ((22, 35), (32, 39), (42, 34)):
            d.line((x, y, x, y - 10), fill=P["green"], width=2); d.ellipse((x - 5, y - 15, x, y - 9), fill=P["sage"], outline=o)
    elif kind == "future-mailbox":
        d.rounded_rectangle((15, 17, 49, 42), 8, fill=P["rose"], outline=o); d.rectangle((28, 40, 35, 55), fill=P["brown"], outline=o)
        d.line((16, 28, 48, 28), fill=o); d.rectangle((40, 13, 45, 26), fill=P["amber"], outline=o)
    elif kind == "postcard-board":
        d.rectangle((9, 14, 55, 49), fill=P["brown"], outline=o); d.rectangle((13, 18, 51, 45), fill=P["stone"], outline=o)
        for x, y, col in ((16, 21, P["cream"]), (31, 19, P["rose"]), (23, 33, P["sage"]), (39, 31, P["teal"])):
            d.rectangle((x, y, x + 10, y + 7), fill=col, outline=o)
    elif kind == "calendar-terminal":
        d.rectangle((11, 12, 53, 46), fill=P["teal"], outline=o); d.rectangle((16, 17, 48, 41), fill=P["cream"], outline=o)
        for x in (21, 32, 43): d.line((x, 22, x, 38), fill=P["stone"])
        for y in (27, 33): d.line((17, y, 47, y), fill=P["stone"])
        d.rectangle((26, 46, 38, 52), fill=P["brown"], outline=o)
    elif kind == "rebalance-table":
        d.polygon([(9, 25), (31, 17), (55, 25), (33, 35)], fill=P["stone"], outline=o); d.line((14, 31, 14, 53), fill=o, width=3); d.line((50, 31, 50, 53), fill=o, width=3)
        d.rectangle((20, 20, 33, 27), fill=P["cream"], outline=o); d.rectangle((34, 21, 45, 29), fill=P["rose"], outline=o)
    elif kind == "quiet-lantern":
        d.line((32, 9, 32, 17), fill=o, width=2); d.rectangle((21, 17, 43, 49), fill=P["plum"], outline=o); d.rectangle((25, 22, 39, 43), fill=P["amber"], outline=o)
        d.arc((23, 8, 41, 25), 180, 360, fill=o, width=2)
    elif kind == "calm-portal":
        d.ellipse((11, 8, 53, 56), fill=P["plum"], outline=o); d.ellipse((17, 14, 47, 52), fill=P["teal"], outline=o)
        d.arc((20, 20, 44, 48), 60, 300, fill=P["water"], width=2); sparkle(d, 32, 31, c)
    elif kind == "exit-noticeboard":
        d.rectangle((10, 13, 54, 45), fill=P["brown"], outline=o); d.rectangle((15, 18, 49, 40), fill=P["cream"], outline=o)
        d.polygon([(23, 23), (39, 23), (39, 19), (47, 29), (39, 39), (39, 35), (23, 35)], fill=P["teal"], outline=o)
        d.line((18, 45, 18, 56), fill=o, width=3); d.line((46, 45, 46, 56), fill=o, width=3)
    return state_finish(im, state)


def save_sheet(group: str, name: str, frames: list[tuple[str, Image.Image]], columns=4, tags=None):
    folder = OUT / group; folder.mkdir(parents=True, exist_ok=True)
    cw = max(x.width for _, x in frames); ch = max(x.height for _, x in frames)
    rows = (len(frames) + columns - 1) // columns
    canvas = img((cw * columns, ch * rows)); atlas = {}
    for i, (frame_name, frame) in enumerate(frames):
        x, y = i % columns * cw, i // columns * ch
        canvas.alpha_composite(frame, (x, y))
        atlas[f"{frame_name}.png"] = {"frame": {"x": x, "y": y, "w": cw, "h": ch}, "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": cw, "h": ch}, "sourceSize": {"w": cw, "h": ch}}
    png = folder / f"{name}.png"; canvas.save(png)
    payload = {"frames": atlas, "meta": {"app": "PaceTown deterministic pixel builder", "version": "1.0", "image": png.name,
        "format": "RGBA8888", "size": {"w": canvas.width, "h": canvas.height}, "scale": "1", "tags": tags or []}}
    (folder / f"{name}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    MASTER["sheets"][f"{group}/{name}"] = {"image": str(png.relative_to(ROOT)).replace("\\", "/"), "frames": len(frames), "cell": [cw, ch], "tags": tags or []}


def small_icon(kind: str, phase=0, size=(32, 32)) -> Image.Image:
    im = img(size); d = ImageDraw.Draw(im); o = P["navy"]; cx, cy = size[0] // 2, size[1] // 2
    if kind == "firefly":
        d.ellipse((cx - 2, cy - 2, cx + 2, cy + 2), fill=P["amber"], outline=o); d.arc((cx - 8, cy - 5, cx - 1, cy + 4), 90, 270, fill=P["cream"]); d.arc((cx + 1, cy - 5, cx + 8, cy + 4), 270, 90, fill=P["cream"])
        sparkle(d, cx + (phase % 3) - 1, cy - 7)
    elif kind == "note":
        d.line((cx + 3, 7, cx + 3, 22), fill=P["teal"], width=2); d.line((cx + 3, 7, cx + 10, 9), fill=P["teal"], width=2); d.ellipse((cx - 4, 20, cx + 4, 27), fill=P["rose"], outline=o)
    elif kind == "ripple":
        d.ellipse((5 + phase, 11 + phase // 2, 27 - phase, 21 - phase // 2), outline=P["water"]); d.ellipse((10, 14, 22, 19), outline=P["cream"])
    elif kind == "fish":
        d.ellipse((7 + phase, 11, 23 + phase, 21), fill=P["water"], outline=o); d.polygon([(7 + phase, 16), (2 + phase, 11), (2 + phase, 21)], fill=P["rose"], outline=o); d.point((19 + phase, 14), fill=o)
    elif kind == "plant":
        d.line((cx, 26, cx, 12 - phase * 2), fill=P["green"], width=2); d.ellipse((cx - 8, 13, cx, 20), fill=P["sage"], outline=o); d.ellipse((cx, 9, cx + 8, 17), fill=P["green"], outline=o)
    elif kind == "animal":
        d.ellipse((8 + phase, 12, 24 + phase, 25), fill=P["stone"], outline=o); d.polygon([(10 + phase, 13), (12 + phase, 7), (16 + phase, 13)], fill=P["stone"], outline=o); d.point((21 + phase, 16), fill=o)
    elif kind == "spark": sparkle(d, cx, cy, P["amber"])
    return im


def panel_illustration(kind: str) -> Image.Image:
    im = img((128, 96), P["cream"]); d = ImageDraw.Draw(im); o = P["navy"]
    d.rectangle((0, 64, 127, 95), fill=P["sage"]); d.ellipse((82, 12, 106, 36), fill=P["amber"], outline=o)
    if kind == "loading":
        for i, x in enumerate((44, 58, 72, 86)): d.ellipse((x, 41 - (i % 2) * 4, x + 7, 48 - (i % 2) * 4), fill=P["water"], outline=o)
    elif kind in ("empty-calendar", "offline-calendar"):
        d.rectangle((38, 23, 90, 67), fill=P["white"], outline=o); d.rectangle((38, 23, 90, 33), fill=P["teal"], outline=o)
        if kind == "offline-calendar": d.line((42, 28, 86, 63), fill=P["rose"], width=3)
    elif kind == "offline":
        d.arc((37, 28, 91, 73), 205, 335, fill=P["teal"], width=4); d.line((45, 31, 83, 69), fill=P["rose"], width=3)
    elif kind == "ai-unavailable":
        d.rounded_rectangle((43, 25, 85, 65), 8, fill=P["plum"], outline=o); d.ellipse((52, 39, 59, 46), fill=P["cream"]); d.ellipse((69, 39, 76, 46), fill=P["cream"]); d.line((55, 55, 73, 55), fill=P["stone"], width=2)
    elif kind == "no-tasks":
        d.rounded_rectangle((45, 22, 83, 70), 4, fill=P["stone"], outline=o); d.rectangle((50, 29, 78, 64), fill=P["white"], outline=o); d.line((55, 45, 62, 52, 75, 35), fill=P["teal"], width=3)
    return im


def build_core_objects():
    kinds = ["enchanted-storybook", "musical-clock", "ripple-fountain", "tea-counter", "lantern-stall", "backpack-inspection", "council-bell", "garden-plot", "future-mailbox", "postcard-board", "calendar-terminal", "rebalance-table", "quiet-lantern", "calm-portal", "exit-noticeboard"]
    states = ("idle", "highlighted", "active", "reduced_motion")
    for kind in kinds:
        save_sheet("objects", f"{kind}-states-v1", [(s, object_sprite(kind, s)) for s in states], 4, ["interactive-object", "reduced-motion"])


def build_minigames():
    # Firefly Stories
    frames = [(f"firefly_{i}", small_icon("firefly", i)) for i in range(4)]
    frames += [(f"trail_{i}", small_icon("spark", i)) for i in range(4)]
    for i in range(5):
        card = img((32, 32)); d = ImageDraw.Draw(card); d.rectangle((4, 4, 27, 27), fill=(P["rose"], P["sage"], P["teal"], P["plum"], P["stone"])[i], outline=P["navy"]); sparkle(d, 16, 16)
        frames.append((f"story_{i+1}", card))
    frames += [(f"page_turn_{i}", small_icon("spark", i)) for i in range(3)] + [("silent_cue", small_icon("ripple"))]
    save_sheet("minigames", "firefly-stories-foregrounds-v1", frames, 8, ["firefly-stories"])
    frames = [(f"note_{i}", small_icon("note", i)) for i in range(8)] + [(f"clock_hand_{i}", small_icon("note", i)) for i in range(4)] + [(f"wave_{i}", small_icon("ripple", i)) for i in range(3)] + [("calm_complete", small_icon("spark"))]
    save_sheet("minigames", "chime-drift-foregrounds-v1", frames, 8, ["chime-drift", "silent-cue"])
    frames = [(f"ripple_{i}", small_icon("ripple", i)) for i in range(6)] + [(f"fish_{i}", small_icon("fish", i % 2)) for i in range(4)] + [(f"petal_{i}", small_icon("spark", i)) for i in range(4)] + [(f"flower_{i}", small_icon("plant", min(i, 2))) for i in range(3)] + [(f"breathing_circle_{i}", small_icon("ripple", i)) for i in range(3)] + [("reduced_motion_pulse", small_icon("ripple"))]
    save_sheet("minigames", "gentle-ripples-foregrounds-v1", frames, 8, ["gentle-ripples", "reduced-motion"])
    frames = []
    for i in range(5):
        cup = img((32, 32)); d = ImageDraw.Draw(cup); d.rectangle((7, 12, 23, 25), fill=(P["cream"], P["stone"], P["rose"], P["sage"], P["amber"])[i], outline=P["navy"]); d.arc((20, 13, 29, 24), 270, 90, fill=P["navy"])
        frames.append((f"cup_{i}", cup))
    frames += [(f"ingredient_{i}", small_icon(("plant", "spark", "ripple")[i % 3], i % 3)) for i in range(6)]
    frames += [(f"pour_{i}", small_icon("ripple", i)) for i in range(3)] + [(f"steam_{i}", small_icon("ripple", i)) for i in range(3)] + [(f"sparkle_{i}", small_icon("spark", i)) for i in range(2)] + [("rain_overlay", small_icon("ripple")), ("sky_quiet_sitting", small_icon("plant"))]
    save_sheet("minigames", "warm-cup-foregrounds-v1", frames, 8, ["warm-cup"])
    frames = []
    for i in range(12):
        for state in ("unlit", "lit", "glowing"):
            lan = img((32, 32)); d = ImageDraw.Draw(lan); col = P["plum"] if state == "unlit" else P["amber"]
            d.line((16, 3, 16, 8), fill=P["navy"]); d.polygon([(9, 9), (23, 9), (25, 25), (7, 25)], fill=col, outline=P["navy"])
            if state == "glowing": sparkle(d, 16, 17, P["cream"])
            d.point((11 + i % 5, 15), fill=P["cream"])
            frames.append((f"lantern_{i+1}_{state}", lan))
    frames += [("light_overlay", small_icon("spark")), ("goh_lighting_pose", small_icon("firefly")), ("high_contrast_symbol", small_icon("note"))]
    save_sheet("minigames", "night-lanterns-foregrounds-v1", frames, 8, ["night-lanterns", "high-contrast"])


def build_workload_and_states():
    states = []
    for i, name in enumerate(("closed", "open", "light", "medium", "heavy")):
        bp = object_sprite("backpack-inspection", "idle"); d = ImageDraw.Draw(bp)
        if name == "open": d.polygon([(19, 18), (32, 8), (45, 18)], fill=P["cream"], outline=P["navy"])
        for n in range(max(0, i - 1)): d.rectangle((22 + n * 6, 22 - n * 3, 27 + n * 6, 31), fill=P["amber"], outline=P["navy"])
        states.append((name, bp))
    save_sheet("workload", "backpack-states-v1", states, 5, ["stress-not-load-reduction"])
    task_names = ("assignment-book", "laptop", "calendar", "clock", "sports-bag", "cafe-cup", "invitation", "groceries", "parcel", "laundry", "transport-pass", "work-uniform", "appointment-card", "generic-task")
    frames = []
    colors = (P["rose"], P["teal"], P["sage"], P["amber"], P["plum"], P["stone"])
    for i, name in enumerate(task_names):
        it = img((32, 32)); d = ImageDraw.Draw(it); d.rounded_rectangle((5, 6, 27, 26), 3, fill=colors[i % len(colors)], outline=P["navy"]); d.line((10, 12, 22, 12), fill=P["cream"]); d.line((10, 17, 20, 17), fill=P["cream"])
        frames.append((name, it))
    save_sheet("workload", "task-item-atlas-v1", frames, 7, ["task-items"])
    save_sheet("workload", "scheduling-state-atlas-v1", [(n, small_icon(k)) for n, k in (("fixed-event-lock", "note"), ("flexible-event-ribbon", "ripple"), ("deadline-indicator", "spark"))], 3)
    for name in ("loading", "empty-calendar", "offline", "ai-unavailable", "no-tasks"):
        save_sheet("states", f"{name}-illustration-v1", [(name, panel_illustration(name))], 1, ["empty-state"])


def student_sprite(activity: str, phase: int) -> Image.Image:
    im = img((64, 96)); d = ImageDraw.Draw(im); o = P["navy"]; bob = -1 if phase % 2 else 0
    d.ellipse((23, 10 + bob, 41, 28 + bob), fill="#B97855", outline=o); d.polygon([(22, 15 + bob), (26, 7 + bob), (42, 12 + bob), (40, 18 + bob)], fill=P["brown"], outline=o)
    d.rounded_rectangle((19, 29 + bob, 45, 66 + bob), 4, fill=(P["rose"], P["teal"], P["sage"], P["plum"])[phase % 4], outline=o)
    d.rectangle((22, 65, 30, 86), fill=P["navy"], outline=o); d.rectangle((34, 65, 42, 86), fill=P["navy"], outline=o)
    if activity == "reading": d.rectangle((12, 42, 27, 53), fill=P["cream"], outline=o)
    elif activity == "laptop": d.rectangle((10, 45, 30, 57), fill=P["stone"], outline=o)
    elif activity == "resting-tree": d.arc((8, 47, 33, 72), 10, 170, fill=P["cream"], width=2)
    elif activity == "groceries": d.rectangle((44, 48, 57, 67), fill=P["amber"], outline=o)
    elif activity == "headphones": d.arc((20, 7, 44, 31), 180, 360, fill=P["amber"], width=2)
    elif activity == "cafe-drink": d.rectangle((45, 43, 55, 57), fill=P["cream"], outline=o)
    return im


def build_ambient_and_garden():
    for activity in ("reading", "laptop", "resting-tree", "groceries", "headphones", "cafe-drink"):
        save_sheet("ambient", f"student-{activity}-v1", [(f"{activity}_{i}", student_sprite(activity, i)) for i in range(4)], 4, ["ambient-npc"])
    for animal in ("birds", "cats", "squirrel", "butterflies", "garden-fish"):
        save_sheet("ambient", f"{animal}-animation-v1", [(f"{animal}_{i}", small_icon("fish" if animal == "garden-fish" else "animal", i % 2)) for i in range(4)], 4, ["ambient-animal"])
    plots = []
    for stage in range(5):
        plot = img((96, 96)); d = ImageDraw.Draw(plot); d.polygon([(10, 56), (46, 34), (86, 55), (49, 80)], fill=P["brown"], outline=P["navy"])
        for i in range(stage * 2):
            x, y = 27 + (i % 4) * 15, 55 + (i // 4) * 11; d.line((x, y, x, y - 9 - stage), fill=P["green"], width=2); d.ellipse((x - 5, y - 13 - stage, x + 5, y - 6 - stage), fill=P["sage"], outline=P["navy"])
        plots.append((f"stage_{stage}", plot))
    save_sheet("garden", "plot-progression-v1", plots, 5, ["non-destructive-progression"])
    plants = []
    for species in range(12):
        for stage in range(3):
            plant = small_icon("plant", stage, (32, 48)); d = ImageDraw.Draw(plant)
            if stage == 2: d.ellipse((11, 8, 21, 18), fill=(P["amber"], P["rose"], P["water"], P["cream"])[species % 4], outline=P["navy"])
            plants.append((f"plant_{species+1}_stage_{stage}", plant))
    save_sheet("garden", "plant-growth-atlas-v1", plants, 6, ["12-species", "3-stages"])
    for kind in ("birdbath", "wind-chime"):
        save_sheet("garden", f"{kind}-states-v1", [(s, object_sprite("ripple-fountain" if kind == "birdbath" else "quiet-lantern", s)) for s in ("idle", "highlighted", "active", "reduced_motion")], 4)
    overlays = []
    for name, col in (("morning", (239,227,204,35)), ("afternoon", (217,162,52,35)), ("evening", (80,61,98,80))): overlays.append((name, img((320, 180), col)))
    save_sheet("garden", "time-overlays-v1", overlays, 1, ["full-screen-overlay"])
    save_sheet("garden", "garden-complete-effect-v1", [(f"sparkle_{i}", small_icon("spark", i, (64, 64))) for i in range(6)], 6)


def postcard(title_color: str, motif: str) -> Image.Image:
    im = img((160, 112), P["cream"]); d = ImageDraw.Draw(im); d.rectangle((1, 1, 158, 110), outline=P["navy"])
    d.rectangle((8, 8, 104, 82), fill=title_color, outline=P["navy"]); d.rectangle((114, 10, 148, 34), fill=P["stone"], outline=P["navy"])
    d.line((114, 48, 148, 48), fill=P["stone"]); d.line((114, 59, 148, 59), fill=P["stone"]); d.line((114, 70, 148, 70), fill=P["stone"])
    if motif == "garden": d.ellipse((38, 30, 76, 67), fill=P["sage"], outline=P["navy"])
    elif motif == "calendar": d.rectangle((38, 25, 78, 66), fill=P["white"], outline=P["navy"])
    elif motif == "group":
        for x in (28, 43, 58, 73, 88): d.ellipse((x, 34, x + 11, 45), fill=P["cream"], outline=P["navy"])
    else: sparkle(d, 57, 46, P["amber"])
    return im


def build_mail_calendar_polish():
    save_sheet("mail", "mailbox-states-v1", [(s, object_sprite("future-mailbox", s)) for s in ("closed", "new-message", "open", "glowing")], 4)
    env = []
    for i in range(5):
        e = img((48, 32)); d = ImageDraw.Draw(e); d.rectangle((6, 7, 41, 27), fill=P["cream"], outline=P["navy"]); d.line((6, 7, 24, 20 - i), fill=P["rose"]); d.line((41, 7, 24, 20 - i), fill=P["rose"])
        env.append((f"envelope_{i}", e))
    save_sheet("mail", "envelope-letter-animation-v1", env, 5)
    names = [f"guardian-{x}" for x in ("mira", "kai", "sol", "sky", "goh")] + [f"story-{i}" for i in range(1, 6)] + ["guardian-council", "recovery-garden", "calendar-rebalance", "blank"]
    frames = []
    for i, name in enumerate(names):
        motif = "group" if name == "guardian-council" else "garden" if name == "recovery-garden" else "calendar" if name == "calendar-rebalance" else "spark"
        frames.append((name, postcard((P["rose"], P["sage"], P["teal"], P["plum"], P["stone"])[i % 5], motif)))
    save_sheet("mail", "postcard-atlas-v1", frames, 2, ["14-postcards"])
    save_sheet("calendar", "calendar-additional-atlas-v1", [("selected-calendar", small_icon("spark")), ("imported-event", small_icon("note")), ("offline-calendar", small_icon("ripple"))], 3)
    before = panel_illustration("empty-calendar"); after = panel_illustration("loading")
    save_sheet("calendar", "schedule-preview-backgrounds-v1", [("before", before), ("after", after)], 2)
    effects = []
    for name, col in (("cloud-shadow", (23,38,56,45)), ("evening", (80,61,98,90)), ("window-glow", (217,162,52,80)), ("quiet-mode-vignette", (23,38,56,105))): effects.append((name, img((320, 180), col)))
    save_sheet("effects", "scene-overlays-v1", effects, 1, ["overlay"])
    for name, kind in (("ambient-dust-sparkle", "spark"), ("interaction-pulse", "ripple"), ("footstep-particles", "spark"), ("guardian-speech-indicator", "note"), ("loading-transition", "ripple"), ("interaction-cursor", "spark")):
        save_sheet("effects", f"{name}-v1", [(f"{name}_{i}", small_icon(kind, i)) for i in range(4)], 4)


def restyle_and_brand():
    # Crisp icon master plus deterministic PWA exports.
    icon = img((512, 512), P["cream"]); d = ImageDraw.Draw(icon)
    d.rounded_rectangle((24, 24, 487, 487), 72, fill=P["teal"], outline=P["navy"], width=12)
    d.ellipse((145, 145, 367, 367), fill=P["stone"], outline=P["navy"], width=10)
    d.line((256, 256, 256, 180), fill=P["navy"], width=14); d.line((256, 256, 320, 294), fill=P["rose"], width=14)
    d.polygon([(252, 167), (210, 119), (254, 130)], fill=P["sage"], outline=P["navy"]); d.polygon([(260, 167), (306, 119), (261, 130)], fill=P["green"], outline=P["navy"])
    brand = OUT / "branding"; brand.mkdir(parents=True, exist_ok=True); icon.save(brand / "app-icon-pixel-master-v2.png")
    for size in (16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 384, 512): icon.resize((size, size), Image.Resampling.NEAREST).save(brand / f"app-icon-{size}.png")
    MASTER["sheets"]["branding/app-icon-pixel-master-v2"] = {"image": str((brand / "app-icon-pixel-master-v2.png").relative_to(ROOT)).replace("\\", "/"), "frames": 1, "cell": [512, 512], "tags": ["pwa-source"]}
    # Palette-reduce existing full-screen mini-game scenes and retain their role as backgrounds only.
    palette = [tuple(int(P[k][i:i+2], 16) for i in (1, 3, 5)) for k in ("navy", "sage", "teal", "amber", "rose", "cream", "plum", "stone", "water", "brown", "green", "white")]
    pal = Image.new("P", (1, 1)); raw = sum(([r, g, b] for r, g, b in palette), []) + [0] * (768 - 3 * len(palette)); pal.putpalette(raw)
    bgdir = OUT / "minigame-backgrounds"; bgdir.mkdir(parents=True, exist_ok=True)
    for src in (ROOT / "assets" / "generated" / "minigames").glob("*-background-v1.png"):
        source = Image.open(src).convert("RGB"); reduced = source.quantize(palette=pal, dither=Image.Dither.NONE).convert("RGBA"); reduced.save(bgdir / src.name.replace("-v1", "-production-v2"))


def build_corrected_existing():
    ui_names = ("calm-corner", "backpack", "guardians", "garden", "mailbox", "journal", "exit-quest", "quiet-mode", "mental", "time", "physical", "social", "errands", "calendar", "rebalance", "conflict")
    ui = []
    kinds = ("quiet-lantern", "backpack-inspection", "council-bell", "garden-plot", "future-mailbox", "enchanted-storybook", "exit-noticeboard", "calm-portal", "enchanted-storybook", "musical-clock", "ripple-fountain", "postcard-board", "tea-counter", "calendar-terminal", "rebalance-table", "council-bell")
    for name, kind in zip(ui_names, kinds): ui.append((name, object_sprite(kind, "idle")))
    save_sheet("ui", "ui-icon-atlas-production-v2", ui, 4, ["kenney-thin-outline-compatible", "canonical-palette"])
    calendar_states = []
    for name in ("ready", "syncing", "sync-complete", "permission-denied", "expired", "conflict"):
        card = panel_illustration("empty-calendar"); d = ImageDraw.Draw(card)
        if name == "syncing": d.arc((48, 35, 80, 67), 30, 290, fill=P["water"], width=3)
        elif name == "sync-complete": d.line((50, 52, 59, 61, 77, 39), fill=P["sage"], width=4)
        elif name in ("permission-denied", "expired", "conflict"): d.line((48, 36, 80, 65), fill=P["rose"], width=4); d.line((80, 36, 48, 65), fill=P["rose"], width=4)
        calendar_states.append((name, card))
    save_sheet("calendar", "calendar-state-sheet-production-v2", calendar_states, 3, ["canonical-palette", "no-google-branding"])
    weather = []
    weather_defs = (("fog", "ripple"), ("wind", "ripple"), ("task-gust", "note"), ("crowd", "animal"), ("errand-pile", "spark"), ("low-energy", "ripple"), ("recovery-light", "spark"), ("gentle-rain", "ripple"))
    for name, kind in weather_defs:
        for phase in range(4): weather.append((f"{name}_{phase}", small_icon(kind, phase, (64, 64))))
    save_sheet("effects", "load-weather-atlas-production-v2", weather, 8, ["transparent-overlay", "hard-pixel", "reduced-motion-phase-0"])


def build_review_board():
    entries = list(MASTER["sheets"].items()); board = Image.new("RGB", (1400, 1800), P["navy"]); d = ImageDraw.Draw(board)
    d.text((28, 20), "PACETOWN RUNTIME ASSET LIBRARY V1", fill=P["cream"], font=font(26, True)); d.text((28, 56), f"{len(entries)} production sheets • canonical palette • exact alpha atlases", fill=P["stone"], font=font(14))
    for i, (key, meta) in enumerate(entries[:54]):
        x, y = 28 + i % 6 * 228, 96 + i // 6 * 184
        preview = Image.open(ROOT / meta["image"]).convert("RGBA"); preview.thumbnail((190, 135), Image.Resampling.NEAREST)
        board.paste(preview, (x + (190 - preview.width) // 2, y), preview); d.text((x, y + 140), key[-30:], fill=P["cream"], font=font(10))
    board.save(OUT / "pacetown-runtime-assets-v1-review-board.png")


def build_integration_scene():
    scene = Image.new("RGBA", (960, 540), P["sage"]); d = ImageDraw.Draw(scene)
    for y in range(0, 540, 32):
        for x in range(0, 960, 32):
            col = "#74885A" if (x // 32 + y // 32) % 2 else P["sage"]
            d.rectangle((x, y, x + 31, y + 31), fill=col); d.point((x + 8, y + 11), fill="#839566")
    d.rectangle((0, 206, 959, 365), fill=P["stone"])
    for x in range(0, 960, 32): d.line((x, 206, x, 365), fill="#AE9F84")
    for y in range(206, 366, 32): d.line((0, y, 959, y), fill="#AE9F84")
    # Runtime-scale campus facade and garden edge; no smoothing or fractional scaling.
    d.rectangle((48, 42, 366, 205), fill=P["cream"], outline=P["navy"], width=2); d.polygon([(34, 44), (207, 8), (381, 44)], fill=P["plum"], outline=P["navy"])
    for x in (82, 150, 250, 318): d.rectangle((x, 84, x + 34, 130), fill=P["water"], outline=P["navy"])
    d.rectangle((185, 126, 230, 205), fill=P["teal"], outline=P["navy"])
    d.ellipse((730, 48, 920, 176), fill=P["water"], outline=P["navy"], width=2)
    for x, y in ((674, 67), (714, 112), (900, 90), (642, 150)):
        d.rectangle((x - 3, y + 20, x + 3, y + 48), fill=P["brown"]); d.ellipse((x - 24, y - 8, x + 24, y + 30), fill=P["green"], outline=P["navy"])
    positions = (("player", 160, 246), ("mira", 270, 240), ("kai", 380, 246), ("sol", 490, 246), ("sky", 600, 246), ("goh", 710, 246))
    for name, x, y in positions:
        frame = Image.open(CHAR_ROOT / name / "frames" / "idle_down_0.png").convert("RGBA")
        scene.alpha_composite(frame, (x, y))
    for kind, x, y in (("enchanted-storybook", 90, 385), ("musical-clock", 225, 385), ("ripple-fountain", 360, 385), ("tea-counter", 495, 385), ("lantern-stall", 630, 385), ("future-mailbox", 800, 385)):
        scene.alpha_composite(object_sprite(kind, "active"), (x, y))
    d.rounded_rectangle((18, 475, 942, 523), 8, fill=P["navy"])
    d.text((36, 486), "CAMPUS INTEGRATION QA — 32 px grid • 64×96 cast • canonical interactive objects", fill=P["cream"], font=font(18, True))
    qa = OUT / "qa"; qa.mkdir(parents=True, exist_ok=True); path = qa / "pacetown-campus-integration-test-v1.png"; scene.save(path)
    MASTER["sheets"]["qa/pacetown-campus-integration-test-v1"] = {"image": str(path.relative_to(ROOT)).replace("\\", "/"), "frames": 1, "cell": [960, 540], "tags": ["representative-game-scene", "qa"]}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    build_core_objects(); build_minigames(); build_workload_and_states(); build_ambient_and_garden(); build_mail_calendar_polish(); build_corrected_existing(); restyle_and_brand(); build_integration_scene()
    (OUT / "pacetown-runtime-assets-v1-manifest.json").write_text(json.dumps(MASTER, indent=2), encoding="utf-8")
    build_review_board()
    readme = f"""# PaceTown Runtime Assets V1\n\nGenerated deterministically on the 32 px world grid with the canonical PaceTown palette.\n\n- Production sheets: {len(MASTER['sheets'])}\n- Every atlas uses exact integer cells and RGBA output.\n- Interactive sheets include idle/highlighted/active/reduced-motion states.\n- Mini-game backgrounds are palette-reduced full-screen scenes; foregrounds are separate transparent atlases.\n- The aggregate manifest is `pacetown-runtime-assets-v1-manifest.json`.\n"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")
    print(f"Generated {len(MASTER['sheets'])} runtime sheets in {OUT}")


if __name__ == "__main__":
    main()
