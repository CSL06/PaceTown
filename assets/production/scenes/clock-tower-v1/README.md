# Clock Tower v1 — sunlit source assets

Generated with the built-in ChatGPT ImageGen workflow on 2026-09-05. These are
production source images. Create cropped, resized, and optimized runtime exports
under `assets/app-runtime-v1/game/scenes/clock-tower/` when the scene is wired.

## Art direction

- Preserve PaceTown's detailed, handcrafted 2D pixel-art identity.
- Prefer bright late-morning sunshine, cream limestone, honey oak, pale sky blue,
  fresh greens, and restrained brass.
- Avoid dusk-orange grading, murky navy shadows, gothic gloom, and spooky lighting.
- Keep calendar labels, task cards, and live data out of raster art. The week view
  must remain HTML/CSS so it is responsive and accessible.

## Files

| File | Size | Alpha | Intended use |
| --- | ---: | :---: | --- |
| `clock-tower-interior-sunlit-v1.png` | 1536x1024 | No | Full Clock Tower room background |
| `week-board-frame-v1.png` | 1672x941 | Yes | Responsive board frame around the live calendar |
| `clockwork-states-v1.png` | 2172x724 | Yes | Four equal horizontal clockwork states |
| `exit-door-states-v1.png` | 2172x724 | Yes | Closed, hover, ajar, and open door states |
| `interior-props-atlas-v1.png` | 1254x1254 | Yes | Desk, chairs, shelf, plants, books, lamps, rug, coat stand, satchel |
| `daylight-effects-atlas-v1.png` | 2172x724 | Yes | Sunbeam, dust, board focus, success sparkle overlays |

The room background already contains a board, clockwork, door, and furniture for
visual completeness. The transparent assets exist so interactive states can be
layered or substituted without regenerating the room.

## Prompt set

All prompts used the existing campus and/or the generated room as visual references.

1. **Interior:** bright compact Clock Tower planning room; elevated RPG view; blank
   central week board; clockwork, sunny window, exit, desk, plants, books, rug;
   clear walking path; no characters, labels, or baked-in tasks.
2. **Week board:** front-facing blank cream surface in a honey-oak and brass frame;
   transparent background; clean inner opening for live HTML.
3. **Clockwork:** four aligned states—idle, tick, active highlight, completion
   sparkle—on transparency.
4. **Exit:** four aligned states—closed, hover, ajar, and fully open to welcoming
   daylight—on transparency.
5. **Props:** separated interior furniture and decor in a consistent three-quarter
   perspective on transparency. A second background-extraction pass removed the
   initially opaque checkerboard.
6. **Effects:** four restrained transparent effects—sunbeam, dust motes, board focus,
   and completion sparkle.

## Implementation cautions

- Derive sprite-cell bounds from the exported pixels instead of assuming the
  subjects fill every equal-width cell.
- Validate the room's walkable polygon against the rendered player scale.
- Do not use the raster board as the calendar itself.
- Kai's existing production sprites remain the character source; no replacement
  character art was needed for this scene.
