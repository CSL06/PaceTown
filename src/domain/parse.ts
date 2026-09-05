/**
 * Local, deterministic parsing (implementation plan §16).
 *
 * This is the fallback that has to work when no AI provider is connected, so
 * it is written to be predictable rather than clever: it never invents a
 * commitment, and anything it had to assume is returned in `ambiguities` for
 * review before saving.
 */

import type { DemandCategory, Task } from './types'

export interface ParsedTaskResult {
  tasks: Task[]
  /** Assumptions made, surfaced rather than hidden. */
  ambiguities: string[]
  /** Share of fragments whose category was recognised, 0–1. */
  confidence: number
}

const CATEGORY_WORDS: Record<DemandCategory, string[]> = {
  time: ['lecture', 'class', 'lab', 'seminar', 'shift', 'tutorial', 'exam'],
  mental: ['assignment', 'essay', 'revision', 'revise', 'report', 'erd', 'coursework',
    'reading', 'study', 'notes', 'project'],
  physical: ['gym', 'walk', 'run', 'commute', 'laundry', 'swim', 'training', 'cycle'],
  social: ['society', 'club', 'friends', 'dinner', 'birthday', 'party'],
  errands: ['groceries', 'shopping', 'form', 'bank', 'post', 'pharmacy', 'appointment',
    'renew', 'admin', 'bursary'],
}

/** Things that occupy a slot in the day rather than waiting for one. */
const FIXED_WORDS = ['commute', 'lecture', 'class', 'lab', 'seminar', 'tutorial', 'shift',
  'society', 'club', 'meeting', 'appointment', 'exam']

/** Paperwork costs more thought than carrying shopping home. */
const EFFORTFUL_ERRANDS = ['form', 'admin', 'bank', 'appointment', 'renew', 'bursary']

const HIGH_PRIORITY_WORDS = ['assignment', 'essay', 'report', 'erd', 'exam', 'dissertation',
  'coursework']

const DAY_WORDS: Record<string, number> = {
  today: 0, tonight: 0, tomorrow: 1, wednesday: 0, thursday: 1, friday: 1,
  saturday: 2, sunday: 3, monday: 5, tuesday: 6, 'next week': 6,
}

const EVENING_WORDS = ['café', 'cafe', 'shift', 'society', 'club', 'dinner', 'party']

function clockMinute(hour: number, minute: number, meridiem?: string): number {
  const h = hour % 12
  return h * 60 + minute + (meridiem?.toLowerCase() === 'pm' ? 12 * 60 : 0)
}

function inferredClockMinute(hour: number, minute: number, text: string): number {
  const evening = hasWord(text, EVENING_WORDS)
  return clockMinute(hour, minute) + (evening && hour <= 7 ? 12 * 60 : 0)
}

function hasWord(text: string, words: readonly string[]): boolean {
  return words.some((w) => new RegExp(`\\b${w}\\b`).test(text))
}

function shorten(s: string): string {
  return s.length > 30 ? `${s.slice(0, 30)}…` : s
}

/** Strip scheduling phrases out of a fragment so the title reads cleanly. */
export function titleise(fragment: string): string {
  const t = fragment
    .replace(/^(i\s+have\s+a?\s*|i\s+need\s+to\s+|i\s+still\s+need\s+to\s+|my\s+|there'?s\s+)/i, '')
    .replace(/\s*\b(from|at)\s+\d{1,2}(:\d{2})?\s*(am|pm)?(\s*(to|until|till|-|–|—)\s*\d{1,2}(:\d{2})?\s*(am|pm)?)?/i, '')
    .replace(/\s*\b(takes|for)?\s*\d+\s*(minutes|minute|mins|min|hours|hour|hrs|hr)\b/i, '')
    .replace(/\s*\bdue\s+(today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)/i, '')
    .trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * Turn a plain-language description of a week into editable commitments.
 * Splits on punctuation only — "due next week and takes 30 minutes" must stay
 * one commitment rather than becoming two.
 */
export function parseSchedule(text: string, day = 'thu'): ParsedTaskResult {
  const fragments = String(text)
    .split(/[,;.\n]/)
    .map((s) => s.replace(/^\s*(and|then)\s+/i, '').trim())
    .filter((s) => s.length > 3)

  const tasks: Task[] = []
  const ambiguities: string[] = []
  let recognised = 0

  fragments.forEach((fragment, i) => {
    const low = fragment.toLowerCase()

    let category: DemandCategory | null = null
    for (const key of Object.keys(CATEGORY_WORDS) as DemandCategory[]) {
      if (hasWord(low, CATEGORY_WORDS[key])) {
        category = key
        break
      }
    }
    if (category) recognised += 1
    else category = 'errands'

    let minutes: number | null = null
    let startMinute: number | undefined
    let endMinute: number | undefined
    let fixed = hasWord(low, FIXED_WORDS)

    const range = low.match(
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|until|till|–|—|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/,
    )
    if (range) {
      const startHour = Number(range[1])
      const startPart = Number(range[2] ?? 0)
      const startMeridiem = range[3]
      const endHour = Number(range[4])
      const endPart = Number(range[5] ?? 0)
      const endMeridiem = range[6]
      startMinute = startMeridiem
        ? clockMinute(startHour, startPart, startMeridiem)
        : inferredClockMinute(startHour, startPart, low)
      endMinute = endMeridiem
        ? clockMinute(endHour, endPart, endMeridiem)
        : inferredClockMinute(endHour, endPart, low)
      while (endMinute <= startMinute) endMinute += 12 * 60
      minutes = endMinute - startMinute
      fixed = true
    }
    if (minutes === null) {
      const dur = low.match(/(\d+)\s*(minutes|minute|mins|min|hours|hour|hrs|hr)\b/)
      if (dur) minutes = /^h/.test(dur[2]) ? Number(dur[1]) * 60 : Number(dur[1])
    }
    const at = low.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
    if (minutes === null && at) {
      minutes = 60
      fixed = true
      const hour = Number(at[1])
      const minute = Number(at[2] ?? 0)
      startMinute = at[3]
        ? clockMinute(hour, minute, at[3])
        : inferredClockMinute(hour, minute, low)
      endMinute = startMinute + minutes
    }
    if (minutes === null) {
      minutes = 30
      ambiguities.push(`No duration given for “${shorten(fragment)}” — assumed 30 minutes.`)
    }

    let deadlineDays = 5
    let urgency: Task['urgency'] = 'later'
    const due = low.match(
      /due\s+(today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)/,
    )
    if (due) {
      deadlineDays = DAY_WORDS[due[1]] ?? 5
      urgency = deadlineDays === 0 ? 'today' : deadlineDays === 1 ? 'tomorrow' : 'later'
    } else if (fixed) {
      deadlineDays = 0
      urgency = 'today'
    } else {
      ambiguities.push(`No deadline given for “${shorten(fragment)}” — treated as flexible this week.`)
    }

    const urgent = urgency === 'today' || urgency === 'tomorrow'
    const priority: Task['priority'] = fixed
      ? 'high'
      : hasWord(low, HIGH_PRIORITY_WORDS) || urgent
        ? 'high'
        : category === 'mental'
          ? 'medium'
          : 'low'

    const mentalEffort: Task['mentalEffort'] =
      category === 'mental'
        ? 'high'
        : category === 'time'
          ? hasWord(low, ['shift']) ? 'low' : 'medium'
          : category === 'errands'
            ? hasWord(low, EFFORTFUL_ERRANDS) ? 'medium' : 'low'
            : 'low'

    tasks.push({
      id: `p${i}`,
      title: titleise(fragment),
      category,
      day,
      startMinute,
      endMinute,
      estimatedMinutes: minutes,
      priority,
      mentalEffort,
      flexibility: fixed ? 'fixed' : 'flexible',
      urgency,
      deadlineDays,
      source: 'parsed',
      status: 'pending',
    })
  })

  return {
    tasks,
    ambiguities,
    confidence: fragments.length ? Math.round((recognised / fragments.length) * 100) / 100 : 0,
  }
}

const DELIVERABLE_VERBS =
  /\b(must|should|include|submit|produce|design|implement|identify|describe|justify|create|draw|write|explain|resolve|normalis|normaliz|list)\b/i

/**
 * Pull deliverables out of an assignment brief. Deliberately shallow pattern
 * matching: every line stays editable, and extracted text never becomes the
 * submitted work (vision §18).
 */
export function extractDeliverables(text: string, limit = 8): string[] {
  return String(text)
    .replace(/\.\s+/g, '.\n')
    .split(/\n|;/)
    .map((raw) => raw.replace(/^[\s\-•*·\d.)]+/, '').trim())
    .filter((t) => t.length >= 10 && DELIVERABLE_VERBS.test(t))
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .slice(0, limit)
}
