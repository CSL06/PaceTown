import { describe, expect, it } from 'vitest'
import {
  availableMinutes, bandFor, dailyLoad, energyFactor, explainLoad,
  guidedPercentage, wakingMinutes, weightedDemand,
} from './workload'
import { DEMO_CAPACITY, DEMO_DAY, demoTasks } from './seed'
import type { Task } from './types'

const task = (over: Partial<Task> = {}): Task => ({
  id: 't', title: 'Task', category: 'mental', day: 'thu', estimatedMinutes: 60,
  priority: 'medium', mentalEffort: 'medium', urgency: 'later',
  flexibility: 'flexible', deadlineDays: 5, ...over,
})

describe('weightedDemand', () => {
  it('multiplies minutes by priority, effort and urgency', () => {
    // 120 × 1.25 × 1.20 × 1.15
    expect(weightedDemand(task({
      estimatedMinutes: 120, priority: 'high', mentalEffort: 'high', urgency: 'tomorrow',
    }))).toBeCloseTo(207, 5)
  })

  it('discounts low priority and low effort', () => {
    expect(weightedDemand(task({
      estimatedMinutes: 45, priority: 'low', mentalEffort: 'low',
    }))).toBeCloseTo(30.6, 5)
  })

  it('treats a medium/medium/later task as its raw minutes', () => {
    expect(weightedDemand(task({ estimatedMinutes: 45 }))).toBe(45)
  })
})

describe('capacity', () => {
  it('derives waking minutes from the student’s own hours', () => {
    expect(wakingMinutes({ wakeHour: 8, sleepHour: 23 })).toBe(900)
    expect(wakingMinutes({ wakeHour: 7, sleepHour: 21 })).toBe(840)
  })

  it('never returns an implausibly short day', () => {
    expect(wakingMinutes({ wakeHour: 12, sleepHour: 13 })).toBe(240)
  })

  it('subtracts fixed commitments from available minutes', () => {
    const tasks = [task({ flexibility: 'fixed', estimatedMinutes: 570 })]
    expect(availableMinutes(tasks, 'thu', 900)).toEqual({ fixed: 570, available: 330 })
  })

  it('excludes fixed work from weighted demand', () => {
    const load = dailyLoad([task({ flexibility: 'fixed', estimatedMinutes: 180 })], 'thu', 900)
    expect(load.weightedDemand).toBe(0)
    expect(load.contributors).toHaveLength(0)
  })

  it('does not go negative when commitments exceed the day', () => {
    expect(availableMinutes([task({ flexibility: 'fixed', estimatedMinutes: 2000 })], 'thu', 900))
      .toEqual({ fixed: 2000, available: 0 })
  })
})

describe('load bands', () => {
  it.each([
    [0, 'open'], [59.9, 'open'],
    [60, 'steady'], [80, 'steady'],
    [81, 'heavy'], [95, 'heavy'],
    [96, 'over'], [110, 'over'],
    [111, 'unsust'], [400, 'unsust'],
  ])('%d%% is %s', (pct, key) => {
    expect(bandFor(pct).key).toBe(key)
  })
})

describe('the seeded demonstration day', () => {
  const tasks = demoTasks()
  const load = dailyLoad(tasks, DEMO_DAY, wakingMinutes(DEMO_CAPACITY))

  it('parses into nine commitments', () => {
    expect(tasks).toHaveLength(9)
  })

  it('is at 108.0% — the figure the whole demo story rests on', () => {
    expect(load.percentage).toBeCloseTo(108, 1)
    expect(load.band.key).toBe('over')
  })

  it('leaves 330 minutes after 570 minutes of fixed commitments', () => {
    expect(load.fixedMinutes).toBe(570)
    expect(load.availableMinutes).toBe(330)
  })

  it('names the assignment as the largest contributor', () => {
    expect(load.contributors[0].task.title).toMatch(/ERD assignment/i)
    expect(load.contributors[0].weighted).toBeCloseTo(207, 1)
  })

  it('explains itself in plain language', () => {
    const text = explainLoad(load)
    expect(text).toContain('108.0%')
    expect(text).toContain('330 minutes')
    expect(text).toContain('ERD assignment')
  })
})

describe('energy', () => {
  const load = dailyLoad(demoTasks(), DEMO_DAY, 900)

  it('is neutral when not reported', () => {
    expect(energyFactor(null)).toBe(1)
    expect(guidedPercentage(load, null)).toBeCloseTo(load.percentage, 5)
  })

  it('makes the same schedule read heavier on a low-energy day', () => {
    expect(guidedPercentage(load, 2)).toBeGreaterThan(load.percentage)
  })

  it('makes it read lighter on a high-energy day', () => {
    expect(guidedPercentage(load, 5)).toBeLessThan(load.percentage)
  })

  it('stays inside a bounded range — it can never dominate the calculation', () => {
    for (const e of [1, 2, 3, 4, 5]) {
      expect(energyFactor(e)).toBeGreaterThanOrEqual(0.85)
      expect(energyFactor(e)).toBeLessThanOrEqual(1.1)
    }
  })

  it('never mutates the raw figure it is shown beside', () => {
    const before = load.percentage
    guidedPercentage(load, 1)
    expect(load.percentage).toBe(before)
  })
})
