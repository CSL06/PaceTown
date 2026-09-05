/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { DailyLoad } from '../../domain'
import { buildCheckpoints } from '../../domain/plans'
import type { GameState } from '../state'
import { initialState } from '../state'
import { Session } from './Loop'

function propsFor(over: Partial<GameState> = {}) {
  const state: GameState = {
    ...initialState(),
    blocker: 'unclear_start',
    checkpoints: buildCheckpoints('unclear_start', { taskTitle: 'ERD' }),
    ...over,
  }
  state.activeCheckpointId = state.checkpoints[0].id
  const load = { percentage: 91, contributors: [] } as unknown as DailyLoad
  let current = state
  const update = (fn: (s: GameState) => GameState) => { current = fn(current) }
  return { state: () => current, load, update, go: vi.fn(), toast: vi.fn() }
}

describe('chosen guardian in Session', () => {
  it('asks the overridden guardian and offers their action', () => {
    const p = propsFor({ guardianOverride: 'sol' })
    render(<Session state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByText(/ask sol/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /shrink to a 5-minute step/i }))
    expect(p.state().checkpoints[0].estimatedMinutes).toBe(5)
  })

  it('defaults to the routed guardian with their action', () => {
    const p = propsFor()
    render(<Session state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(screen.getByText(/ask mira/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /draft outline into scratchpad/i })).toBeInTheDocument()
  })
})
