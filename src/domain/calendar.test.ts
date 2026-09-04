import { describe, expect, it } from 'vitest'
import { dayDistance, formatMinute, taskTime, tasksForDay, weekLoads } from './calendar'
import { demoTasks } from './seed'

describe('weekly calendar', () => {
  it('formats stored times for the board', () => {
    expect(formatMinute(9 * 60)).toBe('9am')
    expect(formatMinute(17 * 60 + 30)).toBe('5:30pm')
    expect(taskTime({ startMinute: 9 * 60, endMinute: 12 * 60 })).toBe('9am–12pm')
  })

  it('orders timed commitments before untimed flexible work', () => {
    const thursday = tasksForDay(demoTasks(), 'thu')
    expect(thursday[0].startMinute).toBeDefined()
    const firstUntimed = thursday.findIndex((task) => task.startMinute === undefined)
    expect(firstUntimed).toBeGreaterThan(0)
    expect(thursday.slice(firstUntimed).every((task) => task.startMinute === undefined)).toBe(true)
  })

  it('derives every day load from the actual week', () => {
    const loads = weekLoads(demoTasks(), 900)
    expect(Object.keys(loads)).toHaveLength(7)
    expect(loads.thu.percentage).toBeGreaterThan(loads.sat.percentage)
    expect(loads.sat.fixedMinutes).toBeGreaterThan(0)
  })

  it('measures forward placement distance inside the displayed week', () => {
    expect(dayDistance('thu', 'fri')).toBe(1)
    expect(dayDistance('thu', 'sat')).toBe(2)
    expect(dayDistance('thu', 'wed')).toBe(-1)
  })
})
