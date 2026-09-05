/**
 * @vitest-environment jsdom
 *
 * The first panel test in the codebase. The panels are where consent rules and
 * reward payouts actually live, and until now none of them were covered — the
 * domain layer was well tested, the layer that spends the player's coins was
 * not.
 *
 * The Shop is the right place to start because it is the only screen that
 * takes something away from the player.
 */
import { useEffect, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEMO_CAPACITY, dailyLoad, wakingMinutes } from '../../domain'
import { initialState, type GameState } from '../state'
import { Shop } from './Shop'

interface HarnessProps {
  start?: Partial<GameState>
  toast?: (m: string) => void
  /** Reported from an effect, never assigned during render. */
  onState?: (s: GameState) => void
}

/** Drives the panel with real state, the way Game.tsx does. */
function Harness({ start, toast = () => {}, onState }: HarnessProps) {
  const [state, setState] = useState<GameState>({ ...initialState(), ...start })
  const load = dailyLoad(state.tasks, 'thu', wakingMinutes(DEMO_CAPACITY))
  useEffect(() => { onState?.(state) }, [state, onState])
  return (
    <Shop
      state={state}
      load={load}
      update={(fn) => setState((s) => fn(s))}
      go={() => {}}
      toast={toast}
    />
  )
}

/**
 * The row for a named cosmetic. Scoped to the list, because the preview panel
 * shows the same name and an unscoped query matches both.
 */
function row(name: string) {
  const list = document.querySelector('.opts') as HTMLElement
  return within(list).getByText(name).closest('.shop-row') as HTMLElement
}

describe('buying', () => {
  it('spends the coins and equips what you bought', async () => {
    render(<Harness start={{ coins: 100 }} />)
    await userEvent.click(within(row('Soft overcast')).getByRole('button', { name: /35/ }))

    // 100 - 35, shown in the wallet.
    expect(screen.getByText('65')).toBeInTheDocument()
    expect(within(row('Soft overcast')).getByText(/in place/i)).toBeInTheDocument()
  })

  it('will not sell what you cannot afford, and takes nothing', async () => {
    const toast = vi.fn()
    render(<Harness start={{ coins: 10 }} toast={toast} />)

    const buy = within(row('Blue evening')).getByRole('button', { name: /65/ })
    expect(buy).toBeDisabled()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(toast).not.toHaveBeenCalled()
  })

  it('says how much more is needed rather than just refusing', () => {
    render(<Harness start={{ coins: 40 }} />)
    // 65 - 40. A refusal in this product is supposed to be information.
    expect(within(row('Blue evening')).getByText(/25 more/)).toBeInTheDocument()
  })

  it('records the purchase in the journal', async () => {
    let latest: GameState | null = null
    render(<Harness start={{ coins: 100 }} onState={(s) => { latest = s }} />)
    await userEvent.click(within(row('Soft overcast')).getByRole('button', { name: /35/ }))
    expect(latest!.journal.at(-1)?.text).toMatch(/soft overcast/i)
  })

  it('never pays XP for spending, because the shop is not an achievement', async () => {
    let latest: GameState | null = null
    render(<Harness start={{ coins: 100, xp: 40 }} onState={(s) => { latest = s }} />)
    await userEvent.click(within(row('Soft overcast')).getByRole('button', { name: /35/ }))
    expect(latest!.xp).toBe(40)
  })
})

describe('owning', () => {
  it('offers to re-equip something already owned instead of charging again', async () => {
    render(<Harness start={{ coins: 100, owned: ['sky-overcast', 'sky-evening'] }} />)
    await userEvent.click(within(row('Blue evening')).getByRole('button', { name: /use this/i }))

    expect(within(row('Blue evening')).getByText(/in place/i)).toBeInTheDocument()
    // Equipping something you own is free.
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('ships the free default already owned', () => {
    render(<Harness />)
    expect(within(row('Late afternoon')).getByText(/in place/i)).toBeInTheDocument()
  })
})

describe('what the shop promises', () => {
  it('states plainly that nothing here changes your week', () => {
    render(<Harness />)
    expect(screen.getByText(/appearance only/i)).toBeInTheDocument()
  })

  it('never changes the task list or the load', async () => {
    let latest: GameState | null = null
    render(<Harness start={{ coins: 100 }} onState={(s) => { latest = s }} />)
    const before = latest!.tasks.length
    await userEvent.click(within(row('Soft overcast')).getByRole('button', { name: /35/ }))
    expect(latest!.tasks).toHaveLength(before)
  })
})
