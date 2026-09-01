# PaceTown Production Character Sprites

> Deprecated visual design: retain these sheets only as animation-grid and manifest references. The improved portrait-faithful bases are under `../character-redesign-v3/recommended-64x96/`.

These version 1.1 assets remain technically valid, but their 16x24-derived bodies are too generic to preserve the cast's original identities.

## Delivered characters

- Player
- Mira
- Kai
- Sol
- Sky
- Goh

Each character directory contains:

```text
<character>/
├── <character>-production-sheet.png   256 × 240 transparent sprite sheet
├── <character>-atlas.json             Phaser-compatible frame coordinates
├── <character>-animations.json        Animation groups, rates, and repeat values
└── frames/                             Forty individual 32 × 48 transparent PNGs
```

## Animation set

- `idle_down`, `idle_left`, `idle_right`, `idle_up`
- `walk_down`, `walk_left`, `walk_right`, `walk_up`
- `talk_down`, `talk_left`, `talk_right`, `talk_up`
- `interact_down`
- `breathe_down`
- `sit_down`
- `phone_down`
- `concerned_down`
- `happy_down`

There are 40 frames and 18 animation definitions per character.

## Phaser loading

```ts
this.load.atlas(
  "sky",
  "/assets/production/characters/sky/sky-production-sheet.png",
  "/assets/production/characters/sky/sky-atlas.json",
);
```

At startup, read `sky-animations.json` and register each definition with `this.anims.create`. Prefix animation keys with the character name, such as `sky_walk_down`, to prevent collisions.

## Rendering rules

- Render at integer multiples such as `2×`, `3×`, or `4×`.
- Use nearest-neighbour filtering and disable antialiasing.
- Anchor sprites at bottom center.
- Keep the version 1.1 single-pixel detail pass; it prevents the characters from looking like uniformly enlarged 16-pixel icons beside the world art.
- Do not resize individual frames independently.
- Use the same movement speed and frame rate for every guardian unless an accessibility setting requests reduced motion.

## Identity notes

- Sky uses center-parted black hair, round glasses, a dusty-rose cardigan, cream shirt, and sky-blue apron.
- Mira is an adult neko-maid librarian with dark hair, cat ears and tail, glasses, navy-and-cream uniform, teal ribbon, and bell.

## Style QA

- `../style-checks/pacetown-character-world-compatibility.png` is the native-scale scene test.
- `../style-checks/pacetown-character-closeups.png` is the 4x identity/detail inspection board.
- The industrial Kauzz street sheet and smooth Styloo renders are not style anchors for the cozy campus core.
- The player is the preferred glasses-free sage-jacket design.

The source generator is [Generate-PaceTownSprites.ps1](../../../tools/Generate-PaceTownSprites.ps1). Re-running it recreates all sheets, individual frames, atlases, and animation manifests deterministically.
