/**
 * Game state and persistence.
 *
 * The domain layer owns every calculation; this owns only what the player has
 * done and where they are. Saves are versioned and migrated rather than
 * discarded — a returning student must never lose their week.
 */

import {
  DEMO_BRIEF, DEMO_CAPACITY, DEMO_SCHEDULE_TEXT, demoTasks,
  type BlockerKind, type Capacity, type Checkpoint, type Task,
} from '../domain'
import type { PlaceId, ViewId } from './layout'

export const SAVE_KEY = 'pacetown.game'
export const SAVE_VERSION = 1

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
  notes: string
  outcome: 'completed' | 'partial' | 'blocked' | 'rescheduled' | null
  progressNote: string
  nextAction: string

  rippleTaps: number
  questOutcome: 'done' | 'partial' | 'changed' | null

  xp: number
  coins: number
  gardenGrowth: number
  mailbox: { at: number; text: string }[]
  journal: JournalEntry[]

  avatar: { px: number; py: number }
  facing: 'up' | 'down' | 'left' | 'right'
  quiet: boolean
  contrast: boolean
  view: ViewId | null
}

export function initialState(): GameState {
  return {
    version: SAVE_VERSION,
    started: false,
    introSeen: false,
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
    notes: '',
    outcome: null,
    progressNote: 'Listed 6 entities. Mapped Student–Course as many-to-many.',
    nextAction: 'Add the enrolment junction entity.',

    rippleTaps: 0,
    questOutcome: null,

    xp: 0,
    coins: 0,
    gardenGrowth: 0,
    mailbox: [],
    journal: [],

    avatar: { px: 49.8, py: 66 },
    facing: 'down',
    quiet: false,
    contrast: false,
    view: null,
  }
}

type Migration = (state: Record<string, unknown>) => Record<string, unknown>

/**
 * Save migrations, oldest first. Index 0 upgrades v0 saves to v1.
 * Adding a field means adding a migration, not bumping past the old save.
 */
const MIGRATIONS: Migration[] = []

/**
 * Load a save, migrating it forward. Only an unreadable or future-versioned
 * save falls back to a fresh game — a missing field is filled in, never a
 * reason to wipe someone's progress.
 */
export function loadState(): GameState {
  const fresh = initialState()
  let raw: string | null = null
  try {
    raw = localStorage.getItem(SAVE_KEY)
  } catch {
    return fresh
  }
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
    view: null,
  } as GameState
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // Private mode, or the quota is full. The session still works; it just
    // will not survive a reload, which is better than crashing mid-session.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* nothing to clear */
  }
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
