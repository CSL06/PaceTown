/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { DailyLoad, Task } from '../../domain'
import { buildCheckpoints } from '../../domain/plans'
import type { GameState } from '../state'
import { initialState } from '../state'
import { Work } from './Loop'

function propsFor(over: Partial<GameState> = {}) {
  const state: GameState = {
    ...initialState(),
    blocker: 'unclear_start',
    checkpoints: buildCheckpoints('unclear_start', { taskTitle: 'ERD' }),
    ...over,
  }
  state.activeCheckpointId = state.checkpoints[0].id
  const load = {
    percentage: 108,
    contributors: [{ task: { id: 't1', title: 'ERD', estimatedMinutes: 120 } as unknown as Task, weighted: 1 }],
  } as unknown as DailyLoad
  let current = state
  const update = (fn: (s: GameState) => GameState) => { current = fn(current) }
  return { state: () => current, load, update, go: vi.fn(), toast: vi.fn() }
}

describe('guardian picker', () => {
  it('pre-selects the routed guardian and switches on click', () => {
    const p = propsFor()
    const { rerender } = render(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    // Scope to the picker group: the Start button ("Start a Pace Session with
    // Mira") also contains the guardian name, so an unscoped getByRole query
    // matches two buttons. The picker is the group labelled "Choose your guardian".
    const picker = () => within(screen.getByRole('group', { name: /choose your guardian/i }))
    expect(picker().getByRole('button', { name: /mira/i })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(picker().getByRole('button', { name: /sol/i }))
    expect(p.state().guardianOverride).toBe('sol')
    rerender(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    expect(picker().getByRole('button', { name: /sol/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clears the override when a different blocker is picked', () => {
    const p = propsFor()
    const { rerender } = render(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    const picker = () => within(screen.getByRole('group', { name: /choose your guardian/i }))
    const blockers = () => within(screen.getByRole('group', { name: /what is blocking/i }))
    fireEvent.click(picker().getByRole('button', { name: /sol/i }))
    expect(p.state().guardianOverride).toBe('sol')
    rerender(<Work state={p.state()} load={p.load} update={p.update} go={p.go} toast={p.toast} />)
    fireEvent.click(blockers().getByRole('button', { name: /too large/i }))
    expect(p.state().guardianOverride).toBeNull()
  })
})
