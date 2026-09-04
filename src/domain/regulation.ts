/**
 * Regulation activities and recommendations (implementation plan §14).
 *
 * Pure and deterministic: which activity to suggest for a given context is a
 * property of the code, not of copy. The UI renders these; nothing here knows
 * about React, panels, or views.
 */

import type { BlockerKind, DemandCategory } from './types'

export type RegulationId =
  | 'firefly_stories'
  | 'chime_drift'
  | 'gentle_ripples'
  | 'warm_cup'
  | 'night_lanterns'

export type RegulationPlacement = 'before_work' | 'mid_session' | 'after_work' | 'standalone'

export type RegulationResponse = 'lighter' | 'same' | 'not_sure'

export interface RegulationActivity {
  id: RegulationId
  name: string
  guardian: string
  /** Typical seconds; never a minimum — leaving early is valid. */
  typicalSeconds: [number, number]
  blurb: string
}

export const REGULATIONS: Record<RegulationId, RegulationActivity> = {
  firefly_stories: {
    id: 'firefly_stories',
    name: 'Firefly Stories',
    guardian: 'mira',
    typicalSeconds: [45, 120],
    blurb: 'Follow story lights about rest and persistence. Read or skip, then place one glow.',
  },
  chime_drift: {
    id: 'chime_drift',
    name: 'Chime Drift',
    guardian: 'kai',
    typicalSeconds: [45, 120],
    blurb: 'Slow notes arrive at a predictable pace. Tap, press a key, or simply watch.',
  },
  gentle_ripples: {
    id: 'gentle_ripples',
    name: 'Gentle Ripples',
    guardian: 'sol',
    typicalSeconds: [45, 120],
    blurb: 'Taps create ripples, petals and opening flowers. An optional breathing circle keeps a comfortable pace.',
  },
  warm_cup: {
    id: 'warm_cup',
    name: 'Warm Cup',
    guardian: 'sky',
    typicalSeconds: [45, 120],
    blurb: 'Choose a base, pour, stir, add an ingredient, and sit by the window. It cannot be ruined.',
  },
  night_lanterns: {
    id: 'night_lanterns',
    name: 'Night Lanterns',
    guardian: 'goh',
    typicalSeconds: [45, 120],
    blurb: 'Choose a symbol for a concern, light a lantern, and place it — or save it as a next action.',
  },
}

export const REGULATION_IDS = Object.keys(REGULATIONS) as RegulationId[]

export interface RecoverySuggestion {
  digital: RegulationId
  /** IRL quest catalogue id (vision §11). Only Pocket of Green is fully built in the prototype. */
  irl: 'pocket_of_green'
  reason: string
}

/**
 * Recommendation matrix from implementation plan §14. One digital and one IRL
 * option; neither is worth more than the other.
 */
export function recommendRecovery(
  blocker: BlockerKind | null,
  peakArea: DemandCategory | null,
): RecoverySuggestion {
  if (blocker === 'unclear_start' || blocker === 'perfection_pressure') {
    return {
      digital: 'firefly_stories',
      irl: 'pocket_of_green',
      reason: 'A rough start pairs with a low-pressure story, or a short step away from the screen.',
    }
  }
  if (peakArea === 'time') {
    return {
      digital: 'chime_drift',
      irl: 'pocket_of_green',
      reason: 'Time pressure calls for a slower transition — a chime, or a short screen-free pause.',
    }
  }
  if (blocker === 'low_capacity') {
    return {
      digital: 'warm_cup',
      irl: 'pocket_of_green',
      reason: 'Low capacity calls for the gentlest ritual — a warm cup here, or a short reset away.',
    }
  }
  if (blocker === 'missing_materials') {
    return {
      digital: 'night_lanterns',
      irl: 'pocket_of_green',
      reason: 'An unresolved setup niggle can be parked in a lantern, or written down away from the screen.',
    }
  }
  return {
    digital: 'gentle_ripples',
    irl: 'pocket_of_green',
    reason: 'A paced sensory pause here, or a short reset away — neither is worth more than the other.',
  }
}

/**
 * Participation completes a regulation session — never a score, a duration, or
 * a performance target (vision §11).
 */
export function completesRegulation(source: 'participation' | 'score' | 'duration'): boolean {
  return source === 'participation'
}
