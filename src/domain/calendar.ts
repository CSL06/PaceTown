import { dailyLoad } from './workload'
import type { DailyLoad, Task } from './types'

export const WEEK_DAYS = [
  { key: 'mon', short: 'Mon', label: 'Monday' },
  { key: 'tue', short: 'Tue', label: 'Tuesday' },
  { key: 'wed', short: 'Wed', label: 'Wednesday' },
  { key: 'thu', short: 'Thu', label: 'Thursday' },
  { key: 'fri', short: 'Fri', label: 'Friday' },
  { key: 'sat', short: 'Sat', label: 'Saturday' },
  { key: 'sun', short: 'Sun', label: 'Sunday' },
] as const

export type WeekDayKey = typeof WEEK_DAYS[number]['key']

export function dayIndex(day: string): number {
  return WEEK_DAYS.findIndex((entry) => entry.key === day)
}

export function dayDistance(from: string, to: string): number {
  const start = dayIndex(from)
  const end = dayIndex(to)
  return start < 0 || end < 0 ? -1 : end - start
}

export function formatMinute(value: number): string {
  const normalised = ((value % (24 * 60)) + 24 * 60) % (24 * 60)
  const hour = Math.floor(normalised / 60)
  const minute = normalised % 60
  const suffix = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}${minute ? `:${String(minute).padStart(2, '0')}` : ''}${suffix}`
}

export function taskTime(task: Pick<Task, 'startMinute' | 'endMinute'>): string | null {
  if (task.startMinute === undefined) return null
  return task.endMinute === undefined
    ? formatMinute(task.startMinute)
    : `${formatMinute(task.startMinute)}–${formatMinute(task.endMinute)}`
}

export function tasksForDay(tasks: readonly Task[], day: string): Task[] {
  return tasks
    .filter((task) => task.day === day && task.status !== 'completed')
    .slice()
    .sort((a, b) => {
      if (a.startMinute !== undefined && b.startMinute !== undefined) return a.startMinute - b.startMinute
      if (a.startMinute !== undefined) return -1
      if (b.startMinute !== undefined) return 1
      return a.title.localeCompare(b.title)
    })
}

export function weekLoads(tasks: readonly Task[], waking: number): Record<string, DailyLoad> {
  return Object.fromEntries(WEEK_DAYS.map(({ key }) => [key, dailyLoad(tasks, key, waking)]))
}
