/**
 * Game state and persistence.
 *
 * The domain layer owns every calculation; this owns only what the player has
 * done and where they are. Saves are versioned and migrated rather than
 * discarded — a returning student must never lose their week.
 */

import {
  DEFAULT_COSMETICS, DEMO_BRIEF, DEMO_CAPACITY, DEMO_SCHEDULE_TEXT, demoTasks,
  type BlockerKind, type Capacity, type Checkpoint, type CosmeticSlot,
  type RegulationId, type Task,
} from '../domain'
import type { PlaceId, ViewId } from './layout'
import { localStorageAdapter } from './storage'

export const SAVE_KEY = 'pacetown.game'
export const SAVE_VERSION = 4

const store = localStorageAdapter(SAVE_KEY)

export interface JournalEntry {
  at: number
  text: string
  detail?: string
  reward?: { xp: number; coins: number }
}

export interface GameState {
  version: number
  started: boolean
  introSeen: boolean
  /** True once onboarding has been completed or explicitly skipped. */
  onboarded: boolean
  greeted: Partial<Record<PlaceId, boolean>>

  capacity: Capacity
  scheduleText: string
  brief: string
  deliverables: string[]
  tasks: Task[]

  rebalanceSeen: boolean
  rebalanceApproved: boolean

  blocker: BlockerKind | null
  checkpoints: Checkpoint[]
  activeCheckpointId: string | null
  /** The task the active plan and session belong to. */
  activeTaskId: string | null
  notes: string
  outcome: 'completed' | 'partial' | 'blocked' | 'rescheduled' | null
  /** Last checkpoint+outcome saved — an exact re-save is skipped, never re-paid. */
  savedSessionKey: string | null
  progressNote: string
  nextAction: string

  rippleTaps: number
  questOutcome: 'done' | 'partial' | 'changed' | null
  /** Set once any recovery has been completed; gates the reward, not the path. */
  recoveryDone: boolean

  /** Pace Session workspace: timer, scratchpad, and where a pause came from. */
  session: {
    elapsedSec: number
    timerMode: 'none' | 'up' | 'down'
    timerLenSec: number
    scratchpad: string
    helpMode: string | null
    pausedFrom: ViewId | null
  }

  /** Gentle Ripples participation record. */
  ripples: {
    taps: number
    response: 'lighter' | 'same' | 'not_sure' | null
    lastAt: number | null
  }

  /** Pocket of Green quest path and verification state. */
  pocket: {
    path: 'outdoor' | 'window' | 'indoor' | 'image' | null
    outcome: 'done' | 'partial' | 'changed' | null
    confirmation: 'self' | 'photo' | null
    verification: 'pass' | 'uncertain' | 'fail' | null
  }

  keepsakes: {
    id: string
    category: string
    imageURL: string
    source: 'local_filter' | 'symbolic_fallback'
    placement: string
    retainsOriginal: boolean
    name: string
    at: number
  }[]

  regulationSessions: {
    at: number
    activity: string
    placement: string
    response: 'lighter' | 'same' | 'not_sure' | null
  }[]

  skippedQuestKinds: string[]
  /** Recovery activities the student said they prefer. Ordering, never gating. */
  recoveryPrefs: RegulationId[]

  /** Cosmetics bought with coins, and the one equipped in each slot. */
  owned: string[]
  equipped: Record<CosmeticSlot, string>

  xp: number
  coins: number
  gardenGrowth: number
  mailbox: { at: number; text: string }[]
  journal: JournalEntry[]

  avatar: { px: number; py: number }
  facing: 'up' | 'down' | 'left' | 'right'
  quiet: boolean
  contrast: boolean
  scene: 'campus' | 'clock-tower'
  view: ViewId | null
}

export function initialState(): GameState {
  return {
    version: SAVE_VERSION,
    started: false,
    introSeen: false,
    onboarded: false,
    greeted: {},

    capacity: { ...DEMO_CAPACITY },
    scheduleText: DEMO_SCHEDULE_TEXT,
    brief: DEMO_BRIEF,
    deliverables: [],
    tasks: demoTasks(),

    rebalanceSeen: false,
    rebalanceApproved: false,

    blocker: null,
    checkpoints: [],
    activeCheckpointId: null,
    activeTaskId: null,
    notes: '',
    outcome: null,
    savedSessionKey: null,
    progressNote: 'Listed 6 entities. Mapped Student–Course as many-to-many.',
    nextAction: 'Add the enrolment junction entity.',

    rippleTaps: 0,
    questOutcome: null,
    recoveryDone: false,

    session: {
      elapsedSec: 0,
      timerMode: 'none',
      timerLenSec: 20 * 60,
      scratchpad: '',
      helpMode: null,
      pausedFrom: null,
    },

    ripples: { taps: 0, response: null, lastAt: null },

    pocket: { path: null, outcome: null, confirmation: null, verification: null },

    keepsakes: [],
    regulationSessions: [],
    skippedQuestKinds: [],
    recoveryPrefs: [],

    owned: [],
    equipped: { ...DEFAULT_COSMETICS },

    xp: 0,
    coins: 0,
    gardenGrowth: 0,
    mailbox: [],
    journal: [],

    avatar: { px: 49.8, py: 66 },
    facing: 'down',
    quiet: false,
    contrast: false,
    scene: 'campus',
    view: null,
  }
}

type Migration = (state: Record<string, unknown>) => Record<string, unknown>

/**
 * Save migrations, oldest first. Index 0 upgrades v0 saves to v1, index 1
 * upgrades v1 to v2. Adding a field means adding a migration, not bumping
 * past the old save.
 */
const MIGRATIONS: Migration[] = [
  (s) => ({ ...s, version: 1 }),
  (s) => ({
    ...s,
    version: 2,
    session: {
      elapsedSec: 0,
      timerMode: 'none',
      timerLenSec: 20 * 60,
      scratchpad: '',
      helpMode: null,
      pausedFrom: null,
      ...(typeof s.session === 'object' && s.session !== null ? s.session : {}),
    },
    ripples: {
      taps: typeof s.rippleTaps === 'number' ? s.rippleTaps : 0,
      response: null,
      lastAt: null,
    },
    pocket: { path: null, outcome: null, confirmation: null, verification: null },
    keepsakes: Array.isArray(s.keepsakes) ? s.keepsakes : [],
    regulationSessions: Array.isArray(s.regulationSessions) ? s.regulationSessions : [],
    skippedQuestKinds: Array.isArray(s.skippedQuestKinds) ? s.skippedQuestKinds : [],
  }),
  (s) => ({
    ...s,
    version: 3,
    activeTaskId: typeof s.activeTaskId === 'string' ? s.activeTaskId : null,
    recoveryDone: typeof s.recoveryDone === 'boolean' ? s.recoveryDone : false,
  }),
  /* v4 adds onboarding, recovery preferences and cosmetics. An existing save
     is treated as already onboarded — it has a week in it, so sending that
     player back through a first-run wizard would be wrong. */
  (s) => ({
    ...s,
    version: 4,
    onboarded: true,
    recoveryPrefs: Array.isArray(s.recoveryPrefs) ? s.recoveryPrefs : [],
    owned: Array.isArray(s.owned) ? s.owned : [],
    equipped: {
      ...DEFAULT_COSMETICS,
      ...(typeof s.equipped === 'object' && s.equipped !== null ? s.equipped : {}),
    },
  }),
]

/**
 * Load a save, migrating it forward. Only an unreadable or future-versioned
 * save falls back to a fresh game — a missing field is filled in, never a
 * reason to wipe someone's progress.
 */
export function loadState(): GameState {
  const fresh = initialState()
  const raw = store.load()
  if (!raw) return fresh

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return fresh
  }

  let version = typeof parsed.version === 'number' ? parsed.version : 0
  if (version > SAVE_VERSION) return fresh

  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version]
    if (!migrate) break
    parsed = migrate(parsed)
    version += 1
  }

  return {
    ...fresh,
    ...parsed,
    version: SAVE_VERSION,
    // Every load opens on the title screen, as a game should. Progress is
    // restored; only the entry point resets.
    started: false,
    scene: 'campus',
    view: null,
  } as GameState
}

export function saveState(state: GameState): void {
  store.save(JSON.stringify(state))
}

/**
 * Marks the save as onboarded without collecting anything. Used by the
 * explore-without-an-account path, where the seeded week is the point and a
 * first-run wizard would be in the way.
 */
export function markOnboarded(): void {
  const state = loadState()
  saveState({ ...state, onboarded: true })
}

/**
 * Back to the seeded week, still in the town.
 *
 * Distinct from clearState: this is what a presenter wants between runs, and
 * what "start the example week again" means. Onboarding stays marked, because
 * being sent back through a first-run wizard is not what anyone means by
 * "reset the demo".
 */
export function resetDemo(): void {
  saveState({ ...initialState(), onboarded: true })
}

/** Removes everything. The caller is responsible for where to go next. */
export function clearState(): void {
  store.clear()
}

/** Growth never decays and has no failure state (vision §7.6). */
export function grow(state: GameState): GameState {
  return { ...state, gardenGrowth: Math.min(4, state.gardenGrowth + 1) }
}

export function record(
  state: GameState,
  text: string,
  detail?: string,
  reward?: { xp: number; coins: number },
): GameState {
  return {
    ...state,
    xp: state.xp + (reward?.xp ?? 0),
    coins: state.coins + (reward?.coins ?? 0),
    journal: [...state.journal, { at: Date.now(), text, detail, reward }],
  }
}
