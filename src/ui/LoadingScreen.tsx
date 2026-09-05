/**
 * The loading screen.
 *
 * Two design rules it exists to satisfy:
 *
 *   1. It never lies. The bar tracks real bytes (see useBootProgress), the
 *      stage line names what is genuinely being fetched, and if the network
 *      stalls the bar stalls with it. This app explains every other number it
 *      shows; a decorative progress bar would be the one exception, so it is
 *      not one.
 *
 *   2. It never flashes. Showing a full-screen panel for 80ms is worse than
 *      showing nothing, so it waits `delayMs` before appearing at all — and
 *      once it has appeared it stays for `minimumMs`, because a screen that
 *      blinks in and straight back out reads as a glitch.
 *
 * The tone is deliberate. "Loading…" with a spinner would be honest but
 * generic; this is a cozy town, so it says what is happening in the same
 * unhurried voice as the rest of the product.
 */

import { useEffect, useState } from 'react'
import type { BootStage } from './useBootProgress'
import './loading.css'

/** Twenty blocks, so each one is a readable 5%. */
const BLOCKS = 20

const STAGE_COPY: Record<BootStage, string> = {
  campus: 'Waking the campus',
  cast: 'Bringing the guardians in',
  ready: 'Opening the gate',
}

interface Props {
  /** 0–1. */
  progress: number
  stage: BootStage
  /** Wait this long before showing anything, so a warm cache never flashes. */
  delayMs?: number
  /** Once shown, stay at least this long. */
  minimumMs?: number
  /** Called when both the work and the minimum dwell are finished. */
  onSettled?: () => void
  /** True when the work itself is done. */
  ready?: boolean
}

export function LoadingScreen({
  progress,
  stage,
  delayMs = 160,
  minimumMs = 550,
  ready = false,
  onSettled,
}: Props) {
  const [visible, setVisible] = useState(false)
  const [shownAt, setShownAt] = useState<number | null>(null)

  /* Hold off entirely for the first moment: most returning visitors have the
     campus cached and would only see a flicker. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
      setShownAt(Date.now())
    }, delayMs)
    return () => window.clearTimeout(timer)
  }, [delayMs])

  /* Settle when the work is done — but not before the screen has been up long
     enough to read, if it went up at all. */
  useEffect(() => {
    if (!ready || !onSettled) return
    if (shownAt === null) { onSettled(); return }
    const remaining = Math.max(0, minimumMs - (Date.now() - shownAt))
    const timer = window.setTimeout(onSettled, remaining)
    return () => window.clearTimeout(timer)
  }, [ready, shownAt, minimumMs, onSettled])

  if (!visible) return null

  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  const lit = Math.round((percent / 100) * BLOCKS)

  return (
    <div className="ld" role="status" aria-live="polite">
      <div className="ld-panel">
        <div className="ld-brand">
          <span className="ld-mark" aria-hidden="true">P</span>
          <span className="ld-word">PaceTown</span>
        </div>

        <p className="ld-stage">{STAGE_COPY[stage]}<span className="ld-dots" aria-hidden="true" /></p>

        {/* A walker tied to the real number rather than to a timer: it is at
            40% across when the download is, so the motion is information. */}
        <div className="ld-track" aria-hidden="true">
          <span className="ld-walker" style={{ left: `${percent}%` }} />
        </div>

        <div
          className="ld-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Opening Campus Grove"
        >
          {Array.from({ length: BLOCKS }, (_, i) => (
            <span key={i} className={i < lit ? 'is-lit' : undefined} />
          ))}
        </div>

        <div className="ld-readout">
          <span className="ld-pct">{percent}%</span>
          <span className="ld-note">Nothing is being uploaded. This is your browser fetching the town.</span>
        </div>
      </div>

      <p className="ld-foot">Find your pace. Grow your place.</p>
    </div>
  )
}
