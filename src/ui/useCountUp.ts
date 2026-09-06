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
 *     splash-screen trick, and it would mean the Daily Load lies for 400ms
 *     every time you enter the town.
 *   - It respects `prefers-reduced-motion`, where it snaps.
 *   - It always lands exactly on the target. Easing toward a value and
 *     stopping at 99.4% is how counters end up displaying the wrong number.
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
  const [shown, setShown] = useState(target)
  const from = useRef(target)
  const raf = useRef(0)
  /* Mount is not a change. Without this the first paint of every screen
     animates from zero, which briefly displays a figure that is not true. */
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      from.current = target
      setShown(target)
      return
    }

    const reduced = typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!enabled || reduced || duration <= 0 || !Number.isFinite(target)) {
      from.current = target
      setShown(target)
      return
    }

    const start = performance.now()
    const origin = from.current
    const distance = target - origin
    if (distance === 0) return

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      if (t >= 1) {
        // Land exactly, never on an eased approximation.
        from.current = target
        setShown(target)
        return
      }
      setShown(origin + distance * ease(t))
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, enabled])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return shown
}
