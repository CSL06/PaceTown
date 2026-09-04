/**
 * Contextual Pace Session guidance (implementation plan §9).
 *
 * The local fallback that answers the six help modes. Every answer is built
 * from the student's actual task, checkpoint, definition of done and brief
 * deliverables — never from a single hardcoded example. Deterministic and
 * editable: the student reviews everything before acting on it.
 */

import type { BlockerKind, GuardianId } from './types'

export type HelpMode = 'Plan' | 'Explain' | 'Brainstorm' | 'Review' | 'Debug' | 'What next?'

export const HELP_MODES: readonly HelpMode[] = [
  'Plan', 'Explain', 'Brainstorm', 'Review', 'Debug', 'What next?',
]

export interface GuideContext {
  taskTitle?: string
  checkpointTitle?: string
  checkpointMinutes?: number
  definitionOfDone?: string
  deliverables?: string[]
}

const task = (ctx: GuideContext) =>
  ctx.taskTitle?.trim() ? `“${ctx.taskTitle.trim()}”` : 'this task'
const checkpoint = (ctx: GuideContext) =>
  ctx.checkpointTitle?.trim() ? `“${ctx.checkpointTitle.trim()}”` : 'this checkpoint'

function modeLines(mode: HelpMode, ctx: GuideContext): string[] {
  const t = task(ctx)
  const c = checkpoint(ctx)
  const firstDeliverable = ctx.deliverables?.find((d) => d.trim().length > 0)?.trim()
  switch (mode) {
    case 'Plan':
      return [
        `Say ${t} back in one sentence: what goes in, and what comes out.`,
        firstDeliverable
          ? `The brief names “${firstDeliverable}” — let that be the whole scope of ${c}.`
          : `Then shrink ${c} until it fits the time you actually have.`,
        ctx.checkpointMinutes
          ? `This checkpoint runs about ${ctx.checkpointMinutes} min — start its first two minutes now.`
          : 'Start the first two minutes now — momentum first, plan second.',
      ]
    case 'Explain':
      return [
        `Explain ${t} as if to a friend who missed the lecture: what is it asking for?`,
        ctx.definitionOfDone?.trim()
          ? `Finished means: ${ctx.definitionOfDone.trim()}`
          : 'If you cannot say what finished looks like, that is the first thing to write down.',
        'Write that explanation in the scratchpad below — one messy paragraph is enough.',
      ]
    case 'Brainstorm':
      return [
        `List every approach to ${t} you can think of — bad ideas included, speed over quality. Start from ${c}.`,
        'Then cross out every approach your brief or instructions never mention.',
        'Pick the least-bad idea left and write it as the next action.',
      ]
    case 'Review':
      return [
        ctx.definitionOfDone?.trim()
          ? `Check ${t} against one line only: ${ctx.definitionOfDone.trim()}`
          : `Check ${t} against ${c}: does it do what the checkpoint promised?`,
        'Mark exactly one thing to improve. The rest stays as it is.',
        'If it meets the definition of done, say so in What changed — then it is done.',
      ]
    case 'Debug':
      return [
        `Describe what you expected ${t} to do, and what it actually does — in one sentence each.`,
        'If two parts both seem to own the same piece, it usually belongs to the connection between them.',
        'Change one thing, then re-check once: did the behavior move?',
      ]
    case 'What next?':
      return [
        `The smallest next action on ${c} for ${t} is one you could start in under two minutes.`,
        'Name it out loud, write it as the next action, and stop planning there.',
        'Type it into “The easiest next starting action” below, so future-you starts in seconds.',
      ]
  }
}

/** One blocker-aware tip for the combinations where it matters. */
function blockerTip(blocker: BlockerKind, mode: HelpMode): string | null {
  if (blocker === 'perfection_pressure' && (mode === 'Review' || mode === 'Plan')) {
    return 'Aim low on purpose: a rough version you would not show anyone still counts as started.'
  }
  if (blocker === 'too_large' && mode === 'Plan') {
    return 'If the plan still does not fit today, the checkpoint is still too large — halve it.'
  }
  if (blocker === 'missing_knowledge' && mode === 'Explain') {
    return 'Naming the exact sentence you do not understand is the whole checkpoint.'
  }
  if (blocker === 'missing_materials' && (mode === 'Plan' || mode === 'What next?')) {
    return 'This is a gathering problem, not a working problem: the next action is collecting, not producing.'
  }
  if (blocker === 'low_capacity' && mode === 'Plan') {
    return 'Plan for the energy you have today, not the energy you wish you had — stopping after this is complete.'
  }
  if (blocker === 'unclear_start' && mode === 'What next?') {
    return 'The first move should be observable: open, list, or read something — not “understand everything”.'
  }
  return null
}

/** One guardian lens: whose voice the answer arrives in. */
function guardianLens(guardian: GuardianId): string {
  switch (guardian) {
    case 'mira': return 'Mira, your study partner: let’s make this understandable before making it done.'
    case 'kai': return 'Kai, your planner: let’s make this fit the time you actually have.'
    case 'sol': return 'Sol, your sustainer: smaller is legitimate — stopping after it is complete.'
    case 'sky': return 'Sky, keeping you company: no pressure here, rough on purpose.'
    case 'goh': return 'Goh, your finisher: gather what’s missing first — that is the work right now.'
  }
}

/**
 * Guidance lines for one help request. Always mentions the student's task;
 * never falls back to a hardcoded example assignment.
 */
export function guideLines(
  blocker: BlockerKind,
  mode: HelpMode,
  ctx: GuideContext = {},
  guardian?: GuardianId,
): string[] {
  const tip = blockerTip(blocker, mode)
  const head = guardian ? [guardianLens(guardian)] : []
  return tip ? [...head, ...modeLines(mode, ctx), tip] : [...head, ...modeLines(mode, ctx)]
}
