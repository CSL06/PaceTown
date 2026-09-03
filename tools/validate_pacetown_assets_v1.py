from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
RUNTIME = ROOT / "assets" / "production" / "runtime-assets-v1"
CHAR_ROOT = ROOT / "assets" / "production" / "character-redesign-v3" / "game-ready-animations-64x96"


def main() -> None:
    errors: list[str] = []
    report: dict = {"characters": {}, "runtime": {}, "errors": errors}

    for name in ("player", "mira", "kai", "sol", "sky", "goh"):
        folder = CHAR_ROOT / name
        manifest_path = folder / f"{name}-animation-manifest-v4.json"
        atlas_path = folder / f"{name}-atlas-v4.json"
        animations_path = folder / f"{name}-animations-v4.json"
        for path in (manifest_path, atlas_path, animations_path):
            if not path.exists(): errors.append(f"Missing {path.relative_to(ROOT)}")
        if not manifest_path.exists(): continue
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        atlas = json.loads(atlas_path.read_text(encoding="utf-8"))
        animations = json.loads(animations_path.read_text(encoding="utf-8"))
        frames = sorted((folder / "frames").glob("*.png"))
        if len(frames) != 40: errors.append(f"{name}: expected 40 frames, got {len(frames)}")
        if len(atlas["frames"]) != 40: errors.append(f"{name}: atlas frame count is not 40")
        if len(animations) != 18: errors.append(f"{name}: animation count is not 18")
        transparent = 0
        for frame in frames:
            im = Image.open(frame).convert("RGBA")
            if im.size != (64, 96): errors.append(f"{name}: bad frame size {frame.name}: {im.size}")
            lo, hi = im.getchannel("A").getextrema()
            if lo == 0 and hi == 255: transparent += 1
        if transparent != len(frames): errors.append(f"{name}: {transparent}/{len(frames)} frames have genuine alpha")
        report["characters"][name] = {"frames": len(frames), "animations": len(animations), "alphaFrames": transparent, "cell": manifest["cell"]}

    master = json.loads((RUNTIME / "pacetown-runtime-assets-v1-manifest.json").read_text(encoding="utf-8"))
    for key, meta in master["sheets"].items():
        path = ROOT / meta["image"]
        if not path.exists(): errors.append(f"Missing runtime image: {key}"); continue
        im = Image.open(path)
        if im.mode != "RGBA": errors.append(f"{key}: expected RGBA, got {im.mode}")
        if im.width < 1 or im.height < 1: errors.append(f"{key}: invalid dimensions")
        atlas_path = path.with_suffix(".json")
        if meta["frames"] > 1 and not atlas_path.exists(): errors.append(f"{key}: missing atlas JSON")
        elif atlas_path.exists():
            atlas = json.loads(atlas_path.read_text(encoding="utf-8"))
            if len(atlas["frames"]) != meta["frames"]: errors.append(f"{key}: atlas count mismatch")
            for frame_name, entry in atlas["frames"].items():
                f = entry["frame"]
                if f["x"] + f["w"] > im.width or f["y"] + f["h"] > im.height: errors.append(f"{key}: {frame_name} outside sheet")
        report["runtime"][key] = {"frames": meta["frames"], "cell": meta["cell"], "mode": im.mode, "size": list(im.size)}

    report["summary"] = {
        "characterPackages": len(report["characters"]),
        "characterFrames": sum(x["frames"] for x in report["characters"].values()),
        "characterAnimations": sum(x["animations"] for x in report["characters"].values()),
        "runtimeSheets": len(report["runtime"]),
        "passed": not errors,
    }
    (RUNTIME / "validation-report-v1.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    if errors:
        print("\n".join(errors)); raise SystemExit(1)


if __name__ == "__main__":
    main()
