/**
 * Contextual Pace Session guidance (implementation plan §9).
 *
 * The local fallback that answers the six help modes. Every answer is built
 * from the student's actual task, checkpoint, definition of done and brief
 * deliverables — never from a single hardcoded example. Deterministic and
 * editable: the student reviews everything before acting on it.
 */

import type { BlockerKind } from './types'

export type HelpMode = 'Plan' | 'Explain' | 'Brainstorm' | 'Review' | 'Debug' | 'What next?'

export const HELP_MODES: readonly HelpMode[] = [
  'Plan', 'Explain', 'Brainstorm', 'Review', 'Debug', 'What next?',
]

export interface GuideContext {
  taskTitle?: string
  checkpointTitle?: string
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
      ]
    case 'Explain':
      return [
        `Explain ${t} as if to a friend who missed the lecture: what is it asking for?`,
        ctx.definitionOfDone?.trim()
          ? `Finished means: ${ctx.definitionOfDone.trim()}`
          : 'If you cannot say what finished looks like, that is the first thing to write down.',
      ]
    case 'Brainstorm':
      return [
        `List every approach to ${t} you can think of — bad ideas included, speed over quality. Start from ${c}.`,
        'Then cross out every approach your brief or instructions never mention.',
      ]
    case 'Review':
      return [
        ctx.definitionOfDone?.trim()
          ? `Check ${t} against one line only: ${ctx.definitionOfDone.trim()}`
          : `Check ${t} against ${c}: does it do what the checkpoint promised?`,
        'Mark exactly one thing to improve. The rest stays as it is.',
      ]
    case 'Debug':
      return [
        `Describe what you expected ${t} to do, and what it actually does — in one sentence each.`,
        'If two parts both seem to own the same piece, it usually belongs to the connection between them.',
      ]
    case 'What next?':
      return [
        `The smallest next action on ${c} for ${t} is one you could start in under two minutes.`,
        'Name it out loud, write it as the next action, and stop planning there.',
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

/**
 * Guidance lines for one help request. Always mentions the student's task;
 * never falls back to a hardcoded example assignment.
 */
export function guideLines(blocker: BlockerKind, mode: HelpMode, ctx: GuideContext = {}): string[] {
  const tip = blockerTip(blocker, mode)
  return tip ? [...modeLines(mode, ctx), tip] : modeLines(mode, ctx)
}
