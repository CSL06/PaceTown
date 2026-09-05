/**
 * The town's other destinations. Each is small on purpose — a place you enter,
 * do one thing, and leave.
 */

import {
  DEMO_DESTINATION, REWARDS, guidedPercentage, proposeRebalance,
  wakingMinutes, weightedDemand,
} from '../../domain'
import { GUARDIANS, PLACES, doorstep } from '../layout'
import { clearState, record } from '../state'
import { loadWeather, pressureByArea } from '../Campus'
import { Guardian } from './Guardian'
import { HelpDot } from './HelpDot'
import type { PanelProps } from './types'

const fmt = (n: number) => n.toFixed(1)
const AREA_LABEL = {
  time: 'Time', mental: 'Mental', physical: 'Physical', social: 'Social', errands: 'Errands',
} as const

/* -------------------------------------------------------- daily load */

export function LoadPanel({ state, load, go }: PanelProps) {
  const areas = pressureByArea(state.tasks, 'thu')
  const fixedBy: Record<string, number> = {}
  for (const t of state.tasks) {
    if (t.day !== 'thu' || t.flexibility !== 'fixed') continue
    fixedBy[t.category] = (fixedBy[t.category] ?? 0) + t.estimatedMinutes
  }
  const peak = Math.max(1, ...Object.values(areas))
  const top = load.contributors.slice(0, 2).map((c) => c.task.title)

  return (
    <>
      <div className="card">
        <div className="eyebrow">Thursday <HelpDot view="load" state={state} load={load} /></div>
        <div className="load-head">
          <span className="load-num">{fmt(load.percentage)}%</span>
          <span className="band" style={{ background: `var(--${load.band.key})` }}>{load.band.label}</span>
        </div>
        <div className="capacity">
          <div><span>Waking day</span><span>{load.wakingMinutes} min</span></div>
          <div><span>Fixed commitments</span><span>−{load.fixedMinutes} min</span></div>
          <div className="rule"><span>Available</span><span>{load.availableMinutes} min</span></div>
          <div><span>Weighted demand</span><span>{fmt(load.weightedDemand)} min</span></div>
          <div><span>Total schedule load</span><span>({load.fixedMinutes} + {fmt(load.weightedDemand)}) ÷ {load.wakingMinutes} × 100</span></div>
        </div>
        {top.length > 0 && (
          <p className="lede">
            Thursday is <b>{fmt(load.percentage)}%</b> because {load.fixedMinutes} minutes are already
            committed, leaving <b>{load.availableMinutes} minutes</b> for {load.contributors.length}{' '}
            flexible tasks. The largest contributors are <b>{top.join('</b> and <b>')}</b>.
          </p>
        )}
        {state.capacity.energy && (
          <p className="note" style={{ marginTop: 10 }}>
            Adjusted for today’s energy: <b>{fmt(guidedPercentage(load, state.capacity.energy))}%</b> —
            guidance only, the raw figure above is unchanged.
          </p>
        )}
        <p className="disclaimer">
          This is schedule guidance, not a health assessment. It describes your calendar, not you.
        </p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('understand')}>Show the arithmetic</button>
          <button className="secondary" type="button" onClick={() => go('briefing')}>Check in</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14 }}>Where the pressure is <HelpDot view="load" state={state} load={load} /></h3>
        <div className="areas">
          {(Object.keys(AREA_LABEL) as (keyof typeof AREA_LABEL)[]).map((k) => {
            const fixed = fixedBy[k] ?? 0
            const total = areas[k]
            return (
              <div className="area" key={k}>
                <span>{AREA_LABEL[k]}</span>
                <span className="bar">
                  <i className="locked" style={{ width: `${(fixed / peak) * 100}%`, background: `var(--${k})` }} />
                  <i style={{ width: `${((total - fixed) / peak) * 100}%`, background: `var(--${k})` }} />
                </span>
                <span className="val">{Math.round(total)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14 }}>Load Weather</h3>
        <p className="note">Every effect has a text equivalent — nothing depends on colour alone.</p>
        {loadWeather(state.tasks, 'thu').map((w) => (
          <div className="wrow" key={w.place}>
            <span aria-hidden="true">{w.icon}</span>
            <span>{w.place}</span>
            <span className="st">{w.states[w.level]}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ---------------------------------------------------------- briefing */

export function Briefing({ state, load, update, go, toast }: PanelProps) {
  const scale = (field: 'energy' | 'stress', label: string, lo: string, hi: string) => (
    <div style={{ marginTop: 16 }}>
      <div className="eyebrow">{label}</div>
      <div className="outcomes">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={state.capacity[field] === n}
            onClick={() => update((s) => ({
              ...s, capacity: { ...s.capacity, [field]: s.capacity[field] === n ? null : n },
            }))}>{n}</button>
        ))}
      </div>
      <div className="note" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span>{lo}</span><span>{hi}</span>
      </div>
    </div>
  )

  return (
    <div className="card">
      <h2>Today <HelpDot view="briefing" state={state} load={load} /></h2>
      <p className="lede">
        Defaults you can change at any time. Nothing here is a health measurement, and every field
        can be skipped.
      </p>
      <div className="field">
        <label htmlFor="wake">Usually awake from</label>
        <input id="wake" type="number" min={4} max={12} value={state.capacity.wakeHour}
          onChange={(e) => update((s) => ({
            ...s, capacity: { ...s.capacity, wakeHour: Math.max(4, Math.min(12, Number(e.target.value) || 8)) },
          }))} />
      </div>
      <div className="field">
        <label htmlFor="sleep">Usually asleep by</label>
        <input id="sleep" type="number" min={18} max={26} value={state.capacity.sleepHour}
          onChange={(e) => update((s) => ({
            ...s, capacity: { ...s.capacity, sleepHour: Math.max(18, Math.min(26, Number(e.target.value) || 23)) },
          }))} />
      </div>
      <p className="note">
        That is <b className="mono">{wakingMinutes(state.capacity)} minutes</b> of waking day before
        any commitments are subtracted.
      </p>

      {scale('energy', 'Energy today — optional', 'Running on empty', 'Full tank')}
      {scale('stress', 'Stress today — optional', 'Settled', 'Wound up')}

      <div className="capacity">
        <div><span>Raw calculation</span><span>{fmt(load.percentage)}% · {load.band.label}</span></div>
        <div><span>Adjusted for energy</span><span>{fmt(guidedPercentage(load, state.capacity.energy))}%</span></div>
      </div>
      <p className="disclaimer">
        Energy bends the guidance within a bounded range. It never rewrites the time calculation.
      </p>
      <div className="actions">
        <button className="primary" type="button" onClick={() => {
          update((s) => record(s, 'Checked in',
            `${wakingMinutes(s.capacity)} waking minutes` +
            (s.capacity.energy ? ` · energy ${s.capacity.energy}/5` : '') +
            '. Optional self-report, not a health measurement.'))
          toast('Capacity saved')
          go(null)
        }}>Save</button>
        <button className="secondary" type="button" onClick={() => go(null)}>Skip for now</button>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- council */

export function Council({ state, load, go }: PanelProps) {
  const areas = pressureByArea(state.tasks, 'thu')
  const top = load.contributors[0]?.task.title ?? null
  const voices = ([
    ['kai', 'time', `Thursday holds ${Math.round(areas.time)} minutes of fixed time. That part cannot move.`],
    ['mira', 'mental', top
      ? `Most of what is left is thinking work, and “${top}” is the biggest piece.`
      : `Most of what is left is thinking work — about ${Math.round(areas.mental)} minutes of it.`],
    ['sol', 'physical', 'You have been at this a while. A smaller step is still a full step.'],
    ['sky', 'social', 'One fixed social plan. You chose it, so I would not move it.'],
    ['goh', 'errands', 'The errands are small and fit together. They are not today’s problem.'],
  ] as const)
    .slice()
    .sort((a, b) => areas[b[1]] - areas[a[1]])
    .slice(0, 3)

  // One name per destination, shared with the HUD and the ? popups:
  // 'Rebalance the week' only while a rebalance is still undecided.
  const waking = wakingMinutes(state.capacity)
  const rebalanceOpen = !state.rebalanceSeen &&
    proposeRebalance(state.tasks, { day: 'thu', destination: DEMO_DESTINATION, waking }).moves.length > 0
  const recommendation = rebalanceOpen
    ? 'Rebalance the week'
    : state.outcome && !state.questOutcome ? 'Recover' : 'Choose the work'

  return (
    <div className="card">
      <div className="eyebrow">Guardian Council</div>
      <h2>Three guardians, one recommendation <HelpDot view="council" state={state} load={load} /></h2>
      <p className="lede">
        The Council reads the same numbers you can see. It proposes; you decide. Ringing the bell
        never applies a schedule change.
      </p>
      {voices.map(([who, , says]) => <Guardian key={who} who={who} says={says} />)}
      <div className="card">
        <div className="eyebrow">Recommended</div>
        <h3 style={{ fontSize: 18, marginTop: 5, color: 'var(--accent)' }}>{recommendation}</h3>
        <div className="opts">
          {([['Choose the work', 'work'], ['Rebalance the week', 'rebalance'], ['Recover', 'recover'],
            ['Gather what is missing', 'backpack'], ['Choose for myself', null]] as const).map(([label, view]) => (
            <button key={label} className="opt" type="button" aria-pressed={label === recommendation}
              onClick={() => go(view)}>
              <span className="k">{label === recommendation ? '▸' : '○'}</span><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- recover */

export function Recover({ state, load, update, go }: PanelProps) {
  if (state.questOutcome === 'done' || state.questOutcome === 'partial') {
    return (
      <div className="card">
        <h2>Recovery recorded <HelpDot view="recover" state={state} load={load} /></h2>
        <p className="lede">
          Self-confirmation and photo confirmation earn identically. Photo use grants no XP, coins,
          rarity, or progression advantage. The first recovery pays {REWARDS.recovery.xp} XP —
          further pauses cost nothing and earn nothing.
        </p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('journal')}>See the Journal</button>
          <button className="secondary" type="button" onClick={() => {
            update((s) => ({ ...s, questOutcome: null }))
            go('calm')
          }}>Choose another recovery</button>
        </div>
      </div>
    )
  }
  if (state.session.pausedFrom) {
    return (
      <div className="card">
        <div className="eyebrow">Recover</div>
        <h2>Your session is on hold <HelpDot view="recover" state={state} load={load} /></h2>
        <p className="lede">
          Resume it whenever you are ready — your checkpoint, notes and timer are held exactly as
          you left them. Recovery stays open alongside it.
        </p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('session')}>Resume Pace Session</button>
          <button className="secondary" type="button" onClick={() => go('ripples')}>Gentle Ripples</button>
          <button className="secondary" type="button" onClick={() => go('calm')}>Short reset</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="eyebrow">Recover</div>
      <h2>Two ways to pause <HelpDot view="recover" state={state} load={load} /></h2>
      <Guardian who="sol" says="Two equal pauses: Ripples here, or a short reset away from the screen. Neither earns more." />
      <div className="opts">
        <button className="opt" type="button" onClick={() => go('ripples')}>
          <span className="k">◎</span>
          <span>Do something here<small>Gentle Ripples · 45–120 seconds · no score, no failure state</small></span>
        </button>
        <button className="opt" type="button" onClick={() => go('pocket')}>
          <span className="k">☀</span>
          <span>Do something away from the screen<small>Pocket of Green · IRL-01 · Sol</small></span>
        </button>
      </div>
      <div className="actions">
        <button className="secondary" type="button" onClick={() => go(null)}>Not now</button>
        <span className="note">Declining costs nothing and removes no progress.</span>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- journal */

export function Journal({ state, load, go }: PanelProps) {
  return (
    <div className="card">
      <div className="eyebrow">Post Office</div>
      <h2>What Thursday actually held <HelpDot view="journal" state={state} load={load} /></h2>
      <p className="lede">
        Written automatically from real events. No mood score, no streak, and no missed-day
        messaging when you come back.
      </p>
      {state.journal.length === 0
        ? <>
            <p className="empty">Nothing recorded yet. Actions across town write here automatically.</p>
            <div className="actions">
              <button className="primary" type="button" onClick={() => go('intake')}>Start at Town Hall</button>
            </div>
          </>
        : [...state.journal].reverse().map((e) => {
          const d = new Date(e.at)
          return (
            <div className="entry" key={e.at + e.text}>
              <span className="when">
                {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}
              </span>
              <div>
                <strong>
                  {e.text}
                  {e.reward && <span className="reward">+{e.reward.xp} XP · +{e.reward.coins}</span>}
                </strong>
                {e.detail && <p>{e.detail}</p>}
              </div>
            </div>
          )
        })}
      {state.outcome && (
        <div className="next-action">
          <div className="eyebrow">Waiting for you next time</div>
          <p>{state.nextAction}</p>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- backpack */

export function Backpack({ state, load, go }: PanelProps) {
  const today = state.tasks.filter((t) => t.day === 'thu')
  return (
    <div className="card">
      <div className="eyebrow">Backpack inspection point</div>
      <h2>What you are carrying <HelpDot view="backpack" state={state} load={load} /></h2>
      <p className="lede">
        Workload shown as something carried, not something you are. It gets lighter when work is
        done or safely rescheduled — it never bursts.
      </p>
      <div className="scroll">
        <table>
          <thead><tr><th>Item</th><th>Area</th><th>State</th><th className="num">Min</th><th className="num">Weighted</th></tr></thead>
          <tbody>
            {today.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.title}</strong></td>
                <td>{AREA_LABEL[t.category]}</td>
                <td>{t.flexibility === 'fixed'
                  ? <span className="band" style={{ background: 'var(--time)' }}>locked</span>
                  : <span className="band" style={{ background: 'var(--steady)' }}>flexible</span>}</td>
                <td className="num">{t.estimatedMinutes}</td>
                <td className="num">{t.flexibility === 'fixed' ? '—' : fmt(weightedDemand(t))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <button className="primary" type="button" onClick={() => go('work')}>Bring one into a session</button>
        <button className="secondary" type="button" onClick={() => go('rebalance')}>Move one through rebalancing</button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ garden */

export function Garden({ state, load, go }: PanelProps) {
  const stages = ['Nothing planted yet', 'A shoot', 'Leaves opening', 'Standing tall', 'In bloom']
  return (
    <div className="card">
      <div className="eyebrow">Recovery Garden</div>
      <h2>{stages[state.gardenGrowth]} <HelpDot view="garden" state={state} load={load} /></h2>
      <p className="lede">
        Growth comes from work progress, intentional recovery, realistic rescheduling and asking for
        help. There are no dead or wilted states, and being away never removes anything.
      </p>
      <div className="plot" aria-hidden="true">
        <span className={`sprout s${state.gardenGrowth}`} />
      </div>
      <p className="note">Growth: {state.gardenGrowth} of 4 · persists across refreshes.</p>
      <div className="actions">
        <button className="secondary" type="button" onClick={() => go('recover')}>Recover again</button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- future mailbox */

export function Mailbox({ state, load, update, toast }: PanelProps) {
  return (
    <div className="card">
      <div className="eyebrow">Future Mailbox</div>
      <h2>Send something to your future self <HelpDot view="mailbox" state={state} load={load} /></h2>
      <p className="lede">
        It surfaces at the next relevant moment rather than arriving as a reminder you have to dismiss.
      </p>
      <div className="field">
        <label htmlFor="mailtext">A next action, or a note</label>
        <input id="mailtext" defaultValue={state.nextAction} />
      </div>
      <div className="actions">
        <button className="primary" type="button" onClick={() => {
          const el = document.getElementById('mailtext') as HTMLInputElement | null
          const text = el?.value.trim() || state.nextAction
          // The same note twice is one note: record history, but pay only once.
          const duplicate = state.mailbox.length > 0 && state.mailbox[state.mailbox.length - 1].text === text
          update((s) => record({ ...s, mailbox: [...s.mailbox, { at: Date.now(), text }] },
            'Sent a note to your future self', text, duplicate ? undefined : { xp: 10, coins: 5 }))
          toast(duplicate ? 'Already in the mailbox — no extra reward' : 'Saved to the Future Mailbox')
        }}>Put it in the mailbox</button>
      </div>
      {state.mailbox.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 18 }}>Waiting</div>
          {[...state.mailbox].reverse().map((m) => (
            <div className="next-action" key={m.at}>
              <div className="eyebrow">{new Date(m.at).toLocaleString()}</div>
              <p>{m.text}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- home */

export function Home({ state, load, update, go, toast }: PanelProps) {
  return (
    <div className="card">
      <div className="eyebrow">Home</div>
      <h2>Stopping is a valid outcome <HelpDot view="home" state={state} load={load} /></h2>
      <div className="opts">
        <button className="opt" type="button" aria-pressed={state.quiet}
          onClick={() => update((s) => ({ ...s, quiet: !s.quiet }))}>
          <span className="k">◑</span>
          <span>Quiet Mode{state.quiet ? ' — on' : ''}
            <small>Reduces motion, ambient life and effects. Every core action stays available.</small></span>
        </button>
        <button className="opt" type="button" aria-pressed={state.contrast}
          onClick={() => update((s) => ({ ...s, contrast: !s.contrast }))}>
          <span className="k">◐</span>
          <span>High contrast{state.contrast ? ' — on' : ''}
            <small>Stronger edges and text. Status is never carried by colour alone.</small></span>
        </button>
        <button className="opt" type="button" onClick={() => go('briefing')}>
          <span className="k">⚙</span>
          <span>Capacity and check-in<small>Waking hours, and today’s optional energy and stress.</small></span>
        </button>
      </div>

      <div className="card">
        <div className="eyebrow">Exit Quest</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>Close the day on purpose</h3>
        <p className="lede">
          Record what changed, keep the next action, and leave. No guilt message, no streak, and
          nothing is lost by being away.
        </p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => {
            // Closing twice with the same next action records history, but pays once.
            update((s) => {
              const detail = `Next action kept: ${s.nextAction}.`
              const already = s.journal.some((e) =>
                e.text === 'Closed the day with the Exit Quest' && e.detail === detail)
              return record(s, 'Closed the day with the Exit Quest',
                detail, already ? undefined : REWARDS.savedNextAction)
            })
            toast('Day closed')
            go('journal')
          }}>Save and stop here</button>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Your data</div>
        <div className="capacity">
          <div><span>Store</span><span>localStorage · versioned and migrated</span></div>
          <div><span>Journal entries</span><span>{state.journal.length}</span></div>
          <div><span>Commitments</span><span>{state.tasks.length}</span></div>
        </div>
        <div className="actions">
          <button className="secondary" type="button" onClick={() => {
            const raw = localStorage.getItem('pacetown.game') ?? '{}'
            const blob = new Blob([raw], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'pacetown-save.json'
            a.click()
            URL.revokeObjectURL(url)
            toast('Save exported as JSON')
          }}>Export save (JSON)</button>
          <button className="secondary" type="button" onClick={() => {
            clearState()
            // A wiped save has no onboarding record, so reloading in place
            // would land on the first-run wizard. Start from the front.
            window.location.assign('/')
          }}>Delete local data</button>
          <span className="note">Local-first. Nothing has left this browser.</span>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- town list */

/** Views that exist but have no doorway on the map. */
const OFF_MAP = [
  ['load', 'Daily Load', 'The full calculation and Load Weather'],
  ['briefing', 'Daily Briefing', 'Capacity, energy and today’s check-in'],
  ['keepsakes', 'Pace Keepsakes', 'Turn a quest photo into private pixel art'],
  ['collection', 'Collection', 'Your private keepsake grid'],
] as const

/**
 * The Town List is the keyboard and screen-reader path through the whole game,
 * so it has to be genuinely usable rather than a fallback. It used to be
 * fourteen identical rectangles; now each entry carries who lives there, which
 * is the fastest way to find anything on a map organised by guardian.
 */
export function TownList({ state, load, update, go }: PanelProps) {
  const visit = (place: (typeof PLACES)[number]) => {
    update((s) => ({ ...s, avatar: doorstep(place), facing: 'down' }))
    go(place.view)
  }

  return (
    <div className="card">
      <p className="lede">
        <HelpDot view="townlist" state={state} load={load} />{' '}
        Every spatial interaction has an equivalent here. Nothing on the map is reachable only by
        pointing at it.
      </p>

      <div className="eyebrow tl-head">On the map</div>
      <div className="townlist">
        {PLACES.map((place) => (
          <button key={place.id} type="button" className="tl-row" onClick={() => visit(place)}>
            <span className="tl-face" aria-hidden="true">
              {place.who
                ? <img src={`/game/portraits/${place.who}.webp`} alt="" />
                : <i className="tl-pin" />}
            </span>
            <span className="tl-text">
              <b>{place.name}</b>
              <small>{place.blurb}</small>
            </span>
            {place.who && <span className="tl-who">{GUARDIANS[place.who].name}</span>}
            <span className="tl-go" aria-hidden="true">&rsaquo;</span>
          </button>
        ))}
      </div>

      <div className="eyebrow tl-head">Not on the map</div>
      <div className="townlist">
        {OFF_MAP.map(([view, name, blurb]) => (
          <button key={view} type="button" className="tl-row" onClick={() => go(view)}>
            <span className="tl-face" aria-hidden="true"><i className="tl-pin is-view" /></span>
            <span className="tl-text">
              <b>{name}</b>
              <small>{blurb}</small>
            </span>
            <span className="tl-go" aria-hidden="true">&rsaquo;</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------- calm corner + previews */

const PREVIEWS = [
  ['Firefly Stories', 'firefly', 'Fireflies reveal five short illustrated fragments about rest, uncertainty, loneliness, persistence, and self-kindness.'],
  ['Chime Drift', 'chime', 'Slow notes arrive at a predictable pace. Tap, press a key, or simply watch as each passes the clock hand.'],
  ['Warm Cup', 'warmcup', 'Choose a drink base, pour, stir, and sit by the window. The sequence is unhurried and cannot be ruined.'],
  ['Night Lanterns', 'lanterns', 'Choose a symbol for a concern, light a lantern, and place it in the evening scene.'],
] as const

export function Calm({ state, load, go }: PanelProps) {
  return (
    <div className="card">
      <div className="eyebrow">Calm Corner</div>
      <h2>Regulation without prerequisites <HelpDot view="calm" state={state} load={load} /></h2>
      <p className="lede">
        No load score, active task, or permission needed. Audio starts muted and every cue has a
        visual equivalent.
      </p>
      <div className="opts">
        <button className="opt" type="button" onClick={() => go('ripples')}>
          <span className="k">◉</span>
          <span>Gentle Ripples<small>The paced sensory pause at the fountain</small></span>
        </button>
        {PREVIEWS.map(([name, view, play]) => (
          <button key={name} className="opt" type="button" onClick={() => go(view as 'firefly' | 'chime' | 'warmcup' | 'lanterns')}>
            <span className="k">○</span>
            <span>{name}<small>{play.slice(0, 64)}…</small></span>
          </button>
        ))}
      </div>
      <p className="note" style={{ marginTop: 14 }}>
        All five activities are playable. Each has muted and reduced-motion variants, and leaving
        early is always valid.
      </p>
    </div>
  )
}
