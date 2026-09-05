/**
 * @vitest-environment jsdom
 */
import { useEffect, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { hasProgress, Library } from './Library'
import { initialState, type GameState } from './state'

function Harness({ initial, onState }: { initial: Partial<GameState>; onState?: (state: GameState) => void }) {
  const [state, setState] = useState<GameState>(() => ({ ...initialState(), started: true, onboarded: true, ...initial }))
  useEffect(() => { onState?.(state) }, [state, onState])
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

describe('session shows the saved note', () => {
  it('pre-fills what changed and the next action when the student re-enters the session', async () => {
    const user = userEvent.setup()
    render(<Harness initial={withActiveSession({
      progressNote: 'Mapped two entities',
      nextAction: 'Add the junction entity',
    })} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    const welcome = await screen.findByRole('dialog', {}, { timeout: 3000 })
    expect(welcome).toHaveTextContent('Welcome back')
    await user.click(screen.getByRole('button', { name: /keep going/i }))
    expect(await screen.findByText('Done when', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByLabelText('What changed so far')).toBeInTheDocument()
    expect(screen.getByLabelText('Saved next action')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mapped two entities')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Add the junction entity')).toBeInTheDocument()
  })

  it('writes typed session fields straight into the save', async () => {
    const user = userEvent.setup()
    const states: GameState[] = []
    render(<Harness initial={withActiveSession()} onState={(state) => states.push(state)} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    expect(await screen.findByText('Done when', {}, { timeout: 3000 })).toBeInTheDocument()
    await user.type(screen.getByLabelText('What changed so far'), 'Mapped two entities')
    await user.type(screen.getByLabelText('Saved next action'), 'Add the junction entity')
    expect(states[states.length - 1].progressNote).toBe('Mapped two entities')
    expect(states[states.length - 1].nextAction).toBe('Add the junction entity')
  })

  it('writes reflect typing into the save, and it survives the recovery break and re-entry', async () => {
    const user = userEvent.setup()
    const states: GameState[] = []
    render(<Harness initial={withActiveSession({ session: { ...initialState().session, elapsedSec: 60 } })} onState={(state) => states.push(state)} />)
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    const welcome = await screen.findByRole('dialog', {}, { timeout: 3000 })
    expect(welcome).toHaveTextContent('Welcome back')
    await user.click(screen.getByRole('button', { name: /keep going/i }))
    await user.click(await screen.findByRole('button', { name: /pause or record progress/i }, { timeout: 3000 }))
    await user.click(screen.getByRole('button', { name: /made some progress/i }))
    await user.type(await screen.findByLabelText('What changed?'), 'Junction entity drafted')
    expect(states[states.length - 1].progressNote).toBe('Junction entity drafted')
    await user.click(screen.getByRole('button', { name: /take a recovery break/i }))
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /your place is ready/i }))
    const welcomeAgain = await screen.findByRole('dialog', {}, { timeout: 3000 })
    expect(welcomeAgain).toHaveTextContent('Welcome back')
    await user.click(screen.getByRole('button', { name: /keep going/i }))
    await user.click(await screen.findByRole('button', { name: /pause or record progress/i }, { timeout: 3000 }))
    await user.click(screen.getByRole('button', { name: /made some progress/i }))
    expect(await screen.findByDisplayValue('Junction entity drafted', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
