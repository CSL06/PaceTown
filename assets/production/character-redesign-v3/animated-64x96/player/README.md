# Player animation v4

Complete portrait-faithful player animation package using exact transparent `64 × 96 px` cells.

## Runtime files

- `player-animation-sheet-v4.png` — `512 × 480 px`, eight columns by five rows.
- `player-atlas-v4.json` — Phaser-compatible coordinates for all 40 frames.
- `player-animations-v4.json` — 18 animation definitions with frame rates and repeat behavior.
- `player-animation-manifest-v4.json` — provenance and technical metadata.
- `frames/` — 40 individually named transparent frames.

## Animation coverage

- Idle: down, left, right, up — two frames each.
- Walk: down, left, right, up — four frames each.
- Talk: down, left, right, up — two frames each.
- Interaction reach — two frames.
- Sitting, phone, concerned and happy — one frame each.
- Calming breath — two frames.

## QA previews

- `player-animation-v4-review-board.png`
- `player-campus-motion-test.png`
- `player-idle-down-preview.gif`
- `player-walk-down-preview.gif`
- `player-talk-down-preview.gif`

## Phaser use

Load the sheet and atlas JSON under the same texture key. Register each entry in `player-animations-v4.json`, prefixing runtime keys with `player_` if other characters share the same animation names.

Use a bottom-center origin and integer coordinates. Do not apply smoothing or fractional display scaling.

## Sources

- Identity: `assets/generated/characters/player/player-sprite-style-master-v3.png`
- Animation poses: `assets/generated/characters/player/player-animation-pose-master-v4.png`
- Direction bases: `assets/production/character-redesign-v3/recommended-64x96/player/`
