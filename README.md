# PaceTown

PaceTown is a cozy pixel-art university experience focused on reducing student stress through supportive AI characters, recovery activities, lightweight games, and calendar-aware guidance.

## Current status

This repository currently contains the planning and asset-production milestone:

- Product and implementation plans
- Authoritative asset-completion checklist
- Generated concepts, portraits, UI art, locations, and mini-game references
- Portrait-faithful v3 character style masters
- Transparent four-direction `64 × 96 px` character bases
- Deterministic asset-processing and preview tools
- Third-party asset source and license manifest

The game application has not been scaffolded yet. The next production task is converting the v3 character bases into complete animation sheets before implementing the playable campus.

## Start here

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
