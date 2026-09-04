import { describe, expect, it } from 'vitest'
import {
  REGULATION_IDS, REGULATIONS, completesRegulation, recommendRecovery,
} from './regulation'

describe('regulation catalogue', () => {
  it('covers all five mini-games', () => {
    expect(REGULATION_IDS).toEqual([
      'firefly_stories', 'chime_drift', 'gentle_ripples', 'warm_cup', 'night_lanterns',
    ])
  })

  it('gives every activity a guardian and a short duration', () => {
    for (const id of REGULATION_IDS) {
      const a = REGULATIONS[id]
      expect(a.guardian.length).toBeGreaterThan(0)
      expect(a.typicalSeconds[0]).toBeGreaterThanOrEqual(30)
      expect(a.typicalSeconds[1]).toBeLessThanOrEqual(180)
    }
  })
})

describe('recommendRecovery', () => {
  it('pairs unclear starts and perfection pressure with Firefly Stories', () => {
    expect(recommendRecovery('unclear_start', null).digital).toBe('firefly_stories')
    expect(recommendRecovery('perfection_pressure', null).digital).toBe('firefly_stories')
  })

  it('pairs time pressure with Chime Drift', () => {
    expect(recommendRecovery(null, 'time').digital).toBe('chime_drift')
  })

  it('pairs low capacity with Warm Cup', () => {
    expect(recommendRecovery('low_capacity', null).digital).toBe('warm_cup')
  })

  it('defaults to Gentle Ripples', () => {
    expect(recommendRecovery(null, null).digital).toBe('gentle_ripples')
  })

  it('always offers Pocket of Green as the IRL path', () => {
    for (const [blocker, area] of [['unclear_start', 'time'], [null, null]] as const) {
      expect(recommendRecovery(blocker, area).irl).toBe('pocket_of_green')
    }
  })
})

describe('completesRegulation', () => {
  it('participation completes; scores and durations never do', () => {
    expect(completesRegulation('participation')).toBe(true)
    expect(completesRegulation('score')).toBe(false)
    expect(completesRegulation('duration')).toBe(false)
  })
})
