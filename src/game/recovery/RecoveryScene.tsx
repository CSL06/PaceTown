import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { REWARDS, type RegulationId } from '../../domain'
import type { ViewId } from '../layout'
import { grow, record, type GameState } from '../state'
import type { PanelProps } from '../panels/types'
import './recovery.css'

type RecoveryView = Extract<ViewId, 'ripples' | 'chime' | 'warmcup' | 'firefly' | 'lanterns'>
type Response = 'lighter' | 'same' | 'not_sure'

const META: Record<RecoveryView, { title: string; place: string; guardian: string; activity: RegulationId }> = {
  ripples: { title: 'Gentle Ripples', place: 'Garden Pavilion', guardian: 'Sol', activity: 'gentle_ripples' },
  chime: { title: 'Chime Drift', place: 'Clock Tower', guardian: 'Kai', activity: 'chime_drift' },
  warmcup: { title: 'Warm Cup', place: 'Café', guardian: 'Sky', activity: 'warm_cup' },
  firefly: { title: 'Firefly Stories', place: 'Library', guardian: 'Mira', activity: 'firefly_stories' },
  lanterns: { title: 'Night Lanterns', place: 'Market', guardian: 'Goh', activity: 'night_lanterns' },
}

const ATLAS_SIZE: Record<RecoveryView, [number, number]> = {
  ripples: [256, 96], chime: [256, 64], warmcup: [256, 96],
  firefly: [256, 96], lanterns: [256, 160],
}

function Sprite({ game, index, className = '', label }: {
  game: RecoveryView; index: number; className?: string; label?: string
}) {
  const [w, h] = ATLAS_SIZE[game]
  const x = (index % 8) * 32
  const y = Math.floor(index / 8) * 32
  return <span className={`recovery-sprite ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true} style={{
      '--atlas': `url(/game/recovery/atlases/${game === 'warmcup' ? 'warm-cup' : game === 'firefly' ? 'firefly-stories' : game === 'lanterns' ? 'night-lanterns' : game === 'ripples' ? 'gentle-ripples' : 'chime-drift'}.png)`,
      '--atlas-w': `${w * 2}px`, '--atlas-h': `${h * 2}px`,
      '--sprite-x': `${-x * 2}px`, '--sprite-y': `${-y * 2}px`,
    } as CSSProperties} />
}

interface CompletionProps {
  response: Response | null
  setResponse: (value: Response | null) => void
  finish: (view: ViewId | null, response: Response, destination?: 'mailbox' | 'backpack', text?: string) => void
  options: { label: string; detail: string; view: ViewId | null; destination?: 'mailbox' | 'backpack'; text?: string }[]
  onBack?: () => void
}

function Completion({ response, setResponse, finish, options, onBack }: CompletionProps) {
  return <div className="recovery-complete" role="dialog" aria-label="Recovery check-in">
    <span className="recovery-kicker">You can stop here</span>
    <h2>How do you feel now?</h2>
    <p>This is optional and only tunes future suggestions. It is not a health score.</p>
    <div className="recovery-response">
      <button type="button" aria-pressed={response === 'lighter'} onClick={() => setResponse('lighter')}>Lighter</button>
      <button type="button" aria-pressed={response === 'same'} onClick={() => setResponse('same')}>The same</button>
      <button type="button" aria-pressed={response === 'not_sure'} onClick={() => setResponse('not_sure')}>Not sure</button>
      <button type="button" className="quiet" onClick={() => setResponse(null)}>Skip</button>
    </div>
    <div className="recovery-return">
      {options.map((option) => <button type="button" key={option.label}
        onClick={() => finish(option.view, response ?? 'not_sure', option.destination, option.text)}>
        <b>{option.label}</b><span>{option.detail}</span>
      </button>)}
    </div>
    {onBack && <button className="recovery-text-button" type="button" onClick={onBack}>Keep playing</button>}
  </div>
}

function useRecoveryFinish({ update, go, toast }: PanelProps, view: RecoveryView) {
  const recorded = useRef(false)
  return (next: ViewId | null, response: Response, destination?: 'mailbox' | 'backpack', text?: string) => {
    if (!recorded.current) {
      recorded.current = true
      const meta = META[view]
      update((current) => {
        const first = !current.recoveryDone
        const at = Date.now()
        let nextState: GameState = {
          ...current,
          questOutcome: 'done', recoveryDone: true,
          regulationSessions: [...current.regulationSessions, {
            at, activity: meta.activity,
            placement: current.session.pausedFrom ? 'mid_session' : 'standalone', response,
          }],
          recoveryPrefs: current.recoveryPrefs.includes(meta.activity)
            ? current.recoveryPrefs : [...current.recoveryPrefs, meta.activity],
          session: { ...current.session, pausedFrom: null },
        }
        if (view === 'ripples') nextState = {
          ...nextState, rippleTaps: nextState.rippleTaps + 1,
          ripples: { taps: nextState.ripples.taps + 1, response, lastAt: at },
        }
        if (destination === 'mailbox' && text?.trim()) {
          nextState = { ...nextState, mailbox: [...nextState.mailbox, { at, text: text.trim() }] }
        }
        if (destination === 'backpack' && text?.trim()) {
          nextState = { ...nextState, recoveryNotes: [...nextState.recoveryNotes, {
            at, activity: meta.activity, text: text.trim(), destination: 'backpack',
          }] }
        }
        return grow(record(nextState, `Used ${meta.title} as a recovery transition`,
          'Participation recorded; no performance was measured.', first ? REWARDS.recovery : undefined))
      })
      toast('Recovery recorded · your place is held')
    }
    go(next)
  }
}

function Shell({ view, state, go, children }: {
  view: RecoveryView; state: GameState; go: (view: ViewId | null) => void; children: ReactNode
}) {
  const meta = META[view]
  const image = view === 'warmcup' ? 'warm-cup' : view === 'firefly' ? 'firefly-stories'
    : view === 'lanterns' ? 'night-lanterns' : view === 'ripples' ? 'gentle-ripples' : 'chime-drift'
  return <main className={`recovery-scene recovery-${view}${state.contrast ? ' recovery-hc' : ''}`}
    style={{ '--recovery-bg': `url(/game/recovery/backgrounds/${image}.png)` } as CSSProperties}>
    <div className="recovery-wash" aria-hidden="true" />
    <header className="recovery-header">
      <div><span>{meta.place}</span><h1>{meta.title}</h1></div>
      <div className="recovery-header-actions">
        <span>{meta.guardian} is nearby</span>
        <button type="button" onClick={() => go(null)} aria-label="Leave activity">Leave</button>
      </div>
    </header>
    {children}
  </main>
}

interface Drop { id: number; x: number; y: number }

function RippleAsset({ index, className = '', label, style }: {
  index: number; className?: string; label?: string; style?: CSSProperties
}) {
  const col = index % 4
  const row = Math.floor(index / 4)
  return <span className={`ripple-production ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true} style={{
      backgroundPosition: `${col * (100 / 3)}% ${row * 100}%`, ...style,
    }} />
}

const PRESSURES = [
  { label: 'Something I must do', detail: 'Give one obligation its own space.', asset: 0 },
  { label: 'Something I’m worried about', detail: 'It can be present without filling the whole pond.', asset: 1 },
  { label: 'Something that can wait', detail: 'Let the paper boat carry it beyond this moment.', asset: 2 },
  { label: 'I don’t want to name it', detail: 'No explanation is required.', asset: 0 },
] as const

function RipplesGame(props: PanelProps) {
  const { state, go } = props
  const [pressure, setPressure] = useState<number | null>(null)
  const [placed, setPlaced] = useState<Drop | null>(null)
  const [breathTick, setBreathTick] = useState(0)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const [breath, setBreath] = useState(true)
  const pond = useRef<HTMLDivElement>(null)
  const finish = useRecoveryFinish(props, 'ripples')
  useEffect(() => {
    if (!placed || !breath) return
    const timer = window.setInterval(() => setBreathTick((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [placed, breath])
  const place = (event: PointerEvent<HTMLElement>) => {
    if (pressure === null || placed) return
    const box = pond.current?.getBoundingClientRect(); if (!box) return
    setPlaced({ id: Date.now(), x: Math.min(75, Math.max(25, ((event.clientX - box.left) / box.width) * 100)),
      y: Math.min(62, Math.max(28, ((event.clientY - box.top) / box.height) * 100)) })
  }
  const breathingIn = breathTick % 10 < 4
  const rippleFrame = 4 + Math.min(3, breathingIn ? breathTick % 4 : Math.floor(((breathTick % 10) - 4) / 2))
  return <Shell view="ripples" state={state} go={go}>
    <section ref={pond} className="recovery-playfield ripple-water" role="button" tabIndex={0}
      aria-label="Pond. Choose a pressure, then place its token in the water."
      onPointerDown={place}
      onKeyDown={(event) => { if ((event.key === ' ' || event.key === 'Enter') && pressure !== null && !placed) {
        event.preventDefault(); setPlaced({ id: Date.now(), x: 50, y: 48 })
      } }}>
      <RippleAsset index={3} className="ripple-sol" label="Sol sitting peacefully beside the pond" />
      {pressure !== null && !placed && <RippleAsset index={PRESSURES[pressure].asset} className="ripple-token-floating" label={PRESSURES[pressure].label} />}
      {placed && <>
        <RippleAsset index={PRESSURES[pressure!].asset} className="ripple-token-placed" label={PRESSURES[pressure!].label}
          style={{ left: `${placed.x}%`, top: `${placed.y}%` }} />
        {breath && <RippleAsset index={rippleFrame} className={`ripple-breath-art ${breathingIn ? 'inhale' : 'exhale'}`} label={breathingIn ? 'Breathing in' : 'Breathing out'} />}
      </>}
      {pressure === null && <div className="ripple-purpose-card" onPointerDown={(event) => event.stopPropagation()}>
        <span className="recovery-kicker">Sol · make room around one thing</span>
        <h2>What is making the water feel crowded?</h2>
        <p>You can name the kind of pressure without explaining it.</p>
        <div>{PRESSURES.map((item, index) => <button key={item.label} type="button" onClick={() => setPressure(index)}>
          <RippleAsset index={item.asset} /><span><b>{item.label}</b><small>{item.detail}</small></span>
        </button>)}</div>
      </div>}
      {pressure !== null && !placed && <div className="recovery-instruction"><b>Give it a place in the water.</b>
        <span>Tap the pond or press Space. You are not dismissing it—only making room around it.</span></div>}
      {placed && <div className="recovery-instruction"><b>{breath ? (breathingIn ? 'Breathe in · the light gathers' : 'Breathe out · the ring makes space') : 'The pressure has its own place.'}</b>
        <span>{breathTick < 10 ? 'Follow one slow cycle, or stop whenever you need.' : 'It is still here, but it no longer fills the whole pond.'}</span></div>}
    </section>
    {pressure !== null && <nav className="recovery-controls">
      {placed && <button type="button" onClick={() => setBreath((value) => !value)}>{breath ? 'Pause breathing guide' : 'Resume breathing guide'}</button>}
      {placed && <button className="primary" type="button" onClick={() => setDone(true)}>Choose what happens next</button>}
      {pressure !== null && !placed && <button type="button" onClick={() => setPressure(null)}>Choose a different pressure</button>}
    </nav>}
    {done && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => setDone(false)} options={[
        { label: 'Let this wait', detail: 'Leave it in the pond and return to town.', view: null },
        { label: 'Make it smaller', detail: 'Take only one manageable piece back to Mira.', view: state.activeCheckpointId ? 'work' : 'townlist' },
        { label: 'Carry it back gently', detail: 'Resume the same checkpoint without losing your place.', view: state.activeCheckpointId ? 'session' : null },
        { label: 'Stay by the water', detail: 'Continue resting in the Calm Corner.', view: 'calm' },
      ]} />}
  </Shell>
}

function ChimeGame(props: PanelProps) {
  const { state, go } = props
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [wave, setWave] = useState(0)
  const [notes, setNotes] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const finish = useRecoveryFinish(props, 'chime')
  const complete = done || wave >= 4
  useEffect(() => {
    if (reduced || complete) return
    const timer = window.setInterval(() => setWave((value) => Math.min(4, value + 1)), 3200)
    return () => window.clearInterval(timer)
  }, [reduced, complete])
  const resonate = () => setNotes((items) => [...items.slice(-7), Date.now() + Math.random()])
  return <Shell view="chime" state={state} go={go}>
    <section className="recovery-playfield chime-room" role="button" tabIndex={0}
      aria-label="Chime room. Listen, or press Space to add a soft resonance."
      onPointerDown={resonate} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); resonate() } }}>
      {[0, 1, 2, 3].map((item) => <span key={item} className={`chime-wave wave-${item}${wave > item ? ' passed' : ''}`} />)}
      {notes.map((note, index) => <Sprite key={note} game="chime" index={index % 8} className={`chime-note note-${index % 5}`} />)}
      <Sprite game="chime" index={8 + (wave % 4)} className="chime-clock" />
      <div className="recovery-instruction"><b>{wave < 4 ? 'Let the next chime pass.' : 'The room has gone quiet.'}</b>
        <span>Tap to resonate, or do nothing and listen. Timing is never scored.</span></div>
    </section>
    <nav className="recovery-controls">
      {reduced && wave < 4 && <button type="button" onClick={() => setWave((value) => value + 1)}>Let the next chime pass</button>}
      <button className="primary" type="button" onClick={() => setDone(true)}>Enough for now</button>
    </nav>
    {complete && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => { setDone(false); if (wave >= 4) setWave(0) }} options={[
        { label: 'Choose one next action', detail: 'Return to Mira’s work plan.', view: 'work' },
        { label: 'Rebalance the week', detail: 'Open the Clock Tower calendar.', view: 'rebalance' },
        { label: 'Return to town', detail: 'Keep exploring at your own pace.', view: null },
      ]} />}
  </Shell>
}

const DRINKS = ['Barley tea', 'Warm milk', 'Lemon water']
const INGREDIENTS = ['Honey', 'Mint', 'Cinnamon', 'Nothing extra']

function WarmCupGame(props: PanelProps) {
  const { state, go } = props
  const [step, setStep] = useState<'choose' | 'pour' | 'ingredient' | 'stir' | 'rest'>('choose')
  const [drink, setDrink] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [pour, setPour] = useState(0)
  const [stirs, setStirs] = useState(0)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const pourTimer = useRef<number | null>(null)
  const finish = useRecoveryFinish(props, 'warmcup')
  const addPour = () => setPour((value) => { const next = Math.min(100, value + 20); if (next === 100) setStep('ingredient'); return next })
  const stopPour = () => { if (pourTimer.current) window.clearInterval(pourTimer.current); pourTimer.current = null }
  const cupFrame = step === 'choose' ? 0 : step === 'pour' ? Math.min(3, Math.floor(pour / 34) + 1) : 4
  return <Shell view="warmcup" state={state} go={go}>
    <section className="recovery-playfield cup-table">
      <Sprite game="warmcup" index={cupFrame} className="warm-cup-sprite" label={`${drink || 'Empty'} cup`} />
      {step === 'pour' && <Sprite game="warmcup" index={11 + Math.min(2, Math.floor(pour / 40))} className="warm-pour" />}
      {(step === 'stir' || step === 'rest') && <Sprite game="warmcup" index={14 + (stirs % 3)} className="warm-steam" />}
      <div className="cup-step-card">
        {step === 'choose' && <><b>Choose what feels comforting</b><div className="choice-row">{DRINKS.map((item) =>
          <button key={item} type="button" onClick={() => { setDrink(item); setStep('pour') }}>{item}</button>)}</div></>}
        {step === 'pour' && <><b>Pour slowly</b><p>Press and hold, or tap a few times.</p>
          <div className="pour-meter"><i style={{ width: `${pour}%` }} /></div>
          <button type="button" onPointerDown={() => { addPour(); stopPour(); pourTimer.current = window.setInterval(addPour, 360) }}
            onPointerUp={stopPour} onPointerLeave={stopPour} onPointerCancel={stopPour} onClick={addPour}>Pour</button></>}
        {step === 'ingredient' && <><b>Add something, or keep it simple</b><div className="choice-row">{INGREDIENTS.map((item, index) =>
          <button key={item} type="button" onClick={() => { setIngredient(item); setStep('stir') }}><Sprite game="warmcup" index={5 + index} />{item}</button>)}</div></>}
        {step === 'stir' && <><b>Give it a slow stir</b><p>{stirs < 3 ? 'Three easy circles. There is no perfect speed.' : `${drink}${ingredient === 'Nothing extra' ? '' : ` with ${ingredient.toLowerCase()}`} is ready.`}</p>
          {stirs < 3 ? <button type="button" onClick={() => setStirs((value) => value + 1)}>Stir gently</button>
            : <button type="button" onClick={() => setStep('rest')}>Take it to the window</button>}</>}
        {step === 'rest' && <><b>Sit with the warmth</b><p>You made something without needing to optimize it.</p>
          <button type="button" onClick={() => setDone(true)}>I’m ready</button></>}
      </div>
    </section>
    <nav className="recovery-controls"><span>No recipe can fail here.</span><button className="primary" type="button" onClick={() => setDone(true)}>Finish gently</button></nav>
    {done && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => setDone(false)} options={[
        { label: 'Resume a Pace Session', detail: 'Return to the same work checkpoint.', view: state.activeCheckpointId ? 'session' : 'work' },
        { label: 'Save it for later', detail: 'Leave a note in the Future Mailbox.', view: 'mailbox', destination: 'mailbox', text: `A warm-cup pause before ${state.nextAction || 'the next task'}.` },
        { label: 'Sit a little longer', detail: 'Continue resting in the Calm Corner.', view: 'calm' },
      ]} />}
  </Shell>
}

const STORIES = [
  ['On rest', 'Rest is how progress survives the week.'],
  ['On uncertainty', 'One visible step is enough to begin.'],
  ['On company', 'Working quietly near someone still counts as company.'],
  ['On persistence', 'Partial progress can still keep its next action.'],
  ['On kindness', 'Keep the same gentle rule you would give a friend.'],
] as const

function FireflyGame(props: PanelProps) {
  const { state, go } = props
  const [story, setStory] = useState<number | null>(null)
  const [glow, setGlow] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const finish = useRecoveryFinish(props, 'firefly')
  return <Shell view="firefly" state={state} go={go}>
    <section className="recovery-playfield firefly-library">
      {STORIES.map((item, index) => <button className={`firefly-light firefly-${index}`} key={item[0]} type="button"
        aria-label={`Follow a light: ${item[0]}`} onClick={() => setStory(index)}><Sprite game="firefly" index={index % 4} /></button>)}
      {glow !== null && <Sprite game="firefly" index={glow % 4} className="placed-glow" label="Placed glow" />}
      {story === null ? <div className="recovery-instruction"><b>Follow one light.</b><span>Five fragments wait here. You never need to read them all.</span></div>
        : <article className="story-page"><span>Short reading</span><h2>{STORIES[story][0]}</h2><p>{STORIES[story][1]}</p>
          <div><button type="button" onClick={() => { setGlow(story); setDone(true) }}>Leave this glow</button>
            <button type="button" onClick={() => setStory(null)}>Follow another</button></div></article>}
    </section>
    <nav className="recovery-controls"><span>Reading one, several, or none are all valid.</span><button className="primary" type="button" onClick={() => setDone(true)}>Leave quietly</button></nav>
    {done && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => setDone(false)} options={[
        { label: 'Resume checkpoint', detail: 'Return to the same notes and next action.', view: state.activeCheckpointId ? 'session' : 'work' },
        { label: 'Save the thought', detail: 'Put the chosen line in the Future Mailbox.', view: 'mailbox', destination: 'mailbox', text: story === null ? 'Make room for one gentle next step.' : STORIES[story][1] },
        { label: 'Continue resting', detail: 'Return to the Calm Corner.', view: 'calm' },
      ]} />}
  </Shell>
}

const SYMBOLS = [['○', 'Ongoing'], ['△', 'A climb'], ['～', 'Passing wave'], ['☆', 'A wish']] as const

function LanternGame(props: PanelProps) {
  const { state, go } = props
  const [design, setDesign] = useState(0)
  const [symbol, setSymbol] = useState(0)
  const [phrase, setPhrase] = useState('')
  const [lit, setLit] = useState(false)
  const [placed, setPlaced] = useState<{ x: number; y: number } | null>(null)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const finish = useRecoveryFinish(props, 'lanterns')
  const frame = design * 3 + (lit ? 2 : 0)
  return <Shell view="lanterns" state={state} go={go}>
    <section className="recovery-playfield lantern-courtyard" onPointerDown={(event) => {
      if (!lit || (event.target as HTMLElement).closest('button,input')) return
      const box = event.currentTarget.getBoundingClientRect()
      setPlaced({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 }); setDone(true)
    }}>
      <div className="lantern-workbench">
        <b>Shape a lantern for what you are carrying</b>
        <div className="lantern-designs">{[0, 1, 2, 3].map((item) => <button key={item} type="button" aria-pressed={design === item} onClick={() => setDesign(item)}><Sprite game="lanterns" index={item * 3} label={`Lantern design ${item + 1}`} /></button>)}</div>
        <div className="lantern-symbols">{SYMBOLS.map((item, index) => <button key={item[1]} type="button" aria-pressed={symbol === index} onClick={() => setSymbol(index)}><b>{item[0]}</b><span>{item[1]}</span></button>)}</div>
        <label>A private phrase <small>(optional; not stored unless you choose)</small><input maxLength={120} value={phrase} onChange={(event) => setPhrase(event.target.value)} placeholder="Only if words help" /></label>
        <button type="button" onClick={() => setLit(true)}>{lit ? 'Lantern glowing' : 'Light the lantern'}</button>
      </div>
      <div className={`lantern-preview${placed ? ' placed' : ''}`} style={placed ? { left: `${placed.x}%`, top: `${placed.y}%` } : undefined}>
        <Sprite game="lanterns" index={frame} label={`${SYMBOLS[symbol][1]} lantern`} /><b>{SYMBOLS[symbol][0]}</b>
      </div>
      {lit && !placed && <div className="recovery-instruction"><b>Place it in the courtyard.</b><span>Tap anywhere beyond the workbench.</span></div>}
    </section>
    <nav className="recovery-controls"><span>Your words stay private unless you deliberately keep them.</span><button className="primary" type="button" disabled={!lit} onClick={() => setDone(true)}>Set it down here</button></nav>
    {done && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => setDone(false)} options={[
        { label: 'Keep it in the Backpack', detail: phrase ? 'Keep the phrase as a private recovery note.' : 'Keep a symbol of this pause.', view: 'backpack', destination: 'backpack', text: phrase || `${SYMBOLS[symbol][1]} lantern` },
        { label: 'Send it to the Future Mailbox', detail: 'Choose to carry the words forward.', view: 'mailbox', destination: 'mailbox', text: phrase || `${SYMBOLS[symbol][1]} lantern` },
        { label: 'Leave it here', detail: 'Release it. No phrase is stored.', view: null },
      ]} />}
  </Shell>
}

export function RecoveryScene(props: PanelProps & { view: RecoveryView }) {
  if (props.view === 'ripples') return <RipplesGame {...props} />
  if (props.view === 'chime') return <ChimeGame {...props} />
  if (props.view === 'warmcup') return <WarmCupGame {...props} />
  if (props.view === 'firefly') return <FireflyGame {...props} />
  return <LanternGame {...props} />
}

export type { RecoveryView }
