import { describe, expect, it } from 'vitest'
import { demoTasks } from '../domain'
import { shouldAutoOpenPreview } from './ClockTower'

const base = { tasks: demoTasks(), capacity: { wakeHour: 8, sleepHour: 23, energy: null, stress: null, sleepHours: null }, rebalanceSeen: false }

describe('shouldAutoOpenPreview', () => {
  it('auto-opens the Kai proposal when rebalance is undecided and moves exist', () => {
    expect(shouldAutoOpenPreview(base)).toBe(true)
  })

  it('stays closed once rebalance was decided', () => {
    expect(shouldAutoOpenPreview({ ...base, rebalanceSeen: true })).toBe(false)
  })
})
