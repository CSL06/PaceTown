import { describe, expect, it } from 'vitest'
import { demoTasks } from './index'
import { buildCheckpoints, guardianFor, resolveCheckpoint } from './plans'
import { guideLines } from './guidance'
import { selectQuests, type QuestContext } from './quests'
import type { BlockerKind, Checkpoint, Task } from './types'

const SEEDED_TASK = 'ERD assignment'

function seededCheckpoints(blocker: BlockerKind): Checkpoint[] {
  return buildCheckpoints(blocker, { taskTitle: SEEDED_TASK })
}

describe('prototype data: guidance never falls back to a fake assignment', () => {
  it('every blocker × help-mode answer names the student’s real task', () => {
    const blockers: BlockerKind[] = [
      'unclear_start', 'too_large', 'low_capacity', 'perfection_pressure', 'missing_materials', 'other',
    ]
    const modes = ['Plan', 'Explain', 'Brainstorm', 'Review', 'Debug', 'What next?'] as const
    for (const b of blockers) {
      const cp = seededCheckpoints(b)[0]
      for (const m of modes) {
        const lines = guideLines(b, m, {
          taskTitle: SEEDED_TASK,
          checkpointTitle: cp.title,
          checkpointMinutes: cp.estimatedMinutes,
          definitionOfDone: cp.definitionOfDone,
        }, guardianFor(b))
        expect(lines.join(' ')).toContain(SEEDED_TASK)
      }
    }
  })

  it('Kai’s voice arrives for the overwhelm blocker, not a generic fallback', () => {
    const lines = guideLines('too_large', 'Plan', { taskTitle: SEEDED_TASK }, 'kai')
    expect(lines.join(' ')).toMatch(/kai/i)
  })
})

describe('prototype data: checkpoints carry a definition of done and a status', () => {
  it('every seeded checkpoint starts open and explains what finished looks like', () => {
    for (const c of seededCheckpoints('too_large')) {
      expect(c.definitionOfDone.length).toBeGreaterThan(10)
      expect(c.status ?? 'pending').not.toBe('completed')
    }
  })

  it('completing the seeded checkpoint flows into a visible completed state', () => {
    const list = seededCheckpoints('too_large')
    const next = resolveCheckpoint(list, list[0].id, 'completed')
    expect(next.find((c) => c.id === list[0].id)?.status).toBe('completed')
  })
})

describe('prototype data: the HUD never points at dead work', () => {
  const ctx = (over: Partial<QuestContext> = {}): QuestContext => ({
    loadPercentage: 108,
    hasOutcome: false,
    hasRecovery: false,
    hasOpenCheckpoint: true,
    rebalanceAvailable: true,
    taskTitle: SEEDED_TASK,
    nextAction: null,
    ...over,
  })

  it('offers the held checkpoint, not a blank “turn it into one” prompt, when checkpoints exist', () => {
    const quests = selectQuests(ctx({ loadPercentage: 91, rebalanceAvailable: false, hasOpenCheckpoint: true }))
    const checkpoint = quests.find((q) => q.id === 'quest-checkpoint')
    expect(checkpoint).toBeDefined()
    expect(checkpoint?.detail).toContain('held exactly as you left')
  })

  it('stops offering the checkpoint quest once everything is completed', () => {
    const quests = selectQuests(ctx({ hasOpenCheckpoint: false }))
    expect(quests.some((q) => q.id === 'quest-checkpoint')).toBe(false)
  })

  it('keeps the saved next action reachable from the journal', () => {
    const quests = selectQuests(ctx({ nextAction: 'Add the enrolment junction entity.' }))
    const nextAction = quests.find((q) => q.id === 'quest-next-action')
    expect(nextAction?.view).toBe('journal')
    expect(nextAction?.detail).toContain('enrolment junction')
  })

  it('seeded tasks are real and flexible so they can become checkpoints', () => {
    const flexible: Task[] = demoTasks().filter((t) => t.flexibility !== 'fixed')
    expect(flexible.some((t) => t.title === SEEDED_TASK)).toBe(true)
  })
})
