import { describe, expect, it } from 'vitest'
import { extractDeliverables, parseSchedule, titleise } from './parse'
import { DEMO_BRIEF, DEMO_SCHEDULE_TEXT } from './seed'

describe('parseSchedule', () => {
  it('reads a clock range as a fixed commitment', () => {
    const [t] = parseSchedule('lecture from 9 to 12').tasks
    expect(t.flexibility).toBe('fixed')
    expect(t.estimatedMinutes).toBe(180)
    expect(t.startMinute).toBe(9 * 60)
    expect(t.endMinute).toBe(12 * 60)
  })

  it('assumes an evening end when the range reads backwards', () => {
    // "6 to 10" is an evening shift, not a negative four hours.
    const task = parseSchedule('café shift from 6 to 10').tasks[0]
    expect(task.estimatedMinutes).toBe(240)
    expect(task.startMinute).toBe(18 * 60)
    expect(task.endMinute).toBe(22 * 60)
  })

  it('reads a stated duration', () => {
    expect(parseSchedule('revise notes for 62 minutes').tasks[0].estimatedMinutes).toBe(62)
    expect(parseSchedule('a 2 hour lab').tasks[0].estimatedMinutes).toBe(120)
  })

  it('reads a deadline', () => {
    expect(parseSchedule('essay due tomorrow').tasks[0].urgency).toBe('tomorrow')
    expect(parseSchedule('form due next week takes 30 minutes').tasks[0].deadlineDays).toBe(6)
  })

  it('keeps one commitment together when it mentions both a deadline and a duration', () => {
    const result = parseSchedule('bursary form due next week 30 minutes')
    expect(result.tasks).toHaveLength(1)
    expect(result.tasks[0].estimatedMinutes).toBe(30)
    expect(result.tasks[0].deadlineDays).toBe(6)
  })

  it('categorises by keyword', () => {
    expect(parseSchedule('Database lecture from 9 to 12').tasks[0].category).toBe('time')
    expect(parseSchedule('revise normalisation notes for 20 minutes').tasks[0].category).toBe('mental')
    expect(parseSchedule('weekly groceries 45 minutes').tasks[0].category).toBe('errands')
    expect(parseSchedule('90 minute commute').tasks[0].category).toBe('physical')
    expect(parseSchedule('Film Society at 5').tasks[0].category).toBe('social')
  })

  it('surfaces what it had to assume instead of guessing silently', () => {
    const result = parseSchedule('groceries')
    expect(result.ambiguities.length).toBeGreaterThan(0)
    expect(result.ambiguities.join(' ')).toMatch(/assumed 30 minutes/)
  })

  it('reports low confidence on text it does not recognise', () => {
    expect(parseSchedule('xyzzy plugh, frobnicate widget').confidence).toBe(0)
  })

  it('returns nothing for empty input rather than inventing a commitment', () => {
    expect(parseSchedule('').tasks).toHaveLength(0)
    expect(parseSchedule('   ').tasks).toHaveLength(0)
  })

  it('parses the seeded week into the demonstration schedule', () => {
    const result = parseSchedule(DEMO_SCHEDULE_TEXT)
    expect(result.tasks).toHaveLength(9)
    expect(result.confidence).toBe(1)
    expect(result.tasks.filter((t) => t.flexibility === 'fixed')).toHaveLength(4)
    expect(result.ambiguities).toHaveLength(3)
  })

  it('keeps an explicit time for a single timed event', () => {
    const task = parseSchedule('Film Society at 5 pm').tasks[0]
    expect(task.startMinute).toBe(17 * 60)
    expect(task.endMinute).toBe(18 * 60)
  })
})

describe('titleise', () => {
  it('strips the scheduling phrases out of the title', () => {
    expect(titleise('Database Systems lecture from 9 to 12')).toBe('Database Systems lecture')
    expect(titleise('ERD assignment due tomorrow takes 120 minutes')).toBe('ERD assignment')
    expect(titleise('90 minute commute')).toBe('Commute')
    expect(titleise('Film Society at 5')).toBe('Film Society')
  })
})

describe('extractDeliverables', () => {
  it('pulls the requirements out of a brief', () => {
    const found = extractDeliverables(DEMO_BRIEF)
    expect(found.length).toBeGreaterThanOrEqual(4)
    expect(found.join(' ')).toMatch(/entities/i)
    expect(found.join(' ')).toMatch(/many-to-many/i)
  })

  it('ignores prose that asks for nothing', () => {
    expect(extractDeliverables('This module runs on Tuesdays. The lecturer is Dr Bell.')).toHaveLength(0)
  })

  it('caps how much it will claim to have found', () => {
    const many = Array.from({ length: 40 }, (_, i) => `- Identify thing number ${i}`).join('\n')
    expect(extractDeliverables(many).length).toBeLessThanOrEqual(8)
  })
})
