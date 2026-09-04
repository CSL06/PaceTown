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

This repository is a **functional local-first prototype**: the full §24 vertical slice runs
in the browser with no cloud, AI provider, or Google Calendar required.

- Product and implementation plans, asset-completion checklist, and generated art
- Portrait-faithful v3 character bases and v4 animation packages (player + 5 guardians)
- 62-sheet production runtime library, manifests, review boards, and validation report
- Deterministic asset-processing and preview tools
- Mentor demo (`/`): campus movement, Sky dialogue, guided breathing activity
- Campus Grove (`/game`): seeded Thursday at 108%, explainable Daily Load, selective
  consent-based rebalancing, blocker-driven work plans, full Pace Sessions (timer,
  scratchpad, help modes, pause-and-regulate), all five regulation mini-games,
  Pocket of Green IRL quest with local photo verification, private keepsake pipeline
  with local pixel filter and symbolic fallback, quests, XP/coins, Recovery Garden,
  Journal, Future Mailbox, Backpack, Guardian Council, Quiet Mode, Exit Quest,
  versioned saves, export, and an offline PWA shell
- 122 automated domain tests (`npm test`)

## Run the mentor demo

### Requirements

- [Node.js](https://nodejs.org/) 20.19 or newer
- npm 10 or newer, included with Node.js

### Setup

```powershell
git clone https://github.com/CSL06/PaceTown.git
cd PaceTown
npm install
npm run dev
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
npm run build
npm run preview
```

The compiled demo is written to `dist/`, which is intentionally excluded from Git.

### Tests

```powershell
npm test
npm run test:watch
```

122 cases across ten files. They cover the arithmetic, and they pin the product
promises so those cannot quietly rot: self/photo confirmation parity, no
timer/mini-game/AI academic completion, rebalance previews never mutating tasks,
bounded energy guidance, and the seeded 108% Thursday.

### Campus Grove walkthrough (`/game`)

1. Press **Enter Campus Grove**. Kai explains Thursday at **108%** — calculated, not written in.
2. Open the **Clock Tower** and approve Kai's proposal (per-move checkboxes). Thursday drops
   toward **91.5%**; Saturday stays Open. Nothing moves until you approve it.
3. At the **Library**, pick *I do not know where to begin*, review the editable work plan,
   and start a 20-minute checkpoint Pace Session with Mira.
4. Ask Mira to *Explain*, record **Partial progress**, and save
   *Add the enrolment junction entity* as the next action.
5. Pause into **Gentle Ripples**, then take Sol's **Pocket of Green** (self-confirm or
   optional photo — equal rewards).
6. Turn the quest into a private **Keepsake** (create-and-discard keeps only the pixel art),
   then open the **Journal**: rebalance, work, recovery, keepsake, deletion state, and next
   action are all recorded. One Recovery Garden plant has grown.

Reload at any point: you return to the title screen with progress intact (versioned
`localStorage` saves under `pacetown.game`). **Export save (JSON)** and
**Delete local data** live at Home.

### Demo scope

The mentor demo (`/`) is intentionally narrow: visual direction, campus exploration, an
accessible list alternative, a supportive Sky interaction, and one stress-reduction
activity. The full product loop lives in Campus Grove (`/game`), which is local-first and
works offline after the first visit (runtime-cached PWA shell). Google Calendar, generative
NPC conversations, and cloud sync remain planned production adapters — every AI-assisted
feature already has a deterministic local fallback, and the app never requires one.

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
