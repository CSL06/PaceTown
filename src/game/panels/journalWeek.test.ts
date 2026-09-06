import { describe, expect, it } from 'vitest'
import { dayKey, lastSevenDays } from './Places'

/** 2026-09-06 is a Sunday; all fixtures hang off it. */
const SUNDAY = new Date(2026, 8, 6, 14, 0, 0).getTime()
const DAY = 86_400_000

describe('the journal week strip', () => {
  it('always offers exactly seven days, oldest first', () => {
    const week = lastSevenDays([], SUNDAY)
    expect(week).toHaveLength(7)
    expect(week[6].key).toBe(dayKey(SUNDAY))
    expect(week[0].date.getTime()).toBeLessThan(week[6].date.getTime())
  })

  it('counts entries into the day they happened on', () => {
    const week = lastSevenDays([
      { at: SUNDAY - 60_000 },
      { at: SUNDAY - 120_000 },
      { at: SUNDAY - DAY * 2 },
    ], SUNDAY)
    expect(week[6].count).toBe(2)
    expect(week[4].count).toBe(1)
  })

  it('reports an empty day as zero rather than omitting it', () => {
    // The strip has to show quiet days, or it becomes a streak by omission.
    const week = lastSevenDays([{ at: SUNDAY }], SUNDAY)
    expect(week.filter((d) => d.count === 0)).toHaveLength(6)
  })

  it('ignores anything older than the window instead of piling it on day one', () => {
    const week = lastSevenDays([{ at: SUNDAY - DAY * 40 }], SUNDAY)
    expect(week.every((d) => d.count === 0)).toBe(true)
  })

  it('buckets by local calendar day, not by fixed 24-hour blocks', () => {
    // One minute past midnight belongs to the new day, however recent it is.
    const justAfterMidnight = new Date(2026, 8, 6, 0, 1, 0).getTime()
    const justBefore = new Date(2026, 8, 5, 23, 59, 0).getTime()
    expect(dayKey(justAfterMidnight)).not.toBe(dayKey(justBefore))
    const week = lastSevenDays([{ at: justAfterMidnight }, { at: justBefore }], SUNDAY)
    expect(week[6].count).toBe(1)
    expect(week[5].count).toBe(1)
  })

  it('crosses a month boundary without collapsing days together', () => {
    const firstOfMonth = new Date(2026, 8, 1, 12, 0, 0).getTime()
    const week = lastSevenDays([{ at: firstOfMonth }], firstOfMonth)
    expect(week[6].count).toBe(1)
    // The six days before it are in the previous month and still distinct.
    expect(new Set(week.map((d) => d.key)).size).toBe(7)
  })
})
