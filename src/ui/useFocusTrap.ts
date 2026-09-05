/**
 * Focus containment for modal dialogs.
 *
 * A dialog marked `aria-modal="true"` is promising that the rest of the page
 * is inert. Without this the promise is a lie: focus stays wherever it was,
 * and Tab walks straight out of the dialog into the campus behind it. Anyone
 * on a keyboard or a screen reader is then operating controls they cannot see,
 * underneath a scrim.
 *
 * What it does, in the order it matters:
 *
 *   1. Remembers what had focus, and gives it back on close. Losing your place
 *      in the town every time you open a panel is its own small injury.
 *   2. Moves focus into the dialog, preferring the first real control over the
 *      container, so the first Tab goes somewhere useful.
 *   3. Wraps Tab and Shift+Tab at the ends.
 *
 * Escape is deliberately not handled here — the game already owns that key
 * globally, and two handlers racing to close the same panel is worse than one.
 */

import { useEffect, useRef } from 'react'

/** Focusable, in DOM order, skipping anything hidden or disabled. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'details > summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    // offsetParent is null for display:none; a zero-size box is also unreachable.
    .filter((el) => el.offsetParent !== null || el === document.activeElement)
}

export function useFocusTrap<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!active || !root) return

    const previous = document.activeElement as HTMLElement | null

    // Prefer a real control; fall back to the container so focus is at least
    // inside the dialog rather than behind it.
    const first = focusableWithin(root)[0]
    if (first) {
      first.focus()
    } else {
      root.setAttribute('tabindex', '-1')
      root.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusableWithin(root)
      if (items.length === 0) { e.preventDefault(); return }

      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const current = document.activeElement as HTMLElement | null

      // Focus having escaped entirely (a click on the scrim, say) is pulled back.
      if (!current || !root.contains(current)) {
        e.preventDefault()
        firstItem.focus()
        return
      }
      if (e.shiftKey && current === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && current === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      // Only take focus back if it is still ours to give — the closing action
      // may have deliberately sent it somewhere else.
      const now = document.activeElement
      if (previous && (now === document.body || (root && root.contains(now)))) {
        previous.focus?.()
      }
    }
  }, [active])

  return ref
}
