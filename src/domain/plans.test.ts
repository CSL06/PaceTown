import { describe, expect, it } from 'vitest'
import { BLOCKERS, PLAN_TEMPLATES, buildCheckpoints, guardianFor, resolveCheckpoint } from './plans'
import type { BlockerKind } from './types'

const ALL: BlockerKind[] = BLOCKERS.map((b) => b.id)

describe('the blocker catalogue', () => {
  it('covers every blocker the plan names', () => {
    expect(ALL).toEqual([
      'unclear_start', 'too_large', 'missing_knowledge', 'missing_materials',
      'low_capacity', 'perfection_pressure', 'other',
    ])
  })

  it('has a template for every one of them', () => {
    for (const id of ALL) expect(PLAN_TEMPLATES[id]).toBeDefined()
  })

  it('routes each blocker to a guardian whose specialty matches it', () => {
    expect(guardianFor('unclear_start')).toBe('mira')
    expect(guardianFor('too_large')).toBe('kai')
    expect(guardianFor('missing_materials')).toBe('goh')
    expect(guardianFor('low_capacity')).toBe('sol')
    expect(guardianFor('perfection_pressure')).toBe('sky')
  })
})

describe('generated checkpoints', () => {
  it('always produces at least one', () => {
    for (const id of ALL) expect(buildCheckpoints(id).length).toBeGreaterThan(0)
  })

  it('gives every checkpoint a definition of done', () => {
    for (const id of ALL) {
      for (const c of buildCheckpoints(id)) {
        expect(c.definitionOfDone.length).toBeGreaterThan(10)
      }
    }
  })

  it('keeps every checkpoint inside one sitting', () => {
    for (const id of ALL) {
      for (const c of buildCheckpoints(id)) {
        expect(c.estimatedMinutes).toBeGreaterThanOrEqual(5)
        expect(c.estimatedMinutes).toBeLessThanOrEqual(30)
      }
    }
  })

  it('mints unique ids so two plans never collide', () => {
    const ids = [...buildCheckpoints('unclear_start'), ...buildCheckpoints('unclear_start')]
      .map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('starts low capacity with reading, not producing', () => {
    // §9: offer a smaller action, and make stopping after it a complete result.
    const first = buildCheckpoints('low_capacity')[0]
    expect(first.definitionOfDone).toMatch(/nothing has to be produced/i)
  })

  it('starts perfection pressure with something deliberately rough', () => {
    expect(buildCheckpoints('perfection_pressure')[0].title).toMatch(/rough/i)
  })

  it('does not interpret "something else" on the student’s behalf', () => {
    expect(PLAN_TEMPLATES.other.opener).toMatch(/I will not guess/i)
    expect(buildCheckpoints('other')[0].title).toMatch(/your own/i)
  })
})

describe('task-aware checkpoints', () => {
  const ctx = { taskTitle: 'Weekly groceries', deliverables: [] as string[] }

  it('names the student’s task in every generated checkpoint', () => {
    for (const id of ['unclear_start', 'too_large', 'missing_knowledge'] as BlockerKind[]) {
      const text = buildCheckpoints(id, ctx).map((c) => `${c.title} ${c.definitionOfDone}`).join(' ')
      expect(text).toContain('Weekly groceries')
    }
  })

  it('never falls back to the seeded example assignment', () => {
    for (const id of ALL) {
      const text = buildCheckpoints(id, ctx).map((c) => `${c.title} ${c.definitionOfDone}`).join(' ')
      expect(text).not.toMatch(/many-to-many|junction entity|ERD/i)
    }
  })

  it('grounds the first checkpoint in the brief deliverable when one exists', () => {
    const first = buildCheckpoints('unclear_start', {
      taskTitle: 'ERD assignment', deliverables: ['Write a short data dictionary'],
    })[0]
    expect(`${first.title} ${first.definitionOfDone}`).toContain('Write a short data dictionary')
  })

  it('keeps every task-aware checkpoint inside one sitting with a definition of done', () => {
    for (const id of ALL) {
      for (const c of buildCheckpoints(id, ctx)) {
        expect(c.definitionOfDone.length).toBeGreaterThan(10)
        expect(c.estimatedMinutes).toBeGreaterThanOrEqual(5)
        expect(c.estimatedMinutes).toBeLessThanOrEqual(30)
      }
    }
  })
})

describe('resolveCheckpoint', () => {
  const plan = buildCheckpoints('unclear_start', { taskTitle: 'Weekly groceries' })

  it('marks completed work completed', () => {
    const [first] = plan
    const next = resolveCheckpoint(plan, first.id, 'completed')
    expect(next.find((c) => c.id === first.id)?.status).toBe('completed')
  })

  it('keeps partial and blocked work visibly open', () => {
    const [first] = plan
    expect(resolveCheckpoint(plan, first.id, 'partial').find((c) => c.id === first.id)?.status).toBe('partial')
    expect(resolveCheckpoint(plan, first.id, 'blocked').find((c) => c.id === first.id)?.status).toBe('blocked')
  })

  it('returns rescheduled work to pending — waiting, not failed', () => {
    const [first] = plan
    expect(resolveCheckpoint(plan, first.id, 'rescheduled').find((c) => c.id === first.id)?.status).toBe('pending')
  })

  it('leaves every other checkpoint untouched', () => {
    const next = resolveCheckpoint(plan, plan[0].id, 'completed')
    expect(next.slice(1)).toEqual(plan.slice(1))
  })

  it('never mutates the caller’s list', () => {
    const before = plan.map((c) => c.status)
    resolveCheckpoint(plan, plan[0].id, 'completed')
    expect(plan.map((c) => c.status)).toEqual(before)
  })
})
