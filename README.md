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
- Complete animation v4 packages for the player, Mira, Kai, Sol, Sky, and Goh: 240 frames and 108 Phaser animation definitions in total
- A 62-sheet production-formatted runtime library covering interactive objects, mini-games, workload UI, application states, ambient life, Recovery Garden progression, postcards, Calendar art, overlays, effects, and PWA icons
- Aggregate runtime manifest, per-sheet atlas JSON, visual review board, campus integration scene, and passing validation report
- Deterministic asset-processing and preview tools
- Third-party asset source and license manifest

The visual asset-generation milestone is complete, and the repository includes a mentor-ready React vertical slice with campus movement, Sky dialogue, and a guided breathing activity. The next product task is expanding that slice toward load explanation, rebalancing, task intake, one guided Pace Session, Gentle Ripples, the fully specified Pocket of Green IRL quest, an optional private photo-to-Keepsake flow, saved partial progress, and one visible town response. The production campus still needs to be assembled from the approved free packs.

## Run the mentor demo

### Requirements

- [Node.js](https://nodejs.org/) 20.19 or newer
- [pnpm](https://pnpm.io/) 10 or newer (`corepack enable` can provide it)

### Setup

```powershell
git clone https://github.com/CSL06/PaceTown.git
cd PaceTown
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:5173/` in a browser. Vite will print a different address in the terminal if port `5173` is already occupied.

### Demo walkthrough

1. Move the player with the arrow keys or `W`, `A`, `S`, and `D`. On a phone, use the on-screen direction buttons.
2. Walk near Sky and press `E` or `Enter`, or open **Town List** and choose **Sky's Tea Corner**.
3. Continue Sky's conversation and select **Try one calming breath**.
4. Complete the guided inhale, hold, and exhale cycle, then return to campus.
5. Use **Motion on/off** to demonstrate the reduced-motion experience.

### Production build

```powershell
pnpm build
pnpm preview
```

The compiled demo is written to `dist/`, which is intentionally excluded from Git.

### Demo scope

This is a mentor-review vertical slice, not the complete PaceTown product. It demonstrates the intended visual direction, responsive campus exploration, an accessible list alternative, a supportive Sky interaction, and one stress-reduction activity. Google Calendar, generative NPC conversations, the remaining guardians, workload rebalancing, Keepsakes, and additional games are planned but are not connected to this demo yet.

## Start here

- `PACETOWN_PROJECT_VISION.md`
- `PACETOWN_VISION_MERMAID.md`
- `PaceTown_Hackathon_Implementation_Plan.md`
- `assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md`
- `assets/production/character-redesign-v3/README.md`
- `assets/production/runtime-assets-v1/README.md`
- `assets/production/runtime-assets-v1/pacetown-runtime-assets-v1-manifest.json`
- `assets/third-party/ASSET_MANIFEST.md`

## Third-party assets

Downloaded asset packs and archives are intentionally excluded from Git. Follow `assets/third-party/ASSET_MANIFEST.md` to retrieve them from their original sources and review the applicable licenses before distribution.

## Asset tooling

PowerShell tools generate the legacy animation-grid references and visual compatibility boards. The v3 exact-grid character previews use the bundled workspace Python runtime and Pillow:

```powershell
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_character_redesign_previews.py
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_player_animation_v4.py --character player
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_pacetown_runtime_assets_v1.py
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\validate_pacetown_assets_v1.py
```
