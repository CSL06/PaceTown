import { describe, expect, it } from 'vitest'
import { dayDistance, formatMinute, moveCalendarTask, taskTime, tasksForDay, weekLoads } from './calendar'
import { demoTasks } from './seed'

describe('weekly calendar', () => {
  it('preserves a drop order within a day after serialization', () => {
    const tasks = demoTasks()
    const laundry = tasks.find((task) => task.day === 'thu' && task.title === 'Laundry')!
    const pharmacy = tasks.find((task) => task.title === 'Pharmacy')!
    const moved = moveCalendarTask(tasks, laundry.id, pharmacy.day)
    expect(tasksForDay(JSON.parse(JSON.stringify(moved)), pharmacy.day).map((task) => task.id).slice(-2)).toEqual([pharmacy.id, laundry.id])
    const reordered = moveCalendarTask(moved, laundry.id, pharmacy.day, pharmacy.id)
    const ids = tasksForDay(reordered, pharmacy.day).map((task) => task.id)
    expect(ids.indexOf(laundry.id)).toBe(ids.indexOf(pharmacy.id) - 1)
    expect(reordered.find((task) => task.id === laundry.id)?.deadlineDays).toBe(moved.find((task) => task.id === laundry.id)?.deadlineDays)
  })
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

  it('can include completed commitments for a visible calendar history', () => {
    const tasks = demoTasks()
    const completed = { ...tasks[0], status: 'completed' as const }
    const changed = tasks.map((task) => task.id === completed.id ? completed : task)
    expect(tasksForDay(changed, completed.day)).not.toContainEqual(completed)
    expect(tasksForDay(changed, completed.day, true)).toContainEqual(completed)
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
