/**
 * Small motion helpers for the landing page.
 *
 * Both degrade to "just show the final state" when IntersectionObserver is
 * missing or the visitor has asked for reduced motion. Motion is decoration
 * here; content never depends on it.
 */

import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Adds `.is-in` to every `[data-reveal]` inside the returned ref once it
 * scrolls into view, staggered by its position. One observer for the whole
 * page rather than one per element.
 */
export function useReveal<T extends HTMLElement>() {
  const root = useRef<T>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    const targets = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (targets.length === 0) return

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      for (const target of targets) target.classList.add('is-in')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLElement
          // Siblings cascade rather than all arriving at once.
          const index = Number(target.dataset.revealIndex ?? 0)
          target.style.transitionDelay = `${Math.min(index, 6) * 70}ms`
          target.classList.add('is-in')
          observer.unobserve(target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )

    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return root
}

/**
 * Counts from zero to `value` the first time the returned ref is on screen.
 * Returns the live display value.
 */
export function useCountUp(value: number, durationMs = 1100) {
  const ref = useRef<HTMLElement>(null)
  // Reduced motion gets the real number immediately, rather than a zero that
  // an effect then corrects on the next render.
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0))
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || done.current) return

    // Reduced motion already initialised `shown` to the final value, so there
    // is nothing to set — reading it here would only add a dependency.
    if (prefersReducedMotion()) { done.current = true; return }

    // No observer, but motion is fine: skip the animation, keep the number.
    if (typeof IntersectionObserver === 'undefined') {
      done.current = true
      setShown(value)
      return
    }

    let raf = 0
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done.current) return
      done.current = true
      observer.disconnect()

      const startedAt = performance.now()
      const frame = (now: number) => {
        const t = Math.min(1, (now - startedAt) / durationMs)
        // Ease out: fast to begin with, settling onto the real number.
        setShown(value * (1 - (1 - t) ** 3))
        if (t < 1) raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }, { threshold: 0.4 })

    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, durationMs])

  return { ref, shown }
}
