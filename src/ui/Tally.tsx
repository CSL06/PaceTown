/**
 * A number that travels to its new value.
 *
 * Wraps `useCountUp` and adds the two details that stop an animated figure
 * from being worse than a static one:
 *
 *   - Tabular figures, so digits keep their column and the row does not
 *     shudder as the value passes through 9s.
 *   - The *target* in the accessibility tree, never the intermediate frames.
 *     A screen reader announcing every step of a count is unusable, so the
 *     travelling digits are hidden and the settled value is what is read.
 */

import { useCountUp, type CountUpOptions } from './useCountUp'

interface Props extends CountUpOptions {
  value: number
  /** Decimal places to show. Load is whole; nothing here needs more than one. */
  places?: number
  /** Rendered after the number, inside the same element (e.g. "%"). */
  suffix?: string
  className?: string
}

export function Tally({ value, places = 0, suffix, className, ...options }: Props) {
  const shown = useCountUp(value, options)
  const text = shown.toFixed(places)

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden="true">{text}{suffix}</span>
      {/* Only the settled figure reaches assistive tech. */}
      <span className="sr">{value.toFixed(places)}{suffix}</span>
    </span>
  )
}
