import { describe, expect, it } from 'vitest'
import { foregroundQuest, selectQuests, type QuestContext } from './quests'

const ctx = (over: Partial<QuestContext> = {}): QuestContext => ({
  loadPercentage: 91.5,
  hasOutcome: false,
  hasRecovery: false,
  hasOpenCheckpoint: false,
  rebalanceAvailable: true,
  taskTitle: 'ERD assignment',
  nextAction: null,
  ...over,
})

describe('selectQuests', () => {
  it('offers at most three quests', () => {
    expect(selectQuests(ctx()).length).toBeLessThanOrEqual(3)
  })

  it('leads with rebalancing when moves are available', () => {
    expect(selectQuests(ctx())[0].id).toBe('quest-rebalance')
  })

  it('offers a checkpoint quest when there is nothing left to move', () => {
    const quests = selectQuests(ctx({ rebalanceAvailable: false, hasOpenCheckpoint: true }))
    expect(quests.some((q) => q.id === 'quest-checkpoint')).toBe(true)
  })

  it('stops offering finished work — a completed checkpoint is not re-offered', () => {
    const quests = selectQuests(ctx({ rebalanceAvailable: false, hasOpenCheckpoint: false }))
    expect(quests.some((q) => q.id === 'quest-checkpoint')).toBe(false)
  })

  it('sends the saved next action to the journal, where it waits', () => {
    const quests = selectQuests(ctx({ nextAction: 'Add the enrolment junction entity.' }))
    expect(quests.find((q) => q.id === 'quest-next-action')?.view).toBe('journal')
  })

  it('stops offering recovery once recovery is recorded', () => {
    const quests = selectQuests(ctx({ hasRecovery: true }))
    expect(quests.some((q) => q.id === 'quest-recovery')).toBe(false)
  })

  it('deprioritises frequently skipped kinds without removing them', () => {
    const quests = selectQuests(ctx(), ['quest-rebalance'])
    expect(quests).toHaveLength(3)
    expect(quests[quests.length - 1].id).toBe('quest-rebalance')
  })
})

describe('foregroundQuest', () => {
  it('foregrounds the rebalance quest when moves are available', () => {
    const quests = selectQuests(ctx())
    expect(foregroundQuest(quests, ctx())?.id).toBe('quest-rebalance')
  })

  it('foregrounds recovery once work has an outcome but no recovery', () => {
    const c = ctx({ rebalanceAvailable: false, hasOutcome: true, taskTitle: 'ERD assignment' })
    const quests = selectQuests(c)
    expect(foregroundQuest(quests, c)?.id).toBe('quest-recovery')
  })

  it('returns null when there is nothing to foreground', () => {
    expect(foregroundQuest([], ctx())).toBeNull()
  })
})
