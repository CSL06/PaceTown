# PaceTown

![PaceTown](assets/app-runtime-v1/og-card.jpg)

PaceTown is a local-first pixel-art guided-work and recovery game for
university students. It turns a real week into an understandable workload,
helps move what can safely move, makes one remaining task startable, and keeps
recovery and context available without shame, streaks, or diagnosis.

## Product Loop

```text
Understand the week
    -> move what can safely move
    -> choose one real task
    -> make one checkpoint
    -> work with a guardian
    -> recover intentionally
    -> return with the next action intact
```

The system is not a generic wellbeing dashboard or an AI homework assistant.
Its calculations are deterministic and local. Guardians provide contextual
support, but the student reviews and owns every plan, checkpoint, note, and
outcome.

## Current Status

The repository contains a functional browser prototype of the Campus Grove
vertical slice. It runs without a cloud service, AI provider, or Google
Calendar connection.

Implemented:

- Live landing page with the seeded week and real domain calculations
- Local account, guest-demo, sign-in, and four-step onboarding paths
- Town Hall natural-language intake with visible assumptions and editable commitments
- Daily Load calculation with fixed/flexible work, weighted demand, bands, and Load Weather
- Clock Tower room with a seven-day Week Board
- Kai's consent-first rebalance preview, destination comparison, drag-and-drop planning, deadline guards, and undo
- Library room with Mira's open-work list, day navigation, task paging, blocker guidance, and one-checkpoint proposals
- Pace Sessions with done definitions, timers, scratchpad, free-text contextual help, outcomes, and progress continuity
- Welcome-back desk panel, open-work resume badge, and HUD resume ritual
- Gentle Ripples, Pocket of Green, Firefly Stories, Chime Drift, Warm Cup, and Night Lanterns
- Photo-safe Pocket verification with self-confirmation and manual fallback
- Private Keepsakes with local pixel filtering or symbolic fallback
- Journal, Future Mailbox, Backpack, Guardian Council, Recovery Garden, Settings, Shop, Quiet Mode, and High Contrast
- Versioned local saves, JSON export, `/reset` demo reset, and production-only offline shell registration
- **319 tests across 35 files**, with typecheck and production build passing

## Guardians

Each guardian changes what the student can do rather than repeating dashboard
numbers:

| Guardian | Place | Specialty |
| --- | --- | --- |
| Mira | Library | Understand briefs, explain concepts, and create checkpoints |
| Kai | Clock Tower | Plan time, forecast load, and rebalance flexible work |
| Sol | Garden and Park | Reduce scope, protect breaks, and recover |
| Sky | Café | Provide quiet company and low-pressure body doubling |
| Goh | Market | Gather materials, group errands, and finish loose ends |

Guardian guidance is local and deterministic. It is always framed as a
suggestion, never as submitted academic work or a health assessment.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and live town introduction |
| `/signup` | Local browser-only account creation and guest demo entry |
| `/login` | Local sign-in and simulated Google profile flow |
| `/welcome` | Skippable four-step onboarding |
| `/town` | Authenticated Campus Grove experience |
| `/game` | Presenter front door; creates a guest session and opens the seeded town |
| `/demo` | Narrow legacy mentor demo with Sky and breathing |
| `/reset` | Developer/presenter shortcut; clears the game save and session, then opens `/game` |

The app stores accounts, sessions, and game progress in the browser. This is
intentional prototype behavior, not production authentication.

## Run Locally

### Requirements

- Node.js 24 or newer
- npm 10 or newer

### Setup

```powershell
git clone https://github.com/CSL06/PaceTown.git
cd PaceTown
npm install
npm run dev
```

Open the URL printed by Vite. The usual development address is
`http://localhost:5173/`.

### Useful Commands

```powershell
npm test             # run the full Vitest suite
npm run test:watch   # run Vitest interactively
npm run build        # typecheck and build production assets
npm run preview      # serve the production build locally
```

For a clean presenter run, open:

```text
http://localhost:5173/reset
```

It clears the local game save and active session, then redirects to the
one-click `/game` demo path. Home and Settings also provide careful reset/data
controls.

## Current Demo Flow

The canonical presenter script is [`prototypeflow.md`](prototypeflow.md). The
short version is:

1. Open `/reset`, then `/game`.
2. Enter Campus Grove. A first-run Kai intro leads to Town Hall before the math.
3. Save the seeded commitments and inspect the calculated Daily Load.
4. Enter the Clock Tower. Kai's Week Board opens on a consent preview; approve or dismiss it. The manual drag-drop board remains available below.
5. Enter the Library and talk to Mira. Choose a real commitment, answer the blocker question, use one proposed checkpoint, and walk to the study desk.
6. Work in the Pace Session. Use the timer, scratchpad, Ask Mira, and the current checkpoint's done definition.
7. Choose an outcome, write what changed and the next action, then save and stand up.
8. Return to the desk later to see the Welcome Back summary and resume with the saved note intact.
9. Use Gentle Ripples or Pocket of Green, then read the Journal and optionally create a Keepsake.

## Architecture

The project is deliberately split into two one-way layers:

```text
src/domain/   pure calculations and deterministic policy
      ^
src/game/     React scenes, panels, persistence, and navigation
```

The domain layer does not import React, browser storage, or game UI. Important
domain modules include:

- `workload.ts` — waking capacity, weighted demand, load bands, and energy guidance
- `parse.ts` — local schedule and brief parsing
- `calendar.ts` — week-day placement and task ordering
- `rebalance.ts` — consent-based move proposals and selected application
- `plans.ts` — blocker-driven checkpoints, guardian routing, and checkpoint resolution
- `taskGuidance.ts` — deterministic task-aware checkpoint proposals
- `guidance.ts` — contextual Pace Session help modes
- `quests.ts` — foregrounded quest selection
- `regulation.ts` — recovery activity catalogue and preferences
- `photo.ts` / `keepsake.ts` — local photo checks and privacy-aware memories
- `rewards.ts` — XP, coins, levels, and reward parity

The main game surfaces live in `src/game/`:

- `Game.tsx` — Campus Grove shell, HUD, routing, saves, and shared guidance
- `ClockTower.tsx` — walkable planning room and Week Board
- `Library.tsx` — walkable guided-work room and Pace Session flow
- `GuardianDock.tsx` — compact guardian status and action rail
- `panels/` — recovery, journal, keepsake, settings, shop, council, and supporting views
- `state.ts` / `storage.ts` — versioned local persistence

## Data and Privacy

- Game data is stored under `pacetown.game` in browser `localStorage`.
- Account data is stored locally under `pacetown.accounts` and `pacetown.session`.
- Photos are optional. Verification checks only local greenery/daylight heuristics.
- A Keepsake never proves that a recovery quest happened.
- Photo use gives no additional XP, coins, rarity, or progression advantage.
- No external AI, cloud sync, Google Calendar, or server API is required.
- Export and delete controls are available from Home/Settings.

## Testing

```powershell
npm test
```

The suite currently contains **319 passing tests across 35 files**. It covers
the arithmetic and product rules, including:

- Seeded workload calculations and load-band behavior
- Calendar movement, deadline protection, and rebalance preview immutability
- Task-aware guidance and guardian routing
- Checkpoint creation, splitting, status resolution, and session outcomes
- Timer behavior without automatic academic completion
- Recovery parity between self-confirmation and photos
- Local photo verification and Keepsake consent choices
- Save migration/default behavior and demo reset
- Clock Tower and Library room interactions
- Welcome-back continuity, resume cards, and current guardian flow

## Assets

The README hero image and runtime artwork are sourced from the checked-in
runtime asset package under `assets/app-runtime-v1/`. Downloaded third-party
packs are intentionally excluded from Git. See
[`assets/third-party/ASSET_MANIFEST.md`](assets/third-party/ASSET_MANIFEST.md)
for source links and license instructions.

The project includes portrait-faithful guardian assets, runtime scene artwork,
world sheets, interaction objects, reduced-motion variants, and PWA icons.

## Project Documents

- [`PACETOWN_PROJECT_VISION.md`](PACETOWN_PROJECT_VISION.md) — product vision and principles
- [`PaceTown_Hackathon_Implementation_Plan.md`](PaceTown_Hackathon_Implementation_Plan.md) — implementation requirements
- [`prototypeflow.md`](prototypeflow.md) — current presenter walkthrough and function reference
- [`CAMPUS_GROVE.md`](CAMPUS_GROVE.md) — Campus Grove usage and architecture notes
- [`DESIGN.md`](DESIGN.md) — visual and interaction design system
- [`assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md`](assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md) — asset status and validation

## Not Built Yet

The prototype intentionally leaves these production adapters out:

- Hosted authentication and multi-device sync
- IndexedDB or server-backed repositories
- Live Google Calendar integration
- Cloud AI conversations
- Deep shop/catalog progression and production town upgrades
- Full Recovery Garden catalog and long-term social features
- Android packaging and production deployment infrastructure
