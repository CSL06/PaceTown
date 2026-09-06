/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from './useCountUp'

/** Drives requestAnimationFrame by hand so the easing is deterministic. */
let now = 0
let frames: FrameRequestCallback[] = []

beforeEach(() => {
  now = 0
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.push(cb)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener() {}, removeEventListener() {},
  }))
})

afterEach(() => vi.unstubAllGlobals())

/** Advances the clock and flushes whatever frames are pending. */
function advance(ms: number) {
  now += ms
  const pending = frames
  frames = []
  act(() => { for (const cb of pending) cb(now) })
}

describe('useCountUp', () => {
  it('shows the first value immediately rather than counting up from zero', () => {
    // A screen opening at 103% must not briefly claim 0%. Asserted as the
    // value over time rather than as "no frame was scheduled", which is an
    // implementation detail — the resting path holds no state at all now.
    const { result } = renderHook(() => useCountUp(103))
    expect(result.current).toBe(103)
    advance(500)
    expect(result.current).toBe(103)
  })

  it('travels toward a changed value instead of jumping', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v, { duration: 400 }),
      { initialProps: { v: 100 } })
    rerender({ v: 200 })
    advance(100)
    // Partway, and moving in the right direction.
    expect(result.current).toBeGreaterThan(100)
    expect(result.current).toBeLessThan(200)
  })

  it('lands exactly on the target', () => {
    // Easing that stops at 99.4% is how a counter ends up displaying the
    // wrong number for the rest of the session.
    const { result, rerender } = renderHook(({ v }) => useCountUp(v, { duration: 400 }),
      { initialProps: { v: 0 } })
    rerender({ v: 37 })
    advance(400)
    expect(result.current).toBe(37)
  })

  it('counts down as readily as up', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v, { duration: 400 }),
      { initialProps: { v: 103 } })
    rerender({ v: 95 })
    advance(400)
    expect(result.current).toBe(95)
  })

  it('snaps when the viewer asked for reduced motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: true, media: q, addEventListener() {}, removeEventListener() {},
    }))
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), { initialProps: { v: 0 } })
    rerender({ v: 50 })
    // Already there on the very first read, and it stays there.
    expect(result.current).toBe(50)
    advance(500)
    expect(result.current).toBe(50)
  })

  it('snaps when disabled, so an unseen panel does not animate', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v, { enabled: false }),
      { initialProps: { v: 0 } })
    rerender({ v: 12 })
    expect(result.current).toBe(12)
  })

  it('reports a non-finite target without animating toward it', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), { initialProps: { v: 10 } })
    rerender({ v: Number.NaN })
    expect(Number.isNaN(result.current)).toBe(true)
    // And recovers on the next real value.
    rerender({ v: 20 })
    advance(500)
    expect(result.current).toBe(20)
  })
})
