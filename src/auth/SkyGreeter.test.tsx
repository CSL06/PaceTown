/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkyGreeter } from './SkyGreeter'

function srcOf() {
  const img = document.querySelector('.sky-greet-art') as HTMLImageElement
  return img.getAttribute('src') ?? ''
}

describe('mood drives the sprite', () => {
  it('idles by default', () => {
    render(<SkyGreeter mood="idle" mode="login" reducedMotion />)
    expect(srcOf()).toContain('/game/sky/idle-')
  })

  it('talks while you type', () => {
    render(<SkyGreeter mood="typing" mode="login" reducedMotion />)
    expect(srcOf()).toContain('/game/sky/talk-')
  })

  it('turns to her tea while the password field has focus', () => {
    render(<SkyGreeter mood="secret" mode="login" reducedMotion />)
    // The whole point of the interaction: she looks away, she does not watch.
    expect(srcOf()).toContain('/game/sky/tea-')
  })

  it('is happy on the way in', () => {
    render(<SkyGreeter mood="happy" mode="login" reducedMotion />)
    expect(srcOf()).toContain('/game/sky/happy-0.webp')
  })
})

describe('what she says', () => {
  it('reassures rather than scolds on an error', () => {
    render(<SkyGreeter mood="error" mode="login" reducedMotion />)
    expect(screen.getByText(/no harm done/i)).toBeInTheDocument()
  })

  it('says something different when signing up than signing in', () => {
    const { unmount } = render(<SkyGreeter mood="idle" mode="login" reducedMotion />)
    const login = document.querySelector('.sky-greet-line span')?.textContent
    unmount()

    render(<SkyGreeter mood="idle" mode="signup" reducedMotion />)
    const signup = document.querySelector('.sky-greet-line span')?.textContent
    expect(signup).not.toBe(login)
  })

  it('announces changes politely rather than interrupting', () => {
    render(<SkyGreeter mood="idle" mode="login" reducedMotion />)
    expect(document.querySelector('.sky-greet-line')).toHaveAttribute('aria-live', 'polite')
  })

  it('leaves the sprite out of the accessibility tree', () => {
    render(<SkyGreeter mood="idle" mode="login" reducedMotion />)
    // Decorative: her line already carries the meaning.
    expect(document.querySelector('.sky-greet-art')).toHaveAttribute('alt', '')
  })
})

describe('reduced motion', () => {
  it('holds a single frame instead of animating', () => {
    render(<SkyGreeter mood="idle" mode="login" reducedMotion />)
    expect(srcOf()).toBe('/game/sky/idle-0.webp')
  })
})
