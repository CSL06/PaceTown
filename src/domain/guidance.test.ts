import { describe, expect, it } from 'vitest'
import { HELP_MODES, guideLines, type HelpMode } from './guidance'
import { BLOCKERS } from './plans'
import type { BlockerKind } from './types'

const blockers: BlockerKind[] = BLOCKERS.map((b) => b.id)
const ctx = {
  taskTitle: 'Weekly groceries',
  checkpointTitle: 'Group errands into one route',
  definitionOfDone: 'One route written down covering groceries and the pharmacy.',
  deliverables: [],
}

describe('guideLines', () => {
  it('answers every blocker × help-mode combination', () => {
    for (const blocker of blockers) {
      for (const mode of HELP_MODES) {
        const lines = guideLines(blocker, mode, ctx)
        expect(lines.length).toBeGreaterThanOrEqual(2)
        for (const line of lines) expect(line.length).toBeGreaterThan(10)
      }
    }
  })

  it('talks about the student’s task, not a hardcoded example', () => {
    for (const blocker of blockers) {
      for (const mode of HELP_MODES) {
        const text = guideLines(blocker, mode, ctx).join(' ')
        expect(text).toContain('Weekly groceries')
        expect(text).not.toMatch(/many-to-many|junction entity|ERD/i)
      }
    }
  })

  it('uses the checkpoint and definition of done where they fit', () => {
    const explain = guideLines('unclear_start', 'Explain', ctx).join(' ')
    expect(explain).toContain('One route written down')
    const next = guideLines('unclear_start', 'What next?', ctx).join(' ')
    expect(next).toContain('Group errands into one route')
  })

  it('grounds planning in the brief deliverable when one exists', () => {
    const plan = guideLines('unclear_start', 'Plan', {
      ...ctx, deliverables: ['Write a short data dictionary'],
    }).join(' ')
    expect(plan).toContain('Write a short data dictionary')
  })

  it('adds blocker-aware tips for the combinations that need them', () => {
    const review = guideLines('perfection_pressure', 'Review', ctx).join(' ')
    expect(review).toMatch(/rough/i)
    const plain = guideLines('other', 'Review' as HelpMode, ctx)
    expect(plain).toHaveLength(2)
  })

  it('degrades gracefully without any context', () => {
    for (const mode of HELP_MODES) {
      expect(guideLines('other', mode).join(' ')).toContain('this task')
    }
  })
})
