/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

function Boom({ throws }: { throws: boolean }) {
  if (throws) throw new Error('the clock tower fell over')
  return <p>everything is fine</p>
}

/* Controlled from the test rather than from inside render: React re-renders a
   failed subtree to recreate the error, so a component that mutates state
   while rendering throws twice and the retry never gets a clean pass. */
let flakyThrows = true
function Flaky() {
  if (flakyThrows) throw new Error('transient')
  return <p>recovered</p>
}

beforeEach(() => {
  localStorage.clear()
  // React logs the caught error itself; keep the suite output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

describe('ErrorBoundary', () => {
  it('renders its children when nothing is wrong', () => {
    render(<ErrorBoundary><Boom throws={false} /></ErrorBoundary>)
    expect(screen.getByText('everything is fine')).toBeInTheDocument()
  })

  it('catches a throw instead of blanking the page', () => {
    render(<ErrorBoundary><Boom throws /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Something in PaceTown broke/i)).toBeInTheDocument()
  })

  it('says the save is intact, because that is the first thing anyone wonders', () => {
    render(<ErrorBoundary><Boom throws /></ErrorBoundary>)
    expect(screen.getByText(/saved week has not been touched/i)).toBeInTheDocument()
  })

  it('shows the underlying message rather than hiding it', async () => {
    render(<ErrorBoundary><Boom throws /></ErrorBoundary>)
    await userEvent.click(screen.getByText(/technical detail/i))
    expect(screen.getByText('the clock tower fell over')).toBeInTheDocument()
  })

  it('offers a retry that clears the error state', async () => {
    flakyThrows = true
    render(<ErrorBoundary><Flaky /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Whatever was broken is now fixed; retry should render the child again.
    flakyThrows = false
    await userEvent.click(screen.getByRole('button', { name: /try that again/i }))
    expect(screen.getByText('recovered')).toBeInTheDocument()
  })

  it('offers a rescue download of everything in storage', async () => {
    localStorage.setItem('pacetown.game', JSON.stringify({ version: 4, xp: 120 }))

    const created: string[] = []
    const clicks: string[] = []
    // jsdom implements neither, and the rescue path depends on both.
    URL.createObjectURL = vi.fn(() => { created.push('blob:x'); return 'blob:x' })
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) { clicks.push(this.download) })

    render(<ErrorBoundary><Boom throws /></ErrorBoundary>)
    await userEvent.click(screen.getByRole('button', { name: /download my data/i }))

    expect(created).toHaveLength(1)
    expect(clicks[0]).toMatch(/^pacetown-recovery-\d+\.json$/)
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })

  it('survives storage that cannot be read', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => { throw new Error('blocked') })
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<ErrorBoundary><Boom throws /></ErrorBoundary>)
    // The point is that this does not throw a second time.
    await userEvent.click(screen.getByRole('button', { name: /download my data/i }))
    expect(URL.createObjectURL).toHaveBeenCalled()
    getItem.mockRestore()
  })
})
