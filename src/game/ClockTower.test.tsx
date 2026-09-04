/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ClockTower } from './ClockTower'
import { initialState, type GameState } from './state'

function Harness() {
  const [state, setState] = useState<GameState>(() => ({ ...initialState(), started: true, onboarded: true }))
  return <ClockTower state={state} update={setState} go={vi.fn()} toast={vi.fn()} onExit={vi.fn()} />
}

describe('Clock Tower scene', () => {
  it('animates the avatar while it walks to an interaction station', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)

    await user.click(screen.getByRole('button', { name: /talk to kai/i }))

    expect(container.querySelector('.clock-player')).toHaveClass('walking', 'station-kai')
  })

  it('opens a real seven-day board instead of a generic rebalance dialog', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByAltText(/sunlit planning room/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /open week board/i }))

    expect(await screen.findByRole('dialog', { name: /weekly planning board/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /choose day/i })).toBeInTheDocument()
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${day}\\d+%$`) })).toBeInTheDocument()
    }
    expect(document.querySelector('.sheet')).not.toBeInTheDocument()
  })

  it('keeps moves as previews until approval, then updates the actual week', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: /open week board/i }))

    expect((await screen.findAllByText('Preview here')).length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: /approve 2 moves/i }))

    expect(await screen.findByRole('heading', { name: /week is telling the truth/i })).toBeInTheDocument()
    expect(screen.queryByText('Preview here')).not.toBeInTheDocument()
    expect(screen.getByText('91%', { selector: '.clock-load strong' })).toBeInTheDocument()
  })
})
