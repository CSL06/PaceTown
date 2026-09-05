# Guardian flow completion — design

Date: 2026-09-05. Approach: A (wire the planned flow with existing mechanics).
Status: approved by user (all 4 sections), awaiting spec review.

## Goal

Complete the three guardian-flow pieces the md plans promise and the game
lacks: the guardian choice step (vision §9 prep step 5, implementation plan
§9 prep step 4), the guardian-voiced resume ritual (implementation plan
§9 "Resume ritual"), and real per-guardian actions (implementation plan
§9 blocker table, vision §10 "each changes what the student can do").

Non-goals: no new views, no save migration, no new reward mechanics, no
changes to workload/rebalance math, no AI provider.

## Section 1 — Guardian choice

Work prep gains a guardian picker next to "Start a Pace Session": all five
guardians, with the blocker-routed guardian pre-selected (unclear start →
Mira, too large → Kai, missing materials → Goh, low capacity → Sol,
perfection pressure → Sky, other → Kai). Picking or changing a blocker
resets the picker to routed; the student may then switch freely.

Stored as `session.guardianOverride: GuardianId | null` (null = follow the
blocker). Effective guardian = override ?? guardianFor(blocker), computed by
a pure domain helper. The Session Ask-header, guardian lens, help modes, and
Work live line all follow the effective guardian. Old saves without the
field read as null.

## Section 2 — Resume ritual

Same trigger as today (held checkpoint, no outcome recorded). The HUD card
becomes guardian-voiced: the effective guardian's portrait plus exactly four
summary lines — task title, checkpoint title, time spent so far, and the
saved next action (or "no next action saved yet") — never missed-day,
streak, or history content. Three choices: Resume → session, Edit plan →
work, Something else → town list.

## Section 3 — Guardian actions

One real button per guardian in the Session, doing something mechanical:

- Mira: drafts an outline into the scratchpad from brief deliverables.
- Kai: splits the checkpoint in two (disabled under 10 minutes).
- Sol: shrinks the checkpoint to a 5-minute step.
- Sky: starts a shared count-up timer ("sit with me" body doubling).
- Goh: adds a gathering checklist checkpoint.

Checkpoint splitting lives in a pure domain helper and is unit-tested;
scratchpad/timer edits reuse existing session-state paths.

## Section 4 — Data and tests

One nullable field (`session.guardianOverride`); defaults merge makes a
migration unnecessary (to be verified against `loadState` in the plan).
Tests: split helper, effective-guardian helper, guidance flows driven by a
chosen (not routed) guardian. `tsc`, `vitest run`, and `vite build` stay
green, plus a manual click-through of prep → session → leave → return.
