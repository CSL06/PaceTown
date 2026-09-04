# First-time `?` Help and Plain-language Guardians Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every game panel gets a `?` popup explaining what is going on and which guardian helps there, and all guardian lines speak in short plain sentences a first-time player understands.

**Architecture:** New `src/game/help.ts` holds all explainer copy plus five small adaptive-line functions behind a crash-safe wrapper; new `src/game/panels/HelpDot.tsx` renders the `?` button and popup and is inserted as one line per panel card. Guardian rewrites edit existing strings in place; no new state, no migration.

**Tech Stack:** React + TypeScript (Vite), vitest 5, existing `game.css` patterns only.

## Global Constraints

- Commit after every task, never push (local commits on `main` only).
- Domain layer (`src/domain/`) stays pure/deterministic; `src/game/` only reads it (one-way imports).
- No new persisted state and no save migration.
- No first-visit auto-popups; `?` opens only on tap.
- Popup styling reuses verified `game.css` variables only (`--accent`, `--edge`, `--edge-hi`, `--dim`, `--faint`, `--sunk`, `--mono`).
- Verify with `npx tsc -b --force`, `npx vitest run <file>`, and `npm run build` where stated.

---

### Task 1: Help content module (`src/game/help.ts` + test)

**Files:**
- Create: `src/game/help.ts`
- Create: `src/game/help.test.ts`

**Interfaces:**
- Consumes: `BLOCKERS`, `DEMO_DESTINATION`, `guardianFor`, `proposeRebalance`, `wakingMinutes`, type `DailyLoad` from `../domain`; `GUARDIANS` and type `ViewId` from `./layout`; type `GameState` from `./state` (type-only, no runtime cycle).
- Produces: `HelpContent`, `HelpGuardian`, `HELP: Record<ViewId, HelpContent>`, `adaptiveLine(view, state, load): string | null` — consumed by Tasks 2–6.

- [ ] **Step 1: Write the failing test `src/game/help.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { demoTasks, type DailyLoad } from '../domain'
import type { GameState } from './state'
import { HELP, adaptiveLine } from './help'
import { GUARDIANS, type ViewId } from './layout'

const EXPECTED_VIEWS: readonly ViewId[] = [
  'intake', 'understand', 'rebalance', 'work', 'session',
  'recover', 'ripples', 'pocket', 'firefly', 'chime', 'warmcup', 'lanterns',
  'keepsakes', 'collection', 'journal', 'council', 'mailbox', 'calm', 'home',
  'backpack', 'garden', 'load', 'townlist', 'briefing', 'preview',
]

const base = (over: Partial<GameState> = {}) =>
  ({
    blocker: null, checkpoints: [], activeCheckpointId: null, activeTaskId: null,
    tasks: demoTasks(),
    capacity: { wakeHour: 8, sleepHour: 23, energy: null, stress: null, sleepHours: null },
    outcome: null, questOutcome: null, rebalanceSeen: false, ...over,
  }) as GameState

const fakeLoad = (percentage: number) => ({ percentage }) as DailyLoad

describe('HELP', () => {
  it('covers every view', () => {
    expect(Object.keys(HELP).sort()).toEqual([...EXPECTED_VIEWS].sort())
  })

  it('names only real guardians', () => {
    for (const h of Object.values(HELP)) {
      expect(Object.keys(GUARDIANS)).toContain(h.guardian.who)
      expect(h.what.length).toBeGreaterThan(10)
      expect(h.how.length).toBeGreaterThan(10)
      expect(h.guardian.why.length).toBeGreaterThan(10)
    }
  })

  it('adaptive lines never throw and return text or null', () => {
    for (const v of EXPECTED_VIEWS) {
      let out: string | null = null
      expect(() => { out = adaptiveLine(v, base(), fakeLoad(108)) }).not.toThrow()
      expect(out === null || typeof out === 'string').toBe(true)
    }
  })

  it('work names the guardian once a blocker is picked', () => {
    expect(adaptiveLine('work', base({ blocker: 'too_large' }), fakeLoad(91))).toContain('Kai')
    expect(adaptiveLine('work', base(), fakeLoad(91))).toContain('No blocker picked yet')
  })

  it('survives an empty state object', () => {
    expect(adaptiveLine('session', {} as GameState, {} as DailyLoad)).toBeNull()
  })

  it('rebalance describes the real proposal', () => {
    expect(adaptiveLine('rebalance', base(), fakeLoad(108))).toMatch(/Kai can move|Nothing can safely move/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/help.test.ts`
Expected: FAIL with "Failed to resolve import './help'" (file does not exist yet).

- [ ] **Step 3: Write minimal implementation `src/game/help.ts`**

```ts
/**
 * First-time explainer copy: one `?` popup per view.
 *
 * Fixed core per view (what / how / which guardian and why) plus one live
 * line where it changes a decision. Game words are explained inline:
 * a checkpoint is one small step with a clear finish line; rebalance means
 * moving flexible work to another day with your approval.
 */

import {
  BLOCKERS, DEMO_DESTINATION, guardianFor, proposeRebalance, wakingMinutes,
  type DailyLoad,
} from '../domain'
import { GUARDIANS, type ViewId } from './layout'
import type { GameState } from './state'
import type { GuardianId } from '../domain'

export interface HelpGuardian {
  who: GuardianId
  why: string
}

export interface HelpContent {
  title: string
  what: string
  how: string
  guardian: HelpGuardian
  adaptive?: (state: GameState, load: DailyLoad) => string | null
}

const name = (g: GuardianId) => GUARDIANS[g].name

export const HELP: Record<ViewId, HelpContent> = {
  intake: {
    title: 'Town Hall',
    what: 'Your week, typed in plain words, turned into a list of commitments.',
    how: 'Edit the text, review it as an editable list, then save. Nothing saves until you approve it.',
    guardian: { who: 'kai', why: 'Kai plans time. He reads this list to tell you what Thursday holds.' },
  },
  understand: {
    title: 'Understand',
    what: 'Why Thursday reads the way it does: every flexible task with its maths.',
    how: 'Read the rows, then choose “See what can move”. Nothing has changed yet.',
    guardian: { who: 'kai', why: 'Kai reads these numbers. He will say what can move.' },
    adaptive: (_s, load) => `Thursday reads ${load.percentage.toFixed(1)}%. Over 100 means more planned than fits — never a grade.`,
  },
  rebalance: {
    title: 'Rebalance Workshop',
    what: 'Kai’s proposal to move flexible work to Saturday. Locked times stay; deadlines hold.',
    how: 'Uncheck moves to preview the result, then approve or reject. Reject leaves the week untouched.',
    guardian: { who: 'kai', why: 'Kai wrote this proposal. He never moves anything without your approval.' },
    adaptive: (s) => {
      if (s.rebalanceSeen) return 'You already decided this. What is left is real work in the Library.'
      const p = proposeRebalance(s.tasks, { day: 'thu', destination: DEMO_DESTINATION, waking: wakingMinutes(s.capacity) })
      return p.moves.length === 0
        ? 'Nothing can safely move. Continue to the Library.'
        : `Kai can move ${p.moves.length} ${p.moves.length === 1 ? 'thing' : 'things'}. Uncheck any move to preview.`
    },
  },
  work: {
    title: 'Library · Choose the work',
    what: 'Pick what blocks you, and get a small plan of checkpoints. A checkpoint is one small step with a clear finish line.',
    how: 'Choose a blocker, pick a checkpoint, then start a Pace Session. Every word stays editable.',
    guardian: { who: 'mira', why: 'Mira untangles study knots. Your blocker choice may call a different guardian — the live line says who.' },
    adaptive: (s) => {
      if (!s.blocker) return 'No blocker picked yet. Choosing one calls the right guardian.'
      const b = BLOCKERS.find((x) => x.id === s.blocker)
      return `${name(guardianFor(s.blocker))} is with you here: you picked “${b?.label ?? s.blocker}”.`
    },
  },
  session: {
    title: 'Pace Session',
    what: 'One checkpoint, one optional timer, one scratchpad. The timer never completes work — only you can.',
    how: 'Ask the guardian, write what changed and the easiest next action, then save and leave.',
    guardian: { who: 'mira', why: 'A guardian sits with you. Your blocker decides which one — the live line says who.' },
    adaptive: (s) => {
      if (!s.blocker) return 'Pick a checkpoint in the Library first. Sessions attach to one checkpoint.'
      const g = name(guardianFor(s.blocker))
      const c = s.checkpoints.find((x) => x.id === s.activeCheckpointId)
      return c ? `${g} is with you. Current checkpoint: “${c.title}”.` : `${g} is with you. Choose a checkpoint in the Library to begin.`
    },
  },
  recover: {
    title: 'Recover',
    what: 'Two equal ways to pause: something here, or something away from the screen. Neither earns more.',
    how: 'Pick Gentle Ripples or Pocket of Green — or choose Not now. Declining costs nothing.',
    guardian: { who: 'sol', why: 'Sol keeps effort sustainable. Pausing is a complete result here.' },
  },
  ripples: {
    title: 'Gentle Ripples',
    what: 'A paced sensory pause at the fountain. No score, no failure state.',
    how: 'Tap the water, say how it feels, then choose where to return.',
    guardian: { who: 'sol', why: 'Sol hosts this water. Achieving nothing here is the point.' },
  },
  pocket: {
    title: 'Pocket of Green',
    what: 'A short calm reset with something green. Outside, window, plant, or picture — all four count the same.',
    how: 'Choose a setting, confirm by your word or an optional photo, then complete.',
    guardian: { who: 'sol', why: 'Sol keeps this equal for every setting. No path earns more.' },
  },
  firefly: {
    title: 'Firefly Stories',
    what: 'Five lights, five short readings about rest and starting. Follow one or skip them all.',
    how: 'Read or skip, place one glow, then choose where to return.',
    guardian: { who: 'mira', why: 'Mira gathered these readings. One small idea is enough.' },
  },
  chime: {
    title: 'Chime Drift',
    what: 'Slow notes drift past a clock hand. Tap them or simply watch — timing is never scored.',
    how: 'Tap, press Space, or watch. Leave whenever you are ready.',
    guardian: { who: 'kai', why: 'Kai keeps this pace slow. There is nothing to be late for.' },
  },
  warmcup: {
    title: 'Warm Cup',
    what: 'Choose a drink, pour, stir, and sit by the window. The sequence cannot be ruined.',
    how: 'Follow the steps in any order that feels right. No wrong moves exist here.',
    guardian: { who: 'sky', why: 'Sky sits with you while the cup is made. Company, not instruction.' },
  },
  lanterns: {
    title: 'Night Lanterns',
    what: 'Choose a symbol for what is on your mind and place a lantern. Words stay private and optional.',
    how: 'Pick a symbol, light the lantern, place it. That is the whole activity.',
    guardian: { who: 'goh', why: 'Goh finishes small things. Naming the concern is the finish here.' },
  },
  keepsakes: {
    title: 'Pace Keepsakes',
    what: 'Turn a Pocket photo into a private pixel-art memory. Optional — the quest already counted.',
    how: 'Choose a photo treatment, name it, keep it. This changes no reward.',
    guardian: { who: 'sol', why: 'Sol keeps memories pressure-free. Keep one only if you want one.' },
  },
  collection: {
    title: 'Keepsake Collection',
    what: 'Your private grid of kept memories. Nothing here is shared or scored.',
    how: 'Look back whenever you like. Returning to town is always one tap away.',
    guardian: { who: 'sol', why: 'Sol tends this shelf. It only ever grows.' },
  },
  journal: {
    title: 'Journal',
    what: 'What Thursday actually held, written automatically from real events. No streaks, no guilt.',
    how: 'Read back any time. Your saved next action waits at the bottom after a session.',
    guardian: { who: 'mira', why: 'Mira keeps study notes honest. This log never judges.' },
  },
  council: {
    title: 'Guardian Council',
    what: 'Three guardians read the same numbers you can see and propose one next step. You decide.',
    how: 'Read the voices, pick the recommendation or choose for yourself. The bell changes nothing by itself.',
    guardian: { who: 'kai', why: 'Kai chairs the numbers. All three speak, then you decide.' },
    adaptive: (s, load) => {
      const rec = load.percentage > 95 ? 'Make space' : s.outcome && !s.questOutcome ? 'Recover first' : 'Do one checkpoint'
      return `Right now the Council leans: ${rec}.`
    },
  },
  mailbox: {
    title: 'Future Mailbox',
    what: 'Send a next action to your future self. It waits instead of nagging.',
    how: 'Write the note, put it in the mailbox. Read waiting notes any time.',
    guardian: { who: 'sky', why: 'Sky keeps this pressure-free. Notes wait; nothing nags.' },
  },
  calm: {
    title: 'Calm Corner',
    what: 'All five recovery activities with no prerequisites. No load score needed.',
    how: 'Pick any activity. Leaving early is always valid.',
    guardian: { who: 'sol', why: 'Sol keeps every door here open. Rest needs no permission.' },
  },
  home: {
    title: 'Home',
    what: 'Quiet Mode, the Exit Quest, and your local data. Stopping is a valid outcome.',
    how: 'Toggle comfort settings, close the day on purpose, or export and delete your data.',
    guardian: { who: 'sol', why: 'Sol keeps stopping valid. Nothing is lost by being away.' },
  },
  backpack: {
    title: 'Backpack',
    what: 'Your Thursday load shown as carried items: locked or flexible. It never bursts.',
    how: 'Bring one item into a session, or move one to Saturday through rebalancing.',
    guardian: { who: 'kai', why: 'Kai reads carried loads. Lighter is a plan, not a grade.' },
  },
  garden: {
    title: 'Recovery Garden',
    what: 'Growth from steady choices: progress, recovery, honest rescheduling, asking for help. Never wilts.',
    how: 'Keep playing gently. Being away never removes anything.',
    guardian: { who: 'sol', why: 'Sol tends this plot. Growth here never decays.' },
  },
  load: {
    title: 'Daily Load',
    what: 'The full Thursday calculation plus Load Weather per place. Every effect has a text equivalent.',
    how: 'Read the maths, then act in the Library or Clock Tower.',
    guardian: { who: 'kai', why: 'Kai owns these numbers. Ask him what can move.' },
  },
  townlist: {
    title: 'Town List',
    what: 'Every place in town, listed. Nothing requires finding things by walking.',
    how: 'Pick a destination to walk there and open it.',
    guardian: { who: 'mira', why: 'Mira makes sure you never get lost.' },
  },
  briefing: {
    title: 'Daily Briefing',
    what: 'Waking hours plus an optional check-in: energy and stress, 1–5, skippable.',
    how: 'Set what you know, skip the rest. This is preference, never diagnosis.',
    guardian: { who: 'sol', why: 'Sol reads capacity gently. Low energy gets smaller plans.' },
  },
  preview: {
    title: 'Preview district',
    what: 'A district that is not yet playable, with a clear return path.',
    how: 'Follow the return path to Gentle Ripples or back to campus.',
    guardian: { who: 'sol', why: 'Sol hosts Gentle Ripples, the fully playable pause this points to.' },
  },
}

/** Crash-safe live line. Unknown views and failing adaptives yield null (static text only). */
export function adaptiveLine(view: ViewId, state: GameState, load: DailyLoad): string | null {
  try {
    return HELP[view]?.adaptive?.(state, load) ?? null
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/game/help.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Run typecheck**

Run: `npx tsc -b --force`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/game/help.ts src/game/help.test.ts
git commit -m "feat: first-time help copy module with crash-safe adaptive lines"
```

---

### Task 2: `HelpDot` component and popup styles

**Files:**
- Create: `src/game/panels/HelpDot.tsx`
- Modify: `src/game/game.css` (append new block at end)

**Interfaces:**
- Consumes: `HELP`, `adaptiveLine`, type `HelpContent` from Task 1; types `ViewId`, `GameState`, `DailyLoad`.
- Produces: `HelpDot({ view, state, load })` — consumed by Tasks 3–6.

- [ ] **Step 1: Append styles to `src/game/game.css`** (read the file end first to match formatting; if any variable below is missing from `:root`, substitute the closest verified one: text `--dim`, edge `--edge`, accent `--accent`, sunk `--sunk`)

```css
.helpdot-wrap { position: relative; display: inline-block; margin-left: 8px; vertical-align: middle }
.helpdot { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--edge-hi); background: var(--sunk); color: var(--dim); font-size: 12px; cursor: pointer; padding: 0; line-height: 1 }
.helpdot:hover { border-color: var(--accent); color: var(--accent) }
.helppop { position: absolute; z-index: 30; top: 26px; right: 0; width: min(300px, 70vw); display: flex; flex-direction: column; gap: 8px; background: var(--sunk); border: 1px solid var(--edge-hi); border-radius: 10px; padding: 12px 14px; font-size: 12.5px; color: var(--dim); box-shadow: 0 8px 24px rgba(0,0,0,.35); text-transform: none; letter-spacing: normal }
.helppop b { font-size: 13px }
.helpguide { color: var(--accent) }
.helplive { border-top: 1px solid var(--edge); padding-top: 8px }
```

- [ ] **Step 2: Create `src/game/panels/HelpDot.tsx`**

```tsx
/** First-time `?`: what this screen is, what to do, which guardian helps and why. */
import { useEffect, useRef, useState } from 'react'
import type { DailyLoad } from '../../domain'
import { HELP, adaptiveLine, type HelpContent } from '../help'
import type { ViewId } from '../layout'
import type { GameState } from '../state'

export function HelpDot({ view, state, load }: { view: ViewId; state: GameState; load: DailyLoad }) {
  const content = (HELP as Partial<Record<ViewId, HelpContent>>)[view]
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!content) return null
  const live = adaptiveLine(view, state, load)
  const who = content.guardian.who.charAt(0).toUpperCase() + content.guardian.who.slice(1)

  return (
    <span className="helpdot-wrap" ref={box}>
      <button type="button" className="helpdot" aria-expanded={open}
        aria-label={`What is ${content.title}?`} onClick={() => setOpen((o) => !o)}>?</button>
      {open && (
        <span className="helppop" role="dialog" aria-label={content.title}>
          <b>{content.title}</b>
          <span>{content.what}</span>
          <span>{content.how}</span>
          <span className="helpguide">{who}: {content.guardian.why}</span>
          {live && <span className="helplive">{live}</span>}
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc -b --force`
Expected: clean (no test file for the component — no DOM test harness exists in this repo).

- [ ] **Step 4: Commit**

```bash
git add src/game/panels/HelpDot.tsx src/game/game.css
git commit -m "feat: reusable HelpDot ? popup component and styles"
```

---

### Task 3: `?` in the core loop panels (`Loop.tsx`)

**Files:**
- Modify: `src/game/panels/Loop.tsx`

**Interfaces:**
- Consumes: `HelpDot` from Task 2.
- Produces: `?` on Intake, Understand, Rebalance (all 3 states), Work (both states), Session (both states).

Insertion rule (same everywhere): append ` <HelpDot view="<id>" state={state} load={load} />` inside the card's first `<h2>`. Add `load` to destructured props where missing (Intake only: change `({ state, update, go, toast }: PanelProps)` to `({ state, load, update, go, toast }: PanelProps)`). Add `import { HelpDot } from './HelpDot'`.

- [ ] **Step 1: Intake** — in `<h2>Say what your week holds</h2>` make it `<h2>Say what your week holds <HelpDot view="intake" state={state} load={load} /></h2>`, plus the destructure and import changes.
- [ ] **Step 2: Understand** — `<h2>Thursday is at {fmt(load.percentage)}%</h2>` gains ` <HelpDot view="understand" state={state} load={load} />` before `</h2>`.
- [ ] **Step 3: Rebalance seen-state** — `<h2>Thursday is now {fmt(load.percentage)}%</h2>` gains the dot with `view="rebalance"`. Empty-state `<h2>Nothing can safely move</h2>` likewise. Main `<h2>Kai has a proposal</h2>` likewise.
- [ ] **Step 4: Work** — empty-state `<h2>No flexible work left on Thursday</h2>` gains `view="work"`; main `<h2>{task.title}</h2>` gains it too.
- [ ] **Step 5: Session** — empty-state `<h2>Pick a checkpoint first</h2>` and main `<h2>One checkpoint at a time</h2>` gain `view="session"`.
- [ ] **Step 6: Verify** — `npx tsc -b --force` clean; `Select-String -Path src/game/panels/Loop.tsx -Pattern 'HelpDot view='` shows 9 insertions.
- [ ] **Step 7: Commit**

```bash
git add src/game/panels/Loop.tsx
git commit -m "feat: ? explainers across Intake, Understand, Rebalance, Work, Session"
```

---

### Task 4: `?` in Places panels, part 1 (Briefing, Council, Recover, Journal, Backpack, Garden)

**Files:**
- Modify: `src/game/panels/Places.tsx`

**Interfaces:**
- Consumes: `HelpDot` from Task 2.

Same insertion rule: append ` <HelpDot view="<id>" state={state} load={load} />` inside the card's first `<h2>`; add missing `load`/`state` to destructures (`Journal({ state, go })` → `({ state, load, go }: PanelProps)`; `Backpack({ state, go })` → `({ state, load, go }: PanelProps)`; `Garden({ state, go })` → `({ state, load, go }: PanelProps)`); add the import.

- [ ] **Step 1: Briefing** — first `<h2>` in `Briefing` gains `view="briefing"`.
- [ ] **Step 2: Council** — `<h2>Three guardians, one recommendation</h2>` gains `view="council"`.
- [ ] **Step 3: Recover recorded-state** — `<h2>Recovery recorded</h2>` gains `view="recover"`; paused-state `<h2>Your session is on hold</h2>` likewise; main `<h2>Two ways to pause</h2>` likewise.
- [ ] **Step 4: Journal** — `<h2>What Thursday actually held</h2>` gains `view="journal"` (plus destructure change).
- [ ] **Step 5: Backpack** — `<h2>What you are carrying</h2>` gains `view="backpack"` (plus destructure change).
- [ ] **Step 6: Garden** — `<h2>{stages[state.gardenGrowth]}</h2>` gains `view="garden"` (plus destructure change).
- [ ] **Step 7: Verify** — `npx tsc -b --force` clean; `Select-String` shows 8 insertions in `Places.tsx`.
- [ ] **Step 8: Commit**

```bash
git add src/game/panels/Places.tsx
git commit -m "feat: ? explainers in Briefing, Council, Recover, Journal, Backpack, Garden"
```

---

### Task 5: `?` in Places part 2, Pocket, and Ripples

**Files:**
- Modify: `src/game/panels/Places.tsx`, `src/game/panels/Pocket.tsx`, `src/game/panels/Ripples.tsx`

**Interfaces:**
- Consumes: `HelpDot` from Task 2.

- [ ] **Step 1: Places part 2** — same rule. `Mailbox({ state, update, toast })` → add `load` to destructure; first `<h2>` gains `view="mailbox"`. Home main `<h2>Stopping is a valid outcome</h2>` gains `view="home"`. `TownList({ update, go })` → add `state, load`; `<h2>Town List</h2>` gains `view="townlist"`. `Calm({ go })` → add `state, load`; `<h2>Regulation without prerequisites</h2>` gains `view="calm"`. `Preview({ go })` → add `state, load`; `<h2>Not yet playable</h2>` gains `view="preview"`. LoadPanel: open the file, find `export function LoadPanel`, append the dot with `view="load"` inside its first `<h2>` (add `state`/`load` to its destructure if missing).
- [ ] **Step 2: Pocket** — `Pocket({ state, update, go, toast })` → add `load`; import `HelpDot`; recorded-state `<h2>` (the `{lastOutcome === 'changed' ? ...}` line) and main `<h2>A short reset, your way</h2>` gain `view="pocket"`.
- [ ] **Step 3: Ripples** — same destructure/import treatment; `<h2>Water settling</h2>`, `<h2>How does the water feel?</h2>`, and `<h2>A paced sensory pause</h2>` gain `view="ripples"`.
- [ ] **Step 4: Verify** — `npx tsc -b --force` clean; insertions total 6 (Places) + 2 (Pocket) + 3 (Ripples).
- [ ] **Step 5: Commit**

```bash
git add src/game/panels/Places.tsx src/game/panels/Pocket.tsx src/game/panels/Ripples.tsx
git commit -m "feat: ? explainers in Mailbox, Home, TownList, Calm, Preview, Load, Pocket, Ripples"
```

---

### Task 6: `?` in the four mini-games, Keepsakes, and Collection

**Files:**
- Modify: `src/game/panels/Minis.tsx`, `src/game/panels/Keepsakes.tsx`

**Interfaces:**
- Consumes: `HelpDot` from Task 2.

- [ ] **Step 1: Minis** — each of `Firefly`, `Chime`, `WarmCup`, `Lanterns` destructures `({ state, update, go, toast }: PanelProps)`; add `load` to each; import `HelpDot`; append the dot with `view="firefly"`, `"chime"`, `"warmcup"`, `"lanterns"` respectively inside each component's first `<h2>` (open each function, use its first `<h2>` whatever the title text is).
- [ ] **Step 2: Keepsakes + Collection** — `Keepsakes` already destructures full props; if `load` is missing add it; import `HelpDot`; first `<h2>` in `Keepsakes` gains `view="keepsakes"`. Open `Collection` in the same file and do the same with `view="collection"`.
- [ ] **Step 3: Verify** — `npx tsc -b --force` clean; 6 insertions total.
- [ ] **Step 4: Commit**

```bash
git add src/game/panels/Minis.tsx src/game/panels/Keepsakes.tsx
git commit -m "feat: ? explainers in mini-games, Keepsakes, Collection"
```

---

### Task 7: Plain-language plan openers (`src/domain/plans.ts` + test)

**Files:**
- Modify: `src/domain/plans.ts` (7 `opener` strings only)
- Create: `src/domain/plain.test.ts`

**Interfaces:**
- Consumes: `PLAN_TEMPLATES` (existing), `guideLines` (existing, Task 8 extends coverage).
- Produces: plain-language contract test consumed by Task 8 (which appends the lens test to the same file).

- [ ] **Step 1: Write the failing test `src/domain/plain.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { PLAN_TEMPLATES, type BlockerKind } from './plans'

export const BANNED = [
  'weighted', 'timebox', 'overloaded', 'xp', 'streak', 'parse', 'assumption', 'burnout', 'diagnos',
]

export const sentences = (s: string) =>
  s.split(/[.!?…]+/).map((p) => p.trim()).filter(Boolean)

const OPENER_WORD: Record<BlockerKind, string> = {
  unclear_start: 'look',
  too_large: 'fits',
  missing_knowledge: 'name',
  missing_materials: 'list',
  low_capacity: 'small',
  perfection_pressure: 'rough',
  other: 'guess',
}

describe('plain-language guardians', () => {
  it('every plan opener is short, plain, and direct', () => {
    for (const [id, t] of Object.entries(PLAN_TEMPLATES)) {
      expect(t.opener.toLowerCase()).toContain(OPENER_WORD[id as BlockerKind])
      expect(sentences(t.opener).length).toBeLessThanOrEqual(2)
      // Whole-word matching: substring checks false-positive (e.g. 'xp' in 'explains').
      for (const w of BANNED) expect(t.opener.toLowerCase()).not.toMatch(new RegExp(`\\b${w}\\b`))
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/plain.test.ts`
Expected: FAIL — the `missing_materials` opener has no word “list”.

- [ ] **Step 3: Replace the 7 openers** (exact strings, `guardian` fields untouched)

| blocker | new opener |
|---|---|
| unclear_start | `We start with one thing you can look at. Understanding first, finishing second.` |
| too_large | `We shrink this until it fits your time today. The rest keeps its place in the week.` |
| missing_knowledge | `First we name the one thing you do not understand yet. That naming is the whole step.` |
| missing_materials | `This is a gathering job. First we list what is missing — nothing has to be found yet.` |
| low_capacity | `Today gets one small step. Stopping after it counts as done.` |
| perfection_pressure | `We aim low on purpose. A rough version nobody sees still counts as started.` |
| other | `Say what is in the way, or plan it yourself. I will not guess.` |

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/plain.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/plans.ts src/domain/plain.test.ts
git commit -m "feat: plain-language plan openers with first-timer wording"
```

---

### Task 8: Plain-language guardian lens (`src/domain/guidance.ts`)

**Files:**
- Modify: `src/domain/guidance.ts` (`guardianLens` only, 5 lines)
- Modify: `src/domain/plain.test.ts` (append lens test; reuse exported `BANNED` and `sentences`)

**Interfaces:**
- Consumes: `BANNED`, `sentences` from Task 7; `guideLines` signature unchanged.

- [ ] **Step 1: Append the failing lens test to `src/domain/plain.test.ts`**

```ts
import { guideLines, type HelpMode } from './guidance'

const LENS_HEAD = /^(Mira explains|Kai plans|Sol keeps|Sky keeps|Goh finishes)/
const LENS_CASE: [BlockerKind, HelpMode, 'mira' | 'kai' | 'sol' | 'sky' | 'goh'][] = [
  ['unclear_start', 'Explain', 'mira'],
  ['too_large', 'Plan', 'kai'],
  ['low_capacity', 'Plan', 'sol'],
  ['perfection_pressure', 'Review', 'sky'],
  ['missing_materials', 'Plan', 'goh'],
]

describe('guardian lens', () => {
  it('opens in the guardian’s plain job, briefly', () => {
    for (const [b, m, g] of LENS_CASE) {
      const head = guideLines(b, m, { taskTitle: 'ERD assignment' }, g)[0]
      expect(head).toMatch(LENS_HEAD)
      expect(sentences(head).length).toBeLessThanOrEqual(2)
      // Whole-word matching: substring checks false-positive (e.g. 'xp' in 'explains').
      for (const w of BANNED) expect(head.toLowerCase()).not.toMatch(new RegExp(`\\b${w}\\b`))
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/plain.test.ts`
Expected: FAIL — current heads read “Mira, your study partner: …” etc.

- [ ] **Step 3: Replace the 5 `guardianLens` returns** (exact strings)

```ts
case 'mira': return 'Mira explains things. We make it understandable before we make it done.'
case 'kai': return 'Kai plans time. We make this fit the hours you actually have.'
case 'sol': return 'Sol keeps effort sustainable. Small is legitimate — stopping after it is done.'
case 'sky': return 'Sky keeps you company. No pressure here — rough on purpose.'
case 'goh': return 'Goh finishes small things. We gather what is missing first — that is the work right now.'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/plain.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/guidance.ts src/domain/plain.test.ts
git commit -m "feat: plain-language guardian lens lines"
```

---

### Task 9: Plain-language greetings, Council voices, panel lines, guardian names

**Files:**
- Modify: `src/game/Game.tsx` (GREETINGS only), `src/game/panels/Places.tsx` (Council voices + Recover line), `src/game/panels/Loop.tsx` (2 Rebalance lines + 3 lowercase-id displays), `src/game/panels/Ripples.tsx`, `src/game/panels/Minis.tsx` (4 lines), `src/game/panels/Pocket.tsx`, `src/game/panels/Keepsakes.tsx`

**Interfaces:**
- Consumes: `GUARDIANS` from `./layout` (already imported in `Game.tsx`; add the import to `Loop.tsx`).

Exact replacements (old → new):

GREETINGS (`Game.tsx`):
- library: `You have a brief you have not opened. Let us start with one observable thing, not the whole assignment.` → `I am Mira, and I explain things. Tell me what blocks you — we start with one small visible step.`
- clock: `Two of your flexible tasks can move without touching a deadline. Want to see which?` → `I am Kai, and I plan time. Two flexible tasks can move to Saturday — want to see?`
- garden: `The water is not achieving anything, and that is rather the point. Sit for a minute?` → `I am Sol, and I keep effort sustainable. This water achieves nothing, and that is the point — sit a minute?`
- market: `Errands group better than they look from inside your head.` → `I am Goh, and I finish small things. Errands group well — bring me the list in your head.`
- cafe: `No agenda here. Work if you want, and I will not ask how it is going.` → `I am Sky, and I keep you company. Work if you want — I will not ask how it is going.`
- park: `Ten minutes outside. Indoors counts the same — I am not checking up on you.` → `I am Sol. Ten minutes with something green counts — outside, window, plant, or picture, all the same.`

Council voices (`Places.tsx`): keep the numbers, change the words —
- kai: `Thursday holds ${…} minutes of fixed time. That is the part I cannot argue with.` → `Thursday holds ${…} minutes of fixed time. That part cannot move.`
- mira: `Most of what is left is cognitive — ${…} weighted minutes, and “${…}” is the largest piece.` → `Most of what is left is thinking work, and “${…}” is the biggest piece.`
- sol: `You have been at this a while. A smaller checkpoint is not a lesser one.` → `You have been at this a while. A smaller step is still a full step.`
- sky: `There is one fixed social commitment. I would not move it — you chose it.` → `One fixed social plan. You chose it, so I would not move it.`
- goh: `The errands are small and they group well. They are not the problem today.` → `The errands are small and fit together. They are not today’s problem.`

Panel lines:
- `Loop.tsx` seen-state kai: `That is as far as moving things will take you. What is left is real work, and it still has to be done. Shall we make it smaller?` → `Moving things cannot help further. What is left is real work — shall we make it smaller?`
- `Loop.tsx` proposal kai: `` `I can move ${proposal.moves.length} things. I will not touch anything with a fixed time, and I will not push work past its deadline. Nothing has moved yet.` `` → `` `I can move ${proposal.moves.length} things. Fixed times stay, deadlines hold, and nothing has moved yet.` ``
- `Loop.tsx` guardian-id displays: `Ask {guardian}` → `Ask {GUARDIANS[guardian].name}`; `{guardian} · local guidance for this task, no AI provider connected` → `{GUARDIANS[guardian].name} · local guidance for this task, no AI provider connected`; `Start a Pace Session with {PLAN_TEMPLATES[state.blocker].guardian}` → `Start a Pace Session with {GUARDIANS[PLAN_TEMPLATES[state.blocker].guardian].name}` (add `GUARDIANS` to the `../../domain` import — verify it is exported from domain index first; if not, import from `../layout`).
- `Places.tsx` Recover sol: `Would you rather pause here with Gentle Ripples, or step away from the screen for a short reset? Neither is worth more than the other.` → `Two equal pauses: Ripples here, or a short reset away from the screen. Neither earns more.`
- `Ripples.tsx` sol: `No score here. Tap the water when you like, watch what answers, and leave whenever you are ready.` → `No score here — tap the water when you like, and leave whenever you are ready.`
- `Pocket.tsx` sol: `Five to ten minutes with something green, given light, or simply calming. Outside, at a window, beside a plant, or with an image — all four count the same.` → `Five to ten calm minutes with something green. Outside, window, plant, or picture — all four count the same.`
- `Minis.tsx` mira: `Five lights, five short fragments. Follow any one, read or skip it, and place a single glow on the page.` → `Five lights, five short readings. Follow one, skip the rest, and leave one glow.`
- `Minis.tsx` kai: `Notes arrive slowly. Tap, press Space, or simply watch each one pass the clock hand. Timing is never scored.` → `Notes drift past slowly. Tap them, or just watch. Timing is never scored.`
- `Minis.tsx` sky: `No rush and no wrong order that matters. I will keep you company while the cup is made.` → `No rush and no wrong order. I will sit with you while the cup is made.`
- `Minis.tsx` goh: `Pick a symbol for what is on your mind. Words are optional, private, and never required.` → `Pick a symbol for what is on your mind. Words are optional and stay private.`
- `Keepsakes.tsx` sol: `Only if you want one. The quest already counted — this changes nothing about rewards.` → `Only if you want one. The quest already counted — this changes no reward.`

- [ ] **Step 1: Apply the Game.tsx greeting replacements.**
- [ ] **Step 2: Apply the Council + Recover replacements in Places.tsx.**
- [ ] **Step 3: Apply the Loop.tsx replacements (lines + name displays + import).**
- [ ] **Step 4: Apply Ripples, Pocket, Minis (4), Keepsakes replacements.**
- [ ] **Step 5: Verify** — `npx tsc -b --force` clean; `npx vitest run` full suite green.
- [ ] **Step 6: Commit**

```bash
git add src/game/Game.tsx src/game/panels/Places.tsx src/game/panels/Loop.tsx src/game/panels/Ripples.tsx src/game/panels/Pocket.tsx src/game/panels/Minis.tsx src/game/panels/Keepsakes.tsx
git commit -m "feat: plain-language greetings, council voices, guardian lines, display names"
```

---

### Task 10: Full verification and demo click-through

**Files:** none (verification only).

- [ ] **Step 1: Run the whole suite**

Run: `npx tsc -b --force && npx vitest run && npm run build`
Expected: typecheck clean, all tests pass (139 existing + 6 help + 2 plain = 147), build succeeds.

- [ ] **Step 2: Manual click-through** — `npm run dev`, open `/game`, reset data, and confirm: every panel shows `?`; each popup shows what/how/guardian-why plus the live line where specified; popups close on tap-away and Escape; Session “Ask …” shows a capitalised guardian name; no console errors.
- [ ] **Step 3: Commit** — only if Step 2 required fixes; otherwise record completion with no empty commit.
