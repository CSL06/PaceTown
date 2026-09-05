/**
 * The doorway into Campus Grove.
 *
 * Entering the town needs two separate things to arrive: the game's JavaScript
 * chunk and the campus artwork. Leaving that to Suspense alone would hand over
 * as soon as the code was ready and drop the player into a half-drawn town
 * with the map still streaming in — so this waits for both, and shows honest
 * progress while it does.
 *
 * It also owns the dwell rules, which Suspense cannot express: a fallback
 * unmounts the instant its chunk resolves, so a minimum display time is
 * impossible there. Here it is just state.
 */

import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { LoadingScreen } from '../ui/LoadingScreen'
import { useBootProgress } from '../ui/useBootProgress'

const loadGame = () => import('./Game')
const Game = lazy(loadGame)

/**
 * How the two halves split the bar. The artwork is ~3.5 MB against ~150 KB of
 * JavaScript, so weighting them evenly would make the bar sit at 50% through
 * almost the entire wait.
 */
const ASSET_SHARE = 0.85

export default function TownGate() {
  const boot = useBootProgress()
  const [chunkReady, setChunkReady] = useState(false)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    let alive = true
    const finish = () => { if (alive) setChunkReady(true) }
    // A failed import still resolves the gate: Suspense will surface the real
    // error, and the error boundary is a better place to explain it than a
    // loading screen that never finishes.
    void loadGame().then(finish, finish)
    return () => { alive = false }
  }, [])

  const ready = boot.ready && chunkReady

  // Held just under full until both halves are actually in, so the bar never
  // shows 100% while something is still arriving.
  const combined = ready
    ? 1
    : Math.min(0.99, boot.progress * ASSET_SHARE + (chunkReady ? 1 - ASSET_SHARE : 0))

  const onSettled = useCallback(() => setSettled(true), [])

  if (!settled) {
    return (
      <LoadingScreen
        progress={combined}
        stage={boot.stage}
        ready={ready}
        onSettled={onSettled}
      />
    )
  }

  // Already imported by now, so this never actually suspends.
  return (
    <Suspense fallback={null}>
      <Game />
    </Suspense>
  )
}
