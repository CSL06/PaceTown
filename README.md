# PaceTown

PaceTown is a cozy pixel-art guided-work and recovery game for university students. It helps students understand schedule pressure, turn intimidating work into manageable checkpoints, work alongside supportive guardians, regulate stress through short mini-games, and preserve a clear next action for later.

## Core experience

PaceTown is not a generic wellbeing dashboard or a collection of relaxation games. Its central playable loop is:

```text
Understand total load
→ reduce what can be reduced
→ get help handling what remains
→ recover intentionally
→ save progress and grow the town
```

The planner explains and reduces external workload. Guided Pace Sessions are one response for work that remains; they do not define the entire product. Digital mini-games and real-world recovery quests are equal options before, during, and after work. Optional IRL photos can be privately transformed into PaceTown-styled pixel-art Keepsakes for the Journal, Recovery Garden, and town collection, without giving photo users greater rewards.

## Current status

This repository currently contains the planning and asset-production milestone:

- Product and implementation plans
- Authoritative asset-completion checklist
- Generated concepts, portraits, UI art, locations, and mini-game references
- Portrait-faithful v3 character style masters
- Transparent four-direction `64 × 96 px` character bases
- Deterministic asset-processing and preview tools
- Third-party asset source and license manifest

The game application has not been scaffolded yet. The next product task is a vertical slice covering load explanation, rebalancing, task intake, one guided Pace Session, Gentle Ripples, the fully specified Pocket of Green IRL quest, an optional private photo-to-Keepsake flow, saved partial progress, and one visible town response. The next asset task is converting the v3 character bases into complete animation sheets; application scaffolding does not need to wait for every animation to be finished.

## Start here

- `PACETOWN_PROJECT_VISION.md`
- `PaceTown_Hackathon_Implementation_Plan.md`
- `assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md`
- `assets/production/character-redesign-v3/README.md`
- `assets/third-party/ASSET_MANIFEST.md`

## Third-party assets

Downloaded asset packs and archives are intentionally excluded from Git. Follow `assets/third-party/ASSET_MANIFEST.md` to retrieve them from their original sources and review the applicable licenses before distribution.

## Asset tooling

PowerShell tools generate the legacy animation-grid references and visual compatibility boards. The v3 exact-grid character previews use the bundled workspace Python runtime and Pillow:

```powershell
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_character_redesign_previews.py
```
