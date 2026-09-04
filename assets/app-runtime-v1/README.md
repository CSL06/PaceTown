# PaceTown app runtime assets v1

This directory is the **only asset bundle served directly by the current web
app**. `vite.config.ts` sets it as Vite's `publicDir`, so a file stored here as
`game/world/campus.png` is still available in the browser at
`/game/world/campus.png`.

Keep source masters, generated drafts, review boards, manifests, and animation
packages in the other `assets/` directories. Only copy or move an asset here
when the running app needs to fetch it by URL.

## Runtime inventory

| Runtime group | Browser consumers | Provenance |
|---|---|---|
| `game/world/campus.png` | Landing, authentication, Campus Grove, social preview, preload | Export prepared for the current 1200×800 Campus Grove world |
| `game/world/campus-daylight.png` | Landing, authentication, Campus Grove, social preview, preload | Sunlit ImageGen variant from `assets/production/world/campus-daylight-v2/` |
| `game/scenes/clock-tower/*` | Dedicated Clock Tower room, board frame, animated interaction states, and ambient layers | Runtime copies from `assets/production/scenes/clock-tower-v1/` |
| `game/world/player-sheet.png` | Landing live town and Campus Grove player | Runtime composite exported from the player animation package |
| `game/world/cast-sheet.png` | Landing live town and Campus Grove guardians | Runtime composite of Mira, Kai, Sol, Goh, and Sky |
| `game/portraits/{goh,kai,mira,sky,sol}.png` | Landing, authentication, title, dialogue, panels, guardian dock | Web portrait exports derived from the character-redesign masters |
| `game/portraits/aina.png` | Reserved protagonist portrait; not referenced by the current UI | Web portrait export retained for the planned personalised player flow |
| `game/campus.png` | Original `/demo` scene | Exact copy of `assets/generated/campus/campus-style-master-v1.png` |
| `game/player/*.png` | Original `/demo` player | Selected frames from the production player animation package |
| `game/sky/*.png` | Original `/demo` Sky states | Selected frames from `assets/production/character-redesign-v3/sky-demo/sky/frames` |
| `game/objects/tea-counter.png` | Original `/demo` tea counter and Town List icon | Exact copy of the production tea-counter state sheet |
| `icons/icon.svg` | Browser icon, apple-touch link, web manifest | Web-specific PaceTown icon |
| `manifest.webmanifest` | Installed PWA metadata | Web-app configuration, not an art master |
| `sw.js` | Production offline shell | Runtime code registered by `src/main.tsx` |
| `audio/` | Optional landing music | `ambient.mp3` is intentionally absent; see `audio/README.md` |

## Boundaries

- Do not reference `assets/generated` or `assets/production` directly from UI
  code. Those directories are working libraries and may be reorganised.
- Do not put screenshots, review sheets, alternate concepts, or unused source
  frames here.
- Preserve the browser URL when replacing an asset unless the consuming code
  is deliberately migrated in the same change.
- Record a new runtime group and its source in this file whenever one is added.

## Current URL contracts

```text
/game/world/*       Current Campus Grove and landing scene
/game/scenes/*      Dedicated playable interior scenes and their layered assets
/game/portraits/*   Character portraits
/game/campus.png    Original mentor demo background
/game/player/*      Original mentor demo player frames
/game/sky/*         Original mentor demo Sky frames
/game/objects/*     Original mentor demo objects
/icons/*            PWA and browser icons
/audio/*            Optional distributed audio
/manifest.webmanifest
/sw.js
```
