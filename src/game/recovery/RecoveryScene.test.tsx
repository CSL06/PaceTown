/**
 * @vitest-environment jsdom
 */
import { useEffect, useState } from 'react'
import { render, screen } from '@testing-library/react'
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
    await user.click(screen.getByRole('button', { name: /pond/i }))
    await user.click(screen.getByRole('button', { name: /choose what happens next/i }))
    await user.click(screen.getByRole('button', { name: /stay by the water/i }))

    expect(latest.regulationSessions.at(-1)?.activity).toBe('gentle_ripples')
    expect(latest.regulationSessions.at(-1)?.response).toBe('not_sure')
    expect(go).toHaveBeenCalledWith('calm')
  })

  it('allows Chime Drift to be watched or ended without tapping notes', async () => {
    const user = userEvent.setup()
    render(<Harness view="chime" />)
    expect(screen.getByText(/do nothing and listen/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /enough for now/i }))
    expect(screen.getByRole('dialog', { name: /recovery check-in/i })).toBeInTheDocument()
  })

  it('walks through choosing, pouring, adding and stirring a warm cup', async () => {
    const user = userEvent.setup()
    render(<Harness view="warmcup" />)
    await user.click(screen.getByRole('button', { name: 'Barley tea' }))
    const pour = screen.getByRole('button', { name: 'Pour' })
    await user.click(pour); await user.click(pour); await user.click(pour); await user.click(pour); await user.click(pour)
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
    expect(screen.queryByText('Rest is how progress survives the week.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /follow a light: on rest/i }))
    expect(screen.getByText('Rest is how progress survives the week.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /leave this glow/i }))
    expect(screen.getByRole('dialog', { name: /recovery check-in/i })).toBeInTheDocument()
  })

  it('keeps a Lantern phrase only after an explicit destination choice', async () => {
    const user = userEvent.setup()
    let latest = initialState()
    render(<Harness view="lanterns" onState={(state) => { latest = state }} />)
    await user.type(screen.getByPlaceholderText(/only if words help/i), 'Call home when I have space')
    await user.click(screen.getByRole('button', { name: /light the lantern/i }))
    await user.click(screen.getByRole('button', { name: /set it down here/i }))
    expect(latest.recoveryNotes).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: /keep it in the backpack/i }))
    expect(latest.recoveryNotes.at(-1)?.text).toBe('Call home when I have space')
  })
})
