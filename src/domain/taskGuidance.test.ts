import { describe, expect, it } from 'vitest'
import { demoTasks } from './seed'
import {
  createGuidanceProvider, guidanceOptionsFor, localTaskGuidanceProvider,
  type GuidanceProvider,
} from './taskGuidance'
import type { Task } from './types'

const mealPrep = demoTasks().find((task) => task.title === 'Meal prep')!

describe('seeded task guidance', () => {
  it('has an intentional ready-to-start response for every seeded commitment', async () => {
    const tasks = demoTasks()
    expect(tasks.length).toBeGreaterThan(0)

    for (const task of tasks) {
      const proposal = await localTaskGuidanceProvider.propose({ task, intent: 'ready' })
      expect(proposal.source, task.title).toBe('seeded-local')
      expect(proposal.activityKind, task.title).not.toBe('general')
      expect(proposal.checkpoint.title.length, task.title).toBeGreaterThan(8)
      expect(proposal.checkpoint.definitionOfDone.length, task.title).toBeGreaterThan(15)
      expect(proposal.checkpoint.estimatedMinutes, task.title).toBeGreaterThan(0)
    }
  })

  it('treats meal prep as food, never as coursework', async () => {
    const proposals = await Promise.all([
      localTaskGuidanceProvider.propose({ task: mealPrep, intent: 'ready' }),
      ...guidanceOptionsFor(mealPrep).map(({ id }) =>
        localTaskGuidanceProvider.propose({ task: mealPrep, intent: id })),
    ])
    const copy = proposals.map((proposal) =>
      `${proposal.message} ${proposal.checkpoint.title} ${proposal.checkpoint.definitionOfDone}`).join(' ')

    expect(mealPrep.activityKind).toBe('meal')
    expect(copy).toMatch(/food|meal|ingredient|cleanup/i)
    expect(copy).not.toMatch(/assignment|brief|deliverable|lecture|notes|rubric|read the/i)
  })

  it('offers blocker choices that match the activity', () => {
    expect(guidanceOptionsFor(mealPrep).map((item) => item.label).join(' '))
      .toMatch(/make|ingredients|cleanup/i)

    const commute = demoTasks().find((task) => task.title === 'Commute')!
    expect(guidanceOptionsFor(commute).map((item) => item.label).join(' '))
      .toMatch(/route|late|journey/i)
  })

  it('uses task-scoped brief deliverables only when supplied by the caller', async () => {
    const assignment = demoTasks().find((task) => task.title === 'ERD assignment')!
    const grounded = await localTaskGuidanceProvider.propose({
      task: assignment,
      intent: 'unclear_start',
      context: { deliverables: ['Write a short data dictionary'] },
    })
    expect(grounded.checkpoint.title).toContain('Write a short data dictionary')

    const meal = await localTaskGuidanceProvider.propose({
      task: mealPrep,
      intent: 'too_large',
      context: { deliverables: ['Write a short data dictionary'] },
    })
    expect(JSON.stringify(meal)).not.toContain('data dictionary')
  })
})

describe('guidance provider boundary', () => {
  it('accepts a future backend without changing the UI contract', async () => {
    const remote: GuidanceProvider = {
      async propose(request) {
        return {
          activityKind: request.task.activityKind ?? 'general',
          guardian: 'mira',
          canonicalBlocker: 'ready',
          message: 'Remote guidance',
          checkpoint: {
            title: 'Remote checkpoint',
            definitionOfDone: 'The remote checkpoint is complete.',
            estimatedMinutes: 8,
            timerPreference: 'down',
          },
          source: 'ai',
        }
      },
    }
    expect((await createGuidanceProvider(remote).propose({ task: mealPrep, intent: 'ready' })).source)
      .toBe('ai')
  })

  it('falls back to coherent local guidance when a future backend fails', async () => {
    const failing: GuidanceProvider = { async propose() { throw new Error('offline') } }
    const proposal = await createGuidanceProvider(failing).propose({ task: mealPrep, intent: 'ready' })
    expect(proposal.source).toBe('seeded-local')
    expect(proposal.checkpoint.title).toMatch(/meal/i)
  })

  it('uses rules for future non-seeded tasks', async () => {
    const task: Task = {
      id: 'future', title: 'Cook breakfast', category: 'physical', estimatedMinutes: 20,
      day: 'mon', priority: 'medium', mentalEffort: 'low', flexibility: 'flexible',
      urgency: 'later', deadlineDays: 2, source: 'manual', activityKind: 'meal',
    }
    const proposal = await localTaskGuidanceProvider.propose({ task, intent: 'ready' })
    expect(proposal.source).toBe('rules-local')
    expect(proposal.activityKind).toBe('meal')
  })
})
