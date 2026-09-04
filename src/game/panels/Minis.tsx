/**
 * The four playable-lite regulation mini-games (vision §11).
 *
 * Firefly Stories (Mira), Chime Drift (Kai), Warm Cup (Sky) and Night
 * Lanterns (Goh). Each is a short, unhurried interaction with no score, no
 * failure state and no minimum duration. Participation — never performance —
 * completes them. Every game ends with an optional Lighter / Same / Not sure
 * response and its specified return paths.
 */

import { useEffect, useState } from 'react'
import { REWARDS } from '../../domain'
import { grow, record } from '../state'
import { Guardian } from './Guardian'
import { HelpDot } from './HelpDot'
import type { PanelProps } from './types'

type Response = 'lighter' | 'same' | 'not_sure'

function recordPlay(
  update: PanelProps['update'],
  toast: PanelProps['toast'],
  state: PanelProps['state'],
  activity: string,
  label: string,
  pausedFrom: string | null,
  response: Response,
) {
  const firstTime = !state.recoveryDone
  update((s) => grow(record({
    ...s,
    questOutcome: 'done',
    recoveryDone: true,
    regulationSessions: [...s.regulationSessions, {
      at: Date.now(), activity, placement: pausedFrom ? 'mid_session' : 'standalone', response,
    }],
    session: { ...s.session, pausedFrom: null },
  },
    label,
    'A preference, not a health measurement.',
    firstTime ? REWARDS.recovery : undefined)))
  if (firstTime) toast(`Recovery recorded · +${REWARDS.recovery.xp} XP`)
}

function Respond({ onPick }: { onPick: (r: Response) => void }) {
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 18 }}>How does that feel? (optional)</div>
      <div className="outcomes">
        <button type="button" onClick={() => onPick('lighter')}>Lighter</button>
        <button type="button" onClick={() => onPick('same')}>The same</button>
        <button type="button" onClick={() => onPick('not_sure')}>Not sure</button>
      </div>
    </>
  )
}

function Returns({ options }: { options: { label: string; detail: string; onGo: () => void }[] }) {
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 18 }}>Return</div>
      <div className="opts">
        {options.map((o) => (
          <button key={o.label} className="opt" type="button" onClick={o.onGo}>
            <span className="k">→</span><span>{o.label}<small>{o.detail}</small></span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------------------------------------------------------- firefly */

const FRAGMENTS = [
  { title: 'On rest', text: 'Rest is not the absence of progress. It is how progress survives the week.' },
  { title: 'On uncertainty', text: 'Not knowing the next three steps is fine. One visible step is enough to begin.' },
  { title: 'On loneliness', text: 'Working near someone — even quietly — still counts as company.' },
  { title: 'On persistence', text: 'Partial progress is progress that kept its next action.' },
  { title: 'On self-kindness', text: 'You would not call a friend lazy for being tired. Keep the same rule for yourself.' },
]

export function Firefly({ state, load, update, go, toast }: PanelProps) {
  const [lit, setLit] = useState<number[]>([])
  const [placed, setPlaced] = useState<number | null>(null)
  const [response, setResponse] = useState<Response | null>(null)
  const done = placed !== null

  const finish = (fn: () => void) => {
    if (done) recordPlay(update, toast, state, 'firefly_stories', 'Used Firefly Stories to settle', state.session.pausedFrom, response ?? 'not_sure')
    fn()
  }

  return (
    <div className="card">
      <div className="eyebrow">Library · Firefly Stories</div>
      <h2>Follow a light <HelpDot view="firefly" state={state} load={load} /></h2>
      <Guardian who="mira" says="Five lights, five short readings. Follow one, skip the rest, and leave one glow." />
      <div className="opts">
        {FRAGMENTS.map((f, i) => (
          <button key={f.title} className="opt" type="button" aria-pressed={lit.includes(i)}
            onClick={() => setLit((l) => (l.includes(i) ? l : [...l, i]))}>
            <span className="k">{lit.includes(i) ? '✦' : '✧'}</span>
            <span>{f.title}
              {lit.includes(i) && <small>{f.text}</small>}
            </span>
          </button>
        ))}
      </div>
      {lit.length > 0 && placed === null && (
        <div className="actions">
          <span className="note">Place one glow to finish — or leave now, which also finishes.</span>
          {lit.map((i) => (
            <button key={i} className="secondary" type="button" onClick={() => setPlaced(i)}>
              Place “{FRAGMENTS[i].title}”
            </button>
          ))}
        </div>
      )}
      {done && !response && <Respond onPick={setResponse} />}
      {done && response && (
        <Returns options={[
          { label: 'Return to work', detail: 'The same checkpoint is waiting.', onGo: () => finish(() => go(state.activeCheckpointId ? 'session' : null)) },
          { label: 'Save a thought', detail: 'Send a line to the Future Mailbox.', onGo: () => finish(() => go('mailbox')) },
          { label: 'Rest here', detail: 'Close with nothing further.', onGo: () => finish(() => go(null)) },
        ]} />
      )}
      {!done && (
        <div className="actions">
          <button className="secondary" type="button" onClick={() => go(null)}>Leave quietly</button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ chime */

export function Chime({ state, load, update, go, toast }: PanelProps) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [waves, setWaves] = useState(0)
  const [taps, setTaps] = useState(0)
  const [response, setResponse] = useState<Response | null>(null)
  const done = waves >= 4

  useEffect(() => {
    if (reduced || done) return
    const id = window.setInterval(() => setWaves((w) => Math.min(4, w + 1)), 3500)
    return () => window.clearInterval(id)
  }, [reduced, done])

  const finish = (fn: () => void) => {
    recordPlay(update, toast, state, 'chime_drift', 'Used Chime Drift to slow a transition', state.session.pausedFrom, response ?? 'not_sure')
    fn()
  }

  return (
    <div className="card">
      <div className="eyebrow">Clock Tower · Chime Drift</div>
      <h2>Slow waves <HelpDot view="chime" state={state} load={load} /></h2>
      <Guardian who="kai" says="Notes drift past slowly. Tap them, or just watch. Timing is never scored." />
      <div className="capacity" aria-live="polite">
        <div><span>Wave {Math.min(waves + 1, 4)} of 4</span><span>{taps} soft {taps === 1 ? 'tap' : 'taps'}</span></div>
      </div>
      <div className="actions">
        <button className="primary" type="button" disabled={done}
          onClick={() => { setTaps((t) => t + 1); setWaves((w) => Math.min(4, w + 1)) }}>
          {reduced || waves >= 4 ? 'Tap the wave' : 'Tap (or wait for the next wave)'}
        </button>
        {reduced && !done && (
          <button className="secondary" type="button" onClick={() => setWaves((w) => Math.min(4, w + 1))}>
            Next wave
          </button>
        )}
      </div>
      {done && !response && <Respond onPick={setResponse} />}
      {done && response && (
        <Returns options={[
          { label: 'Choose one next action', detail: 'Back to the work plan.', onGo: () => finish(() => go('work')) },
          { label: 'Rebalance', detail: 'See what can safely move.', onGo: () => finish(() => go('rebalance')) },
          { label: 'Return', detail: 'Back to the campus.', onGo: () => finish(() => go(null)) },
        ]} />
      )}
    </div>
  )
}

/* ---------------------------------------------------------- warm cup */

const CUP_BASES = ['Barley tea', 'Warm milk', 'Hot water with lemon']
const CUP_STEPS = ['Choose a base', 'Pour', 'Stir', 'Sit by the window'] as const

export function WarmCup({ state, load, update, go, toast }: PanelProps) {
  const [step, setStep] = useState(0)
  const [base, setBase] = useState<string | null>(null)
  const [response, setResponse] = useState<Response | null>(null)
  const done = step >= CUP_STEPS.length

  const finish = (fn: () => void) => {
    recordPlay(update, toast, state, 'warm_cup', 'Prepared a Warm Cup transition', state.session.pausedFrom, response ?? 'not_sure')
    fn()
  }

  return (
    <div className="card">
      <div className="eyebrow">Café · Warm Cup</div>
      <h2>An unhurried ritual <HelpDot view="warmcup" state={state} load={load} /></h2>
      <Guardian who="sky" says="No rush and no wrong order. I will sit with you while the cup is made." />
      <p className="note">Step {Math.min(step + 1, 4)} of 4 · {CUP_STEPS[Math.min(step, 3)]}</p>
      {step === 0 && (
        <div className="opts">
          {CUP_BASES.map((b) => (
            <button key={b} className="opt" type="button" onClick={() => { setBase(b); setStep(1) }}>
              <span className="k">○</span><span>{b}</span>
            </button>
          ))}
        </div>
      )}
      {step > 0 && !done && (
        <div className="capacity">
          <div><span>{base}</span><span>{CUP_STEPS[step]}</span></div>
        </div>
      )}
      {step > 0 && !done && (
        <div className="actions">
          <button className="primary" type="button" onClick={() => setStep((s) => s + 1)}>
            {CUP_STEPS[step]}
          </button>
        </div>
      )}
      {done && (
        <p className="lede">Your {base?.toLowerCase() ?? 'cup'} sits by the window, steaming. It cannot be ruined.</p>
      )}
      {done && !response && <Respond onPick={setResponse} />}
      {done && response && (
        <Returns options={[
          { label: 'Work together', detail: 'A quiet body-doubling session with Sky.', onGo: () => finish(() => go(state.activeCheckpointId ? 'session' : 'work')) },
          { label: 'Schedule later', detail: 'Send the plan to the Future Mailbox.', onGo: () => finish(() => go('mailbox')) },
          { label: 'Sit a little longer', detail: 'Stay with the cup a while.', onGo: () => finish(() => go(null)) },
        ]} />
      )}
    </div>
  )
}

/* ---------------------------------------------------------- lanterns */

const SYMBOLS = [
  { id: 'circle', label: 'Circle — something ongoing', glyph: '○' },
  { id: 'triangle', label: 'Triangle — something to climb', glyph: '△' },
  { id: 'wave', label: 'Wave — something to ride out', glyph: '～' },
  { id: 'star', label: 'Star — something to wish for', glyph: '☆' },
]

export function Lanterns({ state, load, update, go, toast }: PanelProps) {
  const [symbol, setSymbol] = useState<string | null>(null)
  const [phrase, setPhrase] = useState('')
  const [lit, setLit] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)

  const finish = (fn: () => void) => {
    recordPlay(update, toast, state, 'night_lanterns', 'Placed a Night Lantern', state.session.pausedFrom, response ?? 'not_sure')
    fn()
  }

  return (
    <div className="card">
      <div className="eyebrow">Market · Night Lanterns</div>
      <h2>Set something down <HelpDot view="lanterns" state={state} load={load} /></h2>
      <Guardian who="goh" says="Pick a symbol for what is on your mind. Words are optional and stay private." />
      <div className="opts">
        {SYMBOLS.map((s) => (
          <button key={s.id} className="opt" type="button" aria-pressed={symbol === s.id}
            onClick={() => setSymbol(s.id)}>
            <span className="k">{s.glyph}</span><span>{s.label}</span>
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="lanternPhrase">A private phrase (optional — stays in this browser)</label>
        <input id="lanternPhrase" value={phrase} maxLength={120}
          placeholder="Only if putting it in words helps."
          onChange={(e) => setPhrase(e.target.value)} />
      </div>
      <div className="actions">
        <button className="primary" type="button" disabled={!symbol || lit}
          onClick={() => setLit(true)}>
          {lit ? 'Lantern lit' : 'Light the lantern'}
        </button>
      </div>
      {lit && !response && <Respond onPick={setResponse} />}
      {lit && response && (
        <Returns options={[
          { label: 'Put it in the Backpack', detail: 'Keep it as a visible next action.', onGo: () => finish(() => go('backpack')) },
          { label: 'Send it to the Future Mailbox', detail: phrase ? 'The phrase travels with it, privately.' : 'A quiet note to your future self.', onGo: () => finish(() => go('mailbox')) },
          { label: 'Leave it here', detail: 'Released. Nothing is stored.', onGo: () => finish(() => go(null)) },
        ]} />
      )}
    </div>
  )
}
