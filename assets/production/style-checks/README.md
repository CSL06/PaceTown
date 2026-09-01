# PaceTown style compatibility checks

This folder contains visual QA boards, not runtime assets.

## Current result

- `pacetown-character-world-compatibility.png` places the production characters against representative exterior and interior assets at true runtime scale.
- `pacetown-character-closeups.png` shows every character at exact 4x nearest-neighbour scale for identity and single-pixel inspection.
- Character sprites use a 16x24 silhouette foundation, scale cleanly to 32x48, and receive true 32x48 single-pixel highlights and shading.
- Sky remains locked to the supplied reference: black centre-parted hair, round glasses, dusty-rose cardigan, cream shirt, and sky-blue apron.
- Mira remains an adult neko-maid librarian with glasses, cat ears and tail, a navy/cream uniform, and a teal bow with bell.

## Style rules

- Use nearest-neighbour scaling only.
- Use integer display scales only (1x, 2x, 3x).
- Keep outlines dark navy rather than pure black.
- Prefer warm neutrals, muted teal/blue, dusty rose, and restrained gold accents.
- Avoid mixing the industrial Kauzz street sheet into the calming campus core.
- Ghost Data items on the QA board are style-test references only; they remain excluded from runtime until the project explicitly accepts CC BY-SA 4.0.
- Treat generated concept scenes as composition references, not as runtime world tiles.

Regenerate this board after editing character sprites:

```powershell
& .\tools\Build-PaceTownStyleChecks.ps1
```
