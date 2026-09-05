import { describe, expect, it } from 'vitest'
import { applyRebalance, applySelected, isMovable, proposeRebalance } from './rebalance'
import { dailyLoad } from './workload'
import { DEMO_DAY, DEMO_DESTINATION, demoTasks } from './seed'
import type { Task } from './types'

const opts = { day: DEMO_DAY, destination: DEMO_DESTINATION, waking: 900 }

const task = (over: Partial<Task> = {}): Task => ({
  id: 't', title: 'Task', category: 'mental', day: 'thu', estimatedMinutes: 60,
  priority: 'medium', mentalEffort: 'medium', urgency: 'later',
  flexibility: 'flexible', deadlineDays: 5, ...over,
})

describe('what may move', () => {
  it('never moves a fixed commitment', () => {
    expect(isMovable(task({ flexibility: 'fixed', deadlineDays: 9 }), 'thu')).toBe(false)
  })

  it('never moves work due today or tomorrow', () => {
    expect(isMovable(task({ deadlineDays: 0 }), 'thu')).toBe(false)
    expect(isMovable(task({ deadlineDays: 1 }), 'thu')).toBe(false)
  })

  it('moves flexible work with slack', () => {
    expect(isMovable(task({ deadlineDays: 4 }), 'thu')).toBe(true)
  })

  it('ignores work on another day', () => {
    expect(isMovable(task({ day: 'fri', deadlineDays: 6 }), 'thu')).toBe(false)
  })
})

describe('proposals on the seeded day', () => {
  const tasks = demoTasks()
  const proposal = proposeRebalance(tasks, opts)

  it('brings Thursday out of the Overloaded band', () => {
    expect(proposal.before.percentage).toBeGreaterThan(100)
    expect(proposal.after.percentage).toBeLessThanOrEqual(95)
    expect(proposal.after.band.key).toBe('heavy')
  })

  it('moves the least it can get away with', () => {
    expect(proposal.moves.length).toBeGreaterThan(0)
    expect(proposal.moves.length).toBeLessThanOrEqual(3)
  })

  it('moves the most slack and lowest priority first', () => {
    const first = tasks.find((t) => t.id === proposal.moves[0].taskId)!
    expect(first.priority).toBe('low')
  })

  it('never proposes moving the assignment that is due tomorrow', () => {
    const titles = proposal.moves.map((m) => m.title)
    expect(titles.some((t) => /ERD assignment/i.test(t))).toBe(false)
  })

  it('never proposes moving a fixed commitment', () => {
    const fixedIds = tasks.filter((t) => t.flexibility === 'fixed').map((t) => t.id)
    expect(proposal.moves.some((m) => fixedIds.includes(m.taskId))).toBe(false)
  })

  it('leaves the caller’s tasks untouched — a proposal is only a preview', () => {
    const days = tasks.map((t) => t.day)
    proposeRebalance(tasks, opts)
    expect(tasks.map((t) => t.day)).toEqual(days)
  })

  it('reports before and after so the student can compare', () => {
    expect(proposal.before.percentage).toBeGreaterThan(proposal.after.percentage)
  })
})

describe('approval', () => {
  it('applies only after an explicit call, and only the proposed moves', () => {
    const tasks = demoTasks()
    const proposal = proposeRebalance(tasks, opts)
    const applied = applyRebalance(tasks, proposal)

    const movedIds = proposal.moves.map((m) => m.taskId)
    for (const [index, t] of applied.entries()) {
      expect(t.day).toBe(movedIds.includes(t.id) ? DEMO_DESTINATION : tasks[index].day)
    }
    expect(dailyLoad(applied, DEMO_DAY, 900).percentage).toBeCloseTo(proposal.after.percentage, 5)
  })

  it('is a no-op when nothing was proposed', () => {
    const calm = [task({ estimatedMinutes: 30 })]
    const proposal = proposeRebalance(calm, opts)
    expect(proposal.moves).toHaveLength(0)
    expect(applyRebalance(calm, proposal).map((t) => t.day)).toEqual(['thu'])
  })

  it('applies only the selected moves on partial approval', () => {
    const tasks = demoTasks()
    const proposal = proposeRebalance(tasks, opts)
    expect(proposal.moves.length).toBeGreaterThan(1)
    const [first] = proposal.moves
    const applied = applySelected(tasks, proposal, [first.taskId])
    for (const [index, t] of applied.entries()) {
      expect(t.day).toBe(t.id === first.taskId ? DEMO_DESTINATION : tasks[index].day)
    }
    const partial = dailyLoad(applied, DEMO_DAY, 900).percentage
    expect(partial).toBeLessThan(proposal.before.percentage)
    expect(partial).toBeGreaterThanOrEqual(proposal.after.percentage)
  })

  it('applies nothing when the selection is empty', () => {
    const tasks = demoTasks()
    const proposal = proposeRebalance(tasks, opts)
    expect(applySelected(tasks, proposal, []).map((t) => t.day)).toEqual(tasks.map((t) => t.day))
  })
})

describe('when nothing can safely move', () => {
  it('does not overload the receiving day', () => {
    const tasks = [...demoTasks(), task({ id: 'busy-saturday', day: 'sat', flexibility: 'fixed', estimatedMinutes: 900 })]
    expect(proposeRebalance(tasks, opts).moves).toHaveLength(0)
  })

  it('preserves the absolute deadline when approving a move', () => {
    const tasks = demoTasks()
    const proposal = proposeRebalance(tasks, opts)
    const applied = applyRebalance(tasks, proposal)
    for (const move of proposal.moves) {
      expect(applied.find((task) => task.id === move.taskId)!.deadlineDays)
        .toBe(tasks.find((task) => task.id === move.taskId)!.deadlineDays - 2)
    }
  })
  it('returns an empty proposal rather than forcing a move', () => {
    const stuck = [
      task({ id: 'f', flexibility: 'fixed', estimatedMinutes: 800 }),
      task({ id: 'a', estimatedMinutes: 200, deadlineDays: 1, urgency: 'tomorrow' }),
    ]
    const proposal = proposeRebalance(stuck, opts)
    expect(proposal.moves).toHaveLength(0)
    expect(proposal.after.percentage).toBe(proposal.before.percentage)
  })
})
