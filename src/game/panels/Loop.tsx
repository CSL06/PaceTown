/**
 * The core loop: intake, understand, make space, choose the work, and the
 * Pace Session itself. Every figure here comes from src/domain.
 */

import { useEffect, useState } from 'react'
import {
  BLOCKERS, DEMO_DESTINATION, EFFORT_WEIGHT, PLAN_TEMPLATES,
  PRIORITY_WEIGHT, URGENCY_WEIGHT, applySelected, bandFor, buildCheckpoints, dailyLoad,
  extractDeliverables, guideLines, guardianFor, parseSchedule, proposeRebalance, REWARDS,
  resolveCheckpoint, sessionReward,
  wakingMinutes, type HelpMode, type Task,
} from '../../domain'
import { grow, record } from '../state'
import { GUARDIANS } from '../layout'
import { Guardian } from './Guardian'
import { HelpDot } from './HelpDot'
import type { PanelProps } from './types'

const AREA_LABEL = {
  time: 'Time', mental: 'Mental', physical: 'Physical', social: 'Social', errands: 'Errands',
} as const

const fmt = (n: number) => n.toFixed(1)

/* ------------------------------------------------------------- intake */

export function Intake({ state, load, update, go, toast }: PanelProps) {
  const parsed = parseSchedule(state.scheduleText)
  // An editable copy of the parse result. Null means "showing the live parse".
  const [draft, setDraft] = useState<Task[] | null>(null)
  const [draftSource, setDraftSource] = useState<string | null>(null)
  const rows = draft ?? parsed.tasks
  const stale = draft !== null && draftSource !== state.scheduleText

  const patchRow = (id: string, patch: Partial<Task>) =>
    setDraft((d) => (d ?? parsed.tasks).map((t) => (t.id === id ? { ...t, ...patch } : t)))

  return (
    <>
      <div className="card">
        <div className="eyebrow">Town Hall · intake</div>
        <h2>Say what your week holds <HelpDot view="intake" state={state} load={load} /></h2>
        <p className="lede">
          Typed in plain language. A deterministic local parser turns it into editable commitments —
          nothing is saved until you approve it, and nothing is interpreted silently.
        </p>
        <div className="field">
          <label htmlFor="sched">Your week</label>
          <textarea id="sched" value={state.scheduleText}
            onChange={(e) => update((s) => ({ ...s, scheduleText: e.target.value }))} />
        </div>
        <p className="note">
          Confidence {parsed.confidence.toFixed(2)} · {parsed.tasks.length} commitments found
        </p>
        {parsed.ambiguities.length > 0 && (
          <div className="capacity">
            <div><span>Assumptions kept visible</span><span>{parsed.ambiguities.length}</span></div>
            {parsed.ambiguities.map((a) => (
              <div key={a} style={{ display: 'block', color: 'var(--faint)' }}>{a}</div>
            ))}
          </div>
        )}
        <div className="actions">
          {draft === null ? (
            <button className="secondary" type="button" onClick={() => {
              setDraft(parsed.tasks.map((t) => ({ ...t })))
              setDraftSource(state.scheduleText)
            }}>Review as editable list</button>
          ) : (
            <>
              <button className="secondary" type="button" onClick={() => {
                setDraft(parsed.tasks.map((t) => ({ ...t })))
                setDraftSource(state.scheduleText)
              }}>Re-parse{stale ? ' (text changed)' : ''}</button>
              <button className="secondary" type="button" onClick={() => setDraft(null)}>
                Back to parse preview
              </button>
            </>
          )}
        </div>
        <div className="scroll">
          <table>
            <thead><tr><th>Commitment</th><th>Area</th><th>Type</th><th className="num">Minutes</th><th>Day</th><th /></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    {draft === null ? t.title : (
                      <input aria-label={`Title for ${t.id}`} value={t.title}
                        onChange={(e) => patchRow(t.id, { title: e.target.value })}
                        style={{ width: '100%' }} />
                    )}
                  </td>
                  <td>{draft === null ? AREA_LABEL[t.category] : (
                    <select aria-label={`Area for ${t.title}`} value={t.category}
                      onChange={(e) => patchRow(t.id, { category: e.target.value as Task['category'] })}>
                      {(Object.keys(AREA_LABEL) as (keyof typeof AREA_LABEL)[]).map((k) => (
                        <option key={k} value={k}>{AREA_LABEL[k]}</option>
                      ))}
                    </select>
                  )}</td>
                  <td>{draft === null ? t.flexibility : (
                    <select aria-label={`Type for ${t.title}`} value={t.flexibility}
                      onChange={(e) => patchRow(t.id, { flexibility: e.target.value as Task['flexibility'] })}>
                      <option value="fixed">fixed</option>
                      <option value="flexible">flexible</option>
                    </select>
                  )}</td>
                  <td className="num">{draft === null ? t.estimatedMinutes : (
                    <input aria-label={`Minutes for ${t.title}`} type="number" min={5} max={480}
                      value={t.estimatedMinutes} style={{ width: 64 }}
                      onChange={(e) => patchRow(t.id, {
                        estimatedMinutes: Math.max(5, Math.min(480, Number(e.target.value) || 5)),
                      })} />
                  )}</td>
                  <td>{draft === null ? t.day : (
                    <select aria-label={`Day for ${t.title}`} value={t.day}
                      onChange={(e) => patchRow(t.id, { day: e.target.value })}>
                      <option value="thu">Thu</option>
                      <option value="sat">Sat</option>
                    </select>
                  )}</td>
                  <td>{draft !== null && (
                    <button className="secondary" type="button" aria-label={`Remove ${t.title}`}
                      onClick={() => setDraft((d) => (d ?? []).filter((x) => x.id !== t.id))}>✕</button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="actions">
          <button className="primary" type="button" onClick={() => {
            const saving = (draft ?? parsed.tasks).filter((t) => t.title.trim().length > 0)
            update((s) => record({
              ...s, tasks: saving, rebalanceSeen: false, rebalanceApproved: false,
              // A new week means a new loop: drop plan, session and recovery
              // progress tied to the old tasks. Journal and earnings stay.
              blocker: null, checkpoints: [], activeCheckpointId: null, activeTaskId: null,
              outcome: null, savedSessionKey: null, questOutcome: null, recoveryDone: false,
              rippleTaps: 0, pocket: { path: null, outcome: null, confirmation: null, verification: null },
              ripples: { taps: 0, response: null, lastAt: null },
              session: { ...s.session, elapsedSec: 0, pausedFrom: null },
            },
              'Saved parsed commitments',
              `${saving.length} commitments reviewed and approved before saving.`))
            setDraft(null)
            toast('Commitments saved')
            go('understand')
          }}>Save these commitments</button>
          <span className="note">Everything stays editable after saving.</span>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Assignment brief — optional</div>
        <h2 style={{ fontSize: 17 }}>Paste a brief, keep the plan <HelpDot view="intake" state={state} load={load} /></h2>
        <p className="lede">
          You never have to upload anything. Deliverables are pulled out with plain pattern matching,
          and every one stays editable — extracted text never becomes your work.
        </p>
        <div className="field">
          <label htmlFor="brief">The brief</label>
          <textarea id="brief" value={state.brief}
            onChange={(e) => update((s) => ({ ...s, brief: e.target.value }))} />
        </div>
        <div className="actions">
          <button className="secondary" type="button" onClick={() => {
            const found = extractDeliverables(state.brief)
            update((s) => ({ ...s, deliverables: found }))
            toast(`${found.length} deliverables extracted`)
          }}>Extract deliverables</button>
        </div>
        {state.deliverables.length > 0 && (
          <ul style={{ marginTop: 14, paddingLeft: 18, color: 'var(--dim)', fontSize: 13 }}>
            {state.deliverables.map((d) => <li key={d}>{d}</li>)}
          </ul>
        )}
      </div>
    </>
  )
}

/* --------------------------------------------------------- understand */

export function Understand({ state, load, go }: PanelProps) {
  const totalMinutes = load.contributors.reduce((sum, c) => sum + c.task.estimatedMinutes, 0)
  return (
    <div className="card">
      <div className="eyebrow">Understand</div>
      <h2>Thursday is at {fmt(load.percentage)}% <HelpDot view="understand" state={state} load={load} /></h2>
      <p className="lede">
        Every number is computed, not written in. The formula is{' '}
        <span className="mono">(fixed minutes + weighted flexible minutes) ÷ waking minutes × 100</span>.
        Flexible minutes are weighted by priority, mental effort and urgency. Fixed commitments count once at their full duration.
      </p>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>Flexible task</th><th>Area</th><th className="num">Est. min</th><th className="num">Weighted</th></tr>
          </thead>
          <tbody>
            {load.contributors.map(({ task, weighted }) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  <span className="arith">
                    {task.estimatedMinutes} × {PRIORITY_WEIGHT[task.priority].toFixed(2)} ×{' '}
                    {EFFORT_WEIGHT[task.mentalEffort].toFixed(2)} × {URGENCY_WEIGHT[task.urgency].toFixed(2)}
                  </span>
                </td>
                <td>{AREA_LABEL[task.category]}</td>
                <td className="num">{task.estimatedMinutes}</td>
                <td className="num">{fmt(weighted)}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Total weighted demand</td><td />
              <td className="num">{totalMinutes}</td>
              <td className="num">{fmt(load.weightedDemand)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="actions">
        <button className="primary" type="button" onClick={() => go('rebalance')}>See what can move</button>
        <span className="note">Nothing has been changed yet. {state.tasks.length} commitments in total.</span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- rebalance */

export function Rebalance({ state, load, update, go, toast }: PanelProps) {
  const waking = wakingMinutes(state.capacity)
  const proposal = proposeRebalance(state.tasks, {
    day: 'thu', destination: DEMO_DESTINATION, waking,
  })
  const locked = state.tasks.filter((t) => t.day === 'thu' && t.flexibility === 'fixed')
  // Null means "all proposed moves selected".
  const [selected, setSelected] = useState<string[] | null>(null)
  const selectedIds = selected ?? proposal.moves.map((m) => m.taskId)
  const selectedMoves = proposal.moves.filter((m) => selectedIds.includes(m.taskId))
  const afterThu = dailyLoad(applySelected(state.tasks, proposal, selectedIds), 'thu', waking)

  const toggle = (id: string) => setSelected((s) => {
    const current = s ?? proposal.moves.map((m) => m.taskId)
    return current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  })

  if (state.rebalanceSeen) {
    return (
      <div className="card">
        <div className="eyebrow">Rebalance Workshop</div>
        <h2>Thursday is now {fmt(load.percentage)}% <HelpDot view="rebalance" state={state} load={load} /></h2>
        <p className="lede">Heavy means a full day, not a failed one — one checkpoint still fits.</p>
        <Guardian who="kai" says="Moving things cannot help further. What is left is real work — shall we make it smaller?" />
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('work')}>Handle what remains</button>
        </div>
      </div>
    )
  }

  if (proposal.moves.length === 0) {
    return (
      <div className="card">
        <div className="eyebrow">Rebalance Workshop</div>
        <h2>Nothing can safely move <HelpDot view="rebalance" state={state} load={load} /></h2>
        <p className="lede">Every flexible task is either due too soon or already placed well.</p>
        <div className="actions">
          <button className="primary" type="button"
            onClick={() => { update((s) => ({ ...s, rebalanceSeen: true })); go('work') }}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  const satBefore = dailyLoad(state.tasks, DEMO_DESTINATION, waking).percentage
  const satAfter = dailyLoad(applySelected(state.tasks, proposal, selectedIds), DEMO_DESTINATION, waking).percentage

  const DayCard = ({ name, before, after }: { name: string; before: number; after: number }) => (
    <div className="day">
      <div className="eyebrow">{name}</div>
      <div className="row">
        <span className="was">{fmt(before)}%</span>
        <span className="now" style={{ color: `var(--${bandFor(after).key})` }}>{fmt(after)}%</span>
      </div>
      <div className="eyebrow" style={{ marginTop: 6 }}>{bandFor(after).label}</div>
    </div>
  )

  return (
    <div className="card">
      <div className="eyebrow">Rebalance Workshop</div>
      <h2>Kai has a proposal <HelpDot view="rebalance" state={state} load={load} /></h2>
      <Guardian who="kai" says={`I can move ${proposal.moves.length} things. Fixed times stay, deadlines hold, and nothing has moved yet.`} />

      {proposal.moves.map((m) => {
        const task = state.tasks.find((t) => t.id === m.taskId)!
        const on = selectedIds.includes(m.taskId)
        return (
          <label className="move" key={m.taskId} style={{ opacity: on ? 1 : 0.55 }}>
            <input type="checkbox" checked={on} onChange={() => toggle(m.taskId)}
              aria-label={`Move ${m.title} to Saturday`} />
            <span>{m.title}
              <small>Thursday · {task.estimatedMinutes} min · due in {task.deadlineDays} days</small>
            </span>
            <span className="arrow" aria-hidden="true">→</span>
            <span>Saturday<small>within deadline · {fmt(m.weightedMinutes)} weighted min moved</small></span>
          </label>
        )
      })}

      <div className="ba">
        <DayCard name="Thursday" before={proposal.before.percentage} after={afterThu.percentage} />
        <DayCard name="Saturday" before={satBefore} after={satAfter} />
      </div>

      <div className="locked-note">
        <b>Locked, not moved:</b>
        {locked.map((t) => <span key={t.id}>· {t.title} (locked)</span>)}
      </div>

      <div className="actions">
        <button className="primary" type="button" disabled={selectedMoves.length === 0} onClick={() => {
          const applied = applySelected(state.tasks, proposal, selectedIds)
          const titles = selectedMoves.map((m) => m.title).join(', ')
          update((s) => grow(record({
            ...s, tasks: applied, rebalanceSeen: true, rebalanceApproved: true,
          },
            'Rebalanced an overloaded day',
            `${titles} — moved to Saturday. ` +
            `Thursday ${fmt(proposal.before.percentage)}% → ${fmt(afterThu.percentage)}%.`,
            REWARDS.rebalance)))
          toast(`Rebalanced · +${REWARDS.rebalance.xp} XP`)
        }}>Approve {selectedMoves.length === proposal.moves.length
          ? `these ${selectedMoves.length} moves`
          : `${selectedMoves.length} of ${proposal.moves.length} moves`}</button>
        <button className="secondary" type="button" onClick={() => {
          update((s) => record({ ...s, rebalanceSeen: true },
            'Declined the rebalance proposal', 'The week was left exactly as it was.'))
          go('work')
        }}>Reject — leave my week alone</button>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- choose work */

export function Work({ state, load, update, go }: PanelProps) {
  const candidates = load.contributors.map((c) => c.task)
  const [taskId, setTaskId] = useState<string | null>(null)
  const task = candidates.find((t) => t.id === taskId) ?? candidates[0]
  if (!task) {
    return (
      <div className="card">
        <h2>No flexible work left on Thursday <HelpDot view="work" state={state} load={load} /></h2>
        <p className="lede">Everything is locked, moved, or done. Review the week to add more.</p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('intake')}>Review commitments</button>
        </div>
      </div>
    )
  }

  const active = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const template = state.blocker ? PLAN_TEMPLATES[state.blocker] : null

  return (
    <div className="card">
      <div className="eyebrow">Library · choose the work</div>
      {candidates.length > 1 && (
        <div className="field">
          <label htmlFor="workTask">Which commitment</label>
          <select id="workTask" value={task.id}
            onChange={(e) => {
              const id = e.target.value
              setTaskId(id)
              // A new commitment means a new plan: rebuild checkpoints for it
              // instead of showing the old task's plan under the new header.
              const next = candidates.find((t) => t.id === id)
              update((s) => s.blocker && next ? {
                ...s, activeTaskId: next.id,
                checkpoints: buildCheckpoints(s.blocker, { taskTitle: next.title, deliverables: s.deliverables }),
                activeCheckpointId: null, outcome: null, savedSessionKey: null,
              } : s)
            }}>
            {candidates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} · {t.estimatedMinutes} min
              </option>
            ))}
          </select>
        </div>
      )}
      <h2>{task.title} <HelpDot view="work" state={state} load={load} /></h2>
      <p className="lede">
        {task.estimatedMinutes} estimated minutes · the largest single contributor to Thursday.
        Before it becomes a plan, PaceTown asks what is actually in the way.
      </p>

      <div className="opts" role="group" aria-label="What is blocking this">
        {BLOCKERS.map((b, i) => (
          <button key={b.id} className="opt" type="button" aria-pressed={state.blocker === b.id}
            onClick={() => update((s) => ({
              ...s, blocker: b.id, activeTaskId: task.id,
              checkpoints: buildCheckpoints(b.id, { taskTitle: task.title, deliverables: s.deliverables }),
              activeCheckpointId: null,
            }))}>
            <span className="k">{String.fromCharCode(65 + i)}</span>
            <span>{b.label}<small>{b.hint}</small></span>
          </button>
        ))}
      </div>

      {template && (
        <>
          <Guardian who={template.guardian} says={template.opener} />
          <div className="eyebrow" style={{ marginTop: 16 }}>Editable work plan · local template, no AI</div>
          {state.deliverables.length > 0 && (
            <p className="note" style={{ marginTop: 6 }}>From your brief: {state.deliverables.join(' · ')}</p>
          )}
          <div style={{ marginTop: 10 }}>
            {state.checkpoints.every((c) => c.status === 'completed') && state.checkpoints.length > 0 && (
              <p className="note" style={{ marginBottom: 8 }}>
                Every checkpoint here reads completed. Add one below, or pick another commitment above.
              </p>
            )}
            {state.checkpoints.map((c, index) => (
              <div key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'stretch', marginTop: 8 }}>
                <button className="cp" type="button" aria-pressed={state.activeCheckpointId === c.id}
                  style={{ flex: 1 }}
                  onClick={() => update((s) => ({ ...s, activeCheckpointId: c.id }))}>
                  <span className="cp-head">
                    <strong>{c.title}</strong>
                    <span className="mins">
                      {c.status && c.status !== 'pending' ? `${c.status} · ` : ''}{c.estimatedMinutes} min
                    </span>
                  </span>
                  <span className="dod"><b>Done when:</b> {c.definitionOfDone}</span>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button className="secondary" type="button" aria-label={`Move ${c.title} up`}
                    disabled={index === 0} style={{ padding: '4px 8px' }}
                    onClick={() => update((s) => {
                      const list = [...s.checkpoints]
                      const [item] = list.splice(index, 1)
                      list.splice(index - 1, 0, item)
                      return { ...s, checkpoints: list }
                    })}>↑</button>
                  <button className="secondary" type="button" aria-label={`Move ${c.title} down`}
                    disabled={index === state.checkpoints.length - 1} style={{ padding: '4px 8px' }}
                    onClick={() => update((s) => {
                      const list = [...s.checkpoints]
                      const [item] = list.splice(index, 1)
                      list.splice(index + 1, 0, item)
                      return { ...s, checkpoints: list }
                    })}>↓</button>
                  <button className="secondary" type="button" aria-label={`Remove ${c.title}`}
                    style={{ padding: '4px 8px' }}
                    onClick={() => update((s) => ({
                      ...s,
                      checkpoints: s.checkpoints.filter((x) => x.id !== c.id),
                      activeCheckpointId: s.activeCheckpointId === c.id ? null : s.activeCheckpointId,
                    }))}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="actions">
            <button className="secondary" type="button" onClick={() => {
              const id = `manual-${Date.now()}`
              update((s) => ({
                ...s,
                checkpoints: [...s.checkpoints, {
                  id, title: 'My own checkpoint', definitionOfDone: 'I decide what finished looks like.',
                  estimatedMinutes: 15, status: 'pending' as const,
                }],
                activeCheckpointId: id,
              }))
            }}>Add my own checkpoint</button>
          </div>
        </>
      )}

      {active && state.blocker && (
        <>
          <div className="field">
            <label htmlFor="cpTitle">Rewrite this checkpoint</label>
            <input id="cpTitle" value={active.title} onChange={(e) => update((s) => ({
              ...s,
              checkpoints: s.checkpoints.map((c) => c.id === active.id ? { ...c, title: e.target.value } : c),
            }))} />
          </div>
          <div className="field">
            <label htmlFor="cpMins">Minutes</label>
            <input id="cpMins" type="number" min={5} max={180} value={active.estimatedMinutes}
              onChange={(e) => update((s) => ({
                ...s,
                checkpoints: s.checkpoints.map((c) => c.id === active.id
                  ? { ...c, estimatedMinutes: Math.max(5, Math.min(180, Number(e.target.value) || 5)) } : c),
              }))} />
          </div>
          <div className="field">
            <label htmlFor="cpDod">What finished looks like</label>
            <textarea id="cpDod" value={active.definitionOfDone} rows={2}
              onChange={(e) => update((s) => ({
                ...s,
                checkpoints: s.checkpoints.map((c) => c.id === active.id
                  ? { ...c, definitionOfDone: e.target.value } : c),
              }))} />
          </div>
          <div className="actions">
            <button className="primary" type="button" onClick={() => {
              update((s) => record({
                ...s,
                activeTaskId: task.id,
                outcome: null,
                savedSessionKey: null,
                session: { ...s.session, elapsedSec: 0, pausedFrom: null },
              }, 'Began a planned Pace Session',
              `Checkpoint: ${active.title} · blocker identified before starting.`,
              REWARDS.beginSession))
              go('session')
            }}>Start a Pace Session with {GUARDIANS[PLAN_TEMPLATES[state.blocker].guardian].name}</button>
            <span className="note">Shorten it, rewrite it, or reject the whole plan.</span>
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------- pace session */

const HELP_MODES: readonly HelpMode[] = ['Plan', 'Explain', 'Brainstorm', 'Review', 'Debug', 'What next?']

const fmtClock = (totalSec: number) => {
  const s = Math.max(0, Math.floor(totalSec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function Session({ state, load, update, go, toast }: PanelProps) {
  const active = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const [ticking, setTicking] = useState(false)

  useEffect(() => {
    if (!ticking) return
    const id = window.setInterval(() => {
      update((s) => {
        const elapsed = s.session.elapsedSec + 1
        if (s.session.timerMode === 'down' && elapsed >= s.session.timerLenSec) {
          window.clearInterval(id)
          setTicking(false)
          toast('Timebox reached — the checkpoint stays open. Only you can complete it.')
        }
        return { ...s, session: { ...s.session, elapsedSec: elapsed } }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [ticking, update, toast])

  if (!active || !state.blocker) {
    return (
      <div className="card">
        <h2>Pick a checkpoint first <HelpDot view="session" state={state} load={load} /></h2>
        <p className="lede">Sessions attach to one concrete checkpoint with a definition of done.</p>
        <div className="actions">
          <button className="primary" type="button" onClick={() => go('work')}>Choose the work</button>
        </div>
      </div>
    )
  }
  const guardian = guardianFor(state.blocker)
  const help = state.session.helpMode as HelpMode | null
  const ses = state.session
  const remaining = ses.timerLenSec - ses.elapsedSec
  const sessionTask = state.tasks.find((t) => t.id === state.activeTaskId)
    ?? load.contributors[0]?.task ?? null
  const guideCtx = {
    taskTitle: sessionTask?.title,
    checkpointTitle: active.title,
    checkpointMinutes: active.estimatedMinutes,
    definitionOfDone: active.definitionOfDone,
    deliverables: state.deliverables,
  }

  return (
    <div className="card">
      <div className="eyebrow">Pace Session</div>
      <h2>One checkpoint at a time <HelpDot view="session" state={state} load={load} /></h2>

      <div className="capacity" style={{ borderColor: 'var(--accent)' }}>
        <div><span>Current checkpoint</span><span>{active.estimatedMinutes} min planned</span></div>
      </div>
      <h3 style={{ fontSize: 17, marginTop: 10 }}>{active.title}</h3>
      <p className="dod"><b>Done when:</b> {active.definitionOfDone}</p>
      {sessionTask && (
        <p className="note" style={{ marginTop: 6 }}>Working on: <b>{sessionTask.title}</b></p>
      )}

      <div className="eyebrow" style={{ marginTop: 18 }}>Timer — optional, never decisive</div>
      <div className="capacity">
        <div>
          <span>
            <select aria-label="Timer mode" value={ses.timerMode}
              onChange={(e) => {
                setTicking(false)
                update((s) => ({
                  ...s,
                  session: { ...s.session, timerMode: e.target.value as typeof ses.timerMode },
                }))
              }}>
              <option value="none">Untimed</option>
              <option value="up">Count up</option>
              <option value="down">Count down</option>
            </select>
            {ses.timerMode === 'down' && (
              <select aria-label="Timebox length" value={ses.timerLenSec}
                onChange={(e) => update((s) => ({
                  ...s, session: { ...s.session, timerLenSec: Number(e.target.value) },
                }))}>
                {[10, 15, 20, 25, 45].map((m) => (
                  <option key={m} value={m * 60}>{m} min</option>
                ))}
              </select>
            )}
          </span>
          <span className="mono" aria-live="off">
            {ses.timerMode === 'down' ? fmtClock(remaining) : fmtClock(ses.elapsedSec)}
          </span>
        </div>
      </div>
      {ses.timerMode !== 'none' && (
        <div className="actions">
          <button className="secondary" type="button" onClick={() => setTicking((t) => !t)}>
            {ticking ? 'Pause timer' : ses.elapsedSec > 0 ? 'Resume timer' : 'Start timer'}
          </button>
          <button className="secondary" type="button" onClick={() => {
            setTicking(false)
            update((s) => ({ ...s, session: { ...s.session, elapsedSec: 0 } }))
          }}>Reset</button>
        </div>
      )}

      <div className="field">
        <label htmlFor="scratch">Scratchpad — notes, links, excerpts</label>
        <textarea id="scratch" rows={3} value={ses.scratchpad} placeholder="Nothing here needs to be tidy."
          onChange={(e) => update((s) => ({
            ...s, session: { ...s.session, scratchpad: e.target.value },
          }))} />
      </div>

      <div className="eyebrow" style={{ marginTop: 18 }}>Ask {GUARDIANS[guardian].name}</div>
      <div className="opts" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
        {HELP_MODES.map((mode) => (
          <button key={mode} className="opt" type="button" style={{ gridTemplateColumns: '1fr' }}
            aria-pressed={help === mode}
            onClick={() => update((s) => ({
              ...s, session: { ...s.session, helpMode: s.session.helpMode === mode ? null : mode },
            }))}>
            <span>{mode}</span>
          </button>
        ))}
      </div>
      {help && (
        <div className="capacity" style={{ borderLeft: '2px solid var(--mental)' }}>
          <div><span>{GUARDIANS[guardian].name} · local guidance for this task, no AI provider connected</span></div>
          {guideLines(state.blocker, help, guideCtx, guardianFor(state.blocker)).map((p) => (
            <div key={p} style={{ display: 'block', color: 'var(--dim)', marginTop: 6 }}>{p}</div>
          ))}
        </div>
      )}

      <div className="eyebrow" style={{ marginTop: 20 }}>Stuck? These are always available</div>
      <div className="actions">
        <button className="secondary" type="button" onClick={() => {
          update((s) => ({ ...s, session: { ...s.session, pausedFrom: 'session' } }))
          go('recover')
        }}>Pause &amp; regulate</button>
        <button className="secondary" type="button" onClick={() => {
          update((s) => ({
            ...s,
            checkpoints: s.checkpoints.map((c) => c.id === active.id
              ? { ...c, estimatedMinutes: Math.max(5, Math.floor(c.estimatedMinutes / 2)) } : c),
          }))
          toast('Scope reduced — the rest keeps its place in the week.')
        }}>Reduce the scope</button>
        <button className="secondary" type="button"
          onClick={() => {
            update((s) => ({ ...s, outcome: 'rescheduled' }))
            toast('Marked rescheduled — Save and leave to record it.')
          }}>Reschedule</button>
      </div>

      <div className="eyebrow" style={{ marginTop: 20 }}>End the session — every outcome is valid</div>
      <div className="outcomes">
        {(['completed', 'partial', 'blocked', 'rescheduled'] as const).map((o) => (
          <button key={o} type="button" aria-pressed={state.outcome === o}
            onClick={() => update((s) => ({ ...s, outcome: o }))}>
            {o === 'partial' ? 'Partial progress' : o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        ))}
      </div>

      <div className="field">
        <label htmlFor="pn">What changed</label>
        <input id="pn" value={state.progressNote}
          onChange={(e) => update((s) => ({ ...s, progressNote: e.target.value }))} />
      </div>
      <div className="field">
        <label htmlFor="na">The easiest next starting action</label>
        <input id="na" value={state.nextAction}
          onChange={(e) => update((s) => ({ ...s, nextAction: e.target.value }))} />
      </div>

      <div className="actions">
        <button className="primary" type="button"
          disabled={!state.outcome || state.savedSessionKey === `${active.id}:${state.outcome}`} onClick={() => {
          const outcome = state.outcome!
          const label = { completed: 'Completed', partial: 'Made partial progress on',
            blocked: 'Identified a blocker on', rescheduled: 'Rescheduled' }[outcome]
          setTicking(false)
          update((s) => {
            const withStatus = {
              ...s, checkpoints: resolveCheckpoint(s.checkpoints, active.id, outcome),
              savedSessionKey: `${active.id}:${outcome}`,
            }
            return grow(record(
              record(withStatus, `${label} “${active.title}”`, s.progressNote, sessionReward(outcome)),
              'Saved a clear next action', s.nextAction, REWARDS.savedNextAction,
            ))
          })
          update((s) => ({ ...s, session: { ...s.session, pausedFrom: null } }))
          toast('Session saved · next action recorded')
          go('recover')
        }}>Save and leave</button>
        <span className="note">A timer running out never completes a checkpoint.</span>
      </div>
    </div>
  )
}
