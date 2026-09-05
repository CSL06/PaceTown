/**
 * Ambient music for the landing page.
 *
 * Two sources, in order of preference:
 *
 *   1. A real audio file at TRACK_SRC, if one has been added. Looped, with
 *      fades, so it can be a licensed music bed.
 *   2. "Grove Nights" — the generated score in score.ts. Used when no file is
 *      present or the file fails to load.
 *
 * The generated score is the default and needs no file, no download and no
 * licence. The file path exists only so a licensed track can replace it
 * without touching any code. See assets/app-runtime-v1/audio/README.md.
 *
 * Either way, audio only ever starts from a click. Never on load.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { startScore, type Score } from './score'

const PREF_KEY = 'pacetown.ambient'

/**
 * Drop a licensed loop here to use it instead of the generated score. Absent
 * by default — no error is shown to the visitor when it is missing.
 */
const TRACK_SRC = '/audio/ambient.mp3'

/** Music sits under the interface, not over it. */
const TRACK_VOLUME = 0.34
const SCORE_VOLUME = 0.42
const FADE_MS = 1400

export type AmbientSource = 'track' | 'score'

interface Engine {
  ctx: AudioContext
  master: GainNode
  score: Score
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === 'on'
  } catch {
    return false
  }
}

function writePreference(on: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, on ? 'on' : 'off')
  } catch {
    /* Preference is a nicety; playback still works this session. */
  }
}

export interface Ambient {
  playing: boolean
  /** Which source is actually sounding. Null until playback starts. */
  source: AmbientSource | null
  /** Null until the first attempt; a string when no audio is available at all. */
  error: string | null
  toggle: () => void
}

export function useAmbient(): Ambient {
  const [playing, setPlaying] = useState(false)
  const [source, setSource] = useState<AmbientSource | null>(null)
  const [error, setError] = useState<string | null>(null)

  const engine = useRef<Engine | null>(null)
  const element = useRef<HTMLAudioElement | null>(null)
  const fade = useRef(0)
  // Once the file is known to be missing, stop trying on every toggle.
  const trackMissing = useRef(false)

  /** Ramps an element's volume, since HTMLAudioElement has no envelope. */
  const rampTo = useCallback((el: HTMLAudioElement, to: number, ms: number, done?: () => void) => {
    window.clearInterval(fade.current)
    const from = el.volume
    const startedAt = performance.now()
    fade.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startedAt) / ms)
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t))
      if (t >= 1) {
        window.clearInterval(fade.current)
        done?.()
      }
    }, 40)
  }, [])

  const stopScore = useCallback(() => {
    const active = engine.current
    if (!active) return
    engine.current = null
    active.score.stop()

    const { ctx, master } = active
    const now = ctx.currentTime
    // Fade before closing, or the music ends on a click.
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0.0001, now + 1.2)
    window.setTimeout(() => void ctx.close().catch(() => {}), 1800)
  }, [])

  const stop = useCallback(() => {
    const el = element.current
    if (el) {
      element.current = null
      rampTo(el, 0, FADE_MS, () => { el.pause(); el.src = '' })
    }
    stopScore()
    setPlaying(false)
    setSource(null)
  }, [rampTo, stopScore])

  const startGenerated = useCallback(() => {
    if (engine.current) return
    const Ctor = window.AudioContext
      ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) {
      setError('This browser cannot play the ambient score.')
      return
    }

    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, ctx.currentTime)
    master.gain.linearRampToValueAtTime(SCORE_VOLUME, ctx.currentTime + 2.5)
    master.connect(ctx.destination)

    engine.current = { ctx, master, score: startScore(ctx, master) }

    // Some browsers hand back a suspended context even from a gesture.
    void ctx.resume().catch(() => {})
    setError(null)
    setSource('score')
    setPlaying(true)
  }, [])

  const start = useCallback(() => {
    if (engine.current || element.current) return

    if (trackMissing.current) { startGenerated(); return }

    const el = new Audio(TRACK_SRC)
    el.loop = true
    el.preload = 'auto'
    el.volume = 0

    // A missing or unplayable file is the normal case, not an error worth
    // showing anyone — fall through to the score and stop retrying.
    const fallback = () => {
      trackMissing.current = true
      if (element.current === el) element.current = null
      el.pause()
      startGenerated()
    }
    el.addEventListener('error', fallback, { once: true })

    element.current = el
    void el.play().then(
      () => {
        setError(null)
        setSource('track')
        setPlaying(true)
        rampTo(el, TRACK_VOLUME, FADE_MS)
      },
      fallback,
    )
  }, [rampTo, startGenerated])

  const toggle = useCallback(() => {
    if (engine.current || element.current) {
      writePreference(false)
      stop()
    } else {
      writePreference(true)
      start()
    }
  }, [start, stop])

  /* Silence while the tab is in the background — nobody wants music playing
     from a tab they forgot about. The preference is untouched, so returning
     to the tab brings it back. */
  useEffect(() => {
    const onVisibility = () => {
      const el = element.current
      if (el) {
        if (document.hidden) el.pause()
        else void el.play().catch(() => {})
      }
      const active = engine.current
      if (!active) return
      if (document.hidden) void active.ctx.suspend().catch(() => {})
      else void active.ctx.resume().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => () => {
    window.clearInterval(fade.current)
    const el = element.current
    if (el) { el.pause(); el.src = '' }
    element.current = null
    stopScore()
  }, [stopScore])

  return { playing, source, error, toggle }
}

/** Whether the visitor had the score on last time. Never auto-starts it. */
export function ambientWasOn(): boolean {
  return readPreference()
}
