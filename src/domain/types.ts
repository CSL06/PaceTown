/**
 * PaceTown domain types.
 *
 * Mirrors PaceTown_Hackathon_Implementation_Plan.md §8. These describe the
 * student's real commitments and the work built on top of them — nothing here
 * knows about React, storage, or any provider.
 */

export type DemandCategory = 'time' | 'mental' | 'physical' | 'social' | 'errands'
export type Priority = 'low' | 'medium' | 'high'
export type Effort = 'low' | 'medium' | 'high'
export type Urgency = 'today' | 'tomorrow' | 'later'
export type Flexibility = 'fixed' | 'flexible'
export type ActivityKind =
  | 'lecture' | 'tutorial' | 'lab' | 'assignment' | 'study' | 'meeting'
  | 'shift' | 'commute' | 'exercise' | 'errand' | 'admin' | 'meal'
  | 'social' | 'household' | 'general'

export interface Task {
  id: string
  title: string
  category: DemandCategory
  /** Day key the task currently sits on, e.g. 'thu'. */
  day: string
  /** Explicit card order within a day, independent of scheduled time. */
  calendarOrder?: number
  /** Minutes after midnight. Omitted for work that has not been given a time. */
  startMinute?: number
  /** Minutes after midnight. Present with startMinute for a timed commitment. */
  endMinute?: number
  estimatedMinutes: number
  priority: Priority
  mentalEffort: Effort
  flexibility: Flexibility
  urgency: Urgency
  /** Days until the deadline from its current day. Negative means scheduled late. */
  deadlineDays: number
  minimumSessionMinutes?: number
  notes?: string
  externalEventId?: string
  status?: 'pending' | 'completed'
  source?: 'manual' | 'parsed' | 'seeded' | 'calendar'
  /** What sort of real-world activity this is. Guidance may use this; scheduling may not. */
  activityKind?: ActivityKind
}

export type BlockerKind =
  | 'ready'
  | 'unclear_start'
  | 'too_large'
  | 'missing_knowledge'
  | 'missing_materials'
  | 'low_capacity'
  | 'perfection_pressure'
  | 'other'

export interface Checkpoint {
  id: string
  title: string
  /** What finished looks like, in the student's own words. */
  definitionOfDone: string
  estimatedMinutes: number
  /** Suggested session chrome. The student may still change it. */
  timerPreference?: 'down' | 'up' | 'none'
  status?: 'pending' | 'active' | 'partial' | 'completed' | 'blocked'
}

export interface WorkPlan {
  id: string
  taskId: string
  objective: string
  blocker?: BlockerKind
  deliverables: string[]
  checkpoints: Checkpoint[]
  source: 'manual' | 'local' | 'ai'
  status: 'draft' | 'active' | 'completed'
}

export type GuardianId = 'mira' | 'kai' | 'sol' | 'sky' | 'goh'

export interface PaceSession {
  id: string
  taskId: string
  checkpointId: string
  guardianId: GuardianId
  plannedMinutes?: number
  startedAt: string
  endedAt?: string
  outcome?: 'partial' | 'completed' | 'blocked' | 'rescheduled'
  progressNote?: string
  nextAction?: string
}

/** Optional self-report. Never a diagnosis, never a score (vision §8). */
export interface Capacity {
  /** Hour the student is usually awake, 0–23. */
  wakeHour: number
  /** Hour the student is usually asleep, 18–26 (values past 24 wrap past midnight). */
  sleepHour: number
  /** 1–5, or null when not reported. */
  energy: number | null
  stress: number | null
  sleepHours: number | null
}

export interface LoadContribution {
  task: Task
  weighted: number
}

export interface LoadBand {
  key: 'open' | 'steady' | 'heavy' | 'over' | 'unsust'
  label: string
  /** Inclusive upper bound of the band. */
  max: number
}

export interface DailyLoad {
  day: string
  wakingMinutes: number
  fixedMinutes: number
  availableMinutes: number
  weightedDemand: number
  /** May exceed 100. Schedule pressure, not a judgement (vision §8). */
  percentage: number
  band: LoadBand
  /** Flexible contributors, largest first. */
  contributors: LoadContribution[]
}

export interface RebalanceMove {
  taskId: string
  title: string
  from: string
  to: string
  weightedMinutes: number
}

export interface RebalanceProposal {
  moves: RebalanceMove[]
  before: DailyLoad
  after: DailyLoad
  /** The task list as it would be if every move were approved. Nothing is applied. */
  proposed: Task[]
}
