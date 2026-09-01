# Asset Handoff for the Next Implementation

## Recommended visual stack

Use a 32×32 top-down grid for the main campus.

| Need | Preferred source | Notes |
|---|---|---|
| Classrooms, cafeteria, computer room, art room | `third-party/cc0/styloo-classroom/` | Primary campus-interior source; CC0 |
| Exterior paths, stores, forest, modern locations | `third-party/custom-license/kauzz-free-tiles-32/` | Native 32×32; do not redistribute raw sheets |
| Recovery Garden terrain and water | `third-party/custom-license/pix-quest-free/` | 16×16; scale exactly 2× with nearest-neighbour filtering |
| Pixel interface panels and buttons | `third-party/cc0/kenney-ui-pixel-adventure/` | Use the thin-outline family consistently |
| Keyboard, mouse, controller, and touch prompts | `third-party/cc0/kenney-input-prompts-pixel/` | Native 16×16; scale exactly 2× when used in the 32×32 world |
| Fog, lighting, glow, and Quiet Mode masks | `third-party/cc0/kenney-light-masks/` | Use as shader or overlay inputs rather than map tiles |
| Minimap and prototype town markers | `third-party/cc0/kenney-tiny-town/` | Native 16×16; not the main campus tileset |

## Do not use by default

`third-party/cc-by-sa-4.0/ghost-data-school/` is isolated because CC BY-SA 4.0 can require attribution and share-alike distribution of adaptations. The implementation should proceed without this pack unless the project owner explicitly accepts those terms.

## Import order

1. Configure the renderer for nearest-neighbour scaling and disable image smoothing.
2. Create the campus tilemap at 32×32.
3. Build interiors from Styloo and exteriors from Kauzz.
4. Import Pix-Quest nature assets at exact 2× scale; do not resize them fractionally.
5. Choose one Kenney UI outline family and remove unused variants from the production bundle.
6. Add input prompts and lighting masks.
7. Generate the custom PaceTown assets that are not present in these packs:
   - Player avatar.
   - Mira, Kai, Sol, Sky, and Goh.
   - Guardian dialogue portraits.
   - Five interactive stress-game objects.
   - Five mini-game backgrounds.
   - PaceTown icon and splash art.
8. Record every selected third-party file in the production asset manifest.

## Technical rules

- Keep source packs under `assets/third-party/`; copy only selected production files into the application's public asset directory.
- Do not edit the downloaded sources in place. Put recolors and derivatives in a project-owned `assets/customized/` directory.
- Preserve original filenames in the provenance record even if production copies are renamed.
- Never use bilinear filtering, fractional scaling, or lossy JPEG conversion for pixel sprites.
- Do not mix multiple UI outline families on the same screen.
- Exclude source archives, unused variants, PSD files, and preview images from the production build.
