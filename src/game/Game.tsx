/**
 * Campus Grove — the game shell.
 *
 * Owns navigation, persistence and the HUD. Every number it displays comes
 * from src/domain; nothing here calculates pressure.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PLAN_TEMPLATES, dailyLoad, levelOf, wakingMinutes, type GuardianId,
} from '../domain'
import { Campus, daylight } from './Campus'
import { Dialogue, type DialogueScript } from './Dialogue'
import { GUARDIANS, PLACES, doorstep, type Place, type ViewId } from './layout'
import { loadState, saveState, type GameState } from './state'
import { useWorld } from './useWorld'
import { Intake, Rebalance, Session, Understand, Work } from './panels/Loop'
import { Chime, Firefly, Lanterns, WarmCup } from './panels/Minis'
import { Collection, Keepsakes } from './panels/Keepsakes'
import { Pocket } from './panels/Pocket'
import { Ripples } from './panels/Ripples'
import {
  Backpack, Briefing, Calm, Council, Garden, Home, Journal, LoadPanel, Mailbox,
  Preview, Recover, TownList,
} from './panels/Places'
import type { PanelProps } from './panels/types'
import type { ReactElement } from 'react'
import './game.css'

const VIEW_TITLE: Record<ViewId, string> = {
  intake: 'Town Hall', understand: 'Understand', rebalance: 'Rebalance Workshop',
  work: 'Choose the work', session: 'Pace Session', recover: 'Recover',
  ripples: 'Gentle Ripples', pocket: 'Pocket of Green',
  firefly: 'Firefly Stories', chime: 'Chime Drift', warmcup: 'Warm Cup', lanterns: 'Night Lanterns',
  keepsakes: 'Pace Keepsakes', collection: 'Keepsake Collection',
  journal: 'Journal', council: 'Guardian Council', mailbox: 'Future Mailbox',
  calm: 'Calm Corner', home: 'Home', backpack: 'Backpack', garden: 'Recovery Garden',
  load: 'Daily Load', townlist: 'Town List', briefing: 'Daily Briefing', preview: 'Preview',
}

const PANELS: Record<ViewId, (p: PanelProps) => ReactElement> = {
  intake: Intake, understand: Understand, rebalance: Rebalance, work: Work, session: Session,
  recover: Recover, ripples: Ripples, pocket: Pocket, firefly: Firefly, chime: Chime,
  warmcup: WarmCup, lanterns: Lanterns, keepsakes: Keepsakes, collection: Collection,
  journal: Journal, council: Council, mailbox: Mailbox, calm: Calm,
  home: Home, backpack: Backpack, garden: Garden, load: LoadPanel, townlist: TownList,
  briefing: Briefing, preview: Preview,
}

/** Greetings fire once per place, then never again. */
const GREETINGS: Partial<Record<string, [GuardianId, string]>> = {
  library: ['mira', 'You have a brief you have not opened. Let us start with one observable thing, not the whole assignment.'],
  clock: ['kai', 'Two of your flexible tasks can move without touching a deadline. Want to see which?'],
  garden: ['sol', 'The water is not achieving anything, and that is rather the point. Sit for a minute?'],
  market: ['goh', 'Errands group better than they look from inside your head.'],
  cafe: ['sky', 'No agenda here. Work if you want, and I will not ask how it is going.'],
  park: ['sol', 'Ten minutes outside. Indoors counts the same — I am not checking up on you.'],
}

const LOOP_STEPS = [
  ['Intake', (s: GameState) => s.journal.some((e) => /parsed commitments/i.test(e.text))],
  ['Understand', (s: GameState) => s.tasks.length > 0],
  ['Make space', (s: GameState) => s.rebalanceSeen],
  ['Work plan', (s: GameState) => !!s.activeCheckpointId],
  ['Session', (s: GameState) => !!s.outcome],
  ['Recover', (s: GameState) => !!s.questOutcome],
  ['Journal', (s: GameState) => s.journal.length > 3],
] as const

export default function Game() {
  const [state, setState] = useState<GameState>(() => loadState())
  const [script, setScript] = useState<DialogueScript | null>(null)
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const [moved, setMoved] = useState(false)
  const [live, setLive] = useState('')

  const stage = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const avatar = useRef<HTMLDivElement>(null)

  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [],
  )

  useEffect(() => { saveState(state) }, [state])

  const update = useCallback((fn: (s: GameState) => GameState) => setState(fn), [])

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])

  const go = useCallback((view: ViewId | null) => {
    setState((s) => ({ ...s, view }))
    setLive(view ? `${VIEW_TITLE[view]} opened.` : 'Back on the campus.')
  }, [])

  const load = useMemo(
    () => dailyLoad(state.tasks, 'thu', wakingMinutes(state.capacity)),
    [state.tasks, state.capacity],
  )

  const panelOpen = state.view !== null
  const dialogueOpen = script !== null

  const { near, moveTo, press } = useWorld(
    { stage, world, avatar },
    {
      enabled: state.started && !panelOpen && !dialogueOpen,
      reducedMotion,
      initial: state.avatar,
      initialFacing: state.facing,
      onMoved: (pos, facing) => setState((s) => ({ ...s, avatar: pos, facing })),
    },
  )

  const enter = useCallback((place: Place) => {
    moveTo(doorstep(place))
    const greeting = GREETINGS[place.id]
    if (!greeting || state.greeted[place.id]) { go(place.view); return }
    setState((s) => ({ ...s, greeted: { ...s.greeted, [place.id]: true } }))
    setScript({
      who: greeting[0],
      lines: [greeting[1]],
      choices: [
        { label: 'Yes', onPick: () => go(place.view) },
        { label: 'Not now', onPick: () => {} },
      ],
    })
  }, [moveTo, go, state.greeted])

  /* First run: Kai explains the number the whole week turns on. Fired from the
     click rather than an effect — an effect that also sets `introSeen` would
     re-run and clear its own pending timer before it fired. */
  const start = useCallback(() => {
    const firstTime = !state.introSeen
    setState((s) => ({ ...s, started: true, introSeen: true }))
    if (!firstTime) return
    window.setTimeout(() => setScript({
      who: 'kai',
      lines: [
        'You made it. Take a breath before you look at any of it.',
        `Thursday is at ${load.percentage.toFixed(0)} percent. That is not a judgement — it is arithmetic. Four things are locked in and cannot move.`,
        'Two of the flexible ones can. I will show you exactly which, and nothing changes until you say so.',
      ],
      choices: [
        { label: 'Show me what can move', onPick: () => go('rebalance') },
        { label: 'Let me look around first', onPick: () => {} },
      ],
    }), 400)
  }, [state.introSeen, load.percentage, go])

  /* E enters what you are standing next to; Escape backs out of anything. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if ((k === 'e' || k === 'enter') && near && !panelOpen && !dialogueOpen) {
        e.preventDefault(); enter(near)
      }
      if (k === 'escape') {
        if (dialogueOpen) setScript(null)
        else if (panelOpen) go(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, panelOpen, dialogueOpen, enter, go])

  const stepsDone = LOOP_STEPS.filter(([, done]) => done(state)).length
  const level = levelOf(state.xp)
  const activeCheckpoint = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const leadView: ViewId = load.percentage > 95 ? 'rebalance' : state.outcome ? 'recover' : 'work'
  const leadPlace = PLACES.find((p) => p.view === leadView)?.id ?? null

  const panelProps: PanelProps = { state, load, update, go, toast }
  const Panel = state.view ? PANELS[state.view] : null

  if (!state.started) {
    return (
      <div className={`pt-game${state.contrast ? ' hc' : ''}`}>
        <div className="title">
          <div className="title-art" style={{ backgroundImage: 'url(/game/world/campus.png)' }} />
          <div className="title-veil" />
          <div className="title-inner">
            <div className="logo">
              <span className="mark" aria-hidden="true">P</span>
              <div style={{ textAlign: 'left' }}>
                <h1>PaceTown</h1>
                <p>Find your pace. Grow your place.</p>
              </div>
            </div>
            <p className="title-hook">
              Thursday is at <b style={{ color: 'var(--accent)' }}>{load.percentage.toFixed(0)}%</b>.
              Four commitments are already locked in. Kai thinks two things can move — and the
              assignment you have been avoiding still needs twenty honest minutes.
            </p>
            <div className="title-cast" aria-hidden="true">
              {(Object.keys(GUARDIANS) as GuardianId[]).map((id) => (
                <img key={id} src={`/game/portraits/${id}.png`} alt="" />
              ))}
            </div>
            <div className="title-actions">
              <button className="primary big" type="button" onClick={start}>
                {state.journal.length ? 'Continue your week' : 'Enter Campus Grove'}
              </button>
              <Link className="secondary" to="/">Mentor demo</Link>
            </div>
            <p className="title-note">A cozy campus for the week you actually have</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`pt-game${state.contrast ? ' hc' : ''}`}>
      <Campus refs={{ stage, world, avatar }} load={load} tasks={state.tasks} day="thu"
        near={near} leadPlace={leadPlace} quiet={state.quiet} stepsDone={stepsDone}
        onEnter={enter} />
      <div className="vignette" aria-hidden="true" />

      <div className="hud hud-top">
        <span className="mark" aria-hidden="true">P</span>
        <div>
          <div className="hud-name">PaceTown</div>
          <div className="hud-day">Thursday</div>
        </div>
        <button className="pill" type="button" onClick={() => go('load')}>
          <span className="swatch" style={{ background: `var(--${load.band.key})` }} />
          <span><span className="lbl">Daily Load</span><b>{load.percentage.toFixed(1)}%</b></span>
        </button>
        <span className="grow" />
        <div className="coinbar">
          <span>Lv <b>{level.level}</b></span>
          <span>XP <b>{state.xp}</b></span>
          <span>Coins <b>{state.coins}</b></span>
        </div>
        <button className="iconbtn" type="button" aria-pressed={state.quiet} title="Quiet Mode"
          onClick={() => update((s) => ({ ...s, quiet: !s.quiet }))}>☾</button>
        <button className="iconbtn" type="button" aria-pressed={state.contrast} title="High contrast"
          onClick={() => update((s) => ({ ...s, contrast: !s.contrast }))}>◐</button>
      </div>

      <div className="hud hud-quest">
        {activeCheckpoint && !state.outcome ? (
          <>
            <div className="eyebrow">Where you left off</div>
            <h3>{activeCheckpoint.title}</h3>
            <p>Your checkpoint is held exactly as you left it.</p>
            <div className="qa">
              <button className="go" type="button" onClick={() => go('session')}>Resume session</button>
              <button type="button" onClick={() => go('recover')}>Recover instead</button>
            </div>
          </>
        ) : (
          <>
            <div className="eyebrow">
              {load.percentage > 95 ? 'Over capacity · one action foregrounded' : 'Recommended'}
            </div>
            <h3>{VIEW_TITLE[leadView]}</h3>
            <p>
              {load.percentage > 95
                ? 'Kai only proposes moves that respect every deadline.'
                : 'One checkpoint. Partial progress counts.'}
            </p>
            <div className="qa">
              <button className="go" type="button" onClick={() => go(leadView)}>Go there</button>
              <button type="button" onClick={() => go('council')}>Ask the Council</button>
            </div>
          </>
        )}
      </div>

      <div className="hud hud-tools">
        <button className="tool" type="button" onClick={() => go('townlist')}>☰ Town List</button>
      </div>

      <div className={`prompt${near && !panelOpen && !dialogueOpen ? ' on' : ''}`}>
        <kbd>E</kbd>
        <span>{near ? (near.who ? `Talk to ${GUARDIANS[near.who].name}` : `Enter ${near.name}`) : ''}</span>
      </div>

      <div className={`hint-move${moved ? ' gone' : ''}`}>
        W A S D or arrow keys to walk · E to enter
      </div>

      <div className="dpad" aria-label="Movement">
        {(['up', 'left', 'down', 'right'] as const).map((dir) => (
          <button key={dir} className={dir === 'up' ? 'up' : undefined} type="button"
            aria-label={`Move ${dir}`}
            onPointerDown={() => { press(dir, true); setMoved(true) }}
            onPointerUp={() => press(dir, false)}
            onPointerLeave={() => press(dir, false)}>
            {{ up: '↑', left: '←', down: '↓', right: '→' }[dir]}
          </button>
        ))}
      </div>

      {panelOpen && Panel && (
        <>
          <div className="scrim" onClick={() => go(null)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label={VIEW_TITLE[state.view!]}>
            <div className="sheet-head">
              <h2>{VIEW_TITLE[state.view!]}</h2>
              <button className="iconbtn" type="button" aria-label="Back to campus"
                onClick={() => go(null)}>✕</button>
            </div>
            <div className="sheet-body"><Panel {...panelProps} /></div>
          </div>
        </>
      )}

      {script && (
        <Dialogue script={script} reducedMotion={reducedMotion} onClose={() => setScript(null)} />
      )}

      <div className="toasts">
        {toasts.map((t) => <div className="toast" key={t.id}>{t.text}</div>)}
      </div>

      <div className="sr" aria-live="polite">{live}</div>
      <div className="sr">{daylight(stepsDone)}</div>
    </div>
  )
}
