/**
 * The workload engine.
 *
 * Deterministic, independently testable, and free of UI, storage and providers
 * (implementation plan §10). Every number the interface shows about pressure
 * comes from here, so that "explain every score" is a property of the code
 * rather than a promise in the copy.
 */

import type {
  Capacity, DailyLoad, LoadBand, LoadContribution, Task,
} from './types'

export const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  low: 0.8,
  medium: 1.0,
  high: 1.25,
}

export const EFFORT_WEIGHT: Record<Task['mentalEffort'], number> = {
  low: 0.85,
  medium: 1.0,
  high: 1.2,
}

export const URGENCY_WEIGHT: Record<Task['urgency'], number> = {
  today: 1.3,
  tomorrow: 1.15,
  later: 1.0,
}

/** Suggested bands from vision §8. Ordered; the first match wins. */
export const BANDS: readonly LoadBand[] = [
  { key: 'open', label: 'Open', max: 59.999 },
  { key: 'steady', label: 'Steady', max: 80.999 },
  { key: 'heavy', label: 'Heavy', max: 95.999 },
  { key: 'over', label: 'Overloaded', max: 110.999 },
  { key: 'unsust', label: 'Unsustainable schedule', max: Infinity },
]

export function bandFor(percentage: number): LoadBand {
  return BANDS.find((b) => percentage <= b.max) ?? BANDS[BANDS.length - 1]
}

/**
 * Estimated minutes × priority × mental effort × urgency.
 * Fixed commitments are excluded — they consume capacity instead.
 */
export function weightedDemand(task: Task): number {
  return (
    task.estimatedMinutes *
    PRIORITY_WEIGHT[task.priority] *
    EFFORT_WEIGHT[task.mentalEffort] *
    URGENCY_WEIGHT[task.urgency]
  )
}

/** Waking minutes implied by the student's own hours. Handles past-midnight. */
export function wakingMinutes(capacity: Pick<Capacity, 'wakeHour' | 'sleepHour'>): number {
  const hours = capacity.sleepHour - capacity.wakeHour
  return Math.max(240, Math.round(hours * 60))
}

/** Fixed commitments reduce available minutes directly (§10). */
export function availableMinutes(
  tasks: readonly Task[],
  day: string,
  waking: number,
): { fixed: number; available: number } {
  const fixed = tasks
    .filter((t) => t.day === day && t.flexibility === 'fixed')
    .reduce((sum, t) => sum + t.estimatedMinutes, 0)
  return { fixed, available: Math.max(0, waking - fixed) }
}

export function dailyLoad(tasks: readonly Task[], day: string, waking: number): DailyLoad {
  const { fixed, available } = availableMinutes(tasks, day, waking)

  const contributors: LoadContribution[] = tasks
    .filter((t) => t.day === day && t.flexibility === 'flexible')
    .map((task) => ({ task, weighted: weightedDemand(task) }))
    .sort((a, b) => b.weighted - a.weighted)

  const total = contributors.reduce((sum, c) => sum + c.weighted, 0)
  const percentage = available > 0 ? (total / available) * 100 : total > 0 ? Infinity : 0

  return {
    day,
    wakingMinutes: waking,
    fixedMinutes: fixed,
    availableMinutes: available,
    weightedDemand: total,
    percentage,
    band: bandFor(percentage),
    contributors,
  }
}

/**
 * Optional energy adjusts guidance within a bounded range and never replaces
 * the raw figure (vision §8). Index is energy 1–5.
 */
export const ENERGY_FACTOR = [0.85, 0.92, 1.0, 1.05, 1.1] as const

export function energyFactor(energy: number | null | undefined): number {
  if (!energy || energy < 1 || energy > 5) return 1
  return ENERGY_FACTOR[energy - 1]
}

/**
 * The figure shown alongside — never instead of — `load.percentage`.
 * Lower reported energy means less effective capacity, so the same schedule
 * reads as heavier.
 */
export function guidedPercentage(load: DailyLoad, energy: number | null | undefined): number {
  return load.percentage / energyFactor(energy)
}

/** Plain-language explanation naming the largest contributors (§7.1). */
export function explainLoad(load: DailyLoad): string {
  if (load.contributors.length === 0) {
    return `Nothing flexible is scheduled. ${load.fixedMinutes} minutes are already committed.`
  }
  const top = load.contributors.slice(0, 2).map((c) => c.task.title)
  return (
    `This day is ${load.percentage.toFixed(1)}% because ${load.fixedMinutes} minutes are already ` +
    `committed, leaving ${load.availableMinutes} minutes for ${load.contributors.length} ` +
    `flexible tasks. The largest contributors are ${top.join(' and ')}.`
  )
}
