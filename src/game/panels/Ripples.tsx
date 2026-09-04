/**
 * Gentle Ripples — the fully interactive regulation mini-game (vision §11).
 *
 * Taps or holds create ripples, petals, fish movement and opening flowers.
 * Participation completes it: no score, no failure state, no minimum duration.
 * Leaving early is valid. Reduced-motion replaces expanding motion with soft
 * light pulses and static flower states.
 */

import { useEffect, useRef, useState } from 'react'
import { REWARDS } from '../../domain'
import { grow, record } from '../state'
import { Guardian } from './Guardian'
import type { PanelProps } from './types'

interface Drop {
  id: number
  x: number
  y: number
}

let dropId = 0

type Phase = 'play' | 'respond' | 'done'

export function Ripples({ state, update, go, toast }: PanelProps) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [drops, setDrops] = useState<Drop[]>([])
  const [taps, setTaps] = useState(0)
  const [breathOn, setBreathOn] = useState(!reduced)
  const [breathSec, setBreathSec] = useState(0)
  const [phase, setPhase] = useState<Phase>('play')
  const [response, setResponse] = useState<'lighter' | 'same' | 'not_sure' | null>(null)
  const pondRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!breathOn || reduced) return
    const id = window.setInterval(() => setBreathSec((s) => (s + 1) % 12), 1000)
    return () => window.clearInterval(id)
  }, [breathOn, reduced])

  const breathPhase = !breathOn ? 'off' : breathSec < 4 ? 'in' : breathSec < 6 ? 'hold' : 'out'

  const addDrop = (x: number, y: number) => {
    const id = ++dropId
    setDrops((d) => [...d.slice(-14), { id, x, y }])
    setTaps((t) => t + 1)
    window.setTimeout(() => setDrops((d) => d.filter((drop) => drop.id !== id)), 2600)
  }

  const dropAt = (clientX: number, clientY: number) => {
    const el = pondRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    addDrop(
      Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)),
      Math.min(92, Math.max(8, ((clientY - rect.top) / rect.height) * 100)),
    )
  }

  const flowers = Math.min(5, Math.floor(taps / 3))

  const finish = (choice: 'resume' | 'reduce' | 'rest') => {
    const resp = response ?? 'not_sure'
    update((s) => grow(record({
      ...s,
      rippleTaps: s.rippleTaps + taps,
      questOutcome: 'done',
      ripples: { taps: s.ripples.taps + taps, response: resp, lastAt: Date.now() },
      regulationSessions: [...s.regulationSessions, {
        at: Date.now(), activity: 'gentle_ripples',
        placement: s.session.pausedFrom ? 'mid_session' : 'standalone', response: resp,
      }],
      session: { ...s.session, pausedFrom: null },
    },
      'Used Gentle Ripples as a transition',
      'Returned to the same checkpoint. A preference, not a health measurement.',
      REWARDS.recovery)))
    toast(`Recovery recorded · +${REWARDS.recovery.xp} XP`)
    setPhase('done')
    if (choice === 'resume') go(state.activeCheckpointId ? 'session' : null)
    else if (choice === 'reduce') go('work')
    else go(null)
  }

  if (phase === 'done') {
    return (
      <div className="card">
        <h2>Water settling</h2>
        <p className="lede">Recovery recorded. Your checkpoint is held exactly as you left it.</p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('journal')}>See the Journal</button>
        </div>
      </div>
    )
  }

  if (phase === 'respond') {
    return (
      <div className="card">
        <div className="eyebrow">Gentle Ripples</div>
        <h2>How does the water feel?</h2>
        <p className="lede">Optional. This tunes suggestions — it is never a health score.</p>
        <div className="outcomes">
          {(['lighter', 'same', 'not_sure'] as const).map((r) => (
            <button key={r} type="button" aria-pressed={response === r}
              onClick={() => setResponse(r)}>
              {r === 'lighter' ? 'Lighter' : r === 'same' ? 'The same' : 'Not sure'}
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="secondary" type="button" onClick={() => setPhase('play')}>
            Back to the water
          </button>
        </div>
        {response && (
          <>
            <div className="eyebrow" style={{ marginTop: 18 }}>Return</div>
            <div className="opts">
              <button className="opt" type="button" onClick={() => finish('resume')}>
                <span className="k">→</span><span>Resume checkpoint<small>The same notes, timer and next action.</small></span>
              </button>
              <button className="opt" type="button" onClick={() => finish('reduce')}>
                <span className="k">→</span><span>Reduce its scope<small>Make the checkpoint smaller before returning.</small></span>
              </button>
              <button className="opt" type="button" onClick={() => finish('rest')}>
                <span className="k">→</span><span>Continue resting<small>Close with no further action.</small></span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <div className="eyebrow">Garden Pavilion · Gentle Ripples</div>
      <h2>A paced sensory pause</h2>
      <Guardian who="sol" says="No score here. Tap the water when you like, watch what answers, and leave whenever you are ready." />
      <div
        ref={pondRef}
        className={`pond${reduced ? ' still' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Pond. Tap, click, or press Space to create a ripple."
        onPointerDown={(e) => dropAt(e.clientX, e.clientY)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            addDrop(20 + Math.random() * 60, 30 + Math.random() * 40)
          }
        }}
      >
        {drops.map((d) => (
          <span key={d.id} className="ripple" style={{ left: `${d.x}%`, top: `${d.y}%` }} />
        ))}
        {[12, 38, 64, 85].map((x, i) => (
          <span key={x} className="petal" style={{ left: `${x}%`, animationDelay: `${i * 1.7}s` }} />
        ))}
        <span className="fish" aria-hidden="true" />
        <div className="flowers" aria-label={`${flowers} of 5 flowers open`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < flowers ? 'bloom open' : 'bloom'} />
          ))}
        </div>
        {breathOn && (
          <div className={`breath-ring ${breathPhase}`} aria-hidden="true">
            <span>{breathPhase === 'in' ? 'in' : breathPhase === 'hold' ? 'hold' : breathPhase === 'out' ? 'out' : ''}</span>
          </div>
        )}
      </div>
      <p className="note" aria-live="polite">
        {taps === 0 ? 'Touch the water to begin — or just watch.' : `${taps} ripple${taps === 1 ? '' : 's'} · ${flowers} of 5 flowers open`}
      </p>
      <div className="actions">
        <button className="secondary" type="button" aria-pressed={breathOn}
          onClick={() => setBreathOn((b) => !b)}>
          {breathOn ? 'Hide breathing guide' : 'Show breathing guide'}
        </button>
        <button className="primary" type="button" onClick={() => setPhase('respond')}>
          Done for now
        </button>
        <button className="secondary" type="button" onClick={() => go(null)}>Leave quietly</button>
      </div>
      <p className="note">Leaving early is a valid ending — nothing is lost.</p>
    </div>
  )
}
