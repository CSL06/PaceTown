/**
 * The core loop: intake, understand, make space, choose the work, and the
 * Pace Session itself. Every figure here comes from src/domain.
 */

import {
  BLOCKERS, DEMO_DESTINATION, DEMO_DESTINATION_CAPACITY, EFFORT_WEIGHT, PLAN_TEMPLATES,
  PRIORITY_WEIGHT, URGENCY_WEIGHT, applyRebalance, bandFor, buildCheckpoints, dailyLoad,
  extractDeliverables, guardianFor, parseSchedule, proposeRebalance, REWARDS, sessionReward,
  wakingMinutes, weightedDemand,
} from '../../domain'
import { grow, record } from '../state'
import { Guardian } from './Guardian'
import type { PanelProps } from './types'

const AREA_LABEL = {
  time: 'Time', mental: 'Mental', physical: 'Physical', social: 'Social', errands: 'Errands',
} as const

const fmt = (n: number) => n.toFixed(1)

/* ------------------------------------------------------------- intake */

export function Intake({ state, update, go, toast }: PanelProps) {
  const parsed = parseSchedule(state.scheduleText)

  return (
    <>
      <div className="card">
        <div className="eyebrow">Town Hall · intake</div>
        <h2>Say what your week holds</h2>
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
        <div className="scroll">
          <table>
            <thead><tr><th>Commitment</th><th>Area</th><th>Type</th><th className="num">Minutes</th></tr></thead>
            <tbody>
              {parsed.tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{AREA_LABEL[t.category]}</td>
                  <td>{t.flexibility}</td>
                  <td className="num">{t.estimatedMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="actions">
          <button className="primary" type="button" onClick={() => {
            update((s) => record({ ...s, tasks: parsed.tasks, rebalanceSeen: false, rebalanceApproved: false },
              'Saved parsed commitments',
              `${parsed.tasks.length} commitments reviewed and approved before saving.`))
            toast('Commitments saved')
            go('understand')
          }}>Save these commitments</button>
          <span className="note">Everything stays editable after saving.</span>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Assignment brief — optional</div>
        <h2 style={{ fontSize: 17 }}>Paste a brief, keep the plan</h2>
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
      <h2>Thursday is at {fmt(load.percentage)}%</h2>
      <p className="lede">
        Every number is computed, not written in. The formula is{' '}
        <span className="mono">estimated minutes × priority × mental effort × urgency</span>, divided
        by the minutes your fixed commitments leave behind.
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

  if (state.rebalanceSeen) {
    return (
      <div className="card">
        <div className="eyebrow">Rebalance Workshop</div>
        <h2>Thursday is now {fmt(load.percentage)}%</h2>
        <Guardian who="kai" says="That is as far as moving things will take you. What is left is real work, and it still has to be done. Shall we make it smaller?" />
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
        <h2>Nothing can safely move</h2>
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

  const moved = proposal.moves.reduce((sum, m) => sum + m.weightedMinutes, 0)
  const satBefore = (DEMO_DESTINATION_CAPACITY.committedWeighted / DEMO_DESTINATION_CAPACITY.wakingMinutes) * 100
  const satAfter = ((DEMO_DESTINATION_CAPACITY.committedWeighted + moved) / DEMO_DESTINATION_CAPACITY.wakingMinutes) * 100

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
      <h2>Kai has a proposal</h2>
      <Guardian who="kai" says={`I can move ${proposal.moves.length} things. I will not touch anything with a fixed time, and I will not push work past its deadline. Nothing has moved yet.`} />

      {proposal.moves.map((m) => {
        const task = state.tasks.find((t) => t.id === m.taskId)!
        return (
          <div className="move" key={m.taskId}>
            <span>{m.title}
              <small>Thursday · {task.estimatedMinutes} min · due in {task.deadlineDays} days</small>
            </span>
            <span className="arrow" aria-hidden="true">→</span>
            <span>Saturday<small>within deadline · {fmt(m.weightedMinutes)} weighted min moved</small></span>
          </div>
        )
      })}

      <div className="ba">
        <DayCard name="Thursday" before={proposal.before.percentage} after={proposal.after.percentage} />
        <DayCard name="Saturday" before={satBefore} after={satAfter} />
      </div>

      <div className="locked-note">
        <b>Locked, not moved:</b>
        {locked.map((t) => <span key={t.id}>🔒 {t.title}</span>)}
      </div>

      <div className="actions">
        <button className="primary" type="button" onClick={() => {
          const applied = applyRebalance(state.tasks, proposal)
          update((s) => grow(record({
            ...s, tasks: applied, rebalanceSeen: true, rebalanceApproved: true,
          },
            'Rebalanced an overloaded day',
            `${proposal.moves.map((m) => m.title).join(', ')} — moved to Saturday. ` +
            `Thursday ${fmt(proposal.before.percentage)}% → ${fmt(proposal.after.percentage)}%.`,
            REWARDS.rebalance)))
          toast(`Rebalanced · +${REWARDS.rebalance.xp} XP`)
        }}>Approve these {proposal.moves.length} moves</button>
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
  const task = load.contributors[0]?.task
  if (!task) return <div className="card"><h2>No flexible work left on Thursday</h2></div>

  const active = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const template = state.blocker ? PLAN_TEMPLATES[state.blocker] : null

  return (
    <div className="card">
      <div className="eyebrow">Library · choose the work</div>
      <h2>{task.title}</h2>
      <p className="lede">
        {task.estimatedMinutes} estimated minutes · the largest single contributor to Thursday.
        Before it becomes a plan, PaceTown asks what is actually in the way.
      </p>

      <div className="opts" role="group" aria-label="What is blocking this">
        {BLOCKERS.map((b, i) => (
          <button key={b.id} className="opt" type="button" aria-pressed={state.blocker === b.id}
            onClick={() => update((s) => ({
              ...s, blocker: b.id, checkpoints: buildCheckpoints(b.id), activeCheckpointId: null,
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
            {state.checkpoints.map((c) => (
              <button key={c.id} className="cp" type="button" aria-pressed={state.activeCheckpointId === c.id}
                onClick={() => update((s) => ({ ...s, activeCheckpointId: c.id }))}>
                <span className="cp-head">
                  <strong>{c.title}</strong><span className="mins">{c.estimatedMinutes} min</span>
                </span>
                <span className="dod"><b>Done when:</b> {c.definitionOfDone}</span>
              </button>
            ))}
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
          <div className="actions">
            <button className="primary" type="button" onClick={() => {
              update((s) => record(s, 'Began a planned Pace Session',
                `Checkpoint: ${active.title} · blocker identified before starting.`,
                REWARDS.beginSession))
              go('session')
            }}>Start a Pace Session with {PLAN_TEMPLATES[state.blocker].guardian}</button>
            <span className="note">Shorten it, rewrite it, or reject the whole plan.</span>
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------- pace session */

const HELP_MODES = ['Plan', 'Explain', 'Brainstorm', 'Review', 'Debug', 'What next?'] as const

const GUIDANCE: Record<string, string[]> = {
  Plan: ['Start with the nouns in the brief. Every noun that has to be stored is a candidate entity.'],
  Explain: [
    'A many-to-many relationship means a row on each side can match many rows on the other. A student takes many courses; a course holds many students.',
    'A relational table cannot store that directly. You introduce a junction entity that holds one row per pairing.',
  ],
  Brainstorm: ['Candidates: Student, Course, Enrolment, Lecturer, Department, Semester, Assessment. Cross out any your brief never mentions.'],
  Review: ['Check each relationship for direction and cardinality. Any many-to-many still drawn as a direct line is the thing to fix next.'],
  Debug: ['If two entities both seem to own the same attribute, it usually belongs to the relationship between them. Enrolment date belongs to Enrolment.'],
  'What next?': ['You have listed the entities. The smallest next action is to name the junction entity between Student and Course.'],
}

export function Session({ state, update, go, toast }: PanelProps) {
  const active = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  if (!active || !state.blocker) {
    return <div className="card"><h2>Pick a checkpoint first</h2></div>
  }
  const guardian = guardianFor(state.blocker)
  const help = state.notes.startsWith('__help:') ? state.notes.slice(7).split('\n')[0] : null

  return (
    <div className="card">
      <div className="eyebrow">Pace Session</div>
      <h2>One checkpoint at a time</h2>

      <div className="capacity" style={{ borderColor: 'var(--accent)' }}>
        <div><span>Current checkpoint</span><span>{active.estimatedMinutes} min planned</span></div>
      </div>
      <h3 style={{ fontSize: 17, marginTop: 10 }}>{active.title}</h3>
      <p className="dod"><b>Done when:</b> {active.definitionOfDone}</p>

      <div className="eyebrow" style={{ marginTop: 18 }}>Ask {guardian}</div>
      <div className="opts" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
        {HELP_MODES.map((mode) => (
          <button key={mode} className="opt" type="button" style={{ gridTemplateColumns: '1fr' }}
            onClick={() => update((s) => ({ ...s, notes: `__help:${mode}` }))}>
            <span>{mode}</span>
          </button>
        ))}
      </div>
      {help && GUIDANCE[help] && (
        <div className="capacity" style={{ borderLeft: '2px solid var(--mental)' }}>
          <div><span>{guardian} · local guidance, no AI provider connected</span></div>
          {GUIDANCE[help].map((p) => (
            <div key={p} style={{ display: 'block', color: 'var(--dim)', marginTop: 6 }}>{p}</div>
          ))}
        </div>
      )}

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
        <button className="primary" type="button" disabled={!state.outcome} onClick={() => {
          const outcome = state.outcome!
          const label = { completed: 'Completed', partial: 'Made partial progress on',
            blocked: 'Identified a blocker on', rescheduled: 'Rescheduled' }[outcome]
          update((s) => grow(record(
            record(s, `${label} “${active.title}”`, s.progressNote, sessionReward(outcome)),
            'Saved a clear next action', s.nextAction, REWARDS.savedNextAction,
          )))
          toast('Session saved · next action recorded')
          go('recover')
        }}>Save and leave</button>
        <span className="note">A timer running out never completes a checkpoint.</span>
      </div>
    </div>
  )
}
