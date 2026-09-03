from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
PACK = DIST / "PaceTown_Team_Asset_Pack_v1"
ZIP = DIST / "PaceTown_Team_Asset_Pack_v1.zip"
CHARACTERS = ("player", "mira", "kai", "sol", "sky", "goh")


def copy_file(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def copy_tree(source: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    for path in source.rglob("*"):
        if path.is_file():
            copy_file(path, destination / path.relative_to(source))


def build_characters() -> None:
    source_root = ROOT / "assets" / "production" / "character-redesign-v3" / "game-ready-animations-64x96"
    runtime_root = PACK / "runtime" / "characters"
    preview_root = PACK / "previews" / "characters"
    for name in CHARACTERS:
        source = source_root / name
        runtime = runtime_root / name
        for filename in (
            f"{name}-animation-sheet-v4.png",
            f"{name}-atlas-v4.json",
            f"{name}-animations-v4.json",
            f"{name}-animation-manifest-v4.json",
        ):
            copy_file(source / filename, runtime / filename)
        copy_tree(source / "frames", runtime / "frames")
        for filename in (
            f"{name}-animation-v4-review-board.png",
            f"{name}-campus-motion-test.png",
            f"{name}-idle-down-preview.gif",
            f"{name}-walk-down-preview.gif",
            f"{name}-talk-down-preview.gif",
        ):
            copy_file(source / filename, preview_root / name / filename)


def build_runtime_assets() -> None:
    source = ROOT / "assets" / "production" / "runtime-assets-v1"
    destination = PACK / "runtime" / "world-ui-games"
    excluded_roots = {"qa"}
    excluded_names = {
        "README.md",
        "validation-report-v1.json",
        "pacetown-runtime-assets-v1-review-board.png",
    }
    for path in source.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(source)
        if relative.parts[0] in excluded_roots or path.name in excluded_names:
            continue
        copy_file(path, destination / relative)
    copy_file(source / "pacetown-runtime-assets-v1-review-board.png", PACK / "previews" / "runtime" / "runtime-assets-review-board.png")
    copy_file(source / "qa" / "pacetown-campus-integration-test-v1.png", PACK / "previews" / "runtime" / "campus-integration-test.png")
    copy_file(source / "validation-report-v1.json", PACK / "docs" / "validation-report-v1.json")


def build_docs() -> None:
    copy_file(ROOT / "assets" / "PACETOWN_ASSET_COMPLETION_CHECKLIST.md", PACK / "docs" / "ASSET_COMPLETION_CHECKLIST.md")
    copy_file(ROOT / "assets" / "third-party" / "ASSET_MANIFEST.md", PACK / "docs" / "THIRD_PARTY_ASSET_MANIFEST.md")
    copy_file(ROOT / "assets" / "production" / "character-redesign-v3" / "PROMPTS.md", PACK / "docs" / "IMAGE_GENERATION_PROMPTS.md")
    copy_file(ROOT / "assets" / "production" / "character-redesign-v3" / "README.md", PACK / "docs" / "CHARACTER_ASSET_GUIDE.md")


def write_readme() -> None:
    text = """# PaceTown Team Asset Pack v1

This is the cleaned implementation pack for the PaceTown team. It contains production-formatted custom assets only; drafts and large concept sources have been excluded.

## Use in the game

- `runtime/characters/<name>/`: one `512x480` animation sheet, Phaser atlas JSON, animation definitions, manifest, and forty individual transparent `64x96` frames.
- `runtime/world-ui-games/`: interactive objects, UI, mini-game foregrounds/backgrounds, workload assets, application states, ambient sprites, Recovery Garden, postcards, Calendar art, effects, branding, and per-sheet atlas JSON.
- `previews/`: visual QA only. Do not load these files at runtime.
- `docs/`: asset checklist, prompt record, validation report, and third-party source/licence notes.
- `ASSET_INDEX.json`: every shared file with byte size and SHA-256 checksum.

## Runtime rules

- World grid: `32x32 px`.
- Character frame: `64x96 px`, bottom-aligned to the world grid.
- Use nearest-neighbour scaling and integer positions.
- Disable antialiasing and fractional zoom.
- Use the animation keys from each `<character>-animations-v4.json` file.
- Use the atlas coordinates supplied beside each PNG; do not manually guess frame boundaries.
- Phase zero or a sheet's `reduced_motion` state is the reduced-motion fallback.

## Important licence note

Third-party world packs are deliberately not included in this ZIP. Some source packs prohibit raw redistribution. Each teammate should obtain them from the original links in `docs/THIRD_PARTY_ASSET_MANIFEST.md`, or the team should share them only through an approved private project channel consistent with each licence.

## Validation

The included validation report passed for six character packages, 240 transparent character frames, 108 animation definitions, and 62 runtime sheets.
"""
    (PACK / "README.md").write_text(text, encoding="utf-8")


def write_index() -> None:
    entries = []
    for path in sorted(PACK.rglob("*")):
        if not path.is_file() or path.name == "ASSET_INDEX.json":
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        entries.append({
            "path": path.relative_to(PACK).as_posix(),
            "bytes": path.stat().st_size,
            "sha256": digest,
            "runtime": path.relative_to(PACK).parts[0] == "runtime",
        })
    payload = {
        "pack": "PaceTown Team Asset Pack",
        "version": "1.0",
        "characterFrame": {"width": 64, "height": 96},
        "worldGrid": 32,
        "fileCountExcludingIndex": len(entries),
        "totalBytesExcludingIndex": sum(entry["bytes"] for entry in entries),
        "files": entries,
    }
    (PACK / "ASSET_INDEX.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")


def make_zip() -> None:
    with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(PACK.rglob("*")):
            if path.is_file():
                archive.write(path, Path(PACK.name) / path.relative_to(PACK))


def main() -> None:
    if PACK.exists() or ZIP.exists():
        raise SystemExit("Refusing to overwrite an existing team pack. Rename or remove the existing v1 output first.")
    DIST.mkdir(parents=True, exist_ok=True)
    build_characters()
    build_runtime_assets()
    build_docs()
    write_readme()
    write_index()
    make_zip()
    print(f"Folder: {PACK}")
    print(f"ZIP: {ZIP}")


if __name__ == "__main__":
    main()
