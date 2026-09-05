/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { hasProgress, Library } from './Library'
import { initialState, type GameState } from './state'

function Harness({ initial }: { initial: Partial<GameState> }) {
  const [state, setState] = useState<GameState>(() => ({ ...initialState(), started: true, onboarded: true, ...initial }))
  return <Library state={state} update={setState} go={vi.fn()} toast={vi.fn()} onExit={vi.fn()} />
}

function withActiveSession(over: Partial<GameState> = {}): Partial<GameState> {
  const base = initialState()
  const task = base.tasks.find((t) => t.id === base.activeTaskId) ?? base.tasks.find((t) => t.day === 'thu')!
  return {
    blocker: 'unclear_start',
    activeTaskId: task.id,
    activeCheckpointId: base.checkpoints[0]?.id ?? 'seed-cp',
    checkpoints: base.checkpoints.length
      ? base.checkpoints
      : [{ id: 'seed-cp', title: 'List the visible pieces', definitionOfDone: 'Every piece written down.', estimatedMinutes: 15, status: 'pending' }],
    progressNote: '',
    nextAction: '',
    session: { ...base.session, elapsedSec: 0 },
    ...over,
  }
}

describe('hasProgress', () => {
  it('is true for a note, a next action, or time on the clock', () => {
    expect(hasProgress({ ...initialState(), progressNote: 'Mapped two entities' })).toBe(true)
    expect(hasProgress({ ...initialState(), nextAction: 'Add the junction entity' })).toBe(true)
    expect(hasProgress({ ...initialState(), session: { ...initialState().session, elapsedSec: 45 } })).toBe(true)
    expect(hasProgress({
      ...initialState(),
      progressNote: '',
      nextAction: '',
      session: { ...initialState().session, elapsedSec: 0 },
    })).toBe(false)
    expect(hasProgress(initialState())).toBe(false)
  })
})

describe('desk welcome-back', () => {
  it('shows what changed, the next action, and time spent before the session', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession({
      progressNote: 'Mapped two entities',
      nextAction: 'Add the junction entity',
      session: { ...initialState().session, elapsedSec: 90, timerMode: 'down', timerLenSec: 900 },
    })} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    const dialog = await screen.findByRole('dialog', {}, { timeout: 3000 })
    expect(dialog).toHaveTextContent('Welcome back')
    expect(dialog).toHaveTextContent('Mapped two entities')
    expect(dialog).toHaveTextContent('Add the junction entity')
    expect(dialog).toHaveTextContent('2 min so far')
    await user.click(screen.getByRole('button', { name: /keep going/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Done when')
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
  })

  it('opens the session directly when there is no prior progress', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession()} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    expect(await screen.findByRole('dialog', {}, { timeout: 3000 })).toHaveTextContent('Done when')
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
  })
})

describe('open-work badge', () => {
  it('badges the in-progress task in the task list', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession({ progressNote: 'Mapped two entities' })} />)
    await user.click(screen.getByRole('button', { name: /talk to mira/i }))
    const dialog = await screen.findByRole('dialog', {}, { timeout: 3000 })
    expect(dialog).toHaveTextContent('You did this before — resume at your desk')
  })
})
