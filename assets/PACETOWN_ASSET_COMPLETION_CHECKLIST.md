# PaceTown Authoritative Asset Completion Checklist

Audited on 2026-09-01 against:

- The original asset-generation manifest.
- All eight downloaded third-party packs.
- The generated concept-art library.
- The deterministic production character sheets and manifests.

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

- [R] `generated/branding/app-icon-master-v1.png` — simplify shading and remove smooth gradients; export a crisp pixel master.
- [R] `generated/ui/ui-icon-atlas-v1.png` — reduce saturation and align outlines to the Kenney thin-outline panels.
- [R] `generated/ui/calendar-state-sheet-v1.png` — recolor its bright blues into dusk teal, sage, cream, amber, and muted plum.
- [R] `generated/effects/load-weather-atlas-v1.png` — repixel painterly glow and fog into hard-edged transparent overlays.
- [R] Five generated mini-game backgrounds — internally coherent, but denser than the world tiles. Use them as full-screen mini-game scenes only and apply one shared palette-reduction pass.
- [R] Enchanted Storybook, Ripple Fountain, Tea Counter, and Lantern Stall sheets — retain designs and states, but recreate them on true transparent `32 px`-grid canvases.
- [R] Legacy production body sprites under `production/characters/` — technically valid but visually deprecated because the 16x24 foundation loses the original identities.
- [x] V3 four-direction standing bases — portrait-faithful, transparent, exact `64 × 96 px` cells under `production/character-redesign-v3/recommended-64x96/`.
- [ ] Convert the v3 bases into the complete walk, talk, interaction, breathing, sitting, phone, concerned, and happy animation set.
- [R] Guardian portraits — use only in dialogue UI, where their higher detail is intentional. Do not use them as in-world sprites.

## 4. Custom image assets still required

### P0 — required for the first playable demo

#### Core interactive objects

- [ ] Mira's Enchanted Storybook: idle, highlighted, active, reduced-motion.
- [x] Kai's Musical Clock: idle, highlighted, active, reduced-motion.
- [ ] Sol's Ripple Fountain: idle, highlighted, active, reduced-motion.
- [ ] Sky's Tea Counter: idle, highlighted, active, reduced-motion.
- [ ] Goh's Lantern Stall: idle, highlighted, active, reduced-motion.
- [ ] Backpack inspection point.
- [ ] Guardian Council bell.
- [ ] Recovery Garden plot interaction point.
- [ ] Future Mailbox.
- [ ] Journal Postcard board.
- [ ] Google Calendar connection terminal.
- [ ] Rebalance Workshop table.
- [ ] Quiet Mode lantern.
- [ ] Calm Corner portal.
- [ ] Exit Quest noticeboard.

Each should be one cohesive four-state transparent sheet, aligned to the same `32 px` world grid.

#### Mini-game foreground packages

The backgrounds already exist. Generate only the interactive foreground layers.

- [ ] Firefly Stories: firefly animation, glow/trails, five story illustrations, page-turn transition, silent-mode cue.
- [ ] Chime Drift: musical-note atlas, chime glow, clock-hand frames, silent visual wave, calm-completion effect.
- [ ] Gentle Ripples: ripple frames, water shimmer, fish frames, petals/leaves, flower-opening frames, breathing circle, reduced-motion pulse.
- [ ] Warm Cup: cup atlas, ingredient sprites, pour/stir/steam/sparkle frames, rain overlay, finished-cup states, Sky quiet-sitting pose.
- [ ] Night Lanterns: twelve lantern designs, unlit/lit/glowing states, hanging/free variants, light overlay, Goh lighting pose, high-contrast symbols.

#### Workload and backpack UI

- [ ] Backpack: closed, open, light, medium, and heavy states.
- [ ] One task-item atlas: assignment book, laptop, calendar, clock, sports bag, café cup, invitation, groceries, parcel, laundry, transport pass, work uniform, appointment card, generic task.
- [ ] Scheduling-state atlas: fixed-event lock, flexible-event ribbon, and deadline indicator.
- [x] Five workload-category symbols are covered by the generated UI atlas, pending the UI restyle pass.

#### Essential application states

- [ ] Loading illustration.
- [ ] Empty Calendar illustration.
- [ ] Offline illustration.
- [ ] AI-unavailable illustration.
- [ ] No-tasks illustration.
- [ ] Pace Keepsake frame atlas covering Garden, Café, Library, Market, path, weather, and postcard categories.
- [ ] Privacy-safe anonymous-silhouette treatment for keepsakes derived from photos containing people.
- [C] Local photo pixelation and canonical palette-reduction pipeline.
- [C] Private Keepsake collection, preview, placement, download, and deletion UI.
- [C] PWA icon sizes should be exported from the corrected app-icon master; do not regenerate each size.
- [C] Focus rings, standard navigation icons, charts, buttons, labels, and body text belong in code/SVG, not image generation.

### P1 — required for the complete hackathon vision

#### Ambient campus life

- [ ] Six student NPC sheets: reading, laptop, resting under a tree, groceries, headphones, and café drink.
- [ ] Birds animation sheet.
- [ ] Cats animation sheet.
- [ ] Squirrel animation sheet.
- [ ] Butterflies animation sheet.
- [ ] Garden fish animation sheet, unless the Gentle Ripples fish sheet can be reused.

#### Recovery Garden progression

- [ ] Empty plot and four non-destructive development stages.
- [ ] Twelve plant species with three growth frames each.
- [A] Generic trees, shrubs, rocks, pots, grass, water, and paths should come from Pix-Quest.
- [A] Generic benches, lamps, and garden furniture should be selected from compatible free-pack pieces or built from their tiles.
- [ ] Birdbath and wind-chime interaction sprites if suitable free-pack pieces cannot be found during assembly.
- [ ] Morning, afternoon, and evening garden overlays.
- [ ] Garden-complete celebration effect.

#### Future Mailbox and postcards

- [ ] Mailbox closed, new-message, open, and glowing states.
- [ ] Envelope and letter animation sheet.
- [ ] Five guardian postcard frames.
- [ ] Five story-theme postcard illustrations.
- [ ] Guardian Council group postcard.
- [ ] Recovery Garden postcard.
- [ ] Calendar-rebalance postcard.
- [ ] Blank postcard background.
- [C] Private, saved, delete, and unsaved indicators should use code-native UI icons unless an illustration is specifically needed.

#### Additional Calendar visuals

- [x] Ready, syncing, sync-complete, permission-denied, expired, and conflict states exist, pending recoloring.
- [ ] Selected-calendar indicator.
- [ ] Imported-event marker.
- [ ] Offline Calendar illustration.
- [ ] Before-and-after schedule-preview background.
- [A] Reuse the scheduling-state lock and ribbon from the workload atlas.
- [C] Use Google's official approved asset for any Google logo; never generate one.

### P2 — polish after the demo is stable

- [ ] Cloud-shadow overlay.
- [ ] Evening color overlay.
- [ ] Window-glow overlay.
- [ ] Ambient dust and sparkle sheet.
- [ ] Interaction pulse.
- [ ] Footstep particles.
- [ ] Guardian speech indicator.
- [ ] Quiet Mode vignette.
- [ ] Loading and scene-transition effects.
- [ ] Five guardian portrait tokens if the dialogue portraits cannot be cropped cleanly.
- [ ] Interaction cursor texture only if a code-native cursor is insufficient.

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
- [ ] Production atlases for non-character sprites.
- [ ] Audio captions and descriptions.
- [x] Third-party attribution and licence manifest.

## 6. Approval gate for every future generated sheet

An asset is not production-ready until every item passes.

- [ ] Uses the correct scene family: Kauzz exterior, Styloo interior, Pix-Quest garden, or Kenney UI.
- [ ] Matches the canonical PaceTown palette or has an approved scene-specific palette mapping.
- [ ] Uses top-down three-quarter perspective.
- [ ] Aligns to the `32 px` grid and uses integer dimensions.
- [ ] Uses hard pixels with no smoothing or accidental gradients.
- [ ] Has genuine alpha when intended as a sprite or overlay.
- [ ] Uses a one-native-pixel dark-navy outline where applicable.
- [ ] Remains readable at native size and `4×` nearest-neighbour scale.
- [ ] Contains no embedded text, logos, watermarks, or accidental Google branding.
- [ ] Includes a reduced-motion state when animated.
- [ ] Preserves Sky's and Mira's identity locks.
- [ ] Is compared inside a real representative game scene before approval.

## 7. Next production order

1. Convert the approved v3 character bases into full animation sheets and atlases.
2. Correct the app icon, UI atlas, Calendar sheet, and Load Weather atlas to the canonical palette.
3. Produce the fourteen missing interactive-object sheets.
4. Produce the five mini-game foreground packages.
5. Produce the backpack/workload atlas and essential empty-state illustrations.
6. Add Recovery Garden progression, postcards, ambient NPCs, animals, and remaining polish only after the demo loop works.
