/**
 * Vitest setup, shared by every suite.
 *
 * Most of the suite is pure domain code running under node, so everything
 * DOM-shaped here is guarded. Only files with a `@vitest-environment jsdom`
 * docblock get a document, and only those need the cleanup and the stubs.
 *
 * The jest-dom import is deliberately static and unguarded: it registers the
 * matchers *and* carries the type augmentation for `toBeInTheDocument` and
 * friends. Behind a dynamic import the types never reach TypeScript.
 */

import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  afterEach(() => cleanup())

  /* jsdom implements neither of these and the app uses both, so without stubs
     every component test would fail on an unrelated ReferenceError. */
  if (!('matchMedia' in window)) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
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

  if (!('IntersectionObserver' in window)) {
    class StubIntersectionObserver {
      readonly root = null
      readonly rootMargin = ''
      readonly thresholds: number[] = []
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return [] }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: StubIntersectionObserver,
    })
  }
}
