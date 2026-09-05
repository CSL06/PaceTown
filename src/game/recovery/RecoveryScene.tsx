import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
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

function RippleV5Asset({ kind, index, className = '', label, style }: {
  kind: 'leaf' | 'wave' | 'lotus' | 'shimmer'; index: number; className?: string; label?: string; style?: CSSProperties
}) {
  const col = index % 4
  const row = Math.floor(index / 4)
  return <span className={`ripple-v5-asset ripple-v5-${kind} ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true} style={{
      backgroundImage: `url(/game/recovery/atlases/gentle-ripples-${kind === 'leaf' ? 'leaves' : kind}-v5.png)`,
      backgroundPosition: `${col * (100 / 3)}% ${row * 100}%`,
      ...style,
    }} />
}

const RIPPLE_LEAVES = [
  [0, 13, 18, -56, -42, 0], [1, 27, 14, -39, -54, 1], [2, 43, 20, -12, -58, 2],
  [3, 61, 16, 22, -55, 0], [4, 78, 21, 48, -45, 1], [5, 88, 34, 58, -24, 2],
  [6, 17, 39, -61, -15, 2], [7, 32, 36, -45, -23, 0], [1, 69, 38, 47, -17, 1],
  [3, 84, 51, 61, 3, 0], [5, 19, 59, -58, 17, 1], [0, 36, 63, -43, 28, 2],
  [6, 64, 61, 39, 27, 0], [2, 79, 69, 55, 35, 2], [4, 24, 78, -51, 49, 0],
  [7, 46, 76, -9, 57, 1], [1, 61, 82, 28, 54, 2], [3, 89, 77, 62, 46, 1],
] as const

function RipplesGame(props: PanelProps) {
  const { state, go } = props
  const [started, setStarted] = useState(false)
  const [holding, setHolding] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [waves, setWaves] = useState(0)
  const [waveFrame, setWaveFrame] = useState(0)
  const [shimmerFrame, setShimmerFrame] = useState(0)
  const [cleared, setCleared] = useState(false)
  const [bloomFrame, setBloomFrame] = useState<number | null>(null)
  const [complete, setComplete] = useState(false)
  const holdingRef = useRef(false)
  const releaseTimer = useRef<number | null>(null)
  const waveTimer = useRef<number | null>(null)
  const bloomDelay = useRef<number | null>(null)
  const bloomTimer = useRef<number | null>(null)
  const completionDelay = useRef<number | null>(null)
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const finish = useRecoveryFinish(props, 'ripples')

  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => setShimmerFrame((frame) => (frame + 1) % 8), 520)
    return () => window.clearInterval(timer)
  }, [reduced])
  useEffect(() => () => {
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current)
    if (waveTimer.current !== null) window.clearInterval(waveTimer.current)
    if (bloomDelay.current !== null) window.clearTimeout(bloomDelay.current)
    if (bloomTimer.current !== null) window.clearInterval(bloomTimer.current)
    if (completionDelay.current !== null) window.clearTimeout(completionDelay.current)
  }, [])

  const beginBloom = () => {
    setCleared(true)
    if (reduced) {
      bloomDelay.current = window.setTimeout(() => { setBloomFrame(7); setComplete(true) }, 1100)
      return
    }
    bloomDelay.current = window.setTimeout(() => {
      setBloomFrame(0)
      bloomTimer.current = window.setInterval(() => setBloomFrame((current) => {
        const next = Math.min(7, (current ?? 0) + 1)
        if (next === 7 && bloomTimer.current !== null) {
          window.clearInterval(bloomTimer.current); bloomTimer.current = null
          completionDelay.current = window.setTimeout(() => setComplete(true), 900)
        }
        return next
      }), 300)
    }, 1800)
  }

  const gather = () => {
    if (!started || complete || cleared || releasing || holdingRef.current) return
    holdingRef.current = true
    setHolding(true)
  }
  const release = () => {
    if (!holdingRef.current || releasing) return
    holdingRef.current = false
    setHolding(false)
    setReleasing(true)
    setWaveFrame(0)
    if (!reduced) waveTimer.current = window.setInterval(() => setWaveFrame((frame) => Math.min(7, frame + 1)), 230)
    releaseTimer.current = window.setTimeout(() => {
      if (waveTimer.current !== null) { window.clearInterval(waveTimer.current); waveTimer.current = null }
      setWaves((current) => {
        const next = Math.min(3, current + 1)
        if (next === 3) beginBloom()
        return next
      })
      setReleasing(false)
    }, 1900)
  }
  const repeat = () => {
    holdingRef.current = false
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current)
    if (bloomDelay.current !== null) window.clearTimeout(bloomDelay.current)
    if (bloomTimer.current !== null) window.clearInterval(bloomTimer.current)
    if (completionDelay.current !== null) window.clearTimeout(completionDelay.current)
    setHolding(false); setReleasing(false); setWaves(0); setWaveFrame(0); setCleared(false)
    setBloomFrame(null); setComplete(false); setStarted(true)
  }

  return <Shell view="ripples" state={state} go={go}>
    <section className="recovery-playfield ripple-water">
      <span className="ripple-water-scene" role="img" aria-label="Sunlit water covered with drifting leaves" />
      <RippleV5Asset kind="shimmer" index={shimmerFrame} className="ripple-shimmer" />
      <div className="ripple-leaf-field" aria-hidden="true">{RIPPLE_LEAVES.map(([asset, x, y, dx, dy, group], index) =>
        <RippleV5Asset key={index} kind="leaf" index={asset} className={`ripple-leaf leaf-${index}${group < waves || cleared ? ' cleared' : ''}${releasing && group === waves ? ' scattering' : ''}`}
          style={{ '--leaf-x': `${x}%`, '--leaf-y': `${y}%`, '--leaf-dx': `${dx}vw`, '--leaf-dy': `${dy}vh` } as CSSProperties} />
      )}</div>
      {!started && <div className="ripple-dialogue ripple-dialogue-intro">
        <RippleAsset index={3} className="ripple-sol-portrait" label="Sol" />
        <div><span className="recovery-kicker">Sol</span><p>The pond is carrying too much on its surface. Hold anywhere to gather a current, then let it go.</p>
          <button className="primary" type="button" onClick={() => setStarted(true)}>E · Step closer</button></div>
      </div>}
      {started && !complete && !cleared && <>
        <button className="ripple-water-hit" type="button"
          aria-label={holding ? 'Release to send the wave' : releasing ? 'Wave moving across the water' : 'Hold anywhere on the water to gather a current'}
          disabled={releasing} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); gather() }} onPointerUp={release} onPointerCancel={release}
          onKeyDown={(event) => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); gather() } }}
          onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); release() } }}>
          <span className="sr-only">Interact with the water</span></button>
        {releasing && <RippleV5Asset kind="wave" index={reduced ? 6 : waveFrame} className="ripple-wave-animation" label="A wave moving across the water" />}
        <div className="ripple-dialogue"><RippleAsset index={3} className="ripple-sol-portrait" label="Sol" /><div><span className="recovery-kicker">Sol</span><p>{holding ? 'Hold gently. Let the current gather.' : releasing ? 'Now let it travel. Watch what moves.' : waves ? 'The water has more room. When you are ready, make another.' : 'Hold anywhere on the water. Release when your inhale feels full.'}</p><small>{waves} / 3 waves</small></div></div>
      </>}
      {cleared && bloomFrame === null && <div className="ripple-clear-pause" role="status">The water is clear.</div>}
      {bloomFrame !== null && <RippleV5Asset kind="lotus" index={bloomFrame} className="ripple-lotus-bloom" label={complete ? 'A lotus in full bloom' : 'A lotus opening on the clear water'} />}
      {complete && <div className="ripple-dialogue ripple-dialogue-result"><RippleAsset index={3} className="ripple-sol-portrait" label="Sol" /><div><span className="recovery-kicker">Sol</span><p>A little more room.</p><div className="ripple-result-actions"><button type="button" onClick={repeat}>Again</button><button type="button" onClick={() => finish('calm', 'not_sure')}>Stay</button><button className="primary" type="button" onClick={() => finish(null, 'not_sure')}>Leave</button></div></div></div>}
    </section>
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
  { thought: 'I’m too far behind', title: 'The reachable book',
    story: 'The stack is real, but it is not a verdict about you. One reachable book can still change what happens next.',
    line: 'Choose the one piece that changes what comes next.' },
  { thought: 'I don’t know where to begin', title: 'The first lit stone',
    story: 'A path does not have to reveal itself all at once. The first visible footing is enough for a beginning.',
    line: 'Light only the first step; the route can wait.' },
  { thought: 'Everyone else is doing better', title: 'The unseen backpacks',
    story: 'You can see another person’s pace, but not everything they carry. Different loads create different journeys.',
    line: 'My pace belongs to the load I am actually carrying.' },
  { thought: 'I have to solve everything tonight', title: 'A lamp for tomorrow',
    story: 'Tomorrow can hold a named piece. Closing the rest of the desk is planning, not failure.',
    line: 'Tomorrow can hold one clearly named piece.' },
  { thought: 'I should be able to handle this', title: 'The same warm rule',
    story: 'If a friend were this tired, you would offer warmth before a verdict. You belong inside that rule too.',
    line: 'Offer myself warmth before a verdict.' },
  { thought: 'I would rather not say', title: 'A story without words',
    story: 'A thought does not have to be explained before it deserves a gentler room around it.',
    line: 'I can make space without explaining everything.' },
] as const

function FireflyAsset({ index, className = '', label }: { index: number; className?: string; label?: string }) {
  const col = index % 4
  const row = Math.floor(index / 4)
  return <span className={`firefly-production ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true}
    style={{ backgroundPosition: `${col * (100 / 3)}% ${row * 100}%` }} />
}

function FireflyGame(props: PanelProps) {
  const { state, go } = props
  const [story, setStory] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const finish = useRecoveryFinish(props, 'firefly')
  return <Shell view="firefly" state={state} go={go}>
    <section className="recovery-playfield firefly-library">
      <FireflyAsset index={7} className="firefly-mira" label="Mira reading nearby" />
      {story === null ? <div className="firefly-thoughts"><span className="recovery-kicker">Mira · follow the thought that is following you</span>
        <h2>Which thought is taking up the most room?</h2><p>You can choose without explaining.</p>
        <div>{STORIES.map((item, index) => <button key={item.thought} type="button" onClick={() => setStory(index)}>
          <FireflyAsset index={6} /><span>{item.thought}</span></button>)}</div></div>
        : <article className="story-page"><FireflyAsset index={story} className="story-vignette" label={STORIES[story].title} />
          <div className="story-copy"><span>One small story</span><h2>{STORIES[story].title}</h2><p>{STORIES[story].story}</p>
            <blockquote>{STORIES[story].line}</blockquote><div><button type="button" onClick={() => setDone(true)}>Carry this line</button>
              <button type="button" onClick={() => setStory(null)}>Follow another light</button></div></div></article>}
    </section>
    <nav className="recovery-controls"><span>Choosing none is valid too.</span><button className="primary" type="button" onClick={() => setDone(true)}>Leave quietly</button></nav>
    {done && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => setDone(false)} options={[
        { label: 'Take the line into my checkpoint', detail: 'Keep it in the Backpack and return to one small step.', view: state.activeCheckpointId ? 'session' : 'work', destination: 'backpack', text: story === null ? 'Make room for one gentle next step.' : STORIES[story].line },
        { label: 'Ask Mira for help', detail: 'Return to the work plan and make the blockage visible.', view: 'work' },
        { label: 'Move something to another day', detail: 'Open the Clock Tower calendar.', view: 'rebalance' },
        { label: 'Save the line and rest', detail: 'Send it forward, then continue resting.', view: 'calm', destination: 'mailbox', text: story === null ? 'Make room for one gentle next step.' : STORIES[story].line },
      ]} />}
  </Shell>
}

const SYMBOLS = [['○', 'Ongoing'], ['△', 'A climb'], ['～', 'Passing wave'], ['☆', 'A wish']] as const

const LANTERN_CONCERNS = [
  ['unfinished', 'Something unfinished', 'Acknowledge it without pretending it is solved.'],
  ['control', 'Something outside my control', 'Give it a boundary for tonight.'],
  ['remember', 'Something I need to remember', 'Keep it safely without rehearsing it.'],
  ['release', 'Something I’m ready to release', 'Let the lantern carry it away.'],
  ['wordless', 'Something without words', 'A symbol is enough.'],
] as const

type LanternPlace = 'path' | 'gate' | 'community' | 'water' | 'backpack'

const LANTERN_PLACES: { id: LanternPlace; label: string; detail: string }[] = [
  { id: 'path', label: 'Near the path', detail: 'Return to it soon' },
  { id: 'gate', label: 'At tomorrow’s gate', detail: 'Leave it for tomorrow' },
  { id: 'community', label: 'Beside other lanterns', detail: 'Ask for support' },
  { id: 'water', label: 'On the water', detail: 'Release it' },
  { id: 'backpack', label: 'By my Backpack', detail: 'Keep it intentionally' },
]

function LanternAsset({ index, className = '', label }: { index: number; className?: string; label?: string }) {
  const column = index % 4
  const row = Math.floor(index / 4)
  return <span className={`lantern-production ${className}`} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true} style={{
      backgroundPosition: `${column * (100 / 3)}% ${row * 100}%`,
    }} />
}

function LanternGame(props: PanelProps) {
  const { state, go } = props
  const [concern, setConcern] = useState<number | null>(null)
  const [design, setDesign] = useState(0)
  const [symbol, setSymbol] = useState(0)
  const [phrase, setPhrase] = useState('')
  const [lit, setLit] = useState(false)
  const [placed, setPlaced] = useState<LanternPlace | null>(null)
  const [done, setDone] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const finish = useRecoveryFinish(props, 'lanterns')
  const savedText = phrase || (concern === null ? `${SYMBOLS[symbol][1]} lantern` : LANTERN_CONCERNS[concern][1])
  const chosenPlace = LANTERN_PLACES.find((place) => place.id === placed)
  const placementOption = placed === 'path'
    ? { label: 'Return to it soon', detail: 'Carry the acknowledgment into one small next step.', view: state.activeCheckpointId ? 'session' as const : 'work' as const }
    : placed === 'gate'
      ? { label: 'Leave it for tomorrow', detail: 'Save the words for later and keep resting now.', view: 'calm' as const, destination: 'mailbox' as const, text: savedText }
      : placed === 'community'
        ? { label: 'Ask for support', detail: 'Bring the concern to Mira and make the blockage visible.', view: 'work' as const }
        : placed === 'backpack'
          ? { label: 'Keep it intentionally', detail: 'Keep the phrase as a private recovery note.', view: 'backpack' as const, destination: 'backpack' as const, text: savedText }
          : { label: 'Release it here', detail: 'Leave the concern on the water. No phrase is stored.', view: null }

  return <Shell view="lanterns" state={state} go={go}>
    <section className="recovery-playfield lantern-courtyard">
      <LanternAsset index={7} className="lantern-goh" label="Goh kneeling beside a lantern" />
      {concern === null ? <div className="lantern-concern-card">
        <span className="recovery-kicker">Goh asks one thing</span>
        <h2>What should this light hold?</h2>
        <p>You do not need to explain it. This decides what setting the lantern down will mean.</p>
        <div>{LANTERN_CONCERNS.map((item, index) => <button key={item[0]} type="button" onClick={() => setConcern(index)}>
          <b>{item[1]}</b><small>{item[2]}</small>
        </button>)}</div>
      </div> : <>
        <div className="lantern-workbench">
          <span className="recovery-kicker">{LANTERN_CONCERNS[concern][1]}</span>
          <b>Give the concern a gentle container</b>
          <div className="lantern-designs">{[0, 1, 2, 3].map((item) => <button key={item} type="button" aria-label={`Lantern design ${item + 1}`} aria-pressed={design === item} onClick={() => { setDesign(item); setLit(false); setPlaced(null) }}><LanternAsset index={item} /></button>)}</div>
          <div className="lantern-symbols">{SYMBOLS.map((item, index) => <button key={item[1]} type="button" aria-pressed={symbol === index} onClick={() => setSymbol(index)}><b>{item[0]}</b><span>{item[1]}</span></button>)}</div>
          <label>A private phrase <small>(optional; only stored by an explicit keep choice)</small><input maxLength={120} value={phrase} onChange={(event) => setPhrase(event.target.value)} placeholder="Only if words help" /></label>
          <button type="button" onClick={() => { setLit(true); setPlaced(null) }}>{lit ? 'Lantern glowing' : 'Light the lantern'}</button>
        </div>
        <div className={`lantern-preview${lit ? ' lit' : ''}${placed ? ` placed placement-${placed}` : ''}`}>
          <LanternAsset index={!lit ? design : placed === 'water' ? 6 : placed ? 5 : 4} label={`${SYMBOLS[symbol][1]} lantern`} /><b>{SYMBOLS[symbol][0]}</b>
        </div>
        {lit && <div className="lantern-places" aria-label="Choose where the lantern belongs">
          {LANTERN_PLACES.map((place) => <button key={place.id} type="button" className={`lantern-place-${place.id}`} aria-pressed={placed === place.id} onClick={() => setPlaced(place.id)}>
            <b>{place.label}</b><small>{place.detail}</small>
          </button>)}
        </div>}
        {lit && !placed && <div className="recovery-instruction"><b>Where should this concern live after tonight?</b><span>The place is the decision—not a score.</span></div>}
      </>}
    </section>
    <nav className="recovery-controls"><span>{chosenPlace ? `${chosenPlace.label}: ${chosenPlace.detail}.` : 'Lighting acknowledges the concern; it does not claim to solve it.'}</span><button className="primary" type="button" disabled={!placed} onClick={() => setDone(true)}>Set it down with meaning</button></nav>
    {done && <Completion response={response} setResponse={setResponse} finish={finish}
      onBack={() => setDone(false)} options={[
        placementOption,
        { label: 'Stay in the quiet courtyard', detail: 'Keep resting without storing any words.', view: 'calm' },
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
