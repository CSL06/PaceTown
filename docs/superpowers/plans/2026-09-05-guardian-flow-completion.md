# Guardian Flow Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three planned guardian-flow pieces — guardian choice in session prep, guardian-voiced resume ritual, and one real action button per guardian — using existing mechanics only.

**Architecture:** Two pure domain helpers (`effectiveGuardian`, `splitCheckpoint`) carry the testable logic; one nullable state field (`guardianOverride`) records the student's pick; UI work is a picker in Work prep, an action row in Session, and an isolated `ResumeCard` component wired into the existing HUD branch. No new views, routes, or reward mechanics.

**Tech Stack:** React + TypeScript (Vite), Vitest 5 with jsdom + @testing-library/react (already used by `src/game/DemoEntry.test.tsx`).

## Global Constraints

- Domain layer (`src/domain/`) stays pure and deterministic; `src/game/` reads it one-way only.
- No new views, routes, reward mechanics, or workload/rebalance math changes.
- No save migration: the new field is top-level and `loadState` merges `{...fresh, ...parsed}`, so old saves read it as `null`.
- Guardian copy stays plain (1–2 short sentences); the ritual summary shows exactly task, checkpoint, time spent, next action — never missed-day, streak, or history content.
- Verify with `npx tsc -b --force`, `npx vitest run <file>`, and `npm run build` where stated.
- Commit after every task; never push.

---

## File structure

- `src/domain/plans.ts` — gains `effectiveGuardian` + `splitCheckpoint` beside `guardianFor`/`resolveCheckpoint`. One responsibility: blocker→plan→guardian derivation.
- `src/domain/plans.test.ts` — gains one `describe` block for the two helpers.
- `src/game/state.ts` — gains top-level `guardianOverride: GuardianId | null` (interface + `initialState`).
- `src/game/state.test.ts` — new; pins the default and legacy-save behavior.
- `src/game/panels/Loop.tsx` — Work gains the picker + blocker-reset; Session gains effective guardian + action row.
- `src/game/panels/Work.test.tsx`, `src/game/panels/Session.test.tsx` — new; jsdom render tests with stub props.
- `src/game/ResumeCard.tsx` — new isolated component; `src/game/ResumeCard.test.tsx` — new.
- `src/game/Game.tsx` — HUD branch renders `ResumeCard`.
- `src/game/help.ts` — work/session adaptive lines follow the override.

---

### Task 1: Domain helpers `effectiveGuardian` + `splitCheckpoint`

**Files:**
- Modify: `src/domain/plans.ts`
- Test: `src/domain/plans.test.ts` (append one `describe` block; keep existing imports, add `import type { Checkpoint } from './types'` and `effectiveGuardian, splitCheckpoint` to the `./plans` import)

**Interfaces:**
- Consumes: `guardianFor`, `BlockerKind`, `GuardianId`, `Checkpoint` (all already in scope).
- Produces: `effectiveGuardian(blocker: BlockerKind | null, override: GuardianId | null): GuardianId` and `splitCheckpoint(checkpoints: readonly Checkpoint[], id: string): Checkpoint[]`, both imported from `../domain` by Tasks 3–5.

- [ ] **Step 1: Write the failing tests** (append to `src/domain/plans.test.ts`)

```tsx
describe('effectiveGuardian', () => {
  it('follows the blocker routing when nothing is picked', () => {
    expect(effectiveGuardian('unclear_start', null)).toBe('mira')
    expect(effectiveGuardian(null, null)).toBe('kai')
  })

  it('honours an explicit pick over the routing', () => {
    expect(effectiveGuardian('too_large', 'sol')).toBe('sol')
    expect(effectiveGuardian('low_capacity', 'sky')).toBe('sky')
  })
})

describe('splitCheckpoint', () => {
  const one = (): Checkpoint[] => ([
    { id: 'c1', title: 'Do the part', definitionOfDone: 'Done.', estimatedMinutes: 20, status: 'pending' },
  ])

  it('splits minutes across two checkpoints that sum to the original', () => {
    const next = splitCheckpoint(one(), 'c1')
    expect(next).toHaveLength(2)
    expect(next[0].estimatedMinutes + next[1].estimatedMinutes).toBe(20)
    expect(next[1].title).toBe('Do the part (part 2)')
    expect(next[1].status).toBe('pending')
  })

  it('rounds odd minutes without losing any', () => {
    const list: Checkpoint[] = ([
      { id: 'c1', title: 'Do the part', definitionOfDone: 'Done.', estimatedMinutes: 25, status: 'pending' },
    ])
    const next = splitCheckpoint(list, 'c1')
    expect(next[0].estimatedMinutes + next[1].estimatedMinutes).toBe(25)
  })

  it('leaves the list unchanged when the id is unknown', () => {
    expect(splitCheckpoint(one(), 'nope')).toEqual(one())
  })

  it('never mutates the caller’s list', () => {
    const list = one()
    splitCheckpoint(list, 'c1')
    expect(list).toEqual(one())
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/domain/plans.test.ts`
Expected: FAIL with "effectiveGuardian is not defined" (import error) / "splitCheckpoint is not defined".

- [ ] **Step 3: Write minimal implementation** (append to `src/domain/plans.ts`, after `guardianFor`)

```ts
/**
 * The guardian who actually sits with the student: an explicit pick wins,
 * otherwise the blocker routing decides. Null blocker falls back to 'other'.
 */
export function effectiveGuardian(blocker: BlockerKind | null, override: GuardianId | null): GuardianId {
  return override ?? guardianFor(blocker ?? 'other')
}

/**
 * Split one checkpoint into two halves that sum to the original minutes.
 * Unknown ids return the list unchanged; the caller's list is never mutated.
 */
export function splitCheckpoint(checkpoints: readonly Checkpoint[], id: string): Checkpoint[] {
  const index = checkpoints.findIndex((c) => c.id === id)
  if (index === -1) return [...checkpoints]
  const target = checkpoints[index]
  const first = Math.floor(target.estimatedMinutes / 2)
  const firstHalf: Checkpoint = { ...target, estimatedMinutes: first }
  const secondHalf: Checkpoint = {
    ...target,
    id: `c${counter++}`,
    title: `${target.title} (part 2)`,
    estimatedMinutes: target.estimatedMinutes - first,
    status: 'pending',
  }
  return [...checkpoints.slice(0, index), firstHalf, secondHalf, ...checkpoints.slice(index + 1)]
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/domain/plans.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/plans.ts src/domain/plans.test.ts
git commit -m "feat: effectiveGuardian and splitCheckpoint domain helpers"
```

---

### Task 2: `guardianOverride` state field + legacy-save test

**Files:**
- Modify: `src/game/state.ts`
- Test: create `src/game/state.test.ts`

**Interfaces:**
- Consumes: `GuardianId` type from `../domain` (extend the existing type import on state.ts lines 9–13).
- Produces: `GameState.guardianOverride: GuardianId | null`, default `null`, read by Tasks 3–5 as `state.guardianOverride`.

- [ ] **Step 1: Write the failing test** (create `src/game/state.test.ts`)

```tsx
/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { SAVE_KEY, SAVE_VERSION, initialState, loadState } from './state'

beforeEach(() => localStorage.clear())

describe('guardianOverride', () => {
  it('defaults to null — the blocker routing decides', () => {
    expect(initialState().guardianOverride).toBeNull()
  })

  it('reads null on saves written before the field existed', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, blocker: 'too_large' }))
    const loaded = loadState()
    expect(loaded.guardianOverride).toBeNull()
    expect(loaded.blocker).toBe('too_large')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/state.test.ts`
Expected: FAIL with type error / "guardianOverride does not exist" (tsc) or undefined mismatch. Note: vitest uses esbuild (no typecheck), so expect `expected undefined to be null` — undefined !== null, still red, which is correct.

- [ ] **Step 3: Write minimal implementation** (in `src/game/state.ts`)

1. Extend the domain type import with `GuardianId`.
2. In the `GameState` interface, after the `activeTaskId` declaration, add:
```ts
  /** Explicit guardian pick; null follows the blocker routing. */
  guardianOverride: GuardianId | null
```
3. In `initialState()`, after `activeTaskId: null,`, add:
```ts
    guardianOverride: null,
```

No migration: `loadState` returns `{...fresh, ...parsed}`, so a top-level field absent from an old save keeps the fresh `null`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/state.test.ts`
Expected: PASS (2/2).

- [ ] **Step 5: Commit**

```bash
git add src/game/state.ts src/game/state.test.ts
git commit -m "feat: guardianOverride state field with legacy-safe default"
```

---

### Task 3: Guardian picker in Work prep

**Files:**
- Modify: `src/game/panels/Loop.tsx`
- Test: create `src/game/panels/Work.test.tsx`

**Interfaces:**
- Consumes: `effectiveGuardian` (Task 1), `state.guardianOverride` (Task 2), `GUARDIANS` from `../layout` (already imported in Loop.tsx), `GuardianId` type from `../../domain` (Game.tsx line 15 proves the domain index exports it; extend Loop's existing `../../domain` import).
- Produces: picker UI + reset-on-blocker behavior consumed visually by Task 4's Session.

- [ ] **Step 1: Write the failing test** (create `src/game/panels/Work.test.tsx`)

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { DailyLoad, Task } from '../../domain'
import { buildCheckpoints } from '../../domain/plans'
import type { GameState } from '../state'
import { initialState } from '../state'
import { Work } from './Loop'

function propsFor(over: Partial<GameState> = {}) {
  const state: GameState = {
    ...initialState(),
    blocker: 'unclear_start',
    checkpoints: buildCheckpoints('unclear_start', { taskTitle: 'ERD' }),
    ...over,
  }
  state.activeCheckpointId = state.checkpoints[0].id
  const load = {
    percentage: 108,
    contributors: [{ task: { id: 't1', title: 'ERD', estimatedMinutes: 120 } as unknown as Task, weighted: 1 }],
  } as unknown as DailyLoad
  let current = state
  const update = (fn: (s: GameState) => GameState) => { current = fn(current) }
  return { state: () => current, load, update, go: vi.fn(), toast: vi.fn() }
}

describe('guardian picker', () => {
  it('pre-selects the routed guardian and switches on click', () => {
    const p = propsFor()
    const { rerender } = render(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByRole('button', { name: /mira/i })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /sol/i }))
    expect(p.state().guardianOverride).toBe('sol')
    rerender(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByRole('button', { name: /sol/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
```

Note: `toHaveAttribute` needs jest-dom matchers. If `@testing-library/jest-dom` is not installed, replace those two assertions with `expect(btn.getAttribute('aria-pressed')).toBe('true')`. Check `package.json` first and use whichever works — do not add dependencies.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/panels/Work.test.tsx`
Expected: FAIL — no "Choose your guardian" group exists.

- [ ] **Step 3: Write minimal implementation** (in `src/game/panels/Loop.tsx`, `Work`)

1. Extend the `../../domain` import with `effectiveGuardian` and `type GuardianId`.
2. In the blocker option `onClick` (the `update((s) => ({ ...s, blocker: b.id, ... }))` handler), add `guardianOverride: null,` so a new blocker re-routes.
3. After the checkpoint rewrite fields and before the `<div className="actions">` containing the Start button, insert:

```tsx
          <div className="field">
            <span className="eyebrow">Work with</span>
            <div className="opts" role="group" aria-label="Choose your guardian">
              {(Object.keys(GUARDIANS) as GuardianId[]).map((id) => (
                <button key={id} className="opt" type="button"
                  aria-pressed={effectiveGuardian(state.blocker, state.guardianOverride) === id}
                  onClick={() => update((s) => ({ ...s, guardianOverride: id }))}>
                  <span>{GUARDIANS[id].name}<small>{GUARDIANS[id].role}</small></span>
                </button>
              ))}
            </div>
          </div>
```

4. Change the Start button label from `{GUARDIANS[PLAN_TEMPLATES[state.blocker].guardian].name}` to `{GUARDIANS[effectiveGuardian(state.blocker, state.guardianOverride)].name}`. (`state.blocker` is non-null in this branch.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/panels/Work.test.tsx`
Expected: PASS. Then `npx tsc -b --force` clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/panels/Loop.tsx src/game/panels/Work.test.tsx
git commit -m "feat: guardian picker in Work prep with routed default"
```

---

### Task 4: Session follow-through + guardian action row + help adaptive

**Files:**
- Modify: `src/game/panels/Loop.tsx`, `src/game/help.ts`
- Test: create `src/game/panels/Session.test.tsx`; extend `src/game/help.test.ts` (uses its existing `base()` and `fakeLoad()` helpers — read the top of that file first and match their shape)

**Interfaces:**
- Consumes: `effectiveGuardian`, `splitCheckpoint` (Task 1); `state.guardianOverride` (Task 2).
- Produces: Session driven by the chosen guardian; help adaptive lines honoring the override (Task 5 reads nothing new).

- [ ] **Step 1: Write the failing tests**

`src/game/panels/Session.test.tsx` (new; same stub pattern as Task 3, but render `<Session>` with a `load` stub of `{ percentage: 91, contributors: [] } as unknown as DailyLoad`):

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { DailyLoad } from '../../domain'
import { buildCheckpoints } from '../../domain/plans'
import type { GameState } from '../state'
import { initialState } from '../state'
import { Session } from './Loop'

function propsFor(over: Partial<GameState> = {}) {
  const state: GameState = {
    ...initialState(),
    blocker: 'unclear_start',
    checkpoints: buildCheckpoints('unclear_start', { taskTitle: 'ERD' }),
    ...over,
  }
  state.activeCheckpointId = state.checkpoints[0].id
  const load = { percentage: 91, contributors: [] } as unknown as DailyLoad
  let current = state
  const update = (fn: (s: GameState) => GameState) => { current = fn(current) }
  return { state: () => current, load, update, go: vi.fn(), toast: vi.fn() }
}

describe('chosen guardian in Session', () => {
  it('asks the overridden guardian and offers their action', () => {
    const p = propsFor({ guardianOverride: 'sol' })
    render(<Session state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByText(/ask sol/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /shrink to a 5-minute step/i }))
    expect(p.state().checkpoints[0].estimatedMinutes).toBe(5)
  })

  it('defaults to the routed guardian with their action', () => {
    const p = propsFor()
    render(<Session state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByText(/ask mira/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /draft outline into scratchpad/i })).toBeInTheDocument()
  })
})
```

In `src/game/help.test.ts`, append (do not touch existing tests):

```tsx
  it('work names the chosen guardian when overridden', () => {
    expect(adaptiveLine('work', base({ blocker: 'too_large', guardianOverride: 'sol' }), fakeLoad(91))).toContain('Sol')
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/game/panels/Session.test.tsx src/game/help.test.ts`
Expected: FAIL — Session still asks the routed guardian with no action row; help adaptive ignores the override.

- [ ] **Step 3: Write minimal implementation**

In `src/game/panels/Loop.tsx`, `Session`:
1. Change `const guardian = guardianFor(state.blocker)` to `const guardian = effectiveGuardian(state.blocker, state.guardianOverride)`.
2. Change the `guideLines(state.blocker, help, guideCtx, guardianFor(state.blocker))` call to pass `guardian`.
3. After the Ask-help block closes and before the `<div className="eyebrow" style={{ marginTop: 20 }}>Stuck? These are always available</div>` line, insert:

```tsx
      <div className="eyebrow" style={{ marginTop: 18 }}>{GUARDIANS[guardian].name}’s action</div>
      <div className="actions">
        {guardian === 'mira' && (
          <button className="secondary" type="button" onClick={() => {
            const lines = (state.deliverables.length ? state.deliverables : ['Smallest visible piece first'])
              .map((d) => `- ${d}`)
            update((s) => ({
              ...s,
              session: { ...s.session, scratchpad: [s.session.scratchpad.trim(), `Outline for “${sessionTask?.title ?? 'this task'}”:\n${lines.join('\n')}`].filter(Boolean).join('\n\n') },
            }))
            toast('Outline drafted — edit freely.')
          }}>Draft outline into scratchpad</button>
        )}
        {guardian === 'kai' && (
          <button className="secondary" type="button" disabled={active.estimatedMinutes < 10}
            title={active.estimatedMinutes < 10 ? 'Too small to split further' : undefined}
            onClick={() => {
              update((s) => ({ ...s, checkpoints: splitCheckpoint(s.checkpoints, active.id) }))
              toast('Checkpoint split in two.')
            }}>Split checkpoint in two</button>
        )}
        {guardian === 'sol' && (
          <button className="secondary" type="button" onClick={() => {
            update((s) => ({ ...s, checkpoints: s.checkpoints.map((c) => c.id === active.id ? { ...c, estimatedMinutes: 5 } : c) }))
            toast('Shrunk to a 5-minute step.')
          }}>Shrink to a 5-minute step</button>
        )}
        {guardian === 'sky' && (
          <button className="secondary" type="button" onClick={() => {
            update((s) => ({ ...s, session: { ...s.session, timerMode: 'up', elapsedSec: 0 } }))
            toast('Sky sits with you — press Start timer when ready.')
          }}>Sit with me — start together</button>
        )}
        {guardian === 'goh' && (
          <button className="secondary" type="button" onClick={() => {
            const id = `manual-${Date.now()}`
            update((s) => ({ ...s, checkpoints: [...s.checkpoints, {
              id, title: 'Gather what is missing',
              definitionOfDone: 'A short list of every missing item.',
              estimatedMinutes: 10, status: 'pending' as const,
            }] }))
            toast('Gathering step added.')
          }}>Add gathering checklist</button>
        )}
      </div>
```

4. Extend the `../../domain` import with `splitCheckpoint` and `effectiveGuardian` (`guardianFor` stays — the Work template opener still uses it).
5. In `src/game/help.ts`, in the `work` and `session` adaptive functions only, replace `guardianFor(s.blocker)` with `effectiveGuardian(s.blocker, s.guardianOverride)` and add `effectiveGuardian` to the domain import. Leave all copy untouched.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/panels/Session.test.tsx src/game/help.test.ts`
Expected: PASS. Then `npx tsc -b --force` clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/panels/Loop.tsx src/game/panels/Session.test.tsx src/game/help.ts src/game/help.test.ts
git commit -m "feat: session follows chosen guardian plus guardian action row"
```

---

### Task 5: Guardian-voiced resume ritual (`ResumeCard` + HUD wiring)

**Files:**
- Create: `src/game/ResumeCard.tsx`
- Create: `src/game/ResumeCard.test.tsx`
- Modify: `src/game/Game.tsx` (HUD branch only)

**Interfaces:**
- Consumes: `effectiveGuardian` (Task 1); `GUARDIANS`, `ViewId` from `./layout`; `GameState` from `./state`; `Guardian` from `./panels/Guardian` (props `{ who, says }`, as used in Loop.tsx).
- Produces: ritual card used by the HUD; no other consumers.

- [ ] **Step 1: Write the failing test** (create `src/game/ResumeCard.test.tsx`)

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { buildCheckpoints } from '../domain/plans'
import type { Task } from '../domain'
import type { GameState } from './state'
import { initialState } from './state'
import { ResumeCard } from './ResumeCard'

function stub(): { state: GameState; go: ReturnType<typeof vi.fn> } {
  const state: GameState = {
    ...initialState(),
    blocker: 'unclear_start',
    checkpoints: buildCheckpoints('unclear_start', { taskTitle: 'ERD' }),
    tasks: [{ id: 't1', title: 'ERD' } as unknown as Task],
    activeTaskId: 't1',
    nextAction: 'Read the brief once',
  }
  state.activeCheckpointId = state.checkpoints[0].id
  state.session.elapsedSec = 150
  return { state, go: vi.fn() }
}

describe('ResumeCard', () => {
  it('summarises task, checkpoint, time spent and next action in the guardian’s voice', () => {
    const { state, go } = stub()
    render(<ResumeCard state={state} go={go} />)
    expect(screen.getByText('Mira')).toBeInTheDocument()
    expect(screen.getByText('ERD')).toBeInTheDocument()
    expect(screen.getByText(state.checkpoints[0].title)).toBeInTheDocument()
    expect(screen.getByText(/2 min so far/)).toBeInTheDocument()
    expect(screen.getByText(/Next action: Read the brief once/)).toBeInTheDocument()
  })

  it('offers resume, edit plan and something else', () => {
    const { state, go } = stub()
    render(<ResumeCard state={state} go={go} />)
    fireEvent.click(screen.getByRole('button', { name: /^resume$/i }))
    expect(go).toHaveBeenCalledWith('session')
    fireEvent.click(screen.getByRole('button', { name: /edit plan/i }))
    expect(go).toHaveBeenCalledWith('work')
    fireEvent.click(screen.getByRole('button', { name: /something else/i }))
    expect(go).toHaveBeenCalledWith('townlist')
  })

  it('names the overridden guardian and an empty next action honestly', () => {
    const { state, go } = stub()
    state.guardianOverride = 'sol'
    state.nextAction = '   '
    render(<ResumeCard state={state} go={go} />)
    expect(screen.getByText('Sol')).toBeInTheDocument()
    expect(screen.getByText(/no next action saved yet/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/ResumeCard.test.tsx`
Expected: FAIL with "Failed to resolve import './ResumeCard'".

- [ ] **Step 3: Write minimal implementation** (create `src/game/ResumeCard.tsx`)

```tsx
/**
 * The guardian-voiced resume ritual: task, checkpoint, time spent and next
 * action, with resume / edit / something-else. No shame or history content.
 */
import { effectiveGuardian } from '../domain'
import { GUARDIANS, type ViewId } from './layout'
import { Guardian } from './panels/Guardian'
import type { GameState } from './state'

function fmtSpent(totalSec: number): string {
  const minutes = Math.floor(Math.max(0, totalSec) / 60)
  return minutes < 1 ? 'just opened' : `${minutes} min so far`
}

export function ResumeCard({ state, go }: { state: GameState; go: (view: ViewId | null) => void }) {
  const guardian = effectiveGuardian(state.blocker, state.guardianOverride)
  const checkpoint = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const task = state.tasks.find((t) => t.id === state.activeTaskId)
  const next = state.nextAction.trim()
  return (
    <div>
      <div className="eyebrow">Where you left off</div>
      <Guardian who={guardian} says={`Back to “${task?.title ?? 'your task'}”.`} />
      <p><b>{checkpoint?.title ?? 'Your checkpoint'}</b> · {fmtSpent(state.session.elapsedSec)}</p>
      <p>{next ? `Next action: ${next}` : 'No next action saved yet.'}</p>
      <div className="qa">
        <button className="go" type="button" onClick={() => go('session')}>Resume</button>
        <button type="button" onClick={() => go('work')}>Edit plan</button>
        <button type="button" onClick={() => go('townlist')}>Something else</button>
      </div>
    </div>
  )
}
```

Then in `src/game/Game.tsx`, in the HUD branch that currently renders the "Where you left off" card (`activeCheckpoint && !state.outcome`), replace the branch body with `<ResumeCard state={state} go={go} />`, keeping the branch condition untouched. Add `import { ResumeCard } from './ResumeCard'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/ResumeCard.test.tsx`
Expected: PASS. Then `npx tsc -b --force` clean.

- [ ] **Step 5: Commit**

```bash
git add src/game/ResumeCard.tsx src/game/ResumeCard.test.tsx src/game/Game.tsx
git commit -m "feat: guardian-voiced resume ritual card"
```

---

### Task 6: Full verification + click-through

**Files:** none, unless fixes are needed.

- [ ] **Step 1: Run the whole chain**

Run: `npx tsc -b --force && npx vitest run && npm run build`
Expected: typecheck clean, all tests pass, build succeeds.

- [ ] **Step 2: Manual click-through** — `npm run dev`, open `/game`, reset data, and confirm: Work prep shows the picker pre-selected to the routed guardian; switching guardian then Start shows the chosen guardian in Session with their action button; each action button does its labeled thing; save partial, leave, return to town — the HUD card speaks in the chosen guardian's voice with task, checkpoint, time, next action; Resume / Edit plan / Something else each land correctly; no console errors.
- [ ] **Step 3: Commit** — only if Step 2 required fixes (`git add` only touched files; never push). Otherwise record completion with no empty commit.
