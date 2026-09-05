# Session Continuity and Outsider Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Returning students see what they did before — a welcome-back panel at the study desk, a badge on the in-progress task in the open-work list, and the recorded "what changed" line in the HUD resume card — and prototypeflow.md gains a 10-minute outsider walkthrough plus a post-merge refresh.

**Architecture:** One exported pure helper (`hasProgress`) drives the welcome panel and badge; the Library gains a `welcome` flow that lists the three recorded items before reopening the session; `ResumeCard` gains one "Last time" line; the docs task rewrites the demo script for the post-merge Library room scene. No new state fields, no migrations.

**Tech Stack:** React + TypeScript (Vite), Vitest 5 with jsdom + @testing-library/react (harness pattern proven in `ClockTower.test.tsx`).

## Global Constraints

- No new state fields, no migrations, no removed workflows; `openDesk`'s outcome reset stays unchanged.
- The welcome panel lists exactly: what changed, saved next action, time spent. No shame or history content.
- The guardian system keeps working end to end; the Library's guided flow (Mira → task → blocker → checkpoint → desk) is untouched apart from the welcome branch.
- Verify with `npx tsc -b --force`, `npx vitest run <file>`, and `npm run build` where stated.
- Commit after every task; never push.

---

## File structure

- `src/game/Library.tsx` — gains exported `hasProgress`, the `welcome` flow, and the task-list badge.
- `src/game/Library.test.tsx` — new; jsdom tests (harness mirrors `ClockTower.test.tsx`).
- `src/game/ResumeCard.tsx` — gains the "Last time" line; `src/game/ResumeCard.test.tsx` extended.
- `prototypeflow.md` — outsider walkthrough + post-merge refresh.

---

### Task 1: `hasProgress`, welcome-back flow, and task-list badge

**Files:**
- Modify: `src/game/Library.tsx`
- Test: create `src/game/Library.test.tsx`

**Interfaces:**
- Consumes: existing `Library` props, `MiraPanel`, `initialState` (has `briefTaskId` post-merge), seeded tasks via `initialState().tasks`.
- Produces: `export function hasProgress(state: GameState): boolean` — consumed by the welcome branch, the badge, and the tests.

- [ ] **Step 1: Write the failing tests** (create `src/game/Library.test.tsx`)

```tsx
/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { hasProgress, Library } from './Library'
import { initialState, type GameState } from './state'

function Harness({ initial }: { initial: Partial<GameState> }) {
  const [state, setState] = useState<GameState>(() => ({ ...initialState(), started: true, onboarded: true, ...initial }))
  return <Library state={state} update={setState} go={vi.fn()} toast={vi.fn()} onExit={vi.fn()} />
}

function withActiveSession(over: Partial<GameState> = {}): Partial<GameState> {
  const base = initialState()
  const task = base.tasks.find((t) => t.id === base.activeTaskId) ?? base.tasks.find((t) => t.day === 'thu')!
  return {
    blocker: 'unclear_start',
    activeTaskId: task.id,
    activeCheckpointId: base.checkpoints[0]?.id ?? 'seed-cp',
    checkpoints: base.checkpoints.length
      ? base.checkpoints
      : [{ id: 'seed-cp', title: 'List the visible pieces', definitionOfDone: 'Every piece written down.', estimatedMinutes: 15, status: 'pending' }],
    ...over,
  }
}

describe('hasProgress', () => {
  it('is true for a note, a next action, or time on the clock', () => {
    expect(hasProgress({ ...initialState(), progressNote: 'Mapped two entities' })).toBe(true)
    expect(hasProgress({ ...initialState(), nextAction: 'Add the junction entity' })).toBe(true)
    expect(hasProgress({ ...initialState(), session: { ...initialState().session, elapsedSec: 45 } })).toBe(true)
    expect(hasProgress(initialState())).toBe(false)
  })
})

describe('desk welcome-back', () => {
  it('shows what changed, the next action, and time spent before the session', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession({
      progressNote: 'Mapped two entities',
      nextAction: 'Add the junction entity',
      session: { ...initialState().session, elapsedSec: 90, timerMode: 'down', timerLenSec: 900 },
    })} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Welcome back')
    expect(dialog).toHaveTextContent('Mapped two entities')
    expect(dialog).toHaveTextContent('Add the junction entity')
    expect(dialog).toHaveTextContent('2 min so far')
    await user.click(screen.getByRole('button', { name: /keep going/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Done when')
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
  })

  it('opens the session directly when there is no prior progress', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession()} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Done when')
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
  })
})

describe('open-work badge', () => {
  it('badges the in-progress task in the task list', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession({ progressNote: 'Mapped two entities' })} />)
    await user.click(screen.getByRole('button', { name: /talk to mira/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('You did this before — resume at your desk')
  })
})
```

Note: if the desk button's accessible name differs (it is `Your place is ready` with `active.title` as `small`), scope queries as the existing tests do. If `initialState()` has no checkpoints, the `seed-cp` fallback covers it. Mirror `ClockTower.test.tsx`'s harness style if any extra stubbing proves necessary.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/game/Library.test.tsx`
Expected: FAIL with "hasProgress is not defined" / "Welcome back" not found.

- [ ] **Step 3: Implement in `src/game/Library.tsx`**

1. Extend the `Flow` union: `type Flow = ... | 'welcome'`.
2. Add the exported helper (above the component, after `briefDeliverables`):

```ts
/** True when the student left something behind: a note, a next action, or time. */
export function hasProgress(state: GameState): boolean {
  return state.progressNote.trim().length > 0
    || state.nextAction.trim().length > 0
    || state.session.elapsedSec > 0
}
```

3. In `openDesk`, keep the existing `update` (outcome reset + timerLenSec) exactly, then branch:

```ts
setDraftOutcome(null)
setTaskFinished(false)
setFlow(hasProgress(current)) // 'current' is the freshest state inside the update callback
```

Since `update` uses a callback, capture the flag instead: change `openDesk` to compute `const resumed = active && state.blocker && hasProgress(state)` before the update, do the update unchanged, then `setFlow(resumed ? 'welcome' : 'session')`.

4. Add the welcome panel (place it next to the other flows):

```tsx
{flow === 'welcome' && active && (
  <MiraPanel kicker="Mira · you were here before" title="Welcome back" onClose={closeFlow}>
    <p className="library-copy">Nothing was lost. Here is where you left it.</p>
    <div className="library-choices compact">
      <div><strong>{state.progressNote.trim() || 'No note last time'}</strong><span>What changed</span></div>
      <div><strong>{state.nextAction.trim() || 'Not set yet'}</strong><span>Saved next action</span></div>
      <div><strong>{fmtClock(state.session.elapsedSec)}</strong><span>Time in this session</span></div>
    </div>
    <div className="library-actions">
      <button className="library-primary" type="button" onClick={() => setFlow('session')}>Keep going</button>
      <button type="button" onClick={closeFlow}>Not now</button>
    </div>
  </MiraPanel>
)}
```

5. In the task list (`flow === 'task'`), badge the in-progress task — inside the candidate button, after the `<span>` with time/flexibility, add:

```tsx
{task.id === state.activeTaskId && active && hasProgress(state)
  ? <span>You did this before — resume at your desk</span>
  : null}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/Library.test.tsx`
Expected: PASS. Then `npx tsc -b --force` clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/Library.tsx src/game/Library.test.tsx
git commit -m "feat: desk welcome-back with recorded progress and open-work badge"
```

---

### Task 2: ResumeCard "Last time" line

**Files:**
- Modify: `src/game/ResumeCard.tsx`
- Test: modify `src/game/ResumeCard.test.tsx` (extend; keep existing tests)

**Interfaces:**
- Consumes: `state.progressNote`, `state.outcome` (existing fields).
- Produces: nothing new — display only.

- [ ] **Step 1: Write the failing test** (append to `src/game/ResumeCard.test.tsx`, matching its existing stub helpers)

```tsx
it('shows what changed last time with the outcome label', () => {
  const { state, go } = stub()
  state.progressNote = 'Mapped two entities'
  state.outcome = 'partial'
  render(<ResumeCard state={state} go={go} />)
  expect(screen.getByText(/Last time \(Partial progress\): Mapped two entities/)).toBeInTheDocument()
})

it('omits the last-time line when no note was saved', () => {
  const { state, go } = stub()
  render(<ResumeCard state={state} go={go} />)
  expect(screen.queryByText(/Last time/)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/ResumeCard.test.tsx`
Expected: the new tests FAIL (no "Last time" line), existing tests PASS.

- [ ] **Step 3: Implement** (in `src/game/ResumeCard.tsx`)

Add an outcome-label map and the line:

```ts
const OUTCOME_LABEL = {
  completed: 'Completed', partial: 'Partial progress',
  blocked: 'Blocked', rescheduled: 'Rescheduled',
} as const
```

Inside the component, after the `next` line:

```tsx
const last = (state.progressNote ?? '').trim()
const lastLabel = state.outcome ? OUTCOME_LABEL[state.outcome] : null
```

Render between the next-action `<p>` and `.qa`:

```tsx
{last && <p>Last time{lastLabel ? ` (${lastLabel})` : ''}: {last}</p>}
```

Update the file docstring to mention what changed.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/ResumeCard.test.tsx`
Expected: PASS (all). Then `npx tsc -b --force` clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/ResumeCard.tsx src/game/ResumeCard.test.tsx
git commit -m "feat: resume card shows recorded progress with outcome label"
```

---

### Task 3: prototypeflow.md — outsider walkthrough + post-merge refresh

**Files:**
- Modify: `prototypeflow.md`

**Interfaces:** none (docs).

- [ ] **Step 1: Add the outsider walkthrough** — new section directly after the title, before "Before you show it":

```markdown
## Before you use it — the 10-minute outsider walkthrough

You have never seen PaceTown. This is the shortest honest tour. One loop,
no scores, no guilt:

> See your whole week as one number → move what can safely move → turn one
> scary task into one small step → work with a guardian beside you → rest
> on purpose → everything you did is written down for next time.

1. Open `http://localhost:5173/game` (or press **Enter Campus Grove** from
   the landing page). Kai greets you and — on a first run — walks you to
   **Town Hall**. Your week is already typed there in plain language; press
   **Save these commitments**. The number on the HUD is calculated from it,
   never written in.
2. Walk to the **Clock Tower** (or Town List → Clock Tower). The Week Board
   opens on Kai's suggestion: some tasks are softly outlined as previews.
   Compare Thursday before → after, then **Approve**. Nothing moved until
   you said so.
3. Walk to the **Library** and **Talk to Mira**. Pick one task from your
   open work, answer one short question (what is making it difficult), and
   she proposes one small checkpoint with a clear finish line. **Use this
   step**, then walk to your **study desk**.
4. The session is one checkpoint, one timer (optional), one scratchpad.
   **Ask Mira** when stuck — she answers from your task, not a canned
   example. When you stop: **Pause or record progress** → say how it went →
   leave a note. **Save and stand up**.
5. Leave and come back: the desk greets you with **Welcome back** — what you
   changed, your next action, time spent. The HUD card carries the same
   summary. Rest at the **Garden Pavilion** or the **Park** whenever you
   like; reading the **Post Office** journal shows the whole day honestly.

That is the whole system. Everything below is the same tour, scripted for a
presenter with timings.
```

- [ ] **Step 2: Refresh the acts to the post-merge system** — keep the act structure, goal lines, and "What just happened (the logic)" style, correcting what no longer matches:

1. **Pre-show**: keep `/reset`; confirm the prefilled-inputs section still matches (`initialState`/seed still holds the schedule + brief).
2. **Act 1**: unchanged in substance (Town Hall first via intro).
3. **Act 2**: verify it matches the Clock Tower scene (proposal-first Week Board, drag-drop below, approve) — it was written for this, so mostly confirm numbers/caveats still hold.
4. **Act 3**: rewrite to the Library room scene — **Talk to Mira** → open-work list (day switcher, pages; the in-progress task carries the **"You did this before — resume at your desk"** badge) → task summary → blocker question → Mira proposes **one checkpoint** (Use this step / Make it smaller) → **study desk** → session (Done-when, timer, scratchpad, **Ask Mira** with free-text questions answered from task+checkpoint+brief) → **I'm finished…** (checkpoint vs whole task) or **Pause or record progress** → reflect ("What changed?" + next action) → **Save and stand up**. Replace all message-box / guardian-picker / guardian-action-button prose — those panels no longer exist in this flow. Keep the resume-ritual paragraph and add the new **Welcome back** desk moment and the badge.
5. **Act 4–5**: verify against current Recover/Pocket/Journal code; correct any drift.
6. **Function reference**: update the "Do the work" section to the Library scene flow; note `taskGuidance` (the local guidance provider proposing checkpoints) in the "System" section if it fits.
7. Keep the live-numbers caveat; re-verify the quoted numbers against the current engine and correct if drifted.

- [ ] **Step 3: Verify no stale claims**

Run: `Select-String -Path prototypeflow.md -Pattern 'message box|guardian picker|Work with|Start a Pace Session with|Extract deliverables'`
Fix any hit that describes removed UI; keep hits that are legitimately current. Commit:

```bash
git add prototypeflow.md
git commit -m "docs: outsider walkthrough and post-merge refresh for prototypeflow"
```

---

### Task 4: Full verification

**Files:** none, unless fixes are needed.

- [ ] **Step 1: Run the whole chain**

Run: `npx tsc -b --force && npx vitest run && npm run build`
Expected: typecheck clean, all tests pass, build succeeds.

- [ ] **Step 2: Manual-pass substitute (no browser available)** — statically verify each acceptance item with file:line evidence and report it: welcome panel shows the three recorded items and Keep going enters the session; no-progress desk opens the session directly; badge renders on the in-progress task; ResumeCard shows the Last-time line only with a note. Flag anything only a real browser can confirm (visual layout, hover states).

- [ ] **Step 3: Commit** — only if fixes were required (`git add` only touched files; never push). Otherwise record completion with no empty commit.