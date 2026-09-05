/**
 * The landing page.
 *
 * Every number on this page is computed by the real domain layer from the
 * seeded week, not typed into the copy. If the parser or the load model
 * changes, the marketing changes with it — which is the only way a landing
 * page stays true.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BANDS, DEMO_DESTINATION, dailyLoad, demoTasks, proposeRebalance, wakingMinutes,
  DEMO_CAPACITY, type GuardianId,
} from '../domain'
import { GUARDIANS } from '../game/layout'
import { useAuth } from '../auth/AuthContext'
import { markOnboarded } from '../game/state'
import { useTheme } from '../theme/ThemeProvider'
import { LiveTown } from './LiveTown'
import { useAmbient } from './useAmbient'
import { useCountUp, useReveal } from './motion'
import { TryIt } from './TryIt'
import './landing.css'

interface RosterEntry {
  id: GuardianId
  title: string
  owns: string
  line: string
  module: string
  does: string[]
}

/** What each guardian actually owns in the product, not a personality quiz. */
const ROSTER: RosterEntry[] = [
  {
    id: 'kai', title: 'Plans your time', owns: 'Daily Load · Rebalance',
    line: 'Weighs every commitment against the hours you are actually awake, then proposes which flexible things can move — and moves nothing until you approve it.',
    module: 'workload.ts · rebalance.ts',
    does: [
      'Weighs each task by priority, mental effort and urgency',
      'Shows the arithmetic behind the percentage, line by line',
      'Proposes moves one at a time, each with its own approve button',
    ],
  },
  {
    id: 'mira', title: 'Makes work startable', owns: 'Work plans · Checkpoints',
    line: 'Turns a brief you are avoiding into one checkpoint with a definition of done you wrote yourself. Names the blocker instead of guessing at motivation.',
    module: 'plans.ts',
    does: [
      'Names the blocker: unclear start, too large, missing knowledge',
      'Builds checkpoints with a definition of done in your words',
      'Keeps the plan editable — nothing is generated then locked',
    ],
  },
  {
    id: 'sky', title: 'Keeps you company', owns: 'Pace Sessions',
    line: 'Sits with you through a timed session with a scratchpad and a stuck button. Partial progress is banked as progress, never as failure.',
    module: 'guidance.ts',
    does: [
      'A timer you set, pause and abandon without penalty',
      'A stuck button that offers help modes instead of advice',
      'Banks partial work as an outcome, not an incomplete',
    ],
  },
  {
    id: 'sol', title: 'Protects recovery', owns: 'Regulation · Recovery Garden',
    line: 'Recommends the rest that fits the pressure you are actually under, and grows the garden from sustainable choices. Growth never decays.',
    module: 'regulation.ts',
    does: [
      'Matches the activity to the pressure, not to a streak',
      'Counts participation, never a score or a duration',
      'Grows the garden permanently — nothing here can wither',
    ],
  },
  {
    id: 'goh', title: 'Finishes small things', owns: 'Errands · Quests',
    line: 'Groups the little obligations that quietly eat a week and closes them out. Four small wins still count as four.',
    module: 'quests.ts',
    does: [
      'Groups errands that share a trip or a mood',
      'Foregrounds exactly one quest when pressure is high',
      'Lets you swap any quest without losing what it was worth',
    ],
  },
]

const JOURNEY: Array<{ name: string; detail: string; guardian: GuardianId; action: string }> = [
  { name: 'Understand the load', detail: 'Turn your calendar and task list into one honest picture.', guardian: 'mira', action: 'Start with awareness' },
  { name: 'Make space', detail: 'Review what can wait and approve each change yourself.', guardian: 'kai', action: 'Create room to breathe' },
  { name: 'Get support', detail: 'Break down the next step or work beside someone supportive.', guardian: 'sky', action: 'You do not do this alone' },
  { name: 'Recover', detail: 'Choose rest that matches the pressure you were actually under.', guardian: 'sol', action: 'Rest · reflect · rebuild' },
]

const FEATURES = [
  ['Nothing moves without you', 'Every rebalance is a proposal with an approve button per item. The app never rearranges your week behind your back.'],
  ['Partial counts', 'Sessions end in completed, partial, blocked or rescheduled — and three of those still pay out. Stopping early is a recorded outcome, not a lapse.'],
  ['Load, not a score', 'A percentage of your waking hours with the arithmetic shown. It can exceed 100, because sometimes weeks do.'],
  ['Works offline', 'An installable PWA with a local-first save that migrates forward. Your week survives a bad connection and a browser update.'],
  ['Quiet Mode', 'Turns off weather, motion and idle animation in one press. High contrast sits next to it.'],
  ['Your data stays yours', 'Saves live in your browser. Export the whole thing to a file whenever you want it.'],
] as const

const FEATURE_META = [
  ['approval', 'amber'],
  ['checkpoint', 'plum'],
  ['capacity', 'plum'],
  ['map', 'moss'],
  ['quiet', 'teal'],
  ['lockbox', 'amber'],
] as const

function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark-mark" aria-hidden="true">P</span>
      <span className="wordmark-text">PaceTown</span>
    </span>
  )
}

/** One statistic, counting up the first time it scrolls into view. */
function Stat({ value, prefix = '', suffix = '', decimals = 0, label }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; label: string
}) {
  const { ref, shown } = useCountUp(value)
  return (
    <div className="lp-stat">
      <b ref={ref as RefObject<HTMLElement>}>{prefix}{shown.toFixed(decimals)}{suffix}</b>
      <span>{label}</span>
    </div>
  )
}

export default function Landing() {
  const { account, exploreAsGuest } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useTheme()
  const ambient = useAmbient()
  const page = useReveal<HTMLDivElement>()
  const sceneRef = useRef<HTMLDivElement>(null)
  const [sceneActive, setSceneActive] = useState(true)
  const [sceneEngaged, setSceneEngaged] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<GuardianId>('kai')
  const tabRefs = useRef<Partial<Record<GuardianId, HTMLButtonElement | null>>>({})

  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [],
  )

  /* The plan asks for a prominent demo path: nobody should have to create an
     account to find out whether they want one. */
  const explore = () => {
    exploreAsGuest()
    // The seeded week is the whole point of the demo path, so a first-run
    // wizard would only be in the way.
    markOnboarded()
    navigate('/town')
  }

  const engageScene = useCallback(() => setSceneEngaged(true), [])

  /* The real seeded week, run through the real model. */
  const { load, movers, freed, breathingMinutes } = useMemo(() => {
    const tasks = demoTasks()
    const waking = wakingMinutes(DEMO_CAPACITY)
    const computed = dailyLoad(tasks, 'thu', waking)
    const proposal = proposeRebalance(tasks, { day: 'thu', destination: DEMO_DESTINATION, waking })
    const movedIds = new Set(proposal.moves.map((move) => move.taskId))
    const movedMinutes = tasks
      .filter((task) => movedIds.has(task.id))
      .reduce((total, task) => total + task.estimatedMinutes, 0)
    return {
      load: computed,
      movers: proposal.moves.length,
      freed: Math.max(0, computed.percentage - proposal.after.percentage),
      breathingMinutes: Math.max(10, Math.round(movedMinutes / 10) * 10),
    }
  }, [])

  /* Music and a walking sprite are both wasted on a section nobody is looking at. */
  useEffect(() => {
    const el = sceneRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setSceneActive(entry.isIntersecting),
      { rootMargin: '120px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const bandIndex = BANDS.findIndex((b) => b.key === load.band.key)
  // Clamping an over-capacity week to a full bar hides the one thing the bar
  // exists to show. Scale the track past 100 instead, and mark where 100 was.
  const scaleMax = Math.max(100, load.percentage)
  const current = ROSTER.find((g) => g.id === active)!

  /* Arrow keys move between guardians, as a tablist should. */
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const order = ROSTER.map((g) => g.id)
    const at = order.indexOf(active)
    let next: number
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (at + 1) % order.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (at - 1 + order.length) % order.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = order.length - 1
    else return
    event.preventDefault()
    setActive(order[next])
    tabRefs.current[order[next]]?.focus()
  }

  return (
    <div className="lp" ref={page}>
      <a className="lp-skip" href="#main">Skip to content</a>

      <header className={`lp-nav${scrolled ? ' is-stuck' : ''}`}>
        <Link className="lp-brand" to="/" aria-label="PaceTown home"><Wordmark /></Link>

        <nav className="lp-links" aria-label="Sections">
          <a href="#town">The town</a>
          <a href="#try">Try it</a>
          <a href="#guardians">Guardians</a>
          <a href="#loop">How it works</a>
        </nav>

        <div className="lp-nav-actions">
          <button
            type="button"
            className="lp-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={`lp-audio${ambient.playing ? ' on' : ''}`}
            onClick={ambient.toggle}
            aria-pressed={ambient.playing}
            title={
              ambient.error
                ?? (ambient.playing
                  ? `Turn the music off (${ambient.source === 'track' ? 'your track' : '“Grove Nights”'})`
                  : 'Play the ambient music')
            }
          >
            <span className="lp-eq" aria-hidden="true"><i /><i /><i /></span>
            <span className="lp-audio-text">{ambient.playing ? 'Sound on' : 'Sound off'}</span>
          </button>

          {account ? (
            <Link className="lp-cta" to="/town">Continue your week</Link>
          ) : (
            <>
              <Link className="lp-ghost" to="/login">Sign in</Link>
              <Link className="lp-cta" to="/signup">Start free</Link>
            </>
          )}
        </div>
      </header>

      <main id="main">
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <p className="lp-kicker" data-reveal data-reveal-index="0">
              Thursday mission · {load.percentage.toFixed(0)}% capacity
            </p>
            <h1 data-reveal data-reveal-index="1">
              Your week is too heavy.<br />
              <em>Let&apos;s make some room.</em>
            </h1>
            <p className="lp-sub" data-reveal data-reveal-index="2">
              PaceTown helps make Thursday lighter without changing anything until you approve it.
            </p>
            <div className="lp-mission" data-reveal data-reveal-index="3">
              <span className="lp-mission-label">First mission</span>
              <strong>Create about {breathingMinutes} minutes of breathing room</strong>
              <span>Kai found {movers} flexible commitments. Nothing moves until you approve it.</span>
            </div>
            <div className="lp-hero-actions" data-reveal data-reveal-index="3">
              <Link className="lp-cta lp-cta-big" to={account ? '/town' : '/signup'}>
                {account ? 'Continue today’s mission' : 'Start today’s mission'}
              </Link>
              <button type="button" className="lp-ghost lp-ghost-big" onClick={explore}>
                Explore the town — no account
              </button>
            </div>
            <ul className="lp-trust" data-reveal data-reveal-index="4">
              <li>Free, no card</li>
              <li>Works offline</li>
              <li>Data stays in your browser</li>
            </ul>
          </div>

          <div className={`lp-hero-scene${sceneEngaged ? ' is-engaged' : ''}`} ref={sceneRef} id="town">
            <LiveTown active={sceneActive} reducedMotion={reducedMotion} onTakeOver={engageScene} />
            <div className={`lp-hero-overlay${sceneEngaged ? ' is-hidden' : ''}`}>
              <div className="lp-encounter" aria-label="Sky welcomes the player to PaceTown">
                <span className="lp-encounter-player" role="img" aria-label="Your player character" />
                <span className="lp-encounter-sky" role="img" aria-label="Sky" />
                <span className="lp-encounter-name">Sky</span>
                <span className="lp-encounter-bubble">We&apos;ll take it<br />one step at a time.<i /></span>
              </div>
              <nav className="lp-campus-signs" aria-label="Campus destinations">
                <a href="#guardians">Library <span aria-hidden="true">→</span></a>
                <a href="#loop">Lecture Hall <span aria-hidden="true">→</span></a>
                <a href="#guardians">Commons <span aria-hidden="true">→</span></a>
                <a href="#loop">Quiet Quad <span aria-hidden="true">→</span></a>
              </nav>
              <div className="lp-today-board">
                <strong>Today</strong>
                <span>□ Database lecture</span>
                <span>□ ERD assignment</span>
                <span className="is-done">■ Groceries</span>
              </div>
            </div>
            <div className="lp-scene-hud" aria-hidden="true">
              <span>Capacity</span>
              <b>{load.percentage.toFixed(0)}%</b>
              <div className="lp-hud-bar"><i style={{ width: `${(load.percentage / scaleMax) * 100}%` }} /></div>
              <div className="lp-hud-labels"><small>Open</small><small>Steady</small><small>Heavy</small><small>{load.band.label}</small></div>
            </div>
            <div className="lp-scene-caption">
              <span className="lp-live"><i aria-hidden="true" /> Live</span>
              This is the real game running. Walk around.
            </div>
          </div>
        </section>

        <section className="lp-proof lp-clocktower" aria-label="The seeded week, computed live">
          <div className="lp-clocktower-copy" data-reveal>
            <span className="lp-location-sign">Clock Tower · Kai&apos;s planning desk</span>
            <h2>A Thursday that does not fit.</h2>
            <p>
              Nine commitments parsed from one sentence of plain English, weighed against
              {' '}{Math.round(wakingMinutes(DEMO_CAPACITY) / 60)} waking hours.
            </p>
            <div className="lp-kai-note">
              <img src="/game/portraits/kai.webp" alt="Kai" width="92" height="138" loading="lazy" />
              <div><strong>Kai</strong><span>I found {movers} flexible {movers === 1 ? 'thing' : 'things'} that can safely move.</span></div>
            </div>
          </div>

          <div className="lp-meter lp-clocktower-meter" data-reveal data-reveal-index="1">
            <span className="lp-board-label">Daily load · planning board</span>
            <div className="lp-meter-head">
              <span className="lp-meter-num">{load.percentage.toFixed(0)}<small>%</small></span>
              <span className="lp-band" data-band={load.band.key}>{load.band.label}</span>
            </div>
            <div className="lp-meter-track" role="img"
              aria-label={`Daily load ${load.percentage.toFixed(0)} percent, band ${load.band.label}`}>
              <span className="lp-meter-fill" data-band={load.band.key}
                style={{ width: `${(load.percentage / scaleMax) * 100}%` }} />
              <span className="lp-meter-cap" style={{ left: `${(100 / scaleMax) * 100}%` }} />
            </div>
            <div className="lp-meter-bands" aria-hidden="true">
              {BANDS.map((b, i) => (
                <span key={b.key} className={i === bandIndex ? 'is-on' : undefined}>{b.label}</span>
              ))}
            </div>
          </div>

          <div className="lp-stats lp-clocktower-stats" data-reveal data-reveal-index="2">
            <Stat value={load.contributors.length} label="flexible things carrying the load" />
            <Stat value={movers} label="Kai can propose moving to Saturday" />
            <Stat value={freed} prefix="−" suffix="%" label="if you approve every one of them" />
          </div>

          <p className="lp-foot lp-clocktower-foot" data-reveal data-reveal-index="3">
            No judgement in any of that — it is arithmetic, and the app shows its working.
          </p>
        </section>

        <TryIt />

        <section className="lp-section" id="guardians">
          <div className="lp-section-head" data-reveal>
            <p className="lp-eyebrow">The cast</p>
            <h2>Five guardians. One job each.</h2>
            <p>
              Every character is a real module. Pick one — walk into their district in the
              game and you are using the thing they own.
            </p>
          </div>

          <div className="lp-guardians" data-reveal data-reveal-index="1">
            <div className="lp-tabs" role="tablist" aria-label="Guardians" onKeyDown={onTabKey}>
              {ROSTER.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  id={`tab-${g.id}`}
                  aria-selected={g.id === active}
                  aria-controls={`panel-${g.id}`}
                  tabIndex={g.id === active ? 0 : -1}
                  ref={(el) => { tabRefs.current[g.id] = el }}
                  className={`lp-tab${g.id === active ? ' is-on' : ''}`}
                  onClick={() => setActive(g.id)}
                >
                  <img src={`/game/portraits/${g.id}.webp`} alt="" width="190" height="285" loading="lazy" />
                  <span className="lp-tab-name">{GUARDIANS[g.id].name}</span>
                  <span className="lp-tab-role">{g.title}</span>
                </button>
              ))}
            </div>

            {/* Keyed on the guardian so switching replays the entrance. */}
            <div
              className="lp-guardian-panel"
              role="tabpanel"
              id={`panel-${current.id}`}
              aria-labelledby={`tab-${current.id}`}
              key={current.id}
            >
              <div className="lp-guardian-art">
                <img src={`/game/portraits/${current.id}.webp`} alt="" width="190" height="285" />
              </div>
              <div className="lp-guardian-body">
                <p className="lp-eyebrow">{GUARDIANS[current.id].role}</p>
                <h3>{GUARDIANS[current.id].name} — {current.title.toLowerCase()}</h3>
                <p className="lp-guardian-line">{current.line}</p>
                <ul className="lp-guardian-does">
                  {current.does.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <footer>
                  <span className="lp-chip">{current.owns}</span>
                  <code>{current.module}</code>
                </footer>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section lp-section-alt lp-journey" id="loop">
          <div className="lp-route-title" data-reveal>
            <p className="lp-eyebrow">Your route through a heavy week</p>
            <h2>Four small steps.<br />One lighter Thursday.</h2>
          </div>
          <div className="lp-quest-log" data-reveal data-reveal-index="1">
            <span>Today&apos;s quest log</span>
            <strong>Thursday&nbsp; <i>{load.percentage.toFixed(0)}%</i> → {Math.max(0, load.percentage - freed).toFixed(0)}%</strong>
            <div className="lp-quest-bar"><i style={{ width: `${Math.min(100, load.percentage - freed)}%` }} /></div>
            <small>Nothing moves without your approval.</small>
          </div>

          <ol className="lp-loop">
            {JOURNEY.map((step, i) => (
              <li key={step.name} data-reveal data-reveal-index={i}>
                <span className="lp-loop-n">{i + 1} · {step.name}</span>
                <span className="lp-loop-pin" aria-hidden="true" />
                <h3>{step.action}</h3>
                <p>{step.detail}</p>
                <div className="lp-step-guide">
                  <img src={`/game/portraits/${step.guardian}.webp`} alt="" loading="lazy" />
                  <span><b>{GUARDIANS[step.guardian].name}</b><small>{ROSTER.find((entry) => entry.id === step.guardian)?.title}</small></span>
                </div>
              </li>
            ))}
          </ol>
          <div className="lp-route-support" data-reveal data-reveal-index="4">
            <div className="lp-campus-status">
              <span>Campus status</span>
              <strong><i /> Open</strong>
              <strong><i /> Active</strong>
              <strong><i /> Safe</strong>
            </div>
            <div className="lp-route-message">
              <strong>This isn&apos;t a game about grinding.</strong>
              <span>It&apos;s a game about getting through.</span>
              <button type="button" className="lp-cta" onClick={explore}>Start today&apos;s first step</button>
            </div>
            <div className="lp-daily-tip">
              <span>Daily tip</span>
              <p>Small steps don&apos;t look like much. Until you look back.</p>
            </div>
          </div>
        </section>

        <section className="lp-section lp-values lp-charter">
          <div className="lp-charter-heading" data-reveal>
            <div>
              <span className="lp-location-sign">Library wall · campus rules</span>
              <h2>The PaceTown Campus Charter</h2>
              <p>Consent, not compliance. The town works with you, never around you.</p>
            </div>
            <div className="lp-charter-host">
              <img src="/game/portraits/sol.webp" alt="Sol" width="108" height="162" loading="lazy" />
              <span className="lp-charter-bubble">No streaks.<br />No guilt.</span>
            </div>
          </div>
          <div className="lp-features">
            {FEATURES.map(([title, body], i) => {
              const [icon, tone] = FEATURE_META[i]
              return (
                <div className={`lp-feature lp-feature-${i + 1}`} data-tone={tone} key={title} data-reveal data-reveal-index={i}>
                  <span className={`lp-feature-icon lp-icon-${icon}`} aria-hidden="true" />
                  <div><h3>{title}</h3><p>{body}</p></div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-final-party" aria-hidden="true">
            {ROSTER.map((guardian) => (
              <img key={guardian.id} src={`/game/portraits/${guardian.id}.webp`} alt="" />
            ))}
          </div>
          <div className="lp-final-board" data-reveal>
            <p className="lp-eyebrow">The campus is open</p>
            <h2>Make room before burnout does.</h2>
            <p>Your week is already yours. PaceTown helps you see it clearly, handle what remains, and recover without guilt.</p>
            <div className="lp-hero-actions" data-reveal data-reveal-index="1">
              <Link className="lp-cta lp-cta-big" to={account ? '/town' : '/signup'}>
                {account ? 'Continue your week' : 'Enter PaceTown'}
              </Link>
              {!account && (
                <button type="button" className="lp-ghost lp-ghost-big" onClick={explore}>
                  Explore without an account
                </button>
              )}
            </div>
            <ul className="lp-final-trust">
              <li>Free to explore</li><li>Works offline</li><li>Your approval, every time</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <Wordmark />
        <p>Find your pace. Grow your place.</p>
        <nav aria-label="Footer">
          <Link to="/demo">Mentor demo</Link>
          <a href="#try">Try it</a>
          <a href="#guardians">Guardians</a>
          <a href="#loop">How it works</a>
        </nav>
      </footer>
    </div>
  )
}
