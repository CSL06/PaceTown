/**
 * Blocker-driven work plans (implementation plan §9).
 *
 * The student names what is actually in the way, and the plan follows from
 * that rather than from the assignment alone. These templates are the local
 * fallback: deterministic, editable, and complete without an AI provider.
 */

import type { BlockerKind, Checkpoint, GuardianId } from './types'
import type { SessionOutcome } from './rewards'

export interface BlockerOption {
  id: BlockerKind
  label: string
  hint: string
}

export const BLOCKERS: readonly BlockerOption[] = [
  { id: 'unclear_start', label: 'I do not know where to begin', hint: 'The task is clear but the first move is not.' },
  { id: 'too_large', label: 'The task is too large', hint: 'It will not fit the time you have today.' },
  { id: 'missing_knowledge', label: 'I do not understand something', hint: 'Something in it has not clicked yet.' },
  { id: 'missing_materials', label: 'I am missing materials', hint: 'You cannot start without gathering things first.' },
  { id: 'low_capacity', label: 'I have low capacity today', hint: 'You could work, but not at full effort.' },
  { id: 'perfection_pressure', label: 'I am worried it will not be good enough', hint: 'Starting badly feels worse than not starting.' },
  { id: 'other', label: 'Something else', hint: 'Describe it, or plan manually without interpretation.' },
]

export interface PlanTemplate {
  guardian: GuardianId
  /** What the guardian says when the blocker is chosen. */
  opener: string
  checkpoints: Omit<Checkpoint, 'id' | 'status'>[]
}

const cp = (title: string, estimatedMinutes: number, definitionOfDone: string) =>
  ({ title, estimatedMinutes, definitionOfDone })

/**
 * Each template maps a blocker to its first response (§9). Note that no
 * template starts by producing the deliverable — the first checkpoint is
 * always the smallest observable thing.
 */
export const PLAN_TEMPLATES: Record<BlockerKind, PlanTemplate> = {
  unclear_start: {
    guardian: 'mira',
    opener: 'Then we are not starting with the assignment. We are starting with one observable thing you can look at.',
    checkpoints: [
      cp('Identify the entities and relationships', 20, 'A written list of every entity, and the relationship between each pair.'),
      cp('Draft the skeleton', 25, 'Every entity drawn with its primary key marked.'),
      cp('Resolve the many-to-many relationships', 20, 'Each many-to-many replaced with a junction entity.'),
      cp('Write a short data dictionary', 30, 'Every attribute has a type and a one-line description.'),
    ],
  },
  too_large: {
    guardian: 'kai',
    opener: 'Then we shrink it until it fits the time you actually have. The rest keeps its place in the week.',
    checkpoints: [
      cp('List the deliverables the brief names', 15, 'Each deliverable written down, nothing interpreted or added.'),
      cp('Choose which single deliverable is today’s', 10, 'One deliverable marked as today’s scope; the others dated.'),
      cp('Do that one deliverable only', 25, 'The chosen deliverable exists in rough form.'),
    ],
  },
  missing_knowledge: {
    guardian: 'mira',
    opener: 'Then the first checkpoint is not producing anything. It is naming the exact thing you do not yet understand.',
    checkpoints: [
      cp('Write the specific question you cannot answer', 10, 'One sentence naming the concept, not the whole topic.'),
      cp('Work one solved example of that concept', 20, 'One worked example you can explain back in your own words.'),
      cp('Apply it once to your own work', 20, 'The concept used once, however roughly.'),
    ],
  },
  missing_materials: {
    guardian: 'goh',
    opener: 'Then this is a gathering problem, not a working problem. Let us find out exactly what is missing.',
    checkpoints: [
      cp('List what you need and do not have', 10, 'A short checklist. Nothing has to be found yet.'),
      cp('Collect the two easiest items on it', 15, 'Two items to hand. The rest can wait.'),
    ],
  },
  low_capacity: {
    guardian: 'sol',
    opener: 'Then the honest checkpoint is a small one, and stopping after it is a complete result.',
    checkpoints: [
      cp('Open the brief and read it once', 10, 'The brief has been read. Nothing has to be produced.'),
      cp('List what you already know belongs', 15, 'A partial list. Incomplete is the expected outcome.'),
    ],
  },
  perfection_pressure: {
    guardian: 'sky',
    opener: 'Then we aim low on purpose. The first version should be rough enough that you would not show it to anyone.',
    checkpoints: [
      cp('Write a deliberately rough first version', 15, 'A messy draft exists. Spelling and completeness do not count.'),
      cp('Improve exactly one part of it', 20, 'One section is better. The rest stays rough.'),
    ],
  },
  other: {
    guardian: 'kai',
    opener: 'Then describe it in your own words, or skip the question and plan it manually. I will not guess.',
    checkpoints: [
      cp('Write your own first checkpoint', 15, 'You decide what finished looks like.'),
    ],
  },
}

let counter = 0

export interface PlanContext {
  /** The student's own task title, used so checkpoints read as theirs. */
  taskTitle?: string
  /** Extracted brief deliverables, used to ground the first checkpoint. */
  deliverables?: string[]
}

const named = (ctx: PlanContext | undefined) =>
  ctx?.taskTitle?.trim() ? `“${ctx.taskTitle.trim()}”` : 'this task'

/**
 * Checkpoints that follow the student's actual task and brief rather than a
 * single seeded example. Defaults keep every existing caller working.
 */
export function buildCheckpoints(blocker: BlockerKind, ctx?: PlanContext): Checkpoint[] {
  const t = named(ctx)
  const firstDeliverable = ctx?.deliverables?.find((d) => d.trim().length > 0)?.trim()
  const list: Omit<Checkpoint, 'id' | 'status'>[] = (() => {
    switch (blocker) {
      case 'unclear_start':
        return [
          ...(firstDeliverable
            ? [cp(`Read the first deliverable for ${t}`, 15,
              `Can say what “${firstDeliverable}” is asking, in your own words.`)]
            : [cp(`List the visible pieces of ${t}`, 15,
              'Every piece written down. Nothing has to be done yet.')]),
          cp(`Do the smallest piece of ${t} roughly`, 20,
            'One rough piece exists. Quality does not count yet.'),
          cp(`Define what done means for ${t}`, 10,
            'One sentence saying what finished looks like.'),
        ]
      case 'too_large':
        return [
          cp(`List what ${t} actually requires`, 15,
            'Each requirement written down, nothing interpreted or added.'),
          cp(`Choose which single part of ${t} is today’s`, 10,
            'One part marked as today’s scope; the others dated.'),
          cp('Do that one part only', 25, 'The chosen part exists in rough form.'),
        ]
      case 'missing_knowledge':
        return [
          ...(firstDeliverable
            ? [cp(`Name what ${firstDeliverable} assumes you know`, 10,
              'One sentence naming the concept, not the whole topic.')]
            : [cp(`Write the one question about ${t} you cannot answer`, 10,
              'One sentence naming the concept, not the whole topic.')]),
          cp('Work one solved example of that concept', 20,
            'One worked example you can explain back in your own words.'),
          cp(`Apply it once to ${t}`, 20, 'The concept used once, however roughly.'),
        ]
      case 'missing_materials':
        return (PLAN_TEMPLATES.missing_materials.checkpoints)
      case 'low_capacity':
        return (PLAN_TEMPLATES.low_capacity.checkpoints)
      case 'perfection_pressure':
        return (PLAN_TEMPLATES.perfection_pressure.checkpoints)
      case 'other':
      default:
        return (PLAN_TEMPLATES.other.checkpoints)
    }
  })()
  return list.map((c) => ({ ...c, id: `c${counter++}`, status: 'pending' as const }))
}

export function guardianFor(blocker: BlockerKind): GuardianId {
  return (PLAN_TEMPLATES[blocker] ?? PLAN_TEMPLATES.other).guardian
}

/**
 * Resolve a checkpoint from a recorded session outcome. Completed work reads
 * as completed; partial and blocked stay visibly open; rescheduled returns to
 * pending — waiting, never failed. Never mutates the caller's list.
 */
export function resolveCheckpoint(
  checkpoints: readonly Checkpoint[],
  id: string,
  outcome: SessionOutcome,
): Checkpoint[] {
  const status: Checkpoint['status'] =
    outcome === 'completed' ? 'completed'
    : outcome === 'partial' ? 'partial'
    : outcome === 'blocked' ? 'blocked'
    : 'pending'
  return checkpoints.map((c) => (c.id === id ? { ...c, status } : c))
}
