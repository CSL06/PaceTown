/**
 * @vitest-environment jsdom
 *
 * The timing rules are the whole point of this component, and they are exactly
 * the kind of thing that regresses silently, so they are pinned here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { LoadingScreen } from './LoadingScreen'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

/** Pushes both timers and React work forward together. */
function advance(ms: number) {
  act(() => { vi.advanceTimersByTime(ms) })
}

describe('anti-flash', () => {
  it('shows nothing at all for the first moment', () => {
    render(<LoadingScreen progress={0.2} stage="campus" delayMs={160} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('appears once the delay has passed', () => {
    render(<LoadingScreen progress={0.2} stage="campus" delayMs={160} />)
    advance(200)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('settles immediately when the work finished before it ever appeared', () => {
    const onSettled = vi.fn()
    // Ready from the outset and still inside the delay: a warm cache should
    // hand straight over without a flash of panel.
    render(
      <LoadingScreen progress={1} stage="ready" ready delayMs={160} onSettled={onSettled} />,
    )
    advance(0)
    expect(onSettled).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('minimum dwell', () => {
  it('does not hand over the instant loading finishes, once it is on screen', () => {
    const onSettled = vi.fn()
    const { rerender } = render(
      <LoadingScreen progress={0.5} stage="campus" delayMs={100} minimumMs={600} onSettled={onSettled} />,
    )
    advance(150)
    expect(screen.getByRole('status')).toBeInTheDocument()

    rerender(
      <LoadingScreen progress={1} stage="ready" ready delayMs={100} minimumMs={600} onSettled={onSettled} />,
    )
    advance(100)
    expect(onSettled).not.toHaveBeenCalled()

    advance(600)
    expect(onSettled).toHaveBeenCalledTimes(1)
  })
})

describe('the bar', () => {
  const renderAt = (progress: number) => {
    render(<LoadingScreen progress={progress} stage="campus" delayMs={0} />)
    advance(10)
  }

  it('reports progress to assistive tech', () => {
    renderAt(0.42)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('lights one block per five percent', () => {
    renderAt(0.5)
    const lit = screen.getByRole('progressbar').querySelectorAll('.is-lit')
    expect(lit).toHaveLength(10)
  })

  it('lights nothing at zero and everything at one', () => {
    const { unmount } = render(<LoadingScreen progress={0} stage="campus" delayMs={0} />)
    advance(10)
    expect(screen.getByRole('progressbar').querySelectorAll('.is-lit')).toHaveLength(0)
    unmount()

    render(<LoadingScreen progress={1} stage="ready" delayMs={0} />)
    advance(10)
    expect(screen.getByRole('progressbar').querySelectorAll('.is-lit')).toHaveLength(20)
  })

  it('clamps nonsense rather than overflowing the bar', () => {
    renderAt(2.5)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByRole('progressbar').querySelectorAll('.is-lit')).toHaveLength(20)
  })
})

describe('stage copy', () => {
  it('names what is actually being fetched', () => {
    const { rerender } = render(<LoadingScreen progress={0.1} stage="campus" delayMs={0} />)
    advance(10)
    expect(screen.getByText(/waking the campus/i)).toBeInTheDocument()

    rerender(<LoadingScreen progress={0.9} stage="cast" delayMs={0} />)
    expect(screen.getByText(/bringing the guardians in/i)).toBeInTheDocument()
  })
})
