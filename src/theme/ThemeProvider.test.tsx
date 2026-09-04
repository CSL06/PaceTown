/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeProvider'

function Probe() {
  const { setting, theme, setSetting, toggle } = useTheme()
  return (
    <div>
      <span data-testid="setting">{setting}</span>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggle}>toggle</button>
      <button type="button" onClick={() => setSetting('system')}>use system</button>
      <button type="button" onClick={() => setSetting('dark')}>go dark</button>
    </div>
  )
}

const renderProbe = () => render(<ThemeProvider><Probe /></ThemeProvider>)

/** The stub in setup.ts always reports light; this makes the OS say dark. */
function systemPrefersDark(dark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: dark && query.includes('dark'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  systemPrefersDark(false)
})

describe('ThemeProvider', () => {
  it('defaults to following the system', () => {
    renderProbe()
    expect(screen.getByTestId('setting')).toHaveTextContent('system')
  })

  it('resolves "system" against the OS preference', () => {
    systemPrefersDark(true)
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('leaves data-theme off while following the system', () => {
    renderProbe()
    // Absent, so theme.css's media query governs — which is what makes the
    // page theme correctly before any JS runs.
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('stamps data-theme once a choice is made', async () => {
    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'go dark' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('toggles light to dark and back', async () => {
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('toggling away from a dark system lands on light, not on system', async () => {
    systemPrefersDark(true)
    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('setting')).toHaveTextContent('light')
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('persists the choice', async () => {
    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'go dark' }))
    expect(localStorage.getItem('pacetown.theme')).toBe('dark')
  })

  it('restores a persisted choice on the next mount', () => {
    localStorage.setItem('pacetown.theme', 'dark')
    renderProbe()
    expect(screen.getByTestId('setting')).toHaveTextContent('dark')
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('can be handed back to the system', async () => {
    localStorage.setItem('pacetown.theme', 'dark')
    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'use system' }))
    expect(screen.getByTestId('setting')).toHaveTextContent('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('ignores a corrupt stored value rather than throwing', () => {
    localStorage.setItem('pacetown.theme', 'chartreuse')
    renderProbe()
    expect(screen.getByTestId('setting')).toHaveTextContent('system')
  })
})
