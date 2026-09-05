/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { signInAsGuest } from '../auth/session'
import { ThemeProvider } from '../theme/ThemeProvider'
import Game from './Game'
import { initialState, saveState } from './state'

beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {}, dispatchEvent: () => false,
    }),
  })
  signInAsGuest()
  saveState({ ...initialState(), started: true, onboarded: true })
})

describe('the campus account menu', () => {
  it('opens outside the clipped HUD group and reaches Settings', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/town']}>
        <ThemeProvider><AuthProvider><Game /></AuthProvider></ThemeProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Enter Campus Grove' }))
    const account = screen.getByRole('button', { name: 'Account: Guest' })
    expect(account).toHaveAttribute('aria-expanded', 'false')
    await user.click(account)

    const menu = screen.getByRole('menu')
    expect(account).toHaveAttribute('aria-expanded', 'true')
    expect(menu.closest('.hud-group')).toBeNull()

    await user.click(screen.getByRole('menuitem', { name: 'Settings' }))
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
  })
})
