/**
 * @vitest-environment jsdom
 */
import { useEffect, useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { dailyLoad, wakingMinutes } from '../../domain'
import type { ViewId } from '../layout'
import { initialState, type GameState } from '../state'
import { RecoveryScene, type RecoveryView } from './RecoveryScene'

function Harness({ view, onState, go = vi.fn() }: {
  view: RecoveryView
  onState?: (state: GameState) => void
  go?: (view: ViewId | null) => void
}) {
  const [state, setState] = useState(() => ({ ...initialState(), started: true, onboarded: true }))
  useEffect(() => onState?.(state), [state, onState])
  const load = dailyLoad(state.tasks, 'thu', wakingMinutes(state.capacity))
  return <RecoveryScene view={view} state={state} load={load} update={setState} go={go} toast={vi.fn()} />
}

describe('recovery activity scenes', () => {
  it('lets a ripple interaction finish without answering the optional check-in', async () => {
    const user = userEvent.setup()
    let latest = initialState()
    const go = vi.fn()
    render(<Harness view="ripples" go={go} onState={(state) => { latest = state }} />)

    await user.click(screen.getByRole('button', { name: /something that can wait/i }))
    expect(screen.getByText(/pond guides three breaths/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /begin three slow breaths/i }))
    await user.click(screen.getByRole('button', { name: /enough for now/i }))
    expect(screen.getByText(/pressure did not disappear/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /decide what it needs/i }))
    await user.click(screen.getByRole('button', { name: /more quiet first/i }))

    expect(latest.regulationSessions.at(-1)?.activity).toBe('gentle_ripples')
    expect(latest.regulationSessions.at(-1)?.response).toBe('not_sure')
    expect(go).toHaveBeenCalledWith('calm')
  })

  it('allows Chime Drift to be watched or ended without tapping notes', async () => {
    const user = userEvent.setup()
    render(<Harness view="chime" />)
    await user.click(screen.getByRole('button', { name: /just listen/i }))
    expect(screen.getByText(/nothing to do/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /enough for now/i }))
    expect(screen.getByRole('dialog', { name: /recovery check-in/i })).toBeInTheDocument()
  })

  it('walks through choosing, pouring, adding and stirring a warm cup', async () => {
    const user = userEvent.setup()
    render(<Harness view="warmcup" />)
    await user.click(screen.getByRole('button', { name: 'Warmth' }))
    await user.click(screen.getByRole('button', { name: 'Barley tea' }))
    const pour = screen.getByRole('button', { name: /hold to pour/i })
    await user.click(pour); await user.click(pour); await user.click(pour); await user.click(pour); await user.click(pour)
    await user.click(screen.getByRole('button', { name: /pour complete/i }))
    await user.click(screen.getByRole('button', { name: /honey/i }))
    const stir = screen.getByRole('button', { name: /stir gently/i })
    await user.click(stir); await user.click(stir); await user.click(stir)
    await user.click(screen.getByRole('button', { name: /take it to the window/i }))
    await user.click(screen.getByRole('button', { name: /i’m ready/i }))
    expect(screen.getByRole('dialog', { name: /recovery check-in/i })).toBeInTheDocument()
  })

  it('reveals only the Firefly Story the player follows', async () => {
    const user = userEvent.setup()
    render(<Harness view="firefly" />)
    expect(screen.queryByText('The reachable book')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /i’m too far behind/i }))
    expect(screen.getByText('The reachable book')).toBeInTheDocument()
    expect(screen.getByText(/choose the one piece/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /carry this line/i }))
    expect(screen.getByRole('dialog', { name: /recovery check-in/i })).toBeInTheDocument()
  })

  it('keeps a Lantern phrase only after an explicit destination choice', async () => {
    const user = userEvent.setup()
    let latest = initialState()
    render(<Harness view="lanterns" onState={(state) => { latest = state }} />)
    await user.click(screen.getByRole('button', { name: /something i need to remember/i }))
    await user.type(screen.getByPlaceholderText(/only if words help/i), 'Call home when I have space')
    await user.click(screen.getByRole('button', { name: /light the lantern/i }))
    await user.click(screen.getByRole('button', { name: /by my backpack/i }))
    await user.click(screen.getByRole('button', { name: /set it down with meaning/i }))
    expect(latest.recoveryNotes).toHaveLength(0)
    await user.click(within(screen.getByRole('dialog', { name: /recovery check-in/i })).getByRole('button', { name: /keep it intentionally/i }))
    expect(latest.recoveryNotes.at(-1)?.text).toBe('Call home when I have space')
  })
})
