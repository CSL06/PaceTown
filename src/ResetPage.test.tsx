/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SAVE_KEY } from './game/state'
import ResetPage from './ResetPage'

// SESSION_KEY is module-private in ./auth/session; key the assertions on the
// literal string it is defined as ('pacetown.session').
const SESSION_KEY = 'pacetown.session'

beforeEach(() => localStorage.clear())

describe('ResetPage', () => {
  it('wipes the save and session, then redirects to /game', async () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 4, xp: 999 }))
    localStorage.setItem(SESSION_KEY, JSON.stringify({ account: { id: 'g1' } }))
    render(
      <MemoryRouter initialEntries={['/reset']}>
        <Routes>
          <Route path="/reset" element={<ResetPage />} />
          <Route path="/game" element={<p>fresh demo</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('fresh demo')).toBeInTheDocument()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
