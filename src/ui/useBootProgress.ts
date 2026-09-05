/**
 * Real boot progress for Campus Grove.
 *
 * The bar reports actual bytes arriving, not a scripted animation. The campus
 * map alone is ~3.5 MB, and this app's posture is that every number on screen
 * is explainable — a bar filling on a timer while the network stalls would be
 * the one exception.
 *
 * Every asset is fetched in parallel and its size read from the response's own
 * Content-Length, so there is one request per asset and no preflight round of
 * HEADs holding the bar at zero. Bodies stream, and progress is published on
 * whole-percent changes so a 3.5 MB download does not cause thousands of
 * renders.
 *
 * Two rules it must never break:
 *
 *   - It cannot strand anyone. After BOOT_BUDGET_MS the town opens regardless.
 *     In-flight fetches are deliberately *not* aborted at that point: they keep
 *     filling the HTTP cache, so the images the game is about to request are
 *     already on their way.
 *   - It must survive StrictMode. There is no "have I started" ref here on
 *     purpose: React deliberately mounts, cleans up, and mounts again in
 *     development, and a latch that outlives the cleanup would let the second
 *     mount skip the work the first mount had just cancelled — leaving the bar
 *     frozen at whatever the other half of the gate contributed.
 */

import { useEffect, useState } from 'react'

/** What the town needs on screen before it is worth showing. */
const BOOT_ASSETS: { url: string; stage: BootStage }[] = [
  { url: '/game/world/campus-daylight.webp', stage: 'campus' },
  { url: '/game/world/player-sheet.webp', stage: 'cast' },
  { url: '/game/world/cast-sheet.webp', stage: 'cast' },
  { url: '/game/portraits/kai.webp', stage: 'cast' },
  { url: '/game/portraits/mira.webp', stage: 'cast' },
  { url: '/game/portraits/sol.webp', stage: 'cast' },
  { url: '/game/portraits/sky.webp', stage: 'cast' },
  { url: '/game/portraits/goh.webp', stage: 'cast' },
]

/** Hard ceiling on how long anyone waits, whatever the network is doing. */
const BOOT_BUDGET_MS = 5_000

export type BootStage = 'campus' | 'cast' | 'ready'

export interface BootProgress {
  /** 0–1, byte-accurate when the server reports sizes. */
  progress: number
  stage: BootStage
  ready: boolean
  /** True when the budget ran out and the town opened anyway. */
  timedOut: boolean
}

export function useBootProgress(active = true): BootProgress {
  /* No fetch (an old browser, or a test environment) means there is no honest
     progress to report. Decided at initialisation rather than in the effect,
     so the hook opens in its final state instead of cascading a render. */
  const canFetch = typeof fetch === 'function'

  const [progress, setProgress] = useState(canFetch ? 0 : 1)
  const [stage, setStage] = useState<BootStage>(canFetch ? 'campus' : 'ready')
  const [ready, setReady] = useState(!canFetch)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!active || !canFetch) return

    const controller = new AbortController()
    let cancelled = false

    const settle = () => {
      if (cancelled) return
      setProgress(1)
      setStage('ready')
      setReady(true)
    }

    /* The escape hatch. Note it does not abort: letting the downloads run on
       means the game's <img> tags hit a warm cache moments later. */
    const timer = window.setTimeout(() => {
      if (cancelled) return
      setTimedOut(true)
      settle()
    }, BOOT_BUDGET_MS)

    const run = async () => {
      const loaded = new Array<number>(BOOT_ASSETS.length).fill(0)
      const sizes = new Array<number>(BOOT_ASSETS.length).fill(0)
      let campusDone = false
      let lastPercent = -1

      const publish = () => {
        if (cancelled) return
        const total = sizes.reduce((a, b) => a + b, 0)
        if (total <= 0) return
        const done = loaded.reduce((a, b) => a + b, 0)
        const next = Math.min(0.99, done / total)
        // Only on a whole-percent change: streaming 3.5 MB fires this
        // thousands of times otherwise.
        const percent = Math.floor(next * 100)
        if (percent !== lastPercent) {
          lastPercent = percent
          setProgress(next)
          setStage(campusDone ? 'cast' : 'campus')
        }
      }

      await Promise.all(BOOT_ASSETS.map(async (asset, i) => {
        try {
          const response = await fetch(asset.url, { signal: controller.signal })
          sizes[i] = Number(response.headers.get('content-length')) || 0
          publish()

          if (!response.ok || !response.body) {
            await response.arrayBuffer().catch(() => undefined)
            loaded[i] = sizes[i]
            return
          }

          const reader = response.body.getReader()
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) {
              loaded[i] += value.byteLength
              publish()
            }
          }
        } catch {
          // One missing sprite must not hold the town shut. Count it as done
          // and move on — a broken image beats a frozen screen.
          loaded[i] = sizes[i]
        } finally {
          if (asset.stage === 'campus') campusDone = true
          publish()
        }
      }))

      if (cancelled) return
      window.clearTimeout(timer)
      settle()
    }

    void run()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [active, canFetch])

  return { progress, stage, ready, timedOut }
}
