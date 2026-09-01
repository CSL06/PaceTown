# PaceTown character redesign v3

This redesign replaces the visually generic 16x24-derived character bodies with character-specific art based directly on the original portrait sheets.

## Recommended production base

Use `recommended-64x96/<character>/`.

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
- Full walk, talk, interaction, breathing, sitting, phone, concerned, and happy animations: still need conversion from these v3 bases.
- The older `production/characters/` sheets are retained only for animation-layout reference and should not define the final character appearance.

Regenerate the exact-grid previews with the bundled workspace Python runtime:

```powershell
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" `.\tools\build_character_redesign_previews.py
```
