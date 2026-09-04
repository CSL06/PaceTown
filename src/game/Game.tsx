/**
 * Campus Grove — the game shell.
 *
 * Owns navigation, persistence and the HUD. Every number it displays comes
 * from src/domain; nothing here calculates pressure.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  DEMO_DESTINATION, dailyLoad, foregroundQuest, levelOf, proposeRebalance,
  selectQuests, wakingMinutes, type GuardianId,
} from '../domain'
import { Campus, daylight } from './Campus'
import { ClockTower } from './ClockTower'
import { Dialogue, type DialogueScript } from './Dialogue'
import { GuardianDock } from './GuardianDock'
import { GUARDIANS, PLACES, doorstep, type Place, type ViewId } from './layout'
import { loadState, saveState, type GameState } from './state'
import { useWorld } from './useWorld'
import { Intake, Rebalance, Session, Understand, Work } from './panels/Loop'
import { Chime, Firefly, Lanterns, WarmCup } from './panels/Minis'
import { Settings } from './panels/Settings'
import { Shop } from './panels/Shop'
import { Collection, Keepsakes } from './panels/Keepsakes'
import { Pocket } from './panels/Pocket'
import { Ripples } from './panels/Ripples'
import {
  Backpack, Briefing, Calm, Council, Garden, Home, Journal, LoadPanel, Mailbox,
  Recover, TownList,
} from './panels/Places'
import type { PanelProps } from './panels/types'
import type { ReactElement } from 'react'
import './game.css'
import './cosmetics.css'

const VIEW_TITLE: Record<ViewId, string> = {
  intake: 'Town Hall', understand: 'Understand', rebalance: 'Rebalance Workshop',
  work: 'Choose the work', session: 'Pace Session', recover: 'Recover',
  ripples: 'Gentle Ripples', pocket: 'Pocket of Green',
  firefly: 'Firefly Stories', chime: 'Chime Drift', warmcup: 'Warm Cup', lanterns: 'Night Lanterns',
  keepsakes: 'Pace Keepsakes', collection: 'Keepsake Collection',
  journal: 'Journal', council: 'Guardian Council', mailbox: 'Future Mailbox',
  calm: 'Calm Corner', home: 'Home',   backpack: 'Backpack', garden: 'Recovery Garden',
  load: 'Daily Load', townlist: 'Town List', briefing: 'Daily Briefing',
  settings: 'Settings', shop: 'Shop',
}

const PANELS: Record<ViewId, (p: PanelProps) => ReactElement> = {
  intake: Intake, understand: Understand, rebalance: Rebalance, work: Work, session: Session,
  recover: Recover, ripples: Ripples, pocket: Pocket, firefly: Firefly, chime: Chime,
  warmcup: WarmCup, lanterns: Lanterns, keepsakes: Keepsakes, collection: Collection,
  journal: Journal, council: Council, mailbox: Mailbox, calm: Calm,
  home: Home, backpack: Backpack, garden: Garden, load: LoadPanel, townlist: TownList,
  briefing: Briefing, settings: Settings, shop: Shop,
}

/** Greetings fire once per place, then never again. */
const GREETINGS: Partial<Record<string, [GuardianId, string]>> = {
  library: ['mira', 'I am Mira, and I explain things. Tell me what blocks you — we start with one small visible step.'],
  clock: ['kai', 'I am Kai, and I plan time. Two flexible tasks can move to Saturday — want to see?'],
  garden: ['sol', 'I am Sol, and I keep effort sustainable. This water achieves nothing, and that is the point — sit a minute?'],
  market: ['goh', 'I am Goh, and I finish small things. Errands group well — bring me the list in your head.'],
  cafe: ['sky', 'I am Sky, and I keep you company. Work if you want — I will not ask how it is going.'],
  park: ['sol', 'I am Sol. Ten minutes with something green counts — outside, window, plant, or picture, all the same.'],
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
  const { account, isGuest, signOut } = useAuth()
  const [state, setState] = useState<GameState>(() => loadState())
  const [menuOpen, setMenuOpen] = useState(false)
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
    setState((s) => view === 'rebalance'
      ? { ...s, scene: 'clock-tower', view: null }
      : { ...s, scene: view ? 'campus' : s.scene, view })
    setLive(view === 'rebalance' ? 'Clock Tower entered.'
      : view ? `${VIEW_TITLE[view]} opened.` : 'View closed.')
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
      enabled: state.started && state.scene === 'campus' && !panelOpen && !dialogueOpen,
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
  // Title hook counts the live week, never a hardcoded script.
  const lockedCount = state.tasks.filter((t) => t.day === 'thu' && t.flexibility === 'fixed').length
  const moverCount = proposeRebalance(state.tasks,
    { day: 'thu', destination: DEMO_DESTINATION, waking: wakingMinutes(state.capacity) }).moves.length
  const activeCheckpoint = state.checkpoints.find((c) => c.id === state.activeCheckpointId)

  const waking = wakingMinutes(state.capacity)
  const rebalanceOpen = !state.rebalanceSeen &&
    proposeRebalance(state.tasks, { day: 'thu', destination: DEMO_DESTINATION, waking }).moves.length > 0
  const questCtx = {
    loadPercentage: load.percentage,
    hasOutcome: !!state.outcome,
    hasRecovery: !!state.questOutcome,
    hasOpenCheckpoint: state.checkpoints.length === 0
      ? load.contributors.length > 0
      : state.checkpoints.some((c) => c.status !== 'completed'),
    rebalanceAvailable: rebalanceOpen,
    taskTitle: load.contributors[0]?.task.title ?? null,
    // The saved next action is offered only after a session banked it —
    // never the seeded sentence on a fresh week.
    nextAction: state.outcome ? state.nextAction || null : null,
  }
  const questList = selectQuests(questCtx, state.skippedQuestKinds)
  const foreground = foregroundQuest(questList, questCtx)
  // One agreed direction: rebalance while undecided, else recovery if work was
  // banked, else wherever the foregrounded quest points. Map, HUD and Council
  // follow this same rule, so the three never disagree.
  const leadView: ViewId = rebalanceOpen ? 'rebalance'
    : state.outcome && !state.questOutcome ? 'recover'
    : (foreground?.view as ViewId | undefined) ?? 'work'
  const leadPlace = PLACES.find((p) => p.view === leadView)?.id ?? null

  const panelProps: PanelProps = { state, load, update, go, toast }
  const Panel = state.view ? PANELS[state.view] : null

  /* A save that has never been through onboarding gets sent there first. The
     explore-without-an-account path marks itself onboarded, so it lands in the
     town directly. */
  if (!state.onboarded) return <Navigate to="/welcome" replace />

  const returning = state.journal.length > 0
  const firstName = account?.name?.split(' ')[0] ?? 'friend'

  if (!state.started) {
    return (
      <div className={`pt-game${state.contrast ? ' hc' : ''}`}>
        <div className="title">
          <div className="title-art" style={{ backgroundImage: 'url(/game/world/campus-daylight.png)' }} />
          <div className="title-veil" />
          <div className="title-inner">
            <div className="logo">
              <span className="mark" aria-hidden="true">P</span>
              <div style={{ textAlign: 'left' }}>
                <h1>PaceTown</h1>
                <p>Find your pace. Grow your place.</p>
              </div>
            </div>

            <p className="title-greet">
              {returning ? `Welcome back, ${firstName}.` : `Good to meet you, ${firstName}.`}
            </p>

            <p className="title-hook">
              Thursday is at <b style={{ color: 'var(--accent)' }}>{load.percentage.toFixed(0)}%</b>.
              {' '}{lockedCount} commitment{lockedCount === 1 ? ' is' : 's are'} already locked in.
              {moverCount > 0
                ? <> Kai thinks {moverCount} thing{moverCount === 1 ? '' : 's'} can move — pick one checkpoint to begin.</>
                : ' Nothing can move safely — pick one checkpoint to begin.'}
            </p>

            {returning && (
              <div className="title-progress">
                <div><b>Lv {level.level}</b><span>{state.xp} XP</span></div>
                <div><b>{state.coins}</b><span>coins</span></div>
                <div><b>{stepsDone}/{LOOP_STEPS.length}</b><span>of the loop</span></div>
                <div><b>{state.gardenGrowth}/4</b><span>garden</span></div>
              </div>
            )}

            {/* The cast is the map legend: who is here and what each one is for. */}
            <ul className="title-cast">
              {(Object.keys(GUARDIANS) as GuardianId[]).map((id) => (
                <li key={id}>
                  <img src={`/game/portraits/${id}.png`} alt="" width="190" height="285" />
                  <b>{GUARDIANS[id].name}</b>
                  <span>{GUARDIANS[id].role.split(' · ')[1]}</span>
                </li>
              ))}
            </ul>

            <div className="title-actions">
              <button className="primary big" type="button" onClick={start}>
                {returning ? 'Continue your week' : 'Enter Campus Grove'}
              </button>
              <Link className="secondary" to="/">Landing page</Link>
            </div>

            <p className="title-note">
              W A S D to walk · E to enter · Esc to back out
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (state.scene === 'clock-tower') {
    return (
      <div className={`pt-game${state.contrast ? ' hc' : ''}`}>
        <ClockTower state={state} update={update} go={go} toast={toast}
          onExit={() => {
            setState((s) => ({ ...s, scene: 'campus', view: null }))
            setLive('Back on the campus.')
          }} />
        <div className="toasts">
          {toasts.map((t) => <div className="toast" key={t.id}>{t.text}</div>)}
        </div>
        <div className="sr" aria-live="polite">{live}</div>
      </div>
    )
  }

  return (
    <div className={`pt-game${state.contrast ? ' hc' : ''}`}>
      <Campus refs={{ stage, world, avatar }} load={load} tasks={state.tasks} day="thu"
        near={near} leadPlace={leadPlace} quiet={state.quiet} stepsDone={stepsDone}
        equipped={state.equipped} onEnter={enter} />
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

        {/* Level reads as progress, not as a target: the bar has no deadline
            and nothing here ever goes backwards. */}
        <div className="coinbar">
          <div className="lvl">
            <span className="lbl">Level {level.level}</span>
            <span className="lvl-track">
              <span className="lvl-fill" style={{ width: `${(level.into / level.need) * 100}%` }} />
            </span>
            <span className="lvl-num">{level.into}/{level.need} XP</span>
          </div>
          <span className="coins">Coins <b>{state.coins}</b></span>
        </div>

        <button className="iconbtn" type="button" aria-pressed={state.quiet} title="Quiet Mode"
          onClick={() => update((s) => ({ ...s, quiet: !s.quiet }))}>☾</button>
        <button className="iconbtn" type="button" aria-pressed={state.contrast} title="High contrast"
          onClick={() => update((s) => ({ ...s, contrast: !s.contrast }))}>◐</button>

        <div className="acct">
          <button className="acct-btn" type="button" aria-expanded={menuOpen}
            aria-label={`Account: ${account?.name ?? 'signed in'}`}
            onClick={() => setMenuOpen((v) => !v)}>
            <span className="acct-av" style={{ background: `hsl(${account?.hue ?? 40} 44% 46%)` }}>
              {(account?.name ?? '?').trim().charAt(0).toUpperCase()}
            </span>
            <span className="acct-name">{firstName}</span>
          </button>
          {menuOpen && (
            <>
              <div className="acct-catch" onClick={() => setMenuOpen(false)} />
              <div className="acct-menu" role="menu">
                <div className="acct-who">
                  <b>{account?.name}</b>
                  <span>{isGuest ? 'Browsing without an account' : account?.email}</span>
                </div>
                {isGuest && (
                  <Link className="acct-keep" to="/signup" onClick={() => setMenuOpen(false)}>
                    Keep this progress →
                    <small>Your week is saved in this browser. An account keeps it yours.</small>
                  </Link>
                )}
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); go('settings') }}>
                  Settings
                </button>
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); go('shop') }}>
                  Shop · {state.coins} coins
                </button>
                <Link to="/" role="menuitem" onClick={() => setMenuOpen(false)}>Landing page</Link>
                <button type="button" role="menuitem" className="acct-out" onClick={signOut}>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
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
        ) : foreground ? (
          <>
            <div className="eyebrow">
              {load.percentage > 95 ? 'Over capacity · one action foregrounded' : 'Recommended'}
            </div>
            <h3>{foreground.title}</h3>
            <p>{foreground.detail}</p>
            <div className="qa">
              <button className="go" type="button" onClick={() => go(foreground.view as ViewId)}>Go there</button>
              <button type="button" onClick={() => {
                update((s) => ({ ...s, skippedQuestKinds: [...s.skippedQuestKinds, foreground.id] }))
                toast('Quest replaced — nothing lost')
              }}>Choose another</button>
              <button type="button" onClick={() => go('council')}>Ask the Council</button>
            </div>
          </>
        ) : (
          <>
            <div className="eyebrow">Recommended</div>
            <h3>{VIEW_TITLE[leadView]}</h3>
            <p>One checkpoint. Partial progress counts.</p>
            <div className="qa">
              <button className="go" type="button" onClick={() => go(leadView)}>Go there</button>
              <button type="button" onClick={() => go('council')}>Ask the Council</button>
            </div>
          </>
        )}
      </div>

      <GuardianDock state={state} load={load} go={go} />

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
