# Smooth Guided Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Campus Grove flow coherent and easy for a new user while keeping every real workflow intact: one loud guidance voice, Clock Tower leading with Kai's consent proposal, first-run entry starting at Town Hall, a pixel-dialogue message-box flow in the Library, a rewritten prototypeflow and README, and a `/reset` dev shortcut.

**Architecture:** Presentation and defaults only — no system is removed or simplified. Two pure helpers in `src/game/layout.ts` (`focusGuardianFor`, `nextStepFor`, `firstStepForIntro`) carry the harmonization logic and are unit-tested. UI tasks are surgical edits to `GuardianDock.tsx`, `Game.tsx`, `ClockTower.tsx`, `Loop.tsx` (Work), plus a new `ResetPage.tsx` and route.

**Tech Stack:** React + TypeScript (Vite), Vitest 5 with jsdom + @testing-library/react (existing in repo).

## Global Constraints

- No new functions, state fields, or migrations — the `/reset` route is the one approved exception to "no new views" (spec §7).
- No workflow is removed or simplified: Week Board drag-drop, dock actions, Council, Shop, settings, onboarding and auth all stay reachable.
- The flow must follow the project md plans: prototypeflow.md acts, vision §19 (one foregrounded action), implementation plan §9–§11 consent contract.
- The guardian system must keep working end to end: picker → session actions → resume ritual.
- Verify with `npx tsc -b --force`, `npx vitest run <file>`, and `npm run build` where stated.
- Commit after every task; never push.

---

## File structure

- `src/game/layout.ts` — gains three pure helpers (`focusGuardianFor`, `nextStepFor`, `firstStepForIntro`).
- `src/game/layout.test.ts` — new; unit tests for the three helpers.
- `src/game/GuardianDock.tsx` — accepts `focus: GuardianId | null`; no waiting counter; dot only on the focused guardian.
- `src/game/Game.tsx` — passes focus to the dock; title hook one-liner; first-run intro → Town Hall.
- `src/game/ClockTower.tsx` — WeekBoard auto-opens the Kai preview when rebalance is undecided and moves exist; `shouldAutoOpenPreview` exported pure helper.
- `src/game/clockTower.test.ts` — new; pure-helper test.
- `src/game/panels/Loop.tsx` — Work gains a stepped message-box flow.
- `src/game/panels/Work.test.tsx` — updated + new back-button test.
- `src/game/game.css` — `.msgbox` pixel-dialogue styles.
- `src/ResetPage.tsx` — new; wipes save + session, redirects to `/game`.
- `src/ResetPage.test.tsx` — new.
- `src/main.tsx` — `/reset` route.
- `prototypeflow.md` — rewritten to the real system.
- `README.md` — updated in place.

---

### Task 1: Guidance harmonization helpers + dock focus + title hook

**Files:**
- Modify: `src/game/layout.ts`, `src/game/GuardianDock.tsx`, `src/game/Game.tsx`
- Test: create `src/game/layout.test.ts`

**Interfaces:**
- Consumes: `GuardianId`, `ViewId` (already in layout.ts); `GameState` type (Game.tsx).
- Produces: `focusGuardianFor(view: ViewId | null): GuardianId | null`, `nextStepFor(view: ViewId | null): string`, `firstStepForIntro(state: { journal: unknown[]; rebalanceSeen: boolean }): ViewId` — consumed by Game.tsx in this task.

- [ ] **Step 1: Write the failing tests** (create `src/game/layout.test.ts`)

```ts
import { describe, expect, it } from 'vitest'
import { firstStepForIntro, focusGuardianFor, nextStepFor } from './layout'

describe('focusGuardianFor', () => {
  it('maps each next-step view to the guardian who owns it', () => {
    expect(focusGuardianFor('rebalance')).toBe('kai')
    expect(focusGuardianFor('recover')).toBe('sol')
    expect(focusGuardianFor('session')).toBe('mira')
    expect(focusGuardianFor('work')).toBe('mira')
    expect(focusGuardianFor('garden')).toBe('sol')
    expect(focusGuardianFor('load')).toBe('kai')
    expect(focusGuardianFor('warmcup')).toBe('sky')
    expect(focusGuardianFor('lanterns')).toBe('goh')
    expect(focusGuardianFor(null)).toBeNull()
  })
})

describe('nextStepFor', () => {
  it('returns a one-line recommendation per view', () => {
    expect(nextStepFor('rebalance')).toMatch(/can move/i)
    expect(nextStepFor('recover')).toMatch(/recovery/i)
    expect(nextStepFor('work')).toMatch(/checkpoint/i)
    expect(nextStepFor(null)).toMatch(/checkpoint/i)
  })
})

describe('firstStepForIntro', () => {
  it('leads a brand-new player to Town Hall, returning players to the loop', () => {
    expect(firstStepForIntro({ journal: [], rebalanceSeen: false })).toBe('intake')
    expect(firstStepForIntro({ journal: [{ at: 1 }], rebalanceSeen: false })).toBe('rebalance')
    expect(firstStepForIntro({ journal: [{ at: 1 }], rebalanceSeen: true })).toBe('work')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/game/layout.test.ts`
Expected: FAIL with "focusGuardianFor is not defined".

- [ ] **Step 3: Write minimal implementation**

In `src/game/layout.ts`, append:

```ts
/** The guardian who owns the shared-rule next step — used to focus the dock. */
export function focusGuardianFor(view: ViewId | null): GuardianId | null {
  switch (view) {
    case 'rebalance': case 'load': return 'kai'
    case 'recover': case 'garden': return 'sol'
    case 'session': case 'work': return 'mira'
    case 'warmcup': return 'sky'
    case 'lanterns': return 'goh'
    default: return null
  }
}

/** One-line title-hook copy mirroring the quest card's recommendation. */
export function nextStepFor(view: ViewId | null): string {
  switch (view) {
    case 'rebalance': return 'Kai found things that can move — start there.'
    case 'recover': return 'You banked work — recovery is next.'
    case 'garden': return 'The garden is ready for you.'
    case 'session': return 'Your checkpoint is waiting.'
    default: return 'One checkpoint next — the Library is waiting.'
  }
}

/** Where Kai's first-run intro should point: brand-new saves start at intake. */
export function firstStepForIntro(state: { journal: unknown[]; rebalanceSeen: boolean }): ViewId {
  if (state.journal.length === 0) return 'intake'
  return state.rebalanceSeen ? 'work' : 'rebalance'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/layout.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire the dock and title hook** (in `src/game/GuardianDock.tsx` and `src/game/Game.tsx`)

`GuardianDock.tsx`:
1. Props gain `focus: GuardianId | null`; signature becomes `export function GuardianDock({ state, load, go, focus }: Props)`.
2. Delete the `waiting` count line (`const waiting = entries.filter(...)`).
3. In the header, remove `{waiting > 0 && <b>{waiting} waiting</b>}`.
4. The dock-dot renders only when this entry is the focused guardian: replace `{entry.waiting && <span className="dock-dot" aria-hidden="true" />}` with `{focus === entry.id && <span className="dock-dot" aria-hidden="true" />}`.
5. Keep `is-waiting` class logic on rows but drive it from focus: change `entry.waiting ? ' is-waiting' : ''` to `focus === entry.id ? ' is-waiting' : ''`.

`Game.tsx`:
1. Import `firstStepForIntro, focusGuardianFor, nextStepFor` from `./layout` (extend the existing `./layout` import).
2. Compute `const focusGuardian = focusGuardianFor(leadView)` where `leadView` is defined (after line ~255) and pass `<GuardianDock state={state} load={load} go={go} focus={focusGuardian} />`.
3. Replace the title-hook paragraph (lines ~287–293) with:

```tsx
<p className="title-hook">
  Thursday is at <b style={{ color: 'var(--accent)' }}>{load.percentage.toFixed(0)}%</b>. {nextStepFor(leadView)}
</p>
```

- [ ] **Step 6: Typecheck and run the dock-relevant tests**

Run: `npx tsc -b --force` (clean) and `npx vitest run src/game/layout.test.ts src/game/DemoEntry.test.tsx` (green).

- [ ] **Step 7: Commit**

```bash
git add src/game/layout.ts src/game/layout.test.ts src/game/GuardianDock.tsx src/game/Game.tsx
git commit -m "feat: one loud guidance voice — dock focus, title hook one-liner, layout helpers"
```

---

### Task 2: Clock Tower proposal-first

**Files:**
- Modify: `src/game/ClockTower.tsx`
- Test: create `src/game/clockTower.test.ts`

**Interfaces:**
- Consumes: `proposeRebalance`, `wakingMinutes`, `GameState` (all already imported in ClockTower.tsx).
- Produces: `shouldAutoOpenPreview(state)` pure helper — no external consumers.

- [ ] **Step 1: Write the failing test** (create `src/game/clockTower.test.ts`)

```ts
import { describe, expect, it } from 'vitest'
import { demoTasks } from '../domain'
import { shouldAutoOpenPreview } from './ClockTower'

const base = { tasks: demoTasks(), capacity: { wakeHour: 8, sleepHour: 23, energy: null, stress: null, sleepHours: null }, rebalanceSeen: false }

describe('shouldAutoOpenPreview', () => {
  it('auto-opens the Kai proposal when rebalance is undecided and moves exist', () => {
    expect(shouldAutoOpenPreview(base)).toBe(true)
  })

  it('stays closed once rebalance was decided', () => {
    expect(shouldAutoOpenPreview({ ...base, rebalanceSeen: true })).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/clockTower.test.ts`
Expected: FAIL with "shouldAutoOpenPreview is not defined".

- [ ] **Step 3: Write minimal implementation**

In `src/game/ClockTower.tsx`, add near the top (after the `Props` interface):

```ts
/** True when the Week Board should open on Kai's proposal preview first. */
export function shouldAutoOpenPreview(state: Pick<GameState, 'tasks' | 'capacity' | 'rebalanceSeen'>): boolean {
  if (state.rebalanceSeen) return false
  const waking = wakingMinutes(state.capacity)
  return proposeRebalance(state.tasks, { day: SOURCE_DAY, destination: DEFAULT_DESTINATION, waking }).moves.length > 0
}
```

In `WeekBoard`, change the preview state to open with the proposal:

```ts
const [previewOpen, setPreviewOpen] = useState(() => shouldAutoOpenPreview(state))
```

(`previewOpen` is declared at line ~71; replace `useState(false)`.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/clockTower.test.ts`
Expected: PASS. Then `npx tsc -b --force` clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/ClockTower.tsx src/game/clockTower.test.ts
git commit -m "feat: Clock Tower opens on Kai's consent proposal first"
```

---

### Task 3: First-run intro leads to Town Hall

**Files:**
- Modify: `src/game/Game.tsx` (start callback only)

**Interfaces:**
- Consumes: `firstStepForIntro` from Task 1.
- Produces: intro dialogue choices that navigate to the shared-rule first step.

- [ ] **Step 1: Edit `start` in `src/game/Game.tsx`** (lines ~189–205)

Keep the `firstTime` gate and timeout, but compute the destination and copy:

```tsx
const start = useCallback(() => {
  const firstTime = !state.introSeen
  setState((s) => ({ ...s, started: true, introSeen: true }))
  if (!firstTime) return
  const firstStep = firstStepForIntro(state)
  window.setTimeout(() => setScript({
    who: 'kai',
    lines: firstStep === 'intake'
      ? [
          'You made it. Take a breath before you look at any of it.',
          'Your week is already waiting at Town Hall — one plain-language list. Look at it with me, and then we decide what Thursday really needs.',
        ]
      : [
          'You made it. Take a breath before you look at any of it.',
          `Thursday is at ${load.percentage.toFixed(0)} percent. That is not a judgement — it is arithmetic. Four things are locked in and cannot move.`,
          'Two of the flexible ones can. I will show you exactly which, and nothing changes until you say so.',
        ],
    choices: firstStep === 'intake'
      ? [
          { label: 'Show me my week', onPick: () => go('intake') },
          { label: 'Let me look around first', onPick: () => {} },
        ]
      : [
          { label: 'Show me what can move', onPick: () => go(firstStep) },
          { label: 'Let me look around first', onPick: () => {} },
        ],
  }), 400)
}, [state.introSeen, state.rebalanceSeen, state.journal.length, load.percentage, go])
```

- [ ] **Step 2: Verify**

Run: `npx tsc -b --force` (clean) and `npx vitest run src/game/layout.test.ts src/game/DemoEntry.test.tsx` (green).

- [ ] **Step 3: Commit**

```bash
git add src/game/Game.tsx
git commit -m "feat: first-run intro leads new players to Town Hall first"
```

---

### Task 4: Work panel — pixel-dialogue message boxes

**Files:**
- Modify: `src/game/panels/Loop.tsx` (Work), `src/game/game.css`
- Test: modify `src/game/panels/Work.test.tsx` (extend; keep the existing picker test working)

**Interfaces:**
- Consumes: existing Work state (`state.blocker`, `checkpoints`, `guardianOverride`).
- Produces: stepped flow — blocker list box ⇄ plan box (guardian message box with Back).

- [ ] **Step 1: Update the test** (append to `src/game/panels/Work.test.tsx`, keeping its existing stub helpers)

```tsx
describe('message-box flow', () => {
  it('shows the plan box with a Back button after picking a blocker', () => {
    const p = propsFor()
    const { rerender } = render(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    // Blocker preset renders the plan box; the guardian opener is inside it.
    expect(screen.getByRole('button', { name: /^back/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^back/i }))
    rerender(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.queryByRole('button', { name: /^back/i })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /what is blocking this/i })).toBeInTheDocument()
  })

  it('re-opens the box when a blocker is tapped from the list', () => {
    const p = propsFor({ blocker: null, checkpoints: [] })
    const { rerender } = render(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    fireEvent.click(screen.getByRole('button', { name: /do not know where to begin/i }))
    rerender(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByRole('button', { name: /^back/i })).toBeInTheDocument()
  })
})
```

Note: `propsFor` in the existing file pre-sets `blocker: 'unclear_start'`; the second test overrides it. If the button accessible name for the blocker differs (the label is "I do not know where to begin"), adjust the regex to match the actual label text.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/panels/Work.test.tsx`
Expected: the existing picker test still passes; the new message-box tests fail (no Back button exists).

- [ ] **Step 3: Implement the stepped flow in `Work`** (`src/game/panels/Loop.tsx`)

1. Add state at the top of `Work`:
```tsx
const [step, setStep] = useState<'blockers' | 'plan'>(state.blocker ? 'plan' : 'blockers')
```
2. In the blocker option `onClick`, after the existing update, add `setStep('plan')`.
3. Wrap the blocker list (the `<div className="opts" role="group" aria-label="What is blocking this">…</div>` block, lines ~408–420) so it renders only when `step === 'blockers'`:
```tsx
{step === 'blockers' && ( ...existing opts block... )}
```
4. Wrap the existing plan content (lines ~422–545: `{template && (<>…</>)}` and the `{active && state.blocker && (<>…</>)}` block) so it renders only when `step === 'plan'`:
```tsx
{step === 'plan' && template && ( ...existing template block... )}
{step === 'plan' && active && state.blocker && ( ...existing active block... )}
```
5. Inside the plan box, at the top (before the `<Guardian … />` line), insert the message-box header with Back:
```tsx
<div className="msgbox">
  <div className="msgbox-head">
    <span>Library · {GUARDIANS[template.guardian].name}</span>
    <button type="button" className="msgbox-back" onClick={() => setStep('blockers')}>← Back</button>
  </div>
  <Guardian who={template.guardian} says={template.opener} />
```
and close the wrapper after the Start-session actions block (after line ~545's `</>`):
```tsx
</div>
```
(Adjust indentation so the moved content sits inside `.msgbox`.)
6. If `state.blocker` becomes null while `step === 'plan'` (edge), fall back: `if (step === 'plan' && !state.blocker) setStep('blockers')` via effect, or render the blockers box when `!template`. Simplest: make the plan branch condition `step === 'plan' && template` and the blockers branch `step === 'blockers' || !template`.

- [ ] **Step 4: Add `.msgbox` styles** (append to `src/game/game.css`, reusing existing variables)

```css
.msgbox { border: 2px solid var(--edge-hi); border-radius: 10px; background: var(--sunk); padding: 14px 16px; margin-top: 18px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.18) }
.msgbox-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px }
.msgbox-back { font-size: 12px; color: var(--dim); border: 1px solid var(--edge); border-radius: 6px; padding: 4px 10px; background: transparent; cursor: pointer }
.msgbox-back:hover { border-color: var(--accent); color: var(--accent) }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/game/panels/Work.test.tsx`
Expected: PASS (all tests). Then `npx tsc -b --force` clean.

- [ ] **Step 6: Commit**

```bash
git add src/game/panels/Loop.tsx src/game/game.css src/game/panels/Work.test.tsx
git commit -m "feat: Library work plan as pixel-dialogue message boxes with Back"
```

---

### Task 5: `/reset` dev shortcut

**Files:**
- Create: `src/ResetPage.tsx`
- Create: `src/ResetPage.test.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `clearState` from `./game/state`, `signOut` from `./auth/session`, `useNavigate` from react-router-dom.
- Produces: `/reset` route rendering the page; no other consumers.

- [ ] **Step 1: Write the failing test** (create `src/ResetPage.test.tsx`)

```tsx
/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SAVE_KEY } from './game/state'
import { SESSION_KEY } from './auth/session'
import ResetPage from './ResetPage'

beforeEach(() => localStorage.clear())

describe('ResetPage', () => {
  it('wipes the save and session, then redirects to /game', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 4, xp: 999 }))
    localStorage.setItem(SESSION_KEY, JSON.stringify({ account: { id: 'g1' } }))
    render(
      <MemoryRouter initialEntries={['/reset']}>
        <Routes>
          <Route path="/reset" element={<ResetPage />} />
          <Route path="/game" element={<p>fresh demo</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('fresh demo')).toBeInTheDocument()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ResetPage.test.tsx`
Expected: FAIL with "Failed to resolve import './ResetPage'".

- [ ] **Step 3: Write minimal implementation** (create `src/ResetPage.tsx`)

```tsx
/**
 * Dev shortcut — `/reset` wipes the game save and session, then lands on the
 * presenter front door. Home keeps the careful delete path; this is for
 * iterating and demoing.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from './auth/session'
import { clearState } from './game/state'

export default function ResetPage() {
  const navigate = useNavigate()
  useEffect(() => {
    clearState()
    signOut()
    navigate('/game', { replace: true })
  }, [navigate])
  return <div className="route-fallback">Resetting PaceTown…</div>
}
```

Note: confirm `SESSION_KEY` is exported from `./auth/session` (read the file top); if it is not exported, key the test on the actual key string `'pacetown.session'` instead of importing it.

- [ ] **Step 4: Add the route** (in `src/main.tsx`)

Add `import ResetPage from './ResetPage'` next to the other imports, and add the route after the `/game` route:

```tsx
<Route path="/reset" element={<ResetPage />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/ResetPage.test.tsx`
Expected: PASS. Then `npx tsc -b --force` clean.

- [ ] **Step 6: Commit**

```bash
git add src/ResetPage.tsx src/ResetPage.test.tsx src/main.tsx
git commit -m "feat: /reset dev shortcut wipes save and session"
```

---

### Task 6: prototypeflow.md rewritten to the real system

**Files:**
- Modify: `prototypeflow.md`

**Interfaces:** none (docs).

- [ ] **Step 1: Rewrite the demo script** keeping the existing structure and voice (acts, goal lines, "What just happened (the logic)", the pre-show section, troubleshooting, and the function reference appendix) but making every step describe the real system:

1. **Pre-show**: unchanged, plus add: "For a clean run, open `/reset` first (wipes the save) — or Home → Delete local data."
2. **Act 1 (Town Hall)**: unchanged in substance — title → Kai intro now says "Show me my week" → Town Hall. Add a line noting the intro leads new players to Town Hall first.
3. **Act 2 (Clock Tower)**: rewrite to the real scene — enter the Clock Tower room, walk to the Week Board (or talk to Kai), the board opens on Kai's consent proposal (auto-preview): suggested moves are softly outlined, pick a destination day, compare before/after loads, Approve. Note the drag-drop calendar below as the manual alternative ("or drag a flexible task to another day yourself — same consent rule, fixed tasks never move"). Keep the 108% → 91.5% numbers with the unedited-seeded-week caveat.
4. **Act 3 (Library)**: describe the message-box flow — tap a blocker, a new dialogue box opens with that guardian's opener and the plan; Back returns to the blocker list; pick a guardian (picker, routed default); checkpoints editable; Start a Pace Session.
5. **Act 3 tail**: session workspace unchanged, plus the guardian action button (Mira drafts an outline, Kai splits, etc.) and Ask {Guardian} help modes; note the resume ritual card on return (task, checkpoint, time, next action).
6. **Act 4 (Recover)**: unchanged substance; note first recovery pays 20 XP and further pauses pay nothing.
7. **Act 5 (Journal/Keepsakes)**: unchanged; add the `?` dots and wizard steppers as first-timer aids.
8. **Troubleshooting**: add `/reset`; fix the stale sw.js/offline claim to match main.tsx's production-only registration.

- [ ] **Step 2: Verify no stale claims**

Run a grep over the doc: `Select-String -Path prototypeflow.md -Pattern 'checkbox|Rebalance Workshop panel|sw.js'` — flag any leftover claims about the old panel and fix them.

- [ ] **Step 3: Commit**

```bash
git add prototypeflow.md
git commit -m "docs: prototypeflow rewritten to the real system flow"
```

---

### Task 7: README updated in place

**Files:**
- Modify: `README.md`

**Interfaces:** none (docs).

- [ ] **Step 1: Capture current test counts** — run `npx vitest run` and note the file/test totals; use the real numbers in the README (the doc currently says 212 and 226 — both stale).

- [ ] **Step 2: Update these sections:**

1. "Current status" bullet list: add Week Board + Clock Tower week planning, guardian picker + guardian action buttons, resume ritual, pixel-dialogue Library flow, `/reset` shortcut, and the corrected test counts.
2. "Campus Grove walkthrough (`/town`)": rewrite step 2 to describe the Clock Tower room → Week Board opening on Kai's proposal → approve; step 3 to mention the blocker message box + guardian picker; note `/reset` for quick resets.
3. "Demo walkthrough" (mentor demo section): leave as-is (it describes `/demo`).
4. Keep the honest "not built yet" framing accurate — if the README's status list mentions anything stale, fix it.
5. Add a one-line "Developer shortcuts" note: `http://localhost:5173/reset` wipes the save and session.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README updated to the current system"
```

---

### Task 8: Full verification + manual pass

**Files:** none, unless fixes are needed.

- [ ] **Step 1: Run the whole chain**

Run: `npx tsc -b --force && npx vitest run && npm run build`
Expected: typecheck clean, all tests pass, build succeeds.

- [ ] **Step 2: Manual click-through** — `npm run dev`, then:
1. Open `/reset` (save wiped) then `/game` → title → Enter → Kai intro says "Show me my week" → Town Hall opens.
2. Save commitments → Clock Tower → Week Board opens on Kai's proposal → uncheck a move → destination picker → Approve → Thursday drops.
3. Library → tap a blocker → a dialogue box opens with the guardian opener and plan → Back → pick a different blocker → new box → pick a guardian → Start a Pace Session.
4. In the Session: the chosen guardian's action button works (e.g. Kai splits the checkpoint); Ask {Guardian} help renders.
5. Save partial → return to campus → the HUD resume card speaks as the chosen guardian with task/checkpoint/time/next action → Resume returns to the session.
6. Dock shows no "N waiting" counter; only one guardian dot; title hook is one line.
7. `/reset` returns to `/game` with a fresh save.
- [ ] **Step 3: Commit** — only if Step 2 required fixes (`git add` only touched files; never push). Otherwise record completion with no empty commit.