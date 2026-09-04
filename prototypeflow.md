# PaceTown — Prototype Demo Flow

A scripted, repeatable walkthrough that proves the system works end to end.
One presenter, one browser, ~5 minutes. Every input below is **prefilled in the
app already** (the seeded demo week) — you only paste if you want to show the
parser working from raw text.

## Before you show it

```powershell
npm run dev
```

Open `http://localhost:5173/game` (Vite prints the real port if 5173 is busy).

For a clean run, reset first: **Home → Delete local data** (or a fresh private
window). Reloading mid-demo is safe — saves are versioned and you return to the
title screen with progress intact.

## The prefixed inputs (already in the app)

Town Hall opens with this schedule text prefilled:

> Database Systems lecture from 9 to 12, 90 minute commute, Film Society at 5,
> café shift from 6 to 10, ERD assignment due tomorrow takes 120 minutes,
> revise normalisation notes for 62 minutes, weekly groceries 45 minutes,
> bursary form due next week 30 minutes, laundry 30 minutes

And this assignment brief prefilled:

> Enrolment System — Coursework 2.
> You must design an entity-relationship diagram for the university enrolment system.
> - Identify the entities and their attributes
> - Describe the relationship between each pair of entities
> - Resolve any many-to-many relationships with a junction entity
> - Write a short data dictionary
> Diagrams should be legible and submitted as PDF.

Say this up front: *"Nothing here is hardcoded. The schedule is parsed live,
and every number I show is calculated from it."*

## Act 1 — The week, understood (1 min)

1. Press **Enter Campus Grove**. Kai opens: *"Thursday is at 108 percent… Four
   things are locked in… Two of the flexible ones can move."*
   - **Point out:** 108% is computed — 570 fixed minutes leave 330 of 900 waking
     minutes for 5 flexible tasks. Say: *"This is schedule guidance, not a
     judgement — the app says so on screen."*
2. Open **Town Hall** (map or Town List). The parse preview shows **9 commitments,
   confidence 1.00, 3 visible assumptions** (e.g. assumed 30 minutes).
   - Click **Review as editable list**, change one row (e.g. laundry 30 → 45),
     delete nothing, click **Save these commitments**.
   - **Point out:** the parser never invents commitments and every assumption is
     shown, not hidden. Your edit is what gets saved.

## Act 2 — Make space, with consent (1 min)

3. Open the **Clock Tower**. Kai proposes moving low-priority flexible tasks to
   Saturday. Fixed lectures, the shift, the club meeting stay visibly **locked**;
   the ERD assignment (due tomorrow) is never offered.
   - Uncheck one move. Watch Thursday's after-value change live.
   - Re-check it and click **Approve these 2 moves**.
   - **Point out:** Thursday **108% → 91.5% (Heavy)**, Saturday 15.4% → 22.4%
     and stays Open. *"Nothing moved until I approved it — reject leaves the
     week exactly as it was."*

## Act 3 — One checkpoint, one session (1.5 min)

4. Open the **Library**. Choose ***I do not know where to begin***.
   - **Point out:** the plan follows the blocker, and the first checkpoint is
     grounded in *your brief's first deliverable* — paste or keep the seeded
     brief, click **Extract deliverables**, and the checkpoints reference it.
     Pick the ~20-minute checkpoint; rewrite its title if you like.
5. Click **Start a Pace Session**. Show the three workspace tools in 20 seconds:
   - **Timer** (untimed by default — *"a timer running out never completes
     work here"*), **scratchpad**, and **Ask Mira → Explain**.
   - **Point out:** the answer talks about *your* task and checkpoint, not a
     canned example. Every help mode (Plan, Explain, Brainstorm, Review, Debug,
     What next?) answers from your task, blocker, and brief.
6. Select **Partial progress**, keep *"Add the enrolment junction entity"* as the
   next action, click **Save and leave**.
   - **Point out:** partial progress earns rewards (20 XP) because naming the
     next action *is* the success condition. The HUD quest card now says
     *Recover first* — the system foregrounds one action.

## Act 4 — Recover both ways (1 min)

7. Click **Pause & regulate** path or go to the **Garden Pavilion**: tap the pond
   a few times — flowers bloom, the breathing guide is toggleable — then
   **Done for now → Lighter → Resume checkpoint**.
   - **Point out:** no score, no failure, leaving early is valid, and the session
     resumes with notes and timer intact.
8. Go to the **Park → Pocket of Green**. Pick **open-window observation**,
   **self-confirm**, **Done**.
   - **Point out:** four settings (outdoor / window / indoor / image), optional
     photo checked *locally for greenery only*, camera-denied falls back to
     self-confirm — and **both earn identically** (20 XP). No proof pressure.

## Act 5 — Memory and evidence (30 sec)

9. Click **Turn it into a Keepsake**. Choose **Create keepsake, discard
   original**, tick the privacy review, **Generate**, approve, place it in the
   **Recovery Garden**.
   - **Point out:** metadata is stripped by redrawing, the original is discarded
     as chosen, and the photo earned *nothing extra* — the keepsake is a memory,
     never proof.
10. Open the **Journal** (Post Office). Read the timeline: rebalance, session,
    recovery, keepsake with deletion state, and the waiting next action.
    - **Point out:** HUD shows earned XP/coins/level, one garden plant has grown,
      and the Library fog has eased. *"The town responds to sustainable choices —
      never to streaks or hours."*

## If the audience asks…

| Question | Answer to give (and where to click) |
|---|---|
| What if I disagree with the plan? | Reject the rebalance, rewrite any checkpoint, pick another blocker — approval is always explicit (Clock Tower, Library). |
| What if I'm too tired to work? | Say *"watch this"* — Daily Briefing → low energy bends guidance; Council recommends **Recover first**; Exit Quest at Home closes the day with the next action kept. |
| Where is my data? | Home → **Export save (JSON)** / Delete local data. Local-first; photos optional, private, removable. |
| Does it work on a phone? | Same flow at 390px: Town List drawer, thumb D-pad, bottom sheet. Reduced-motion and high-contrast in Home and the top bar. |
| What proves the math? | `npm test` — 122 cases pin the 108% Thursday, band boundaries, parity, and no-auto-complete rules. |

## Troubleshooting (live-demo insurance)

- **Numbers differ from this script** (e.g. not 108%): someone edited the
  schedule text — Town Hall → Re-parse → Save restores it.
- **Stale state from a previous run**: Home → Delete local data → reload.
- **No camera / file picker awkward on stage**: use self-confirm — that *is*
  the point (equal rewards), and say so.
- **Offline dare**: `npm run build; npm run preview`, then disconnect — the
  shell is runtime-cached and saves persist.

## Function reference (presenter-only — own notes, not for the audience)

What each function does, where it lives, and which act shows it.

| Function | What it does (own words) | Key files | Act |
|---|---|---|---|
| Title + Kai intro | Title screen, computed Thursday %, first-run explainer dialogue | `src/game/Game.tsx`, `src/domain/seed.ts` | 1 |
| Town Hall intake | Parses plain-language week into editable commitments; brief → deliverables; nothing saves until approved | `src/game/panels/Loop.tsx` (Intake), `src/domain/parse.ts` | 1 |
| Understand | Shows the arithmetic per task: minutes × priority × effort × urgency ÷ available | `src/game/panels/Loop.tsx` (Understand), `src/domain/workload.ts` | 1 |
| Rebalance Workshop | Greedy proposal (low-priority, most slack first); per-move checkboxes; approve-all/partial/reject | `src/game/panels/Loop.tsx` (Rebalance), `src/domain/rebalance.ts` | 2 |
| Library work plans | Blocker → guardian + editable checkpoints grounded in your task and brief | `src/game/panels/Loop.tsx` (Work), `src/domain/plans.ts` | 3 |
| Pace Session | One checkpoint, timer (never decisive), scratchpad, 6 contextual help modes, stuck actions, 4 valid outcomes + next action | `src/game/panels/Loop.tsx` (Session), `src/domain/guidance.ts` | 3 |
| Gentle Ripples | Interactive pond: taps → ripples/petals/flowers, breath guide, response + 3 return paths, pause-resume safe | `src/game/panels/Ripples.tsx`, `src/domain/regulation.ts` | 4 |
| Pocket of Green | 4 settings × self/photo × done/partial/changed/another + camera-denied; local greenery check; equal rewards | `src/game/panels/Pocket.tsx`, `src/domain/photo.ts` | 4 |
| Firefly / Chime / Warm Cup / Lanterns | Playable-lite regulation games, each with response + spec'd return paths | `src/game/panels/Minis.tsx` | Encore |
| Keepsakes pipeline | 4 photo policies → EXIF strip → privacy review → pixel filter or symbolic fallback → preview approval → placement | `src/game/panels/Keepsakes.tsx`, `src/domain/keepsake.ts` | 5 |
| Collection | Private keepsake grid: filter, rename, move, download, delete; shows original retained/discarded | `src/game/panels/Keepsakes.tsx` (Collection) | 5 |
| Journal | Auto timeline of rebalance, sessions, recovery, keepsakes, rewards + waiting next action | `src/game/panels/Places.tsx` (Journal), `src/game/state.ts` | 5 |
| Backpack | Thursday's load as carried items: locked vs flexible badges; routes to session/rebalance | `src/game/panels/Places.tsx` (Backpack) | 2–3 |
| Recovery Garden | 5 CSS growth stages from work/recovery/replan/help; never wilts, never decays | `src/game/panels/Places.tsx` (Garden) | 5 |
| Future Mailbox | One-line notes to your future self, surfaced next session | `src/game/panels/Places.tsx` (Mailbox) | Encore |
| Guardian Council | Top-3 guardian voices by pressure area + one foregrounded recommendation; proposes, never applies | `src/game/panels/Places.tsx` (Council) | Q&A |
| Calm Corner | All 5 activities with no prerequisites | `src/game/panels/Places.tsx` (Calm) | 4 |
| Daily Briefing | Wake/sleep hours, optional energy/stress; guided % shown *beside* raw %, never instead | `src/game/panels/Places.tsx` (Briefing), `src/domain/workload.ts` | Q&A |
| Daily Load + Weather | Full % breakdown, area bars, district weather states (fog, clock speed, parcels…) | `src/game/panels/Places.tsx` (LoadPanel), `src/game/Campus.tsx` | 1 |
| HUD quest card | Up to 3 quests, 1 foregrounded under pressure, replaceable without penalty | `src/game/Game.tsx`, `src/domain/quests.ts` | 3 |
| Home + Exit Quest | Quiet Mode, contrast, capacity, save export/delete, intentional stop with next action kept | `src/game/panels/Places.tsx` (Home) | Setup |
| Town List | Every spatial place reachable by list; keyboard-first parity | `src/game/panels/Places.tsx` (TownList), `src/game/layout.ts` | All |
| Saves + storage | Versioned localStorage (`pacetown.game`, v3 + migrations) behind a swap-ready adapter | `src/game/state.ts`, `src/game/storage.ts` | Setup |
| Offline shell | Manifest + runtime-caching service worker (prod only) | `public/sw.js`, `public/manifest.webmanifest`, `src/main.tsx` | Dare |
