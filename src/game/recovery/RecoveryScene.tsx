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

type ChimeMode = 'breathe' | 'tap' | 'listen'

function ChimeAsset({ index, className = '', label }: { index: number; className?: string; label?: string }) {
  const col = index % 4
  const row = Math.floor(index / 4)
  return <span className={`chime-production ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true}
    style={{ backgroundPosition: `${col * (100 / 3)}% ${row * 100}%` }} />
}

function playChimeTone(harmony = false) {
  if (typeof AudioContext === 'undefined') return
  const context = new AudioContext()
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.075, context.currentTime + .03)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.7)
  gain.connect(context.destination)
  ;[harmony ? 392 : 329.63, harmony ? 493.88 : 415.3].forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    oscillator.type = 'sine'; oscillator.frequency.value = frequency
    const partial = context.createGain(); partial.gain.value = index ? .34 : 1
    oscillator.connect(partial); partial.connect(gain); oscillator.start(); oscillator.stop(context.currentTime + 1.8)
  })
  window.setTimeout(() => void context.close(), 2000)
}

function ChimeGame(props: PanelProps) {
  const { state, go } = props
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [mode, setMode] = useState<ChimeMode | null>(null)
  const [tick, setTick] = useState(0)
  const [resonances, setResonances] = useState<number[]>([])
  const [sound, setSound] = useState(false)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const finish = useRecoveryFinish(props, 'chime')
  const complete = done || tick >= 40
  useEffect(() => {
    if (!mode || complete) return
    const timer = window.setInterval(() => setTick((value) => value + 1), reduced ? 1500 : 1000)
    return () => window.clearInterval(timer)
  }, [mode, complete, reduced])
  useEffect(() => {
    if (sound && !state.quiet && tick > 0 && tick % 10 === 0) playChimeTone()
  }, [tick, sound, state.quiet])
  const phraseTick = tick % 10
  const breathingIn = phraseTick < 4
  const phrase = Math.min(4, Math.floor(tick / 10) + 1)
  const resonate = () => {
    if (mode !== 'tap') return
    setResonances((items) => [...items.slice(-4), Date.now() + Math.random()])
    if (sound && !state.quiet) playChimeTone(true)
  }
  return <Shell view="chime" state={state} go={go}>
    <section className="recovery-playfield chime-room" role={mode === 'tap' ? 'button' : undefined}
      tabIndex={mode === 'tap' ? 0 : undefined} aria-label={mode === 'tap' ? 'Chime room. Tap anywhere to add a gentle harmony; timing is not scored.' : undefined}
      onPointerDown={resonate} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); resonate() } }}>
      <ChimeAsset index={tick % 4} className="chime-main" label="Clock-tower chime swinging slowly" />
      <ChimeAsset index={4 + Math.min(2, Math.floor(phraseTick / 3))} className={`chime-pulse ${breathingIn ? 'gathering' : 'releasing'}`} />
      <ChimeAsset index={7} className="chime-kai" label="Kai sitting and listening" />
      {resonances.map((item, index) => <ChimeAsset key={item} index={4 + index % 3} className={`chime-harmony harmony-${index}`} />)}
      {!mode ? <div className="chime-purpose-card">
        <span className="recovery-kicker">Kai · borrow a slower rhythm</span><h2>How would you like to meet the chime?</h2>
        <p>The phrase moves at the same pace whichever you choose.</p><div>
          <button type="button" onClick={() => setMode('breathe')}><b>Breathe with it</b><small>Four in, six out. The light shows the whole cycle.</small></button>
          <button type="button" onClick={() => setMode('tap')}><b>Tap along gently</b><small>Every tap adds harmony. Nothing is early or late.</small></button>
          <button type="button" onClick={() => setMode('listen')}><b>Just listen</b><small>No input required. Let four phrases pass.</small></button>
        </div></div>
        : <div className="recovery-instruction"><b>{mode === 'breathe'
          ? breathingIn ? 'Breathe in · the chime gathers' : 'Breathe out · let the sound travel'
          : mode === 'tap' ? 'Tap anywhere if joining the rhythm feels good' : 'Nothing to do · let this phrase pass'}</b>
          <span>Phrase {phrase} of 4 · {mode === 'tap' ? 'your timing is never measured' : 'you can stop at any time'}</span></div>}
    </section>
    {mode && <nav className="recovery-controls">
      {!state.quiet && <button type="button" aria-pressed={sound} onClick={() => { setSound((value) => !value); if (!sound) playChimeTone() }}>{sound ? 'Sound on' : 'Turn sound on'}</button>}
      {state.quiet && <span>Quiet Mode · visual rhythm only</span>}
      <button className="primary" type="button" onClick={() => setDone(true)}>Enough for now</button>
    </nav>}
    {complete && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => { setDone(false); if (tick >= 40) setTick(0) }} options={[
        { label: 'Choose one next action', detail: 'Return to Mira with a slower starting point.', view: 'work' },
        { label: 'Rebalance the week', detail: 'Use the Clock Tower calendar to make space.', view: 'rebalance' },
        { label: 'Return to town', detail: 'Keep exploring at your own pace.', view: null },
      ]} />}
  </Shell>
}

const DRINKS = ['Barley tea', 'Warm milk', 'Lemon water']
const INGREDIENTS = ['Honey', 'Mint', 'Cinnamon', 'Nothing extra']

const CUP_NEEDS = [
  { label: 'Warmth', line: 'You do not need to earn comfort.' },
  { label: 'Energy without rushing', line: 'A steadier start can carry more than a hurried one.' },
  { label: 'Quiet', line: 'Nothing needs an answer during this minute.' },
  { label: 'Company', line: 'Sky can stay while you return to one small thing.' },
  { label: 'I’m not sure', line: 'Not knowing what you need is still useful information.' },
] as const

function WarmAsset({ index, className = '', label }: { index: number; className?: string; label?: string }) {
  const col = index % 4
  const row = Math.floor(index / 4)
  return <span className={`warm-production ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true}
    style={{ backgroundPosition: `${col * (100 / 3)}% ${row * 100}%` }} />
}

function WarmCupGame(props: PanelProps) {
  const { state, go } = props
  const [step, setStep] = useState<'need' | 'choose' | 'pour' | 'ingredient' | 'stir' | 'rest'>('need')
  const [need, setNeed] = useState<number | null>(null)
  const [drink, setDrink] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [pour, setPour] = useState(0)
  const [stirs, setStirs] = useState(0)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const pourTimer = useRef<number | null>(null)
  const finish = useRecoveryFinish(props, 'warmcup')
  const addPour = () => setPour((value) => Math.min(100, value + 20))
  const stopPour = () => { if (pourTimer.current) window.clearInterval(pourTimer.current); pourTimer.current = null }
  useEffect(() => stopPour, [])
  const cupFrame = step === 'need' || step === 'choose' || pour === 0 ? 0 : pour < 100 ? 1 : 2
  return <Shell view="warmcup" state={state} go={go}>
    <section className="recovery-playfield cup-table">
      <WarmAsset index={cupFrame} className="warm-cup-sprite" label={`${drink || 'Empty'} cup`} />
      {step === 'pour' && pour < 100 && <WarmAsset index={3} className="warm-pour" label="Teapot pouring slowly" />}
      {step === 'rest' && <WarmAsset index={7} className="warm-sky" label="Sky sitting with a warm cup" />}
      <div className="cup-step-card">
        {step === 'need' && <><span className="recovery-kicker">Sky · notice before doing</span><b>What would help most right now?</b>
          <p>The cup is a way to give that need a little space.</p><div className="choice-row cup-needs">{CUP_NEEDS.map((item, index) =>
            <button key={item.label} type="button" onClick={() => { setNeed(index); setStep('choose') }}>{item.label}</button>)}</div></>}
        {step === 'choose' && <><b>Choose what feels comforting</b><div className="choice-row">{DRINKS.map((item) =>
          <button key={item} type="button" onClick={() => { setDrink(item); setStep('pour') }}>{item}</button>)}</div></>}
        {step === 'pour' && <><b>Pour slowly</b><p>Hold the button, or use Space/Enter in steady steps.</p>
          <div className="pour-meter"><i style={{ width: `${pour}%` }} /></div>
          {pour < 100 ? <button key="pouring" type="button"
            onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); stopPour(); addPour(); pourTimer.current = window.setInterval(addPour, 180) }}
            onPointerUp={stopPour} onLostPointerCapture={stopPour} onPointerCancel={stopPour}
            onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); addPour() } }}>Hold to pour</button>
            : <button key="complete" type="button" onClick={() => setStep('ingredient')}>Pour complete · choose an ingredient</button>}</>}
        {step === 'ingredient' && <><b>Add something, or keep it simple</b><div className="choice-row">{INGREDIENTS.map((item, index) =>
          <button key={item} type="button" onClick={() => { setIngredient(item); setStep('stir') }}>
            {index < 3 && <WarmAsset index={4 + index} />}{item}</button>)}</div></>}
        {step === 'stir' && <><b>Give it a slow stir</b><p>{stirs < 3 ? 'Three easy circles. There is no perfect speed.' : `${drink}${ingredient === 'Nothing extra' ? '' : ` with ${ingredient.toLowerCase()}`} is ready.`}</p>
          {stirs < 3 ? <button type="button" onClick={() => setStirs((value) => value + 1)}>Stir gently</button>
            : <button type="button" onClick={() => setStep('rest')}>Take it to the window</button>}</>}
        {step === 'rest' && <><span className="recovery-kicker">{need === null ? 'A quiet minute' : CUP_NEEDS[need].label}</span><b>Sit with the warmth</b>
          <p>{need === null ? 'You made something without needing to optimize it.' : CUP_NEEDS[need].line}</p>
          <button type="button" onClick={() => setDone(true)}>I’m ready</button></>}
      </div>
    </section>
    <nav className="recovery-controls"><span>No recipe can fail here.</span>{step === 'rest' && <button className="primary" type="button" onClick={() => setDone(true)}>Finish gently</button>}</nav>
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
