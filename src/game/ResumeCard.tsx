/**
 * The guardian-voiced resume ritual: task, checkpoint, time spent, next action
 * and last time's recorded progress, with resume / edit / something-else.
 * No shame or history content.
 */
import { effectiveGuardian } from '../domain'
import { type ViewId } from './layout'
import { Guardian } from './panels/Guardian'
import type { GameState } from './state'

function fmtSpent(totalSec: number): string {
  const minutes = Math.floor(Math.max(0, totalSec) / 60)
  return minutes < 1 ? 'just opened' : `${minutes} min so far`
}

/* The outcome label only renders when an outcome is banked alongside an open
   checkpoint. Currently unreachable from the HUD, which gates ResumeCard
   behind `activeCheckpoint && !state.outcome` — kept as component-level
   behavior, exercised only by component tests. */
const OUTCOME_LABEL = {
  completed: 'Completed', partial: 'Partial progress',
  blocked: 'Blocked', rescheduled: 'Rescheduled',
} as const

export function ResumeCard({ state, go }: { state: GameState; go: (view: ViewId | null) => void }) {
  const guardian = effectiveGuardian(state.blocker, state.guardianOverride)
  const checkpoint = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const task = state.tasks.find((t) => t.id === state.activeTaskId)
  const next = (state.nextAction ?? '').trim()
  const last = (state.progressNote ?? '').trim()
  const lastLabel = state.outcome ? OUTCOME_LABEL[state.outcome] : null
  return (
    <div>
      <div className="eyebrow">Where you left off</div>
      <Guardian who={guardian} says={`Back to “${task?.title ?? 'your task'}”.`} />
      <h3>{task?.title ?? 'your task'}</h3>
      <p><b>{checkpoint?.title ?? 'Your checkpoint'}</b> · {fmtSpent(state.session.elapsedSec)}</p>
      <p>{next ? `Next action: ${next}` : 'No next action saved yet.'}</p>
      {last && <p>Last time{lastLabel ? ` (${lastLabel})` : ''}: {last}</p>}
      <div className="qa">
        <button className="go" type="button" onClick={() => go('session')}>Resume</button>
        <button type="button" onClick={() => go('work')}>Edit plan</button>
        <button type="button" onClick={() => go('townlist')}>Something else</button>
      </div>
    </div>
  )
}
