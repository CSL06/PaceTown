/**
 * @vitest-environment jsdom
 */
import { useState } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ClockTower } from './ClockTower'
import { initialState, type GameState } from './state'

function Harness() {
  const [state, setState] = useState<GameState>(() => ({ ...initialState(), started: true, onboarded: true }))
  return <ClockTower state={state} update={setState} go={vi.fn()} toast={vi.fn()} onExit={vi.fn()} />
}

describe('Clock Tower scene', () => {
  it('moves a flexible task by dropping it onto another day', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: /open week board/i }))
    await screen.findByRole('dialog', {}, { timeout: 3000 })
    const item = within(screen.getByRole('listitem', { name: 'Thursday' })).getByText('Weekly groceries').closest('[draggable]')!
    const data = new Map<string, string>()
    const dataTransfer = { setData: (key: string, value: string) => data.set(key, value), getData: (key: string) => data.get(key) ?? '' }
    fireEvent.dragStart(item, { dataTransfer })
    fireEvent.drop(screen.getByRole('listitem', { name: 'Friday' }), { dataTransfer })
    expect(within(screen.getByRole('listitem', { name: 'Friday' })).getByText('Weekly groceries')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Weekly groceries moved to Friday')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText('Café shift').closest('[draggable]')).toHaveAttribute('draggable', 'false')
    await user.click(screen.getByRole('button', { name: 'Undo last move' }))
    expect(within(screen.getByRole('listitem', { name: 'Thursday' })).getByText('Weekly groceries')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Details for Café shift' }))
    expect(screen.getByRole('region', { name: 'Task details' })).toHaveTextContent('Locked: this is a fixed commitment.')
  })

  it('opens the board with E after stepping back beside it', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: /open week board/i }))
    await screen.findByRole('dialog', {}, { timeout: 3000 })
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.keyboard('e')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('keeps moving while a direction is held and stops on release', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    const avatar = container.querySelector('.clock-player') as HTMLElement
    await user.keyboard('{a>}')
    await waitFor(() => expect(parseFloat(avatar.style.left)).toBeLessThan(49))
    expect(avatar).toHaveClass('f-left', 'walking')
    await user.keyboard('{/a}')
    await waitFor(() => expect(avatar).not.toHaveClass('walking'))
  })

  it('animates the avatar while it walks to an interaction station', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)

    await user.click(screen.getByRole('button', { name: /talk to kai/i }))

    await waitFor(() => expect(container.querySelector('.clock-player')).toHaveClass('walking'))
    await waitFor(() => expect(parseFloat((container.querySelector('.clock-player') as HTMLElement).style.left)).toBeGreaterThan(50))
  })

  it('opens a real seven-day board instead of a generic rebalance dialog', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByAltText(/sunlit planning room/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /open week board/i }))

    expect(await screen.findByRole('dialog', { name: /weekly planning board/i }, { timeout: 3000 })).toBeInTheDocument()
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
    await screen.findByRole('dialog', {}, { timeout: 3000 })
    expect((await screen.findAllByText('Preview here', {}, { timeout: 3000 })).length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: /approve \d+ moves/i }))

    expect(await screen.findByRole('heading', { name: /week is telling the truth/i })).toBeInTheDocument()
    expect(screen.queryByText('Preview here')).not.toBeInTheDocument()
    expect(parseFloat(document.querySelector('.clock-load strong')!.textContent!)).toBeLessThanOrEqual(95)
  })
})
