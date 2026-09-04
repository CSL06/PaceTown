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
