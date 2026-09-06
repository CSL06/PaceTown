/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dailyLoad, wakingMinutes } from '../../domain'
import { initialState } from '../state'
import { TownList } from './Places'

describe('Town List travel', () => {
  it('delegates map travel to the live movement callback', async () => {
    const user = userEvent.setup()
    const state = initialState()
    const travel = vi.fn()
    render(<TownList state={state} load={dailyLoad(state.tasks, 'thu', wakingMinutes(state.capacity))}
      update={vi.fn()} go={vi.fn()} toast={vi.fn()} travel={travel} />)

    await user.click(screen.getByRole('button', { name: /market.*errands/i }))

    expect(travel).toHaveBeenCalledWith(expect.objectContaining({ id: 'market' }))
  })
})
