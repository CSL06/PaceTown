import { describe, expect, it } from 'vitest'
import { demoTasks, type DailyLoad } from '../domain'
import type { GameState } from './state'
import { HELP, adaptiveLine } from './help'
import { GUARDIANS, type ViewId } from './layout'

const EXPECTED_VIEWS: readonly ViewId[] = [
  'intake', 'understand', 'rebalance', 'work', 'session',
  'recover', 'ripples', 'pocket', 'firefly', 'chime', 'warmcup', 'lanterns',
  'keepsakes', 'collection', 'journal', 'council', 'mailbox', 'calm', 'home',
  'backpack', 'garden', 'load', 'townlist', 'briefing',
  'settings', 'shop',
]

const base = (over: Partial<GameState> = {}) =>
  ({
    blocker: null, checkpoints: [], activeCheckpointId: null, activeTaskId: null,
    tasks: demoTasks(),
    capacity: { wakeHour: 8, sleepHour: 23, energy: null, stress: null, sleepHours: null },
    outcome: null, questOutcome: null, rebalanceSeen: false, ...over,
  }) as GameState

const fakeLoad = (percentage: number) => ({ percentage }) as DailyLoad

describe('HELP', () => {
  it('covers every view', () => {
    expect(Object.keys(HELP).sort()).toEqual([...EXPECTED_VIEWS].sort())
  })

  it('names only real guardians', () => {
    for (const h of Object.values(HELP)) {
      expect(Object.keys(GUARDIANS)).toContain(h.guardian.who)
      expect(h.what.length).toBeGreaterThan(10)
      expect(h.how.length).toBeGreaterThan(10)
      expect(h.guardian.why.length).toBeGreaterThan(10)
    }
  })

  it('adaptive lines never throw and return text or null', () => {
    for (const v of EXPECTED_VIEWS) {
      let out: string | null = null
      expect(() => { out = adaptiveLine(v, base(), fakeLoad(108)) }).not.toThrow()
      expect(out === null || typeof out === 'string').toBe(true)
    }
  })

  it('work names the guardian once a blocker is picked', () => {
    expect(adaptiveLine('work', base({ blocker: 'too_large' }), fakeLoad(91))).toContain('Kai')
    expect(adaptiveLine('work', base(), fakeLoad(91))).toContain('No blocker picked yet')
  })

  it('survives an empty state object', () => {
    expect(adaptiveLine('session', {} as GameState, {} as DailyLoad)).toBeNull()
  })

  it('rebalance describes the real proposal', () => {
    expect(adaptiveLine('rebalance', base(), fakeLoad(108))).toMatch(/Kai can move|Nothing can safely move/)
  })

  it('work names the chosen guardian when overridden', () => {
    expect(adaptiveLine('work', base({ blocker: 'too_large', guardianOverride: 'sol' }), fakeLoad(91))).toContain('Sol')
  })
})
