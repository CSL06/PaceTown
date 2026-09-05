# Session continuity and outsider walkthrough — design

Date: 2026-09-05. Approach: A (desk welcome-back panel). Status: approved by user (all 4 sections).

## Goal

When a student returns to work they already started, the system must show
what they did before: a welcome-back moment at the study desk, a badge on
the in-progress task in the open-work list, and the recorded "what changed"
line in the HUD resume card. prototypeflow.md gains a 10-minute outsider
walkthrough and is updated to the post-merge system.

## Non-goals

No new state fields, no migrations, no removed workflows, no changes to the
save/outcome logic (the desk's outcome reset stays as-is).

## Section 1 — Desk welcome-back

New `welcome` flow in `Library.tsx`. `openDesk` currently opens the session
directly; with prior progress it instead opens a `MiraPanel` "Welcome back"
listing exactly three recorded items — what changed (`progressNote`), the
saved next action, and time spent — with two choices: **Keep going** (opens
the session flow; all state intact) and **Not now**. Prior progress means
`hasProgress(state)`: `progressNote` or `nextAction` non-empty after trim,
or `session.elapsedSec > 0`. With no prior progress the desk opens the
session directly, unchanged. `openDesk`'s existing `outcome: null` reset is
unchanged.

## Section 2 — Task-list badge and HUD card

In the open-work task list (`flow === 'task'`), the task that has the active
checkpoint with prior progress shows a badge line: "You did this before —
resume at your desk". The HUD `ResumeCard` gains a "Last time: {what
changed}" line (prefixed by the recorded outcome label, e.g. "Partial
progress") rendered only when `progressNote` is non-empty.

## Section 3 — prototypeflow.md

Adds "Before you use it — the 10-minute outsider walkthrough" at the top:
what PaceTown is (one loop, no guilt), then a hands-on first run through the
current system — landing → Enter Campus Grove → Kai intro → Town Hall →
Clock Tower consent proposal → Library room (Mira → open work → blocker →
checkpoint → desk session → finish/outcome → welcome-back on return) →
Recover → Journal. Acts 1–5 and the function reference are then updated to
the post-merge reality: Library room scene with Mira panels and
task-guided checkpoints (`taskGuidance`), Clock Tower proposal-first Week
Board, `/reset` shortcut. The stale Act 3 (message-box panel, guardian
picker) is corrected; numbers keep the live-engine caveat.

## Section 4 — Constraints and tests

Pure helper `hasProgress(state)` in `Library.tsx` (exported) drives the
welcome panel and badge; unit-tested. jsdom tests: welcome-back flow opens
with the three recorded items and Keep going enters the session; badge
renders on the in-progress task; ResumeCard shows the "Last time" line.
`tsc`, full `vitest run`, and `npm run build` stay green.
