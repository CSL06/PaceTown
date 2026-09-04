/**
 * Pocket of Green — the fully usable IRL recovery quest (IRL-01, vision §11).
 *
 * Four setting paths (outdoor, open window, indoor plant, nature image),
 * self-confirmation or optional photo, Done / Partly done / Changed my mind /
 * Choose another outcomes, and an explicit camera-denied path. Self and photo
 * confirmation earn identically; uncertain verification always allows manual
 * correction.
 */

import { useRef, useState } from 'react'
import {
  questReward, statsFromPixels, verifyPocketPhoto, type PhotoVerificationResult,
} from '../../domain'
import { grow, record } from '../state'
import { Guardian } from './Guardian'
import type { PanelProps } from './types'

type Path = 'outdoor' | 'window' | 'indoor' | 'image'
type Step = 'path' | 'method' | 'outcome' | 'recorded'

const PATHS: { id: Path; title: string; detail: string }[] = [
  { id: 'outdoor', title: 'Step outside', detail: '5–10 minutes near greenery, sky, or light in a place that already feels safe.' },
  { id: 'window', title: 'Open-window observation', detail: 'Sit by an open window for 5–10 minutes and notice one green, sky, or light detail.' },
  { id: 'indoor', title: 'Indoor plant', detail: 'Spend 5–10 minutes with an indoor plant or a personally calming object, from where you are.' },
  { id: 'image', title: 'Nature image', detail: 'Look through a supplied or saved nature image for a few minutes. No going anywhere.' },
]

const ALTERNATIVES = [
  'Take a short screen-free pause where you are.',
  'Prepare a familiar drink and step away from the desk.',
  'Write one concern down and put it somewhere intentional.',
  'Try Gentle Ripples at the Garden Pavilion instead.',
]

export function Pocket({ state, update, go, toast }: PanelProps) {
  const [step, setStep] = useState<Step>('path')
  const [path, setPath] = useState<Path | null>(state.pocket.path)
  const [method, setMethod] = useState<'self' | 'photo' | null>(null)
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [verification, setVerification] = useState<PhotoVerificationResult | null>(null)
  const [manual, setManual] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const analyse = (file: File) => {
    const url = URL.createObjectURL(file)
    setPhotoURL(url)
    const img = new Image()
    img.onload = () => {
      try {
        const scale = Math.min(1, 160 / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no 2d context')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        setVerification(verifyPocketPhoto(statsFromPixels(data)))
      } catch {
        setVerification({
          criteria: [], overall: 'uncertain',
          explanation: 'The photo could not be read locally — confirm manually.',
          source: 'local',
        })
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      setVerification({
        criteria: [], overall: 'uncertain',
        explanation: 'The photo could not be read locally — confirm manually.',
        source: 'local',
      })
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const complete = (outcome: 'done' | 'partial' | 'changed') => {
    const confirmation = method === 'photo' ? 'photo' : 'self'
    const reward = questReward(outcome, confirmation)
    update((s) => grow(record({
      ...s,
      questOutcome: outcome === 'changed' ? 'changed' : outcome,
      pocket: {
        path,
        outcome: outcome === 'changed' ? 'changed' : outcome,
        confirmation,
        verification: verification?.overall ?? null,
      },
      regulationSessions: outcome === 'changed' ? s.regulationSessions : [...s.regulationSessions, {
        at: Date.now(), activity: 'pocket_of_green', placement: 'standalone',
        response: null,
      }],
      session: { ...s.session, pausedFrom: null },
    },
      outcome === 'changed'
        ? 'Pocket of Green — changed mind, no penalty'
        : `Pocket of Green — ${outcome === 'done' ? 'done' : 'partly done'}`,
      outcome === 'changed'
        ? 'Choosing another kind of rest is a valid ending.'
        : `Confirmed by ${confirmation === 'photo' ? 'optional photo' : 'self-report'}` +
          `${verification ? ` · local check: ${verification.overall}` : ''}. ` +
          'Outdoor access is never assumed; every path earns the same.',
      reward)))
    if (outcome !== 'changed') toast(`Quest ${outcome === 'done' ? 'complete' : 'partly done'} · +${reward.xp} XP`)
    setStep('recorded')
  }

  if (step === 'recorded') {
    const lastOutcome = state.pocket.outcome
    return (
      <div className="card">
        <div className="eyebrow">Park · Pocket of Green</div>
        <h2>{lastOutcome === 'changed' ? 'Changed mind — no penalty' : 'Recovery recorded'}</h2>
        <p className="lede">
          Self-confirmation and photo confirmation earn identically. Photo use grants no XP, coins,
          rarity, or progression advantage.
        </p>
        <div className="opts">
          {(lastOutcome === 'done' || lastOutcome === 'partial') && (
            <button className="opt" type="button" onClick={() => go('keepsakes')}>
              <span className="k">▣</span>
              <span>Turn it into a Keepsake<small>Private pixel-art memory. The original photo is handled exactly as you choose.</small></span>
            </button>
          )}
          <button className="opt" type="button" onClick={() => go(state.activeCheckpointId ? 'session' : null)}>
            <span className="k">→</span><span>Resume checkpoint<small>The same notes and next action.</small></span>
          </button>
          <button className="opt" type="button" onClick={() => go('mailbox')}>
            <span className="k">→</span><span>Schedule the next action<small>Send it to the Future Mailbox.</small></span>
          </button>
          <button className="opt" type="button" onClick={() => go('calm')}>
            <span className="k">→</span><span>Recover longer<small>All five activities, no prerequisites.</small></span>
          </button>
          <button className="opt" type="button" onClick={() => go(null)}>
            <span className="k">→</span><span>Return to town<small>Nothing is lost by stopping here.</small></span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="eyebrow">Park · Pocket of Green · Sol</div>
      <h2>A short reset, your way</h2>
      <Guardian who="sol" says="Five to ten minutes with something green, given light, or simply calming. Outside, at a window, beside a plant, or with an image — all four count the same." />

      {step === 'path' && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>Choose your setting</div>
          <div className="opts">
            {PATHS.map((p) => (
              <button key={p.id} className="opt" type="button" aria-pressed={path === p.id}
                onClick={() => setPath(p.id)}>
                <span className="k">{path === p.id ? '▸' : '○'}</span>
                <span>{p.title}<small>{p.detail}</small></span>
              </button>
            ))}
          </div>
          <div className="actions">
            <button className="primary" type="button" disabled={!path}
              onClick={() => setStep('method')}>Continue</button>
            <button className="secondary" type="button" onClick={() => complete('changed')}>
              Changed my mind
            </button>
          </div>
          <div className="eyebrow" style={{ marginTop: 18 }}>Or choose another rest</div>
          <ul style={{ paddingLeft: 18, color: 'var(--dim)', fontSize: 13 }}>
            {ALTERNATIVES.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </>
      )}

      {step === 'method' && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>How to confirm</div>
          <div className="opts">
            <button className="opt" type="button" aria-pressed={method === 'self'}
              onClick={() => { setMethod('self'); setVerification(null); setPhotoURL(null) }}>
              <span className="k">{method === 'self' ? '▸' : '○'}</span>
              <span>Self-confirm<small>Your word is enough. Same rewards, no camera needed.</small></span>
            </button>
            <button className="opt" type="button" aria-pressed={method === 'photo'}
              onClick={() => setMethod('photo')}>
              <span className="k">{method === 'photo' ? '▸' : '○'}</span>
              <span>Optional photo<small>Checked locally for greenery or daylight only. Same rewards.</small></span>
            </button>
          </div>

          {method === 'photo' && (
            <div className="capacity">
              <div><span>Photo prompt</span><span>greenery · sky · light · calming detail</span></div>
              <div><span>Never include</span><span>people · addresses · private spaces</span></div>
              <div style={{ display: 'block', marginTop: 8 }}>
                <input ref={fileRef} type="file" accept="image/*"
                  aria-label="Choose a quest photo"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) analyse(f)
                  }} />
                {photoURL && (
                  <div style={{ marginTop: 8 }}>
                    <img src={photoURL} alt="Your quest photo preview" style={{ maxWidth: '100%', border: '1px solid var(--edge)' }} />
                  </div>
                )}
                {verification && (
                  <div style={{ marginTop: 8 }}>
                    <div><span>Local check: </span><b>{verification.overall}</b></div>
                    {verification.criteria.map((c) => (
                      <div key={c.label} style={{ display: 'block', color: 'var(--dim)', marginTop: 4 }}>
                        {c.passed ? '✓' : '?'} {c.label}
                      </div>
                    ))}
                    <p style={{ color: 'var(--dim)' }}>{verification.explanation}</p>
                    {verification.overall === 'uncertain' && !manual && (
                      <button className="secondary" type="button" onClick={() => setManual(true)}>
                        This was my Pocket of Green — confirm manually
                      </button>
                    )}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <button className="secondary" type="button"
                    onClick={() => { setMethod('self'); setVerification(null); setPhotoURL(null) }}>
                    My camera doesn&apos;t work — self-confirm instead
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="actions">
            <button className="secondary" type="button" onClick={() => setStep('path')}>Back</button>
            <button className="primary" type="button"
              disabled={!method || (method === 'photo' && !verification && !manual)}
              onClick={() => setStep('outcome')}>Continue</button>
          </div>
          <p className="note">A photo is never required. Uncertain results always allow manual correction.</p>
        </>
      )}

      {step === 'outcome' && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>How did it go?</div>
          <div className="outcomes">
            <button type="button" onClick={() => complete('done')}>Done</button>
            <button type="button" onClick={() => complete('partial')}>Partly done</button>
          </div>
          <div className="actions">
            <button className="secondary" type="button" onClick={() => complete('changed')}>
              Changed my mind
            </button>
            <button className="secondary" type="button" onClick={() => setStep('path')}>
              Choose another
            </button>
          </div>
        </>
      )}
    </div>
  )
}
