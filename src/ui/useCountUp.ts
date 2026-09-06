/**
 * Animates a number toward a new value instead of swapping it.
 *
 * This is the smallest change with the largest effect on how the app feels.
 * Every figure that matters here — Daily Load, XP, coins, the Week Board's
 * projected load — was replaced instantly when it changed. A number that
 * teleports reads as a variable being reassigned; a number that travels reads
 * as something having happened. The arithmetic is identical either way.
 *
 * Three rules it follows:
 *
 *   - It never animates on mount. The first value is simply the value; only
 *     later changes travel. Counting up from zero when a screen opens is a
 *     splash-screen trick, and it would mean the Daily Load displays a figure
 *     that is not true for 400ms every time you enter the town.
 *   - It respects `prefers-reduced-motion`, where it snaps.
 *   - It always lands exactly on the target. Easing toward a value and
 *     stopping at 99.4% is how counters end up displaying the wrong number.
 *
 * On the shape of it: the hook holds `null` whenever it is not mid-flight and
 * returns the real target in that case, so the resting path needs no state at
 * all. Every `setState` therefore happens inside a rAF callback rather than in
 * the effect body — which is both what `react-hooks/set-state-in-effect` asks
 * for and, independently, the reason the settled value can never drift from
 * the target it was given.
 */

import { useEffect, useRef, useState } from 'react'

/** Ease-out cubic: quick to start, settles gently. */
const ease = (t: number) => 1 - (1 - t) ** 3

export interface CountUpOptions {
  /** Milliseconds for the whole travel. */
  duration?: number
  /** Set false to hold the displayed value (e.g. while a panel is closed). */
  enabled?: boolean
}

export function useCountUp(target: number, options: CountUpOptions = {}): number {
  const { duration = 420, enabled = true } = options
  /** The in-flight value, or null when settled — settled means "show target". */
  const [flying, setFlying] = useState<number | null>(null)
  /** The last value actually on screen, so an interrupted travel resumes. */
  const displayed = useRef(target)
  const raf = useRef(0)
  /* Mount is not a change. Without this the first paint of every screen
     animates from zero, which briefly displays a figure that is not true. */
  const mounted = useRef(false)

  useEffect(() => {
    const origin = displayed.current
    displayed.current = target

    const reduced = typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    const snap = !mounted.current || !enabled || reduced ||
      duration <= 0 || !Number.isFinite(target) || origin === target
    mounted.current = true

    if (snap) {
      // Nothing to animate. If a previous travel is still on screen, clear it
      // on the next frame — a callback, so no state is set from the body.
      raf.current = requestAnimationFrame(() => setFlying(null))
      return () => cancelAnimationFrame(raf.current)
    }

    const start = performance.now()
    const distance = target - origin

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      if (t >= 1) {
        // Land exactly, never on an eased approximation: returning to null
        // means the hook reports the target itself.
        setFlying(null)
        return
      }
      const value = origin + distance * ease(t)
      displayed.current = value
      setFlying(value)
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, enabled])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return flying ?? target
}
