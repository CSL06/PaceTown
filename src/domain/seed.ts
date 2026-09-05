/**
 * The seeded demonstration student (vision §25).
 *
 * The schedule is produced by running the real parser over the text below,
 * so the demo can never drift from what intake would actually do. If the
 * parser regresses, the seeded Thursday figure the whole story rests on
 * moves with it — computed live, never a hard-coded constant — which is
 * the point.
 */

import { parseSchedule } from './parse'
import type { Capacity, Task } from './types'

export const DEMO_DAY = 'thu'
export const DEMO_DESTINATION = 'sat'

export const DEMO_CAPACITY: Capacity = {
  wakeHour: 8,
  sleepHour: 23,
  energy: null,
  stress: null,
  sleepHours: null,
}

export const DEMO_SCHEDULE_TEXT =
  'Database Systems lecture from 9 am to 12 pm, 90 minute commute, Film Society at 5 pm, ' +
  'café shift from 6 pm to 10 pm, ERD assignment due tomorrow takes 120 minutes, ' +
  'revise normalisation notes for 62 minutes, weekly groceries 45 minutes, ' +
  'bursary form due next week 30 minutes, laundry 30 minutes'

export const DEMO_BRIEF =
  'Enrolment System — Coursework 2.\n' +
  'You must design an entity-relationship diagram for the university enrolment system.\n' +
  '- Identify the entities and their attributes\n' +
  '- Describe the relationship between each pair of entities\n' +
  '- Resolve any many-to-many relationships with a junction entity\n' +
  '- Write a short data dictionary\n' +
  'Diagrams should be legible and submitted as PDF.'

export function demoTasks(): Task[] {
  const thursday = parseSchedule(DEMO_SCHEDULE_TEXT, DEMO_DAY).tasks
  const surrounding: Record<string, string> = {
    mon: 'Algorithms lecture from 10 am to 12 pm, gym 45 minutes',
    tue: 'Design tutorial from 2 pm to 3 pm, pharmacy 20 minutes',
    wed: 'Project meeting from 4 pm to 5 pm, laundry 30 minutes',
    fri: 'Software lab from 11 am to 1 pm, dinner with friends at 7 pm',
    sat: 'Morning run 45 minutes, family dinner at 6 pm',
    sun: 'Meal prep 60 minutes, call family 30 minutes',
  }
  const week = Object.entries(surrounding).flatMap(([day, text]) =>
    parseSchedule(text, day).tasks.map((task, index) => ({ ...task, id: `${day}-${index}` })),
  )
  return [...week, ...thursday.map((task, index) => ({ ...task, id: `thu-${index}` }))]
}
