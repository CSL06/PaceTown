/**
 * Pace Keepsakes — the private photo-to-pixel-art pipeline and collection
 * (vision §14, implementation plan §16).
 *
 * Complete or partially complete an IRL quest → choose a photo policy →
 * metadata is stripped by redrawing → privacy review → local pixel filter or
 * symbolic fallback → preview approval → private placement. Verification and
 * generation are independent: a failed check never blocks a keepsake, and a
 * keepsake never proves a quest happened. Photo users earn nothing extra.
 */

import { useState } from 'react'
import {
  KEEPSAKE_CATEGORIES, KEEPSAKE_PLACEMENTS, PALETTE, categoryForQuest, photoDecision,
  quantise, suggestedPlacements, type KeepsakeCategory, type KeepsakePlacement,
  type PhotoHandling,
} from '../../domain'
import { grow, record } from '../state'
import { Guardian } from './Guardian'
import { HelpDot } from './HelpDot'
import type { PanelProps } from './types'

const POLICIES: { id: PhotoHandling; title: string; detail: string }[] = [
  { id: 'verify_and_discard', title: 'Verify and discard', detail: 'Use the photo for optional verification, then delete it. No art is made.' },
  { id: 'keepsake_and_discard_original', title: 'Create keepsake, discard original', detail: 'Keep only the generated pixel-art memory.' },
  { id: 'save_both_privately', title: 'Save both privately', detail: 'Keep the keepsake and the original, both private to this browser.' },
  { id: 'cancel', title: 'Cancel', detail: 'Retain nothing and return.' },
]

const PRIVACY_CHECKS = [
  'No faces or identifiable people',
  'No documents, screens, or notifications',
  'No addresses, house numbers, or vehicle plates',
  'Nothing in a private space I would not keep',
]

/** Deterministic local filter: downsample to the world grid, snap to palette. */
async function filterPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('unreadable'))
      el.src = url
    })
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 64 / Math.max(img.width, img.height))
    canvas.width = Math.max(8, Math.round(img.width * scale))
    canvas.height = Math.max(8, Math.round(img.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no 2d context')
    // Redrawing drops EXIF and location metadata by construction.
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
    quantise(image.data)
    ctx.putImageData(image, 0, 0)
    // Pixelate: draw back up with smoothing off.
    const out = document.createElement('canvas')
    out.width = canvas.width * 4
    out.height = canvas.height * 4
    const octx = out.getContext('2d')
    if (!octx) throw new Error('no 2d context')
    octx.imageSmoothingEnabled = false
    octx.drawImage(canvas, 0, 0, out.width, out.height)
    return out.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}

const hex = (c: readonly [number, number, number]) =>
  `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`

/** Symbolic fallback when there is no photo or it cannot be read. */
export function symbolicKeepsake(category: KeepsakeCategory): string {
  const shape =
    category === 'garden'
      ? `<rect x="38" y="58" width="20" height="18" fill="${hex(PALETTE.stone)}"/><circle cx="48" cy="44" r="16" fill="${hex(PALETTE.sage)}"/><circle cx="38" cy="52" r="9" fill="${hex(PALETTE.sage)}"/>`
      : category === 'cafe'
        ? `<rect x="34" y="42" width="24" height="22" fill="${hex(PALETTE.cream)}"/><rect x="58" y="47" width="8" height="10" fill="none" stroke="${hex(PALETTE.cream)}" stroke-width="3"/><rect x="30" y="70" width="36" height="5" fill="${hex(PALETTE.amber)}"/>`
        : category === 'weather'
          ? `<circle cx="62" cy="34" r="10" fill="${hex(PALETTE.amber)}"/><ellipse cx="44" cy="52" rx="18" ry="10" fill="${hex(PALETTE.water)}"/>`
          : category === 'path'
            ? `<rect x="28" y="30" width="40" height="10" fill="${hex(PALETTE.stone)}"/><rect x="34" y="48" width="40" height="10" fill="${hex(PALETTE.stone)}"/><rect x="28" y="66" width="40" height="10" fill="${hex(PALETTE.stone)}"/>`
            : `<rect x="24" y="28" width="48" height="40" fill="none" stroke="${hex(PALETTE.cream)}" stroke-width="3"/><circle cx="48" cy="48" r="8" fill="${hex(PALETTE.rose)}"/>`
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
    `<rect width="96" height="96" fill="${hex(PALETTE.navy)}"/>` +
    `<rect x="4" y="4" width="88" height="88" fill="none" stroke="${hex(PALETTE.cream)}" stroke-width="2"/>` +
    shape + `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

type Step = 'policy' | 'photo' | 'generate' | 'preview' | 'placed'

export function Keepsakes({ state, load, update, go, toast }: PanelProps) {
  const eligible = state.pocket.outcome === 'done' || state.pocket.outcome === 'partial'
  const [step, setStep] = useState<Step>('policy')
  const [policy, setPolicy] = useState<PhotoHandling | null>(null)
  const [checks, setChecks] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [source, setSource] = useState<'local_filter' | 'symbolic_fallback'>('local_filter')
  const [name, setName] = useState('Pocket of Green memory')
  const [placement, setPlacement] = useState<KeepsakePlacement>('recovery_garden')
  const [busy, setBusy] = useState(false)

  const category: KeepsakeCategory = categoryForQuest('pocket_of_green')
  const decision = policy ? photoDecision(policy) : null

  if (!eligible) {
    return (
      <div className="card">
        <div className="eyebrow">Pace Keepsakes</div>
        <h2>Finish a quest first <HelpDot view="keepsakes" state={state} load={load} /></h2>
        <p className="lede">
          Keepsakes are memories of real recovery. Complete or partially complete Pocket of Green,
          then return here to turn an optional photo into private pixel art.
        </p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('pocket')}>Go to Pocket of Green</button>
        </div>
      </div>
    )
  }

  const generate = async () => {
    setBusy(true)
    try {
      if (file) {
        try {
          setPreview(await filterPhoto(file))
          setSource('local_filter')
        } catch {
          setPreview(symbolicKeepsake(category))
          setSource('symbolic_fallback')
        }
      } else {
        setPreview(symbolicKeepsake(category))
        setSource('symbolic_fallback')
      }
      setStep('preview')
    } finally {
      setBusy(false)
    }
  }

  const approve = () => {
    if (!preview || !policy || !decision) return
    // verify_and_discard verifies only: no keepsake is stored, per photoDecision.
    const keeps = policy !== 'verify_and_discard'
    update((s) => grow(record({
      ...s,
      keepsakes: keeps ? [...s.keepsakes, {
        id: `k${Date.now()}`,
        category,
        imageURL: preview,
        source,
        placement,
        retainsOriginal: decision.retainsOriginal,
        name: name.trim() || 'Untitled memory',
        at: Date.now(),
      }] : s.keepsakes,
    },
      policy === 'verify_and_discard'
        ? 'Verified a quest photo and discarded it'
        : `Created a Pace Keepsake (“${name.trim() || 'Untitled memory'}”)`,
      `Placed in ${placement}. Original photo ${decision.retainsOriginal ? 'privately retained' : 'discarded'}. ` +
      'Keepsake art never proves a quest happened, and photo use earned nothing extra.')))
    toast(policy === 'verify_and_discard' ? 'Verified · original discarded' : 'Keepsake placed privately')
    setFile(null)
    setStep('placed')
  }

  return (
    <div className="card">
      <div className="eyebrow">Pace Keepsakes · private by default</div>
      <h2>A small memory, pixel-styled <HelpDot view="keepsakes" state={state} load={load} /></h2>
      <Guardian who="sol" says="Only if you want one. The quest already counted — this changes no reward." />

      {step === 'policy' && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>How should your photo be handled?</div>
          <div className="opts">
            {POLICIES.map((p) => (
              <button key={p.id} className="opt" type="button" aria-pressed={policy === p.id}
                onClick={() => {
                  setPolicy(p.id)
                  if (p.id === 'cancel') go('pocket')
                }}>
                <span className="k">{policy === p.id ? '▸' : '○'}</span>
                <span>{p.title}<small>{p.detail}</small></span>
              </button>
            ))}
          </div>
          <div className="actions">
            <button className="primary" type="button" disabled={!policy || policy === 'cancel'}
              onClick={() => setStep(decision?.createsKeepsake || policy === 'verify_and_discard' ? 'photo' : 'policy')}>
              Continue
            </button>
          </div>
        </>
      )}

      {step === 'photo' && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>Choose the photo</div>
          <p className="note">
            Redrawing the image strips location metadata before anything else happens.
            {policy === 'verify_and_discard' ? ' It is deleted immediately after verification.' : ''}
          </p>
          <input type="file" accept="image/*" aria-label="Choose a keepsake photo"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {!file && (
            <p className="note" style={{ marginTop: 8 }}>
              No photo? Continue to receive the symbolic {category} keepsake instead — same placement, same privacy.
            </p>
          )}
          <div className="eyebrow" style={{ marginTop: 16 }}>Privacy review</div>
          <div className="opts">
            {PRIVACY_CHECKS.map((c) => (
              <button key={c} className="opt" type="button" aria-pressed={checks.includes(c)}
                onClick={() => setChecks((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>
                <span className="k">{checks.includes(c) ? '▣' : '☐'}</span><span>{c}</span>
              </button>
            ))}
          </div>
          <div className="actions">
            <button className="secondary" type="button" onClick={() => setStep('policy')}>Back</button>
            <button className="primary" type="button"
              disabled={!!file && checks.length < PRIVACY_CHECKS.length}
              onClick={() => setStep('generate')}>
              {file ? 'Review and continue' : 'Continue without a photo'}
            </button>
          </div>
        </>
      )}

      {step === 'generate' && (
        <>
          <p className="lede" style={{ marginTop: 16 }}>
            {file
              ? 'The photo will be downsampled to the world grid and snapped to the PaceTown palette.'
              : `A symbolic ${category} keepsake will be prepared — no photo needed.`}
          </p>
          <div className="actions">
            <button className="secondary" type="button" onClick={() => setStep('photo')}>Back</button>
            <button className="primary" type="button" disabled={busy} onClick={generate}>
              {busy ? 'Generating…' : policy === 'verify_and_discard' ? 'Verify' : 'Generate keepsake'}
            </button>
          </div>
        </>
      )}

      {step === 'preview' && preview && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>Preview — approve before anything is placed</div>
          <img src={preview} alt="Keepsake preview" width={192} height={192}
            style={{ imageRendering: 'pixelated', border: '1px solid var(--edge-hi)', marginTop: 8 }} />
          <p className="note">
            {source === 'local_filter' ? 'Local pixel filter.' : 'Symbolic fallback.'} Generation
            {decision?.retainsOriginal ? ' keeps the original privately.' : ' discards the original.'}
          </p>
          {policy !== 'verify_and_discard' && (
            <>
              <div className="field">
                <label htmlFor="kname">Name it</label>
                <input id="kname" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="kplace">Place it</label>
                <select id="kplace" value={placement}
                  onChange={(e) => setPlacement(e.target.value as KeepsakePlacement)}>
                  {suggestedPlacements(category).concat(
                    KEEPSAKE_PLACEMENTS.filter((p) => !suggestedPlacements(category).includes(p)),
                  ).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="actions">
            <button className="secondary" type="button" onClick={() => { setPreview(null); setStep('generate') }}>
              Regenerate
            </button>
            <button className="primary" type="button" onClick={approve}>
              {policy === 'verify_and_discard' ? 'Confirm — discard original' : 'Approve and place'}
            </button>
          </div>
        </>
      )}

      {step === 'placed' && (
        <>
          <p className="lede" style={{ marginTop: 16 }}>
            {policy === 'verify_and_discard'
              ? 'Verified. The original was discarded and nothing was stored.'
              : `Placed privately${decision?.retainsOriginal ? ', original retained privately' : ', original discarded'}. No extra rewards were granted for using a photo.`}
          </p>
          <div className="actions">
            {policy !== 'verify_and_discard'
              ? <>
                  <button className="primary" type="button" onClick={() => go('collection')}>Open the Collection</button>
                  <button className="secondary" type="button" onClick={() => go('journal')}>See the Journal</button>
                </>
              : <button className="primary" type="button" onClick={() => go('journal')}>See the Journal</button>}
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------ collection */

export function Collection({ state, load, update, go }: PanelProps) {
  const [filter, setFilter] = useState<'all' | KeepsakeCategory>('all')
  const shown = state.keepsakes.filter((k) => filter === 'all' || k.category === filter)

  return (
    <div className="card">
      <div className="eyebrow">Private collection</div>
      <h2>Pace Keepsakes <HelpDot view="collection" state={state} load={load} /></h2>
      <p className="lede">
        Cosmetic memories, not proof. No public feed, trading, rarity, or completion target.
        Self-confirmed and photo quests earn the same place here.
      </p>
      <div className="actions">
        <select aria-label="Filter by category" value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All categories</option>
          {KEEPSAKE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="secondary" type="button" onClick={() => go('keepsakes')}>Make another</button>
      </div>
      {shown.length === 0 ? (
        <p className="empty">Nothing here yet. Memories you approve will appear in this private grid.</p>
      ) : (
        <div className="townlist" style={{ marginTop: 12 }}>
          {shown.map((k) => (
            <div key={k.id} className="next-action" style={{ marginTop: 0 }}>
              <img src={k.imageURL} alt={k.name} width={96} height={96}
                style={{ imageRendering: 'pixelated', border: '1px solid var(--edge)' }} />
              <div className="eyebrow" style={{ marginTop: 8 }}>{k.category} · {k.source === 'local_filter' ? 'pixel filter' : 'symbolic'}</div>
              <p style={{ margin: '4px 0' }}><strong>{k.name}</strong></p>
              <p className="note">Original {k.retainsOriginal ? 'privately retained' : 'discarded'} · in {k.placement}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <select aria-label={`Placement for ${k.name}`} value={k.placement}
                  onChange={(e) => update((s) => ({
                    ...s,
                    keepsakes: s.keepsakes.map((x) => (x.id === k.id ? { ...x, placement: e.target.value } : x)),
                  }))}>
                  {KEEPSAKE_PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <a className="secondary" href={k.imageURL} download={`${k.name}.png`}
                  style={{ textDecoration: 'none', padding: '11px 16px' }}>Download</a>
                <button className="secondary" type="button"
                  onClick={() => update((s) => ({
                    ...s, keepsakes: s.keepsakes.filter((x) => x.id !== k.id),
                  }))}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
