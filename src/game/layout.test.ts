import { describe, expect, it } from 'vitest'
import { firstStepForIntro, focusGuardianFor, nextStepFor } from './layout'

describe('focusGuardianFor', () => {
  it('maps each next-step view to the guardian who owns it', () => {
    expect(focusGuardianFor('rebalance')).toBe('kai')
    expect(focusGuardianFor('recover')).toBe('sol')
    expect(focusGuardianFor('session')).toBe('mira')
    expect(focusGuardianFor('work')).toBe('mira')
    expect(focusGuardianFor('garden')).toBe('sol')
    expect(focusGuardianFor('load')).toBe('kai')
    expect(focusGuardianFor('warmcup')).toBe('sky')
    expect(focusGuardianFor('lanterns')).toBe('goh')
    expect(focusGuardianFor(null)).toBeNull()
  })
})

describe('nextStepFor', () => {
  it('returns a one-line recommendation per view', () => {
    expect(nextStepFor('rebalance')).toMatch(/can move/i)
    expect(nextStepFor('recover')).toMatch(/recovery/i)
    expect(nextStepFor('work')).toMatch(/checkpoint/i)
    expect(nextStepFor(null)).toMatch(/checkpoint/i)
  })
})

describe('firstStepForIntro', () => {
  it('leads a brand-new player to Town Hall, returning players to the loop', () => {
    expect(firstStepForIntro({ journal: [], rebalanceSeen: false })).toBe('intake')
    expect(firstStepForIntro({ journal: [{ at: 1 }], rebalanceSeen: false })).toBe('rebalance')
    expect(firstStepForIntro({ journal: [{ at: 1 }], rebalanceSeen: true })).toBe('work')
  })
})
