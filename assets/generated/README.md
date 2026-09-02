# PaceTown Generated Asset Handoff

Generated with the built-in image-generation workflow on 2026-09-01. This folder contains approved raster assets and clearly labelled composition drafts.

Production character sprites now live in `../production/characters/`. Those exact-grid sheets supersede every body-sprite draft listed below.

## Technically usable source assets

“Technically usable” means the file exists and has the expected alpha or composition. Final visual approval is governed by `../PACETOWN_ASSET_COMPLETION_CHECKLIST.md`; several UI and effect sheets still require palette/style normalization.

### Characters

| Character | Ready file | Content |
|---|---|---|
| Player | `characters/player/player-portraits-v2-transparent.png` | Five dialogue expressions |
| Sky | `characters/sky/sky-portraits-v1.png` | Five dialogue expressions |
| Sky | `characters/sky/sky-sprites-v2-transparent.png` | Directional, walking, talking, drink-tray, and emote sprites |
| Mira | `characters/mira/mira-portraits-v2-transparent.png` | Five dialogue expressions |
| Kai | `characters/kai/kai-portraits-v2-transparent.png` | Five dialogue expressions |
| Sol | `characters/sol/sol-portraits-v2-transparent.png` | Five dialogue expressions |
| Goh | `characters/goh/goh-portraits-v2-transparent.png` | Five dialogue expressions |

### Mini-game backgrounds

- `minigames/firefly-stories-background-v1.png`
- `minigames/chime-drift-background-v1.png`
- `minigames/gentle-ripples-background-v1.png`
- `minigames/warm-cup-background-v1.png`
- `minigames/night-lanterns-background-v1.png`

### Branding, UI, and effects

- `branding/app-icon-master-v1.png` — alpha master.
- `branding/splash-campus-v1.png` — portrait splash illustration.
- `campus/campus-style-master-v1.png` — final world, palette, scale, and architecture anchor.
- `ui/ui-icon-atlas-v1.png` — sixteen alpha-backed feature and category icons.
- `ui/calendar-state-sheet-v1.png` — six alpha-backed Google Calendar integration states; contains no Google branding.
- `effects/load-weather-atlas-v1.png` — eight alpha-backed stress-weather effects.
- `objects/musical-clock-v1-transparent.png` — Kai's four-state interaction object.

## Composition drafts — background cleanup required

Files ending in `-draft.png` are approved for identity, pose, state, architecture, and composition, but must not be imported directly when transparency is required.

### Body sheets

The following are retained only as visual concept references. Use `assets/production/characters/` in the application.

- `characters/player/player-sprites-v2-draft.png` — preferred glasses-free player body design.
- `characters/mira/mira-sprites-v1-draft.png`
- `characters/kai/kai-sprites-v1-draft.png`
- `characters/sol/sol-sprites-v1-draft.png`
- `characters/goh/goh-sprites-v1-draft.png`

### Guardian interaction objects

- `objects/enchanted-storybook-v1-draft.png`
- `objects/ripple-fountain-v1-draft.png`
- `objects/tea-counter-v1-draft.png`
- `objects/lantern-stall-v1-draft.png`

### Location state masters

All ten location sheets contain calm, populated-with-props, and evening concepts. Their baked backgrounds make them composition masters rather than production layers.

- `locations/library-states-v1-draft.png`
- `locations/clock-tower-states-v1-draft.png`
- `locations/garden-pavilion-states-v1-draft.png`
- `locations/cafe-states-v1-draft.png`
- `locations/market-states-v1-draft.png`
- `locations/council-plaza-states-v1-draft.png`
- `locations/recovery-garden-states-v1-draft.png`
- `locations/mailbox-corner-states-v1-draft.png`
- `locations/campus-entrance-states-v1-draft.png`
- `locations/calm-corner-states-v1-draft.png`

## Identity locks

`references/sky-user-reference.png` is the user-provided identity reference for Sky. Preserve his center-parted black hair, round glasses, warm expression, and adult facial proportions.

Mira is an adult neko-maid librarian. Preserve her dark hair, natural cat ears and tail, glasses, modest navy-and-cream uniform, teal bow, bell, and book satchel.

The preferred player identity is the glasses-free design in `player-portraits-v2-transparent.png` and `player-sprites-v2-draft.png`.

## Implementation instructions

1. Use the campus style master and location sheets to assemble the real tilemap from the downloaded third-party tiles.
2. Slice transparent portrait, icon, Calendar, weather, and Sky sheets into production atlases.
3. Manually clean and repixel the approved body and object drafts onto transparent canvases; keep the existing silhouettes and states.
4. Use the portrait-faithful `64 × 96 px` v3 bases under `assets/production/character-redesign-v3/recommended-64x96/`; retain the older `32 × 48 px` sheets only as animation-layout references.
5. Use nearest-neighbour scaling and disable image smoothing.
6. Keep source sheets intact and place sliced frames in `assets/production/`.
7. Add Phaser atlas JSON, frame coordinates, collision data, and accessible application labels in code.

Do not ship source drafts or third-party source archives in the production bundle.
