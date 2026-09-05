/**
 * The rebalancing engine (implementation plan §11).
 *
 * Greedy: find the peak day, move the most slack and lowest priority work
 * first, and stop as soon as the day clears the target band. It returns a
 * proposal and never mutates the caller's tasks — approval is a separate,
 * explicit step (vision §7.2).
 */

import { dailyLoad, weightedDemand } from './workload'
import { dayDistance, moveCalendarTask } from './calendar'
import type { RebalanceMove, RebalanceProposal, Task } from './types'

const PRIORITY_RANK: Record<Task['priority'], number> = { low: 0, medium: 1, high: 2 }

/** Top of the Heavy band: the point at which a day stops being overloaded. */
export const DEFAULT_TARGET = 95

export interface RebalanceOptions {
  day: string
  destination: string
  waking: number
  /** Stop once the day is at or below this percentage. */
  target?: number
}

/**
 * A task may move only if it is flexible and has slack beyond tomorrow.
 * `deadlineDays <= 1` covers both fixed commitments and work due imminently,
 * so the engine can never push something past its deadline.
 */
export function isMovable(task: Task, day: string, destination?: string): boolean {
  const distance = destination ? dayDistance(day, destination) : 1
  return task.day === day && task.flexibility === 'flexible' &&
    task.deadlineDays > 1 && distance > 0 && distance <= task.deadlineDays
}

export function proposeRebalance(
  tasks: readonly Task[],
  { day, destination, waking, target = DEFAULT_TARGET }: RebalanceOptions,
): RebalanceProposal {
  const before = dailyLoad(tasks, day, waking)
  const proposed = tasks.map((t) => ({ ...t }))

  if (before.percentage <= target) {
    return { moves: [], before, after: before, proposed }
  }

  const candidates = proposed
    .filter((t) => isMovable(t, day, destination))
    .sort((a, b) => {
      // Lowest priority first, then the most slack, then the biggest win.
      if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      }
      if (a.deadlineDays !== b.deadlineDays) return b.deadlineDays - a.deadlineDays
      return weightedDemand(b) - weightedDemand(a)
    })

  const moves: RebalanceMove[] = []
  for (const task of candidates) {
    if (dailyLoad(proposed, day, waking).percentage <= target) break
    const candidateSchedule = moveCalendarTask(proposed, task.id, destination)
    if (dailyLoad(candidateSchedule, destination, waking).percentage > target) continue
    moves.push({
      taskId: task.id,
      title: task.title,
      from: day,
      to: destination,
      weightedMinutes: weightedDemand(task),
    })
    task.day = destination
    task.deadlineDays -= dayDistance(day, destination)
  }

  return { moves, before, after: dailyLoad(proposed, day, waking), proposed }
}

/** Apply an approved proposal. Separate from proposing, on purpose. */
export function applyRebalance(tasks: readonly Task[], proposal: RebalanceProposal): Task[] {
  return applySelected(tasks, proposal, proposal.moves.map((move) => move.taskId))
}

/** Apply only the selected moves of a proposal — partial approval is valid. */
export function applySelected(
  tasks: readonly Task[],
  proposal: RebalanceProposal,
  selectedIds: readonly string[],
): Task[] {
  const wanted = new Set(selectedIds)
  return proposal.moves.filter((move) => wanted.has(move.taskId))
    .reduce((current, move) => moveCalendarTask(current, move.taskId, move.to), [...tasks])
}
