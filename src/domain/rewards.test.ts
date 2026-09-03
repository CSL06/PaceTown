import { describe, expect, it } from 'vitest'
import {
  completesAcademicWork, levelOf, questReward, sessionReward, XP_PER_LEVEL,
} from './rewards'

describe('session outcomes', () => {
  it('rewards every valid outcome, not only completion', () => {
    for (const outcome of ['completed', 'partial', 'blocked', 'rescheduled'] as const) {
      expect(sessionReward(outcome).xp).toBeGreaterThan(0)
    }
  })

  it('rewards completion more than partial progress, but not by much', () => {
    expect(sessionReward('completed').xp).toBeGreaterThan(sessionReward('partial').xp)
    expect(sessionReward('completed').xp).toBeLessThanOrEqual(sessionReward('partial').xp * 2)
  })

  it('treats naming a blocker as worth the same as partial progress', () => {
    expect(sessionReward('blocked')).toEqual(sessionReward('partial'))
  })

  it('does not punish rescheduling honestly', () => {
    expect(sessionReward('rescheduled')).toEqual(sessionReward('partial'))
  })
})

describe('recovery quests', () => {
  it('pays self-confirmation and photo confirmation identically', () => {
    // The product promise in §11 and §14, enforced here rather than in the UI.
    for (const outcome of ['done', 'partial', 'changed', 'another'] as const) {
      expect(questReward(outcome, 'self')).toEqual(questReward(outcome, 'photo'))
      expect(questReward(outcome, 'self')).toEqual(questReward(outcome, 'none'))
    }
  })

  it('still earns for partly done', () => {
    expect(questReward('partial').xp).toBeGreaterThan(0)
    expect(questReward('partial').xp).toBeLessThan(questReward('done').xp)
  })

  it('costs nothing to change your mind', () => {
    expect(questReward('changed')).toEqual({ xp: 0, coins: 0 })
    expect(questReward('another')).toEqual({ xp: 0, coins: 0 })
  })
})

describe('levels', () => {
  it('starts at level one', () => {
    expect(levelOf(0)).toEqual({ level: 1, into: 0, need: XP_PER_LEVEL })
  })

  it('advances every 200 XP', () => {
    expect(levelOf(199).level).toBe(1)
    expect(levelOf(200).level).toBe(2)
    expect(levelOf(415)).toEqual({ level: 3, into: 15, need: 200 })
  })

  it('cannot be driven negative', () => {
    expect(levelOf(-50).level).toBe(1)
  })
})

describe('academic completion', () => {
  it('only the student completes their own work', () => {
    expect(completesAcademicWork('student')).toBe(true)
  })

  it('a timer, a mini-game and an assistant never do', () => {
    // Vision §4: PaceTown is not a tool that marks work complete because a
    // timer ended or AI generated an answer.
    expect(completesAcademicWork('timer')).toBe(false)
    expect(completesAcademicWork('minigame')).toBe(false)
    expect(completesAcademicWork('ai')).toBe(false)
  })
})
