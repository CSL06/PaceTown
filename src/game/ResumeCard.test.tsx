/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, type Mock } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { buildCheckpoints } from '../domain/plans'
import type { Task } from '../domain'
import type { ViewId } from './layout'
import type { GameState } from './state'
import { initialState } from './state'
import { ResumeCard } from './ResumeCard'

function stub(): { state: GameState; go: Mock<(view: ViewId | null) => void> } {
  const state: GameState = {
    ...initialState(),
    blocker: 'unclear_start',
    checkpoints: buildCheckpoints('unclear_start', { taskTitle: 'ERD' }),
    tasks: [{ id: 't1', title: 'ERD' } as unknown as Task],
    activeTaskId: 't1',
    nextAction: 'Read the brief once',
    progressNote: '',
  }
  state.activeCheckpointId = state.checkpoints[0].id
  state.session.elapsedSec = 150
  return { state, go: vi.fn<(view: ViewId | null) => void>() }
}

describe('ResumeCard', () => {
  it('summarises task, checkpoint, time spent and next action in the guardian’s voice', () => {
    const { state, go } = stub()
    render(<ResumeCard state={state} go={go} />)
    expect(screen.getByText('Mira')).toBeInTheDocument()
    expect(screen.getByText('ERD')).toBeInTheDocument()
    expect(screen.getByText(state.checkpoints[0].title)).toBeInTheDocument()
    expect(screen.getByText(/2 min so far/)).toBeInTheDocument()
    expect(screen.getByText(/Next action: Read the brief once/)).toBeInTheDocument()
  })

  it('offers resume, edit plan and something else', () => {
    const { state, go } = stub()
    render(<ResumeCard state={state} go={go} />)
    fireEvent.click(screen.getByRole('button', { name: /^resume$/i }))
    expect(go).toHaveBeenCalledWith('session')
    fireEvent.click(screen.getByRole('button', { name: /edit plan/i }))
    expect(go).toHaveBeenCalledWith('work')
    fireEvent.click(screen.getByRole('button', { name: /something else/i }))
    expect(go).toHaveBeenCalledWith('townlist')
  })

  it('names the overridden guardian and an empty next action honestly', () => {
    const { state, go } = stub()
    state.guardianOverride = 'sol'
    state.nextAction = '   '
    render(<ResumeCard state={state} go={go} />)
    expect(screen.getByText('Sol')).toBeInTheDocument()
    expect(screen.getByText(/no next action saved yet/i)).toBeInTheDocument()
  })

  it('shows what changed last time with the outcome label', () => {
    const { state, go } = stub()
    state.progressNote = 'Mapped two entities'
    state.outcome = 'partial'
    render(<ResumeCard state={state} go={go} />)
    expect(screen.getByText(/Last time \(Partial progress\): Mapped two entities/)).toBeInTheDocument()
  })

  it('omits the last-time line when no note was saved', () => {
    const { state, go } = stub()
    render(<ResumeCard state={state} go={go} />)
    expect(screen.queryByText(/Last time/)).not.toBeInTheDocument()
  })
})
