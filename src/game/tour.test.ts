import { describe, expect, it } from 'vitest'
import { TOUR_STEPS } from './tour'

describe('guided tour', () => {
  it('walks the full loop in order', () => {
    expect(TOUR_STEPS.map((s) => s.view)).toEqual([
      'intake', 'understand', 'rebalance', 'work', 'session',
      'ripples', 'pocket', 'keepsakes', 'journal',
    ])
  })

  it('gives every step a unique id, an intro, choices, and a payoff', () => {
    const ids = TOUR_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const step of TOUR_STEPS) {
      expect(step.label.length).toBeGreaterThan(0)
      expect(step.intro.length).toBeGreaterThan(10)
      expect(step.choices.length).toBeGreaterThanOrEqual(2)
      expect(step.payoff.length).toBeGreaterThan(10)
    }
  })

  it('asks only for choices — nothing to type', () => {
    const text = TOUR_STEPS.flatMap((s) => s.choices).join(' ').toLowerCase()
    expect(text).not.toMatch(/type|write a|paste/)
  })
})
