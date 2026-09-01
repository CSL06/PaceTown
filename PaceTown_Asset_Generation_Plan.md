# PaceTown Complete Asset Generation Manifest

> Scope correction: use `assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md` as the authoritative current checklist. Generic terrain, buildings, furniture, UI panels, input prompts, and lighting are covered by the downloaded packs and should not be regenerated.

## Art Direction

Generate an original top-down pixel-art world inspired by the readability of Gather, without copying its characters, maps, buildings, or branding.

- Base tile: `32 × 32 px`.
- Character footprint: `32 × 48 px`.
- Perspective: top-down three-quarter view, not isometric.
- Rendering: crisp pixel clusters, no antialiasing, nearest-neighbour scaling.
- Palette: calming sage, dusk teal, warm amber, dusty rose, cream, muted plum, and dark navy outlines.
- Lighting: welcoming late-afternoon campus with optional stressed and evening overlays.
- Mood: comforting, playful, mature enough for university students.
- No embedded text, logos, watermarks, gradients, photorealism, or sexualized character designs.
- Generate transparent PNGs for characters, objects, buildings, effects, and icons.
- Generate one image per distinct asset or sprite sheet; “batch” refers to production groups, not combining unrelated assets into one prompt.

### Mira character lock

Mira is an adult university-age neko maid and the Library’s mental-wellbeing guardian.

- Human character with cat ears and tail.
- Modest navy-and-cream maid-inspired librarian uniform.
- Teal ribbon, apron pockets, book satchel, and small bell accessory.
- Warm, attentive, slightly playful personality.
- Soft dark hair, expressive ears and tail.
- No revealing clothing, fetish styling, exaggerated anatomy, or childish proportions.

### Sky character lock

Sky's user-provided identity reference is stored at `assets/generated/references/sky-user-reference.png`.

- Adult university-age man with a warm, calm, approachable expression.
- Voluminous black hair with a clean center part.
- Round dark wire-frame glasses.
- Warm medium-light complexion and gentle dark eyes.
- Dusty-rose cardigan, cream shirt, and sky-blue café apron.
- Preserve these facial features and proportions in every portrait and sprite.

## Batch Generation Order

### Batch 0 — Style anchors

Generate these first and use them as references for every later batch:

1. `style-master-campus.png` — complete campus scene showing the final perspective, palette, lighting, buildings, characters, and object scale.
2. `cast-lineup.png` — player, Mira, Kai, Sol, Sky, and Goh at matching scale.
3. `palette-materials.png` — color palette with grass, stone, wood, water, fabric, metal, glass, and glow treatments.
4. `tile-scale-reference.png` — player standing beside a door, bench, tree, table, and 32-pixel tile.
5. `lighting-reference.png` — normal, stressed, calm, and evening lighting applied to the same scene.

### Batch 1 — Terrain and map tiles

Create seamless tile atlases for:

- Grass: clean, flowered, worn, shaded.
- Soil: plain, planted, disturbed.
- Stone paths: straight, corner, intersection, edge, cracked.
- Brick paths: straight, corner, intersection, edge.
- Wooden flooring and decking.
- Interior carpet for Library and Café.
- Water: still, ripple, edge, corner, waterfall.
- Sand and garden gravel.
- Walls: cream plaster, brick, wood, Library shelving.
- Roof tiles in five district colors.
- Doorways, stairs, ramps, bridges, and archways.
- Fences, hedges, railings, and gates.
- Building shadows and tree shadows.
- Indoor and outdoor collision-marker reference tiles.
- Minimap-ready simplified terrain set.

Expected output: approximately 12 atlas sheets containing 70–90 final tiles.

### Batch 2 — Campus locations

Each location requires a transparent base building plus calm, busy, and evening overlays:

1. Library and Story Bench.
2. Clock Tower.
3. Garden/Gym pavilion.
4. Café.
5. Market.
6. Guardian Council plaza.
7. Recovery Garden.
8. Future Mailbox corner.
9. Campus entrance and spawn area.
10. Calm Corner gazebo.

Additional architectural assets:

- Windows with normal, lit, and glowing states.
- Doors with closed, open, and highlighted states.
- Roof decorations.
- District signs without text.
- Interior floor cutaways for interactive locations.
- Accessible ramps and clear walkable entrances.

### Batch 3 — Player character

Generate one inclusive, gender-neutral student avatar:

- Front, back, left, and right idle animations.
- Four-direction walking animations.
- Interaction pose.
- Sitting pose.
- Holding-phone pose.
- Calm breathing pose.
- Concerned, neutral, relieved, and happy emotes.
- Small map portrait.
- Dialogue portrait with four expressions.
- Avatar shadow.
- Interaction outline and selected-state silhouette.

Target: one transparent sprite sheet plus one portrait sheet.

### Batch 4 — Guardian sprites and portraits

Each guardian needs:

- Four-direction idle frames.
- Four-direction talking frames.
- Walk cycle.
- Neutral, concerned, supportive, and happy emotes.
- Interaction pose.
- Map portrait.
- Dialogue portraits: neutral, listening, concerned, reassuring, and cheerful.
- Character shadow.
- Guardian-specific interaction marker.

Character specifications:

- **Mira:** neko maid librarian; navy, cream, and teal.
- **Kai:** thoughtful Clock Tower keeper; amber vest, dark trousers, pocket watch.
- **Sol:** relaxed garden caretaker; olive overalls, sun-yellow scarf, plant accessories.
- **Sky:** friendly Café guardian; dusty-rose cardigan, sky-blue apron, warm drink tray.
- **Goh:** dependable Market guardian; rust jacket, green satchel, parcel clipboard.

Generate Mira first and use the cast anchor to preserve scale and rendering across the other four guardians.

### Batch 5 — Ambient campus characters

Generate six non-interactive student NPCs:

- Student reading.
- Student using a laptop.
- Student resting beneath a tree.
- Student carrying groceries.
- Student walking with headphones.
- Student drinking at the Café.

Each needs:

- Short idle loop.
- Two-direction walking loop where appropriate.
- Sitting or activity pose.
- Shadow.

Also generate:

- Three birds.
- Two cats.
- One squirrel.
- Butterflies.
- Garden fish.

### Batch 6 — Core interactive objects

Each object needs idle, highlighted, active, and reduced-motion states:

- Enchanted Storybook for Mira.
- Musical clock for Kai.
- Ripple Fountain for Sol.
- Tea-making counter for Sky.
- Lantern stall for Goh.
- Backpack inspection point.
- Guardian Council bell.
- Recovery Garden plot.
- Future Mailbox.
- Journal Postcard board.
- Google Calendar connection terminal.
- Rebalance Workshop table.
- Quiet Mode lantern.
- Calm Corner portal.
- Exit Quest noticeboard.

### Batch 7 — Stress-reduction game assets

#### Firefly Stories

- Enchanted book frame.
- Library night background.
- Firefly animation sheet.
- Firefly glow and trail effects.
- Five story illustrations: rest, uncertainty, loneliness, persistence, self-kindness.
- Page-turn transition.
- Silent-mode visual cue.

#### Chime Drift

- Clock Tower interior background.
- Large clock-face layers.
- Floating musical-note atlas.
- Chime glow effects.
- Slow-moving clock-hand animation.
- Silent visual-wave effect.
- Calm completion atmosphere.

#### Gentle Ripples

- Garden fountain background.
- Ripple animation sheet.
- Water shimmer.
- Fish animation sheet.
- Floating petals and leaves.
- Flower-opening animation.
- Optional breathing-circle visual.
- Reduced-motion light-pulse alternative.

#### Warm Cup

- Café window-seat background.
- Cup shape atlas.
- Tea, coffee, cocoa, milk, and herbal ingredient sprites.
- Pouring, stirring, steam, and sparkle animations.
- Rain-window overlay.
- Table decorations.
- Sky’s quiet-sitting pose.
- Finished-cup compositions.

#### Night Lanterns

- Evening Market background.
- Twelve lantern designs with symbol and color variations.
- Unlit, lit, and glowing states.
- Hanging and free-placement variants.
- Lantern-light overlay.
- Night-sky and firefly effects.
- Goh’s lantern-lighting pose.
- High-contrast symbol set.

### Batch 8 — Load Weather and world effects

Generate:

- Mental fog overlays.
- Time-pressure wind lines.
- Falling leaves and paper.
- Social crowd silhouettes.
- Errand parcel stacks.
- Physical-energy sunlight and shade states.
- Calm light rays.
- Rain and drizzle.
- Cloud shadows.
- Evening color overlay.
- Window glow.
- Ambient dust and sparkles.
- Interaction pulse.
- Footstep particles.
- Guardian speech indicator.
- Quiet Mode dimming vignette.
- Loading and scene-transition effects.

Weather must make the world busier, never damaged, frightening, or punitive.

### Batch 9 — Backpack and workload assets

- Backpack closed, open, light, medium, and heavy states.
- Assignment book.
- Laptop.
- Calendar.
- Clock.
- Dumbbell or sports bag.
- Café cup.
- Social invitation card.
- Grocery bag.
- Parcel.
- Laundry basket.
- Transport pass.
- Work uniform.
- Medical appointment card without text.
- Generic task object.
- Fixed-event lock.
- Flexible-event ribbon.
- Deadline indicator.
- Five workload-category symbols.

Each object needs small map, backpack, and panel-size versions.

### Batch 10 — Recovery Garden

- Empty garden plot.
- Four non-destructive growth stages.
- Twelve plant species with three growth frames each.
- Trees, shrubs, flowers, herbs, and water plants.
- Bench, lamp, stepping stones, birdbath, and wind chimes.
- Birds, butterflies, squirrel, cats, and fish animation sheets.
- Morning, afternoon, and evening garden overlays.
- Garden-complete celebration effect.
- No wilted, dead, or failed states.

### Batch 11 — Mailbox, postcards, and stories

- Future Mailbox: closed, new-message, open, and glowing.
- Envelope and letter animations.
- Five guardian postcard frames.
- Five story-theme postcard illustrations.
- Guardian Council group postcard.
- Recovery Garden postcard.
- Calendar-rebalance postcard.
- Blank postcard background for generated summaries.
- Private/saved indicator.
- Delete and unsaved-state illustrations.

No text should be rendered into the images; application text will be placed over them.

### Batch 12 — UI and branding assets

Generate raster assets for:

- PaceTown app icon.
- Browser/PWA icon set.
- Splash-screen campus illustration.
- Loading illustration.
- Empty Calendar state.
- Offline state.
- AI unavailable state.
- No tasks state.
- Calm Corner icon.
- Backpack icon.
- Guardian Council icon.
- Recovery Garden icon.
- Future Mailbox icon.
- Journal Postcard icon.
- Exit Quest icon.
- Quiet Mode icon.
- Five category icons.
- Five guardian portrait tokens.
- Interaction cursor and focus ring texture.

Do not generate:

- Google’s logo; use Google’s official branding asset.
- Body text, buttons, form controls, charts, or dialogue text.
- Accessibility labels.
- Standard navigation icons that are clearer as SVG or code-native components.

### Batch 13 — Google Calendar visual states

Generate original PaceTown-side imagery only:

- Calendar connection terminal.
- Selected-calendar indicator.
- Imported-event marker.
- Fixed-event lock.
- Flexible-event ribbon.
- Syncing animation.
- Sync-complete animation.
- Permission-denied illustration.
- Connection-expired illustration.
- Calendar conflict illustration.
- Offline Calendar illustration.
- Before-and-after schedule preview background.

## Non-Image Assets Required Later

These cannot be produced through image generation and need separate batches.

### Audio

- Main campus ambience.
- Five district ambience loops.
- Five game ambience loops.
- Footsteps.
- Door and object interaction sounds.
- Page turn, clock chime, water ripple, cup pour, and lantern-lighting sounds.
- Notification, Calendar sync, postcard save, and Quiet Mode sounds.
- All audio muted until enabled.

### Fonts and technical files

- Licensed readable pixel-display font.
- Accessible UI body font.
- Phaser atlas JSON files.
- Tilemap and collision data.
- Animation frame manifests.
- Palette file.
- Asset attribution and license manifest.
- Audio captions/descriptions where relevant.

## Batch QA and Acceptance

After each batch:

1. Compare it with the style, cast, scale, and lighting anchors.
2. Reject assets with inconsistent perspective, outlines, palette, lighting, or proportions.
3. Verify transparent backgrounds and clean alpha edges.
4. Inspect at native pixel size and 4× nearest-neighbour scale.
5. Test tile seams and building entrances.
6. Confirm sprite frames keep character proportions and clothing consistent.
7. Confirm Mira remains the same adult neko maid in every sprite and portrait.
8. Confirm Sky and Goh are used everywhere instead of the previous names.
9. Confirm no generated asset contains text, trademarks, watermarks, or accidental Google branding.
10. Record approved assets in a manifest before generating dependent batches.

Estimated delivery: approximately 90 source images or sprite sheets, producing 300–450 sliced in-game assets. Generation begins with Batch 0; no environment or character batches proceed until the five anchors are visually consistent.
