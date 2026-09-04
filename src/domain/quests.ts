/**
 * Daily quest selection (implementation plan §12).
 *
 * Up to three quests, but only one foregrounded under high pressure. Pure and
 * deterministic — the UI renders the result and owns persistence of skips.
 */

export type QuestKind = 'work' | 'recovery' | 'choice'

export interface Quest {
  id: string
  kind: QuestKind
  title: string
  detail: string
  /** Game view to open, as an opaque string — domain must not import game layout. */
  view: string
}

export interface QuestContext {
  loadPercentage: number
  hasOutcome: boolean
  hasRecovery: boolean
  hasCheckpoint: boolean
  rebalanceAvailable: boolean
  taskTitle: string | null
  nextAction: string | null
}

export const HIGH_PRESSURE_AT = 95

/**
 * Frequently skipped kinds appear less often: kinds in `skipped` are deprioritised
 * but never removed — the student can always choose another.
 */
export function selectQuests(ctx: QuestContext, skipped: readonly string[] = []): Quest[] {
  const quests: Quest[] = []

  if (ctx.rebalanceAvailable) {
    quests.push({
      id: 'quest-rebalance',
      kind: 'work',
      title: 'Move one flexible task',
      detail: 'Kai found safer placements. Nothing moves until you approve it.',
      view: 'rebalance',
    })
  } else if (ctx.taskTitle) {
    quests.push({
      id: 'quest-checkpoint',
      kind: 'work',
      title: `One checkpoint: ${ctx.taskTitle}`,
      detail: ctx.hasCheckpoint
        ? 'Your checkpoint is held exactly as you left it.'
        : 'Turn the largest contributor into one manageable checkpoint.',
      view: 'work',
    })
  }

  if (!ctx.hasRecovery) {
    quests.push({
      id: 'quest-recovery',
      kind: 'recovery',
      title: 'Take a short reset',
      detail: 'Gentle Ripples here, or Pocket of Green away from the screen. Equal rewards.',
      view: 'recover',
    })
  }

  if (ctx.nextAction) {
    quests.push({
      id: 'quest-next-action',
      kind: 'choice',
      title: 'Resume your next action',
      detail: ctx.nextAction,
      view: 'session',
    })
  } else {
    quests.push({
      id: 'quest-garden',
      kind: 'choice',
      title: 'Visit the Recovery Garden',
      detail: 'Growth from sustainable choices. Nothing here ever wilts.',
      view: 'garden',
    })
  }

  const deprioritised = quests.filter((q) => skipped.includes(q.id))
  const fresh = quests.filter((q) => !skipped.includes(q.id))
  return [...fresh, ...deprioritised].slice(0, 3)
}

/** Under high pressure only one recommendation is foregrounded (vision §19). */
export function foregroundQuest(quests: readonly Quest[], ctx: QuestContext): Quest | null {
  if (quests.length === 0) return null
  // selectQuests orders rebalance first, so quests[0] is the safe foreground
  // when the day is overloaded.
  if (ctx.loadPercentage > HIGH_PRESSURE_AT) return quests[0]
  if (ctx.rebalanceAvailable) return quests.find((q) => q.id === 'quest-rebalance') ?? quests[0]
  if (ctx.hasOutcome && !ctx.hasRecovery) {
    return quests.find((q) => q.id === 'quest-recovery') ?? quests[0]
  }
  return quests.find((q) => q.kind === 'work') ?? quests[0]
}
