# Smooth guided flow and new-user clarity — design

Date: 2026-09-05. Status: approved by user (all 8 sections).

## Goal

Make the Campus Grove flow feel coherent and easy to follow for a new user
while keeping every real workflow of the system intact: one clear next step
at a time, a Clock Tower that leads with consent, a Work panel that speaks
in pixel-dialogue message boxes, an updated README and prototypeflow, and a
`/reset` dev shortcut. Nothing in the existing systems is simplified away or
replaced — only presentation, defaults, ordering and docs change.

## Non-goals (constraints)

- No new functions, views, state fields, migrations, or reward mechanics.
- No workflow is removed or simplified: Week Board drag-drop, guardian dock
  actions, Council, Shop, settings, onboarding and auth all stay reachable.
- The flow must follow the project's md plans (prototypeflow.md acts, vision
  §19 one-foregrounded-action, implementation plan §9–§11 consent contract).
- The guardian system must keep working end to end: picker → session
  actions → resume ritual.

## Section 1 — One loud guidance voice

Every guidance surface already computes from the shared rule (`leadView` +
`foregroundQuest` in Game.tsx). This section makes all surfaces agree
visually and verbally:

- HUD quest card: the single loud recommendation (unchanged behavior).
- Guardian Dock: all five rows and their action buttons stay; the "N
  waiting" counter is removed; only the one foregrounded guardian shows a
  waiting dot (vision §19: one thing foregrounded).
- Title hook: shortened to one line that mirrors the quest card's current
  recommendation (same rule, same words).
- Lead-place glow and Council recommendation: already follow the shared
  rule; verified, no change.

## Section 2 — Clock Tower: proposal first, board below

When the Week Board opens and rebalance is still undecided
(`!rebalanceSeen`) with moves available (`proposal.moves.length > 0`), the
Kai consent preview is auto-open: select suggested moves → destination
picker → Approve/Reject. The drag-drop calendar, undo, inspect and manual
board remain exactly as they are, below the consent moment. This is a
default-state change in `WeekBoard` (auto `previewOpen`), not a new
function.

## Section 3 — First-run entry follows the plan's loop

On a brand-new save (no journal entries), Kai's intro dialogue leads to
**Town Hall** first (intake — understand the week), matching prototypeflow
Act 1 and the plan's loop order. Returning players keep current behavior
(rebalance if undecided, else the shared-rule next step). Presentational
only.

## Section 4 — prototypeflow.md rewritten to the real system

Same act structure, goal lines, "What just happened (the logic)" notes and
function reference, but describing the actual app: Clock Tower room + Week
Board (Act 2), guardian picker and guardian action buttons (Act 3), resume
ritual, `?` dots, wizard steppers, recovery-pay copy, live-number caveats.
Stale claims (e.g. sw.js) corrected. The md files remain the canonical plan.

## Section 5 — Work panel: pixel-dialogue message boxes

In "Choose the work", tapping a blocker no longer expands content below the
buttons. It opens a new pixel-style message box (portrait left, bordered
dialogue panel, existing palette) containing that blocker's guardian
opener and the plan: checkpoints (editable, selectable), guardian picker,
Start a Pace Session. A Back button returns to the previous box (the
blocker list) with nothing lost; picking a different blocker opens that
guardian's box. Same state and functions — stepped presentation only.

## Section 6 — README updated in place

README.md refreshed to match reality: routes and entry (landing → auth →
wizard → town, plus the `/game` presenter front door), the feature set as
built (Week Board, guardian flow, recovery activities, keepsakes, shop,
settings), how to run and test (tsc, vitest 286, build), the demo path, and
an honest "not built yet" list.

## Section 7 — `/reset` dev shortcut

A small route that clears the game save (existing `clearState()`) and the
demo guest session, then redirects to `/game`. One URL, no confirmation
wall (dev tool; Home keeps the careful path).

## Section 8 — Verification

- `npx tsc -b --force`, `npx vitest run`, `npm run build` all green.
- Manual click-through: new-save entry → Town Hall → Clock Tower proposal
  auto-open → Approve → Library → blocker opens a message box → Back →
  different blocker box → pick guardian → session action button → save →
  resume ritual speaks as chosen guardian; `/reset` wipes and returns.