# PaceTown Authoritative Asset Completion Checklist

Audited and completed for visual production on 2026-09-01 against:

- The original asset-generation manifest.
- All eight downloaded third-party packs.
- The generated concept-art library.
- The deterministic production character sheets and manifests.
- The 62-sheet deterministic runtime asset library and validation report under `production/runtime-assets-v1/`.

This checklist replaces the assumption that every world asset must be generated. Generic world art should come from the downloaded packs. New generation is reserved for PaceTown-specific mechanics, characters, narrative objects, and states that the packs cannot provide.

## Status key

- `[x]` Ready or sufficiently covered.
- `[A]` Available; select, slice, recolor, or assemble rather than generate.
- `[R]` Exists, but must be restyled or cleaned before runtime use.
- `[ ]` Still needs a new custom asset.
- `[C]` Create in code or tooling; do not image-generate.

## 1. Canonical visual system

All future custom art must follow this lock.

- Tile grid: `32 × 32 px`.
- Character frame: `64 × 96 px` for the portrait-faithful hero cast, bottom-aligned to the `32 px` world grid. The earlier `32 × 48 px` bodies are deprecated visual references.
- Camera: top-down three-quarter, never isometric.
- Runtime rendering: hard pixel edges, no antialiasing, no fractional scaling.
- Outlines: one native pixel in dark navy `#172638`.
- Core palette:
  - Sage `#6D8052`
  - Dusk teal `#1F6170`
  - Warm amber `#D9A234`
  - Dusty rose `#92566A`
  - Cream `#EFE3CC`
  - Muted plum `#503D62`
  - Stone `#C7B89B`
  - Water teal `#4E9FA8`
- Lighting: warm late afternoon by default; calm, stressed, and evening treatments are overlays, not separate art styles.
- Mood: reassuring, cozy, playful, and mature enough for university students.
- No embedded text, logos, watermarks, photorealistic elements, punitive imagery, dead plants, or frightening overload effects.

### Pack boundaries

Do not freely mix every downloaded pack in one scene.

- Main exterior campus: use compatible nature pieces from Kauzz `nature_outside-tilef.png` plus Pix-Quest nature at exact `2×`; use 32-pixel ground/path tiles. Do not use the industrial `street-1-1.png` sheet in the calming campus core.
- Campus interiors: Styloo is CC0 and useful as a composition/source library, but its smoother rendered props require a hard-pixel, palette-reduction pass before runtime. Prefer hard-pixel Kauzz interior pieces where they fit.
- Recovery Garden: use Pix-Quest at exact `2×` nearest-neighbour scaling as a visually distinct garden scene.
- UI panels: use only Kenney Pixel Adventure's thin-outline family.
- Input prompts: use Kenney Input Prompts Pixel.
- Lighting: use Kenney Light Masks as shader inputs or overlays.
- Tiny Town: minimap and prototypes only.
- Ghost Data school pack: style-QA reference only; excluded from runtime unless the project explicitly accepts CC BY-SA 4.0.

## 2. Already covered — do not generate again

### World and environment

- [A] Grass, soil, paths, roads, water, trees, bushes, fences, bridges, exterior scenery, and generic building pieces — Kauzz and Pix-Quest.
- [A] Floors, walls, doors, classroom furniture, computer-room props, shelving, tables, and generic campus-interior furniture — Styloo source library, requiring the shared hard-pixel palette pass before runtime.
- [A] Generic market, shop, hospital, street, rural, and interior pieces — Kauzz; select only sheets that pass the canonical palette check.
- [A] Generic garden rocks, bushes, trees, pots, grass, path pieces, and water — Pix-Quest.
- [A] UI panels, buttons, sliders, and modal frames — Kenney thin-outline UI.
- [A] Keyboard, mouse, controller, and touch glyphs — Kenney input prompts.
- [A] Generic glow, fog, light, and water-mask inputs — Kenney light masks.
- [x] Campus composition and architecture reference — `generated/campus/campus-style-master-v1.png`.
- [R] Ten campus location state sheets — composition references only; assemble runtime locations from the free packs instead of cleaning these large sheets.

### Characters

- [x] Player, Mira, Kai, Sol, Sky, and Goh portrait-faithful v3 four-direction style masters and transparent `64 × 96 px` standing bases.
- [x] Forty transparent `32 × 48 px` frames per character.
- [x] Four-direction idle, walk, and talk animations.
- [x] Interaction, breathing, sitting, phone, concerned, and happy states.
- [x] Phaser atlas JSON and animation manifests.
- [x] Dialogue portrait sheets for the player and five guardians.
- [x] Sky identity reference stored at `generated/references/sky-user-reference.png`.
- [x] Portrait-faithful v3 redesign board under `production/character-redesign-v3/`.

### Existing game, brand, and UI art

- [x] Five mini-game background compositions.
- [x] Campus splash illustration.
- [x] Campus style master.
- [x] Kai's musical-clock four-state sheet with alpha.
- [x] UI feature/category icon atlas with alpha.
- [x] Six Google Calendar state illustrations with alpha.
- [x] Load Weather concept atlas with alpha.

## 3. Existing assets that must be restyled before runtime

These exist, but they are not yet consistent enough to ship.

- [x] Corrected app icon master and PWA exports — `production/runtime-assets-v1/branding/`.
- [x] Corrected canonical UI icon atlas — `production/runtime-assets-v1/ui/ui-icon-atlas-production-v2.*`.
- [x] Corrected six-state Calendar sheet — `production/runtime-assets-v1/calendar/calendar-state-sheet-production-v2.*`.
- [x] Corrected hard-pixel Load Weather atlas — `production/runtime-assets-v1/effects/load-weather-atlas-production-v2.*`.
- [x] Five mini-game backgrounds palette-reduced for full-screen use — `production/runtime-assets-v1/minigame-backgrounds/`.
- [x] Enchanted Storybook, Ripple Fountain, Tea Counter, and Lantern Stall rebuilt as exact four-state transparent sheets.
- [R] Legacy production body sprites under `production/characters/` — technically valid but visually deprecated because the 16x24 foundation loses the original identities.
- [x] V3 four-direction standing bases — portrait-faithful, transparent, exact `64 × 96 px` cells under `production/character-redesign-v3/recommended-64x96/`.
- [x] Convert the v3 player base into the complete 40-frame, 18-animation package with Phaser atlas and preview files.
- [x] Mira, Kai, Sol, Sky, and Goh use the same 40-frame, 18-animation structure as the player under `production/character-redesign-v3/animated-64x96/`.
- [R] Guardian portraits — use only in dialogue UI, where their higher detail is intentional. Do not use them as in-world sprites.

## 4. Custom image assets still required

### P0 — required for the first playable demo

#### Core interactive objects

- [x] Mira's Enchanted Storybook: idle, highlighted, active, reduced-motion.
- [x] Kai's Musical Clock: idle, highlighted, active, reduced-motion.
- [x] Sol's Ripple Fountain: idle, highlighted, active, reduced-motion.
- [x] Sky's Tea Counter: idle, highlighted, active, reduced-motion.
- [x] Goh's Lantern Stall: idle, highlighted, active, reduced-motion.
- [x] Backpack inspection point.
- [x] Guardian Council bell.
- [x] Recovery Garden plot interaction point.
- [x] Future Mailbox.
- [x] Journal Postcard board.
- [x] Google Calendar connection terminal.
- [x] Rebalance Workshop table.
- [x] Quiet Mode lantern.
- [x] Calm Corner portal.
- [x] Exit Quest noticeboard.

Each should be one cohesive four-state transparent sheet, aligned to the same `32 px` world grid.

#### Mini-game foreground packages

The backgrounds already exist. Generate only the interactive foreground layers.

- [x] Firefly Stories: firefly animation, glow/trails, five story illustrations, page-turn transition, silent-mode cue.
- [x] Chime Drift: musical-note atlas, chime glow, clock-hand frames, silent visual wave, calm-completion effect.
- [x] Gentle Ripples: ripple frames, water shimmer, fish frames, petals/leaves, flower-opening frames, breathing circle, reduced-motion pulse.
- [x] Warm Cup: cup atlas, ingredient sprites, pour/stir/steam/sparkle frames, rain overlay, finished-cup states, Sky quiet-sitting pose.
- [x] Night Lanterns: twelve lantern designs, unlit/lit/glowing states, hanging/free variants, light overlay, Goh lighting pose, high-contrast symbols.

#### Workload and backpack UI

- [x] Backpack: closed, open, light, medium, and heavy states.
- [x] One task-item atlas: assignment book, laptop, calendar, clock, sports bag, café cup, invitation, groceries, parcel, laundry, transport pass, work uniform, appointment card, generic task.
- [x] Scheduling-state atlas: fixed-event lock, flexible-event ribbon, and deadline indicator.
- [x] Five workload-category symbols are covered by the generated UI atlas, pending the UI restyle pass.

#### Essential application states

- [x] Loading illustration.
- [x] Empty Calendar illustration.
- [x] Offline illustration.
- [x] AI-unavailable illustration.
- [x] No-tasks illustration.
- [ ] Pace Keepsake frame atlas covering Garden, Café, Library, Market, path, weather, and postcard categories.
- [ ] Privacy-safe anonymous-silhouette treatment for keepsakes derived from photos containing people.
- [C] Local photo pixelation and canonical palette-reduction pipeline.
- [C] Private Keepsake collection, preview, placement, download, and deletion UI.
- [C] PWA icon sizes should be exported from the corrected app-icon master; do not regenerate each size.
- [C] Focus rings, standard navigation icons, charts, buttons, labels, and body text belong in code/SVG, not image generation.

### P1 — required for the complete hackathon vision

#### Ambient campus life

- [x] Six student NPC sheets: reading, laptop, resting under a tree, groceries, headphones, and café drink.
- [x] Birds animation sheet.
- [x] Cats animation sheet.
- [x] Squirrel animation sheet.
- [x] Butterflies animation sheet.
- [x] Garden fish animation sheet; Gentle Ripples fish frames can also be reused.

#### Recovery Garden progression

- [x] Empty plot and four non-destructive development stages.
- [x] Twelve plant species with three growth frames each.
- [A] Generic trees, shrubs, rocks, pots, grass, water, and paths should come from Pix-Quest.
- [A] Generic benches, lamps, and garden furniture should be selected from compatible free-pack pieces or built from their tiles.
- [x] Birdbath and wind-chime interaction sprites.
- [x] Morning, afternoon, and evening garden overlays.
- [x] Garden-complete celebration effect.

#### Future Mailbox and postcards

- [x] Mailbox closed, new-message, open, and glowing states.
- [x] Envelope and letter animation sheet.
- [x] Five guardian postcard frames.
- [x] Five story-theme postcard illustrations.
- [x] Guardian Council group postcard.
- [x] Recovery Garden postcard.
- [x] Calendar-rebalance postcard.
- [x] Blank postcard background.
- [C] Private, saved, delete, and unsaved indicators should use code-native UI icons unless an illustration is specifically needed.

#### Additional Calendar visuals

- [x] Ready, syncing, sync-complete, permission-denied, expired, and conflict states exist, pending recoloring.
- [x] Selected-calendar indicator.
- [x] Imported-event marker.
- [x] Offline Calendar illustration.
- [x] Before-and-after schedule-preview background.
- [A] Reuse the scheduling-state lock and ribbon from the workload atlas.
- [C] Use Google's official approved asset for any Google logo; never generate one.

### P2 — polish after the demo is stable

- [x] Cloud-shadow overlay.
- [x] Evening color overlay.
- [x] Window-glow overlay.
- [x] Ambient dust and sparkle sheet.
- [x] Interaction pulse.
- [x] Footstep particles.
- [x] Guardian speech indicator.
- [x] Quiet Mode vignette.
- [x] Loading and scene-transition effects.
- [A] Five guardian portrait tokens can be cropped from the approved dialogue portraits during UI implementation.
- [x] Interaction cursor texture supplied as a fallback; prefer a code-native cursor when sufficient.

## 5. Non-image work still required

These are not image-generation tasks.

- [ ] Main campus ambience.
- [ ] Five district ambience loops.
- [ ] Five mini-game ambience loops.
- [ ] Footsteps and interaction sounds.
- [ ] Page turn, chime, ripple, pour, and lantern sounds.
- [ ] Notification, Calendar sync, postcard-save, and Quiet Mode sounds.
- [ ] Licensed readable pixel-display font.
- [ ] Accessible UI body font.
- [ ] Campus tilemap and collision layers.
- [x] Production atlases for non-character sprites — generated beside each runtime sheet with an aggregate manifest.
- [ ] Audio captions and descriptions.
- [x] Third-party attribution and licence manifest.

## 6. Approval gate for every future generated sheet

An asset is not production-ready until every item passes.

- [x] Uses the correct custom runtime family; free-pack scene boundaries remain documented for world assembly.
- [x] Matches the canonical PaceTown palette or has an approved scene-specific palette mapping.
- [x] Uses top-down three-quarter perspective where perspective applies.
- [x] Aligns to the `32 px` grid and uses integer dimensions.
- [x] Uses hard pixels with no smoothing or accidental gradients.
- [x] Has genuine alpha when intended as a sprite or overlay.
- [x] Uses a one-native-pixel dark-navy outline where applicable.
- [x] Remains readable at native size and `4×` nearest-neighbour scale.
- [x] Contains no embedded text, logos, watermarks, or accidental Google branding.
- [x] Includes a reduced-motion state or stable phase-zero fallback when animated.
- [x] Preserves Sky's and Mira's identity locks.
- [x] Compared in `production/runtime-assets-v1/qa/pacetown-campus-integration-test-v1.png`.

## 7. Next production order

1. [x] Convert the approved v3 character bases into full animation sheets and atlases.
2. [x] Correct the app icon, UI atlas, Calendar sheet, and Load Weather atlas to the canonical palette.
3. [x] Produce the fourteen missing interactive-object sheets.
4. [x] Produce the five mini-game foreground packages.
5. [x] Produce the backpack/workload atlas and essential empty-state illustrations.
6. [x] Add Recovery Garden progression, postcards, ambient NPCs, animals, and remaining visual polish.
