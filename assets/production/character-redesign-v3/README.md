# PaceTown character redesign v3

This redesign replaces the visually generic 16x24-derived character bodies with character-specific art based directly on the original portrait sheets.

## Recommended production base

Use `base-sprites-64x96/<character>/` for clean directional base sprites.

Each character currently has:

- `idle_down_0.png`
- `idle_left_0.png`
- `idle_right_0.png`
- `idle_up_0.png`
- `<character>-direction-preview-v3-64x96.png`

The `64x96` cell is recommended because it preserves recognizable hair, glasses, cat traits, facial features, clothing layers, and accessories while remaining bottom-aligned to the `32px` world grid.

## Identity sources

The full four-view style masters are stored non-destructively at:

- `../../generated/characters/player/player-sprite-style-master-v3.png`
- `../../generated/characters/mira/mira-sprite-style-master-v3.png`
- `../../generated/characters/kai/kai-sprite-style-master-v3.png`
- `../../generated/characters/sol/sol-sprite-style-master-v3.png`
- `../../generated/characters/sky/sky-sprite-style-master-v3.png`
- `../../generated/characters/goh/goh-sprite-style-master-v3.png`

Sky also uses `../../generated/references/sky-user-reference.png` as the authoritative face reference.

## Status

- Four-direction standing bases: ready.
- Exact transparent `64x96` cells: ready.
- Complete game-ready animation packages: ready under `game-ready-animations-64x96/<character>/` for the player, Mira, Kai, Sol, Sky, and Goh.
- Every character has 40 transparent `64x96` frames, 18 shared animation definitions, Phaser atlas JSON, a manifest, GIF previews, a review board, and a campus-scale test.
- Shared states: four-direction idle, walk and talk; front-facing interaction, sitting, phone, breathing, concerned and happy.
- The older `production/characters/` sheets were deprecated and removed; they should not define the final character appearance.

Regenerate the exact-grid previews with the bundled workspace Python runtime:

```powershell
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" `.\tools\build_character_redesign_previews.py
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" `.\tools\build_player_animation_v4.py --character sky
```
