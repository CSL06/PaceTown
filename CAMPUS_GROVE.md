# Campus Grove — running and using the game

Campus Grove is the playable build of PaceTown: a walkable pixel-art campus
where a student's real workload becomes weather, buildings and quests. It runs
alongside the original mentor demo in the same Vite app.

Everything the interface says about pressure is calculated in `src/domain/`,
which has no knowledge of React, storage or any provider. If a number is on
screen, a test somewhere pins it down.

---

## Requirements

- [Node.js](https://nodejs.org/) 20.19 or newer
- npm 10 or newer (ships with Node)

## Install and run

```bash
npm install
npm run dev
```

Vite prints the address it chose. It is usually:

| Route | What it is |
|---|---|
| `http://localhost:5173/` | The original mentor demo — Sky, one conversation, one breathing activity |
| `http://localhost:5173/game` | **Campus Grove** — the full walkable campus |

If port 5173 is busy Vite will pick another (often 5174); use whatever it
prints. Each page links to the other from its top bar.

## Other commands

```bash
npm test          # run the domain test suite once
npm run test:watch  # re-run tests as you edit
npm run build     # typecheck, then build to dist/
npm run preview   # serve the production build
```

---

## Playing it

Press **Enter Campus Grove**. Kai opens with the state of your Thursday, then
leaves you on the campus.

| Input | Does |
|---|---|
| `W` `A` `S` `D` or arrow keys | Walk. The camera follows you |
| `E` | Enter the place you are standing next to |
| `Esc` | Close a panel or dialogue, back to the campus |
| **☰ Town List** | Reach any of the fourteen places without walking |
| Clicking a marker | Walks you there and opens it |

Every place on the map is also in the Town List. Nothing is reachable only by
pointing at it.

### The fourteen places

| Place | What happens there |
|---|---|
| Town Hall | Type your week in plain language; paste an assignment brief |
| Clock Tower · **Kai** | The Rebalance Workshop — what can safely move |
| Library · **Mira** | Name what is blocking you, get an editable work plan |
| Garden Pavilion · **Sol** | Gentle Ripples, and scope reduction |
| Park · **Sol** | Pocket of Green — recovery away from the screen |
| Café · **Sky** | Body doubling and Warm Cup |
| Market · **Goh** | Errands, submission checks, Night Lanterns |
| Guardian Council | One recommendation when several pressures compete |
| Backpack point | Everything you are carrying today, with locks and ribbons |
| Recovery Garden | Growth from sustainable choices. Nothing here ever wilts |
| Future Mailbox | Send a next action to your future self |
| Post Office | The Journal — what actually happened |
| Calm Corner | All five activities, no prerequisites |
| Home | Quiet Mode, high contrast, the Exit Quest, your data |

---

## The three-minute walkthrough

This is the demonstration story from the vision, and it works end to end.

1. **Enter Campus Grove.** Kai explains that Thursday is at **108%**. That
   figure is calculated, not written in — four commitments are locked, leaving
   330 of 900 waking minutes for five flexible tasks.

2. **Go to the Clock Tower.** Kai proposes moving two low-priority tasks with
   slack. Fixed lectures, the shift and the club meeting stay visibly locked,
   and the assignment due tomorrow is never offered. Before-and-after values
   are shown for both days. **Nothing moves until you approve it.**

3. **Approve.** Thursday drops to **91.5% (Heavy)**. Saturday rises from 15.4%
   to 22.4% and stays Open.

4. **Go to the Library.** Choose *"I do not know where to begin."* Mira
   answers, and the plan follows from the blocker rather than the assignment.
   Pick the 20-minute checkpoint and rewrite it if you like.

5. **Run the Pace Session.** Ask Mira to *Explain* — the answer is a local
   template, clearly labelled, with no AI provider connected. End with
   **Partial progress** and save a next action.

6. **Recover, then read the Journal.** Everything you did is recorded with
   what it earned, and your next action is waiting for the next session.

Reload the page at any point. You return to the title screen with your
progress intact.

---

## Accessibility

- Full keyboard operation; every spatial action has a Town List equivalent
- **Quiet Mode** reduces motion, ambient life and effects while keeping every
  core action available
- **High contrast** strengthens edges and text — status is never carried by
  colour alone anywhere
- `prefers-reduced-motion` is respected without any setting being changed
- Panels are semantic dialogs with live regions for announcements

Both toggles are in the top bar and at Home.

---

## Your data

Local-first. Progress is written to `localStorage` under `pacetown.game` and
never leaves the browser.

Saves are **versioned and migrated**: a missing field is filled in from
defaults rather than treated as a reason to wipe your week. Only an unreadable
or future-versioned save starts fresh. **Delete local data** at Home clears it
permanently.

---

## How the code is arranged

```
src/
  domain/          calculations — pure, deterministic, no React
    workload.ts      Daily Load, weights, bands, capacity, energy
    rebalance.ts     the greedy proposer; approval is a separate step
    parse.ts         natural-language intake and brief extraction
    plans.ts         blockers to editable checkpoints, routed by guardian
    rewards.ts       progression, levels, confirmation parity
    keepsake.ts      palette snapping, photo-consent, categories, placements
    regulation.ts    activity catalogue and recovery recommendations
    quests.ts        three-quest selection with one foregrounded action
    photo.ts         local Pocket-of-Green photo heuristics
    seed.ts          the demo week, produced by the parser
  game/            the campus
    Game.tsx         shell: title, HUD, quest card, navigation, persistence
    Campus.tsx       map, Load Weather, guardians, markers
    useWorld.ts      movement, camera, proximity
    Dialogue.tsx     the guardian dialogue bar
    state.ts         save shape, migrations, journal
    storage.ts       persistence adapter (localStorage today, IndexedDB later)
    panels/          what each place opens
      Loop.tsx       intake, understand, rebalance, work, session
      Ripples.tsx    interactive Gentle Ripples
      Pocket.tsx     Pocket of Green, all paths
      Minis.tsx      Firefly, Chime, Warm Cup, Lanterns
      Keepsakes.tsx  keepsake pipeline and private collection
      Places.tsx     load, briefing, council, journal, garden, town systems
  App.tsx          the original mentor demo, unchanged
```

The rule is one-directional: `game/` may read from `domain/`; `domain/` must
never read from `game/`.

### Tests

```bash
npm test
```

122 cases across ten files. They cover the arithmetic, but they also pin the
product promises so those cannot quietly rot:

- Self-confirmation and photo confirmation earn **identically**
- A timer, a mini-game or an assistant **never** completes academic work
- A rebalance proposal **never** mutates the caller's tasks
- Energy adjusts guidance within a bounded range and **never** replaces the
  raw calculation
- The seeded Thursday is parsed rather than hardcoded, so if parsing regresses
  the 108% the demo turns on moves and the test fails loudly

Add a rule to the product, add a test with it.

---

## Not built yet

Honest list, measured against the vertical slice in
[`PACETOWN_PROJECT_VISION.md`](PACETOWN_PROJECT_VISION.md) §24:

- **Storage is `localStorage`, not IndexedDB** — the storage adapter
  (`src/game/storage.ts`) keeps the seam so production can swap it later.
- **Photo verification is heuristic, not AI** — local green/sky/brightness checks with
  manual correction always available, per the local-fallback contract.
- **No CI** — the tests exist but nothing runs them on push.
- **Deferred past the core:** deep shop and cosmetic catalog, live Google Calendar
  authentication, full Recovery Garden catalog, ambient NPC and animal collection,
  Coastal Commons and Night Market, production cloud services, Android packaging.

Everything else in the slice is playable: interactive Gentle Ripples, full Pocket of
Green paths, all five mini-games, the keepsake pipeline with local filter and symbolic
fallback, selective rebalancing, session timer/scratchpad/pause-resume, quests with
replacement, save export, and a runtime-cached offline shell.
