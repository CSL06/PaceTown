/**
 * Progression (vision §15).
 *
 * These rules exist to encode a product decision in code rather than in
 * copy: PaceTown rewards sustainable choices, and it must be impossible for
 * elapsed time, a mini-game, or a photo to earn more than the work did.
 */

export interface Reward {
  xp: number
  coins: number
}

export const NO_REWARD: Reward = { xp: 0, coins: 0 }

/** Suggested hackathon values from §15. */
export const REWARDS = {
  beginSession: { xp: 10, coins: 5 },
  checkpointPartial: { xp: 20, coins: 10 },
  checkpointComplete: { xp: 30, coins: 20 },
  savedNextAction: { xp: 15, coins: 10 },
  rebalance: { xp: 35, coins: 25 },
  recovery: { xp: 20, coins: 15 },
  weeklyGoal: { xp: 75, coins: 50 },
} as const satisfies Record<string, Reward>

export type SessionOutcome = 'completed' | 'partial' | 'blocked' | 'rescheduled'

/**
 * Every outcome is valid. Partial, blocked and rescheduled all earn, because
 * naming a blocker and stopping honestly are the behaviours worth rewarding.
 */
export function sessionReward(outcome: SessionOutcome): Reward {
  return outcome === 'completed' ? REWARDS.checkpointComplete : REWARDS.checkpointPartial
}

export type QuestOutcome = 'done' | 'partial' | 'changed' | 'another'
export type Confirmation = 'self' | 'photo' | 'none'

/**
 * Recovery quest reward.
 *
 * `confirmation` is accepted but deliberately unused: self-confirmation and
 * photo confirmation must earn identically (§11, §14). Keeping the parameter
 * makes that guarantee testable rather than incidental.
 */
export function questReward(outcome: QuestOutcome, _confirmation: Confirmation = 'self'): Reward {
  if (outcome === 'done') return REWARDS.recovery
  if (outcome === 'partial') return { xp: 10, coins: 8 }
  return NO_REWARD
}

export const XP_PER_LEVEL = 200

export interface Level {
  level: number
  into: number
  need: number
}

export function levelOf(xp: number): Level {
  const safe = Math.max(0, Math.floor(xp))
  return { level: Math.floor(safe / XP_PER_LEVEL) + 1, into: safe % XP_PER_LEVEL, need: XP_PER_LEVEL }
}

/**
 * A timer running out, a mini-game finishing, or an assistant answering never
 * completes academic work — only an explicit outcome the student recorded does
 * (§4, §13). Encoded here so the rule cannot be lost in the UI layer.
 */
export function completesAcademicWork(source: 'student' | 'timer' | 'minigame' | 'ai'): boolean {
  return source === 'student'
}
