/**
 * The guardian-voiced resume ritual: task, checkpoint, time spent and next
 * action, with resume / edit / something-else. No shame or history content.
 */
import { effectiveGuardian } from '../domain'
import { type ViewId } from './layout'
import { Guardian } from './panels/Guardian'
import type { GameState } from './state'

function fmtSpent(totalSec: number): string {
  const minutes = Math.floor(Math.max(0, totalSec) / 60)
  return minutes < 1 ? 'just opened' : `${minutes} min so far`
}

export function ResumeCard({ state, go }: { state: GameState; go: (view: ViewId | null) => void }) {
  const guardian = effectiveGuardian(state.blocker, state.guardianOverride)
  const checkpoint = state.checkpoints.find((c) => c.id === state.activeCheckpointId)
  const task = state.tasks.find((t) => t.id === state.activeTaskId)
  const next = (state.nextAction ?? '').trim()
  return (
    <div>
      <div className="eyebrow">Where you left off</div>
      <Guardian who={guardian} says={`Back to “${task?.title ?? 'your task'}”.`} />
      <h3>{task?.title ?? 'your task'}</h3>
      <p><b>{checkpoint?.title ?? 'Your checkpoint'}</b> · {fmtSpent(state.session.elapsedSec)}</p>
      <p>{next ? `Next action: ${next}` : 'No next action saved yet.'}</p>
      <div className="qa">
        <button className="go" type="button" onClick={() => go('session')}>Resume</button>
        <button type="button" onClick={() => go('work')}>Edit plan</button>
        <button type="button" onClick={() => go('townlist')}>Something else</button>
      </div>
    </div>
  )
}
