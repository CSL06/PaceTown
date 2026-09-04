/**
 * The guardian dock.
 *
 * Five characters, each showing what their own module currently says about
 * your week, and each opening the one screen that is worth opening right now.
 * Every line here is derived from the domain layer and the save — none of it
 * is written copy, and none of it is a mood.
 *
 * A guardian is "waiting" when there is something of theirs you have not done
 * yet. That is the only alert state; nothing here nags, counts down, or
 * breaks a streak.
 */

import { useMemo, useState } from 'react'
import {
  DEMO_DESTINATION, proposeRebalance, wakingMinutes, type DailyLoad, type GuardianId,
} from '../domain'
import { GUARDIANS } from './layout'
import type { ViewId } from './layout'
import type { GameState } from './state'

interface Entry {
  id: GuardianId
  /** What this guardian's module says about the week right now. */
  status: string
  /** The screen worth opening, given that status. */
  view: ViewId
  action: string
  waiting: boolean
}

function build(state: GameState, load: DailyLoad): Entry[] {
  const waking = wakingMinutes(state.capacity)
  const proposal = proposeRebalance(state.tasks,
    { day: 'thu', destination: DEMO_DESTINATION, waking })
  const canMove = proposal.moves.length
  const rebalanceOpen = !state.rebalanceSeen && canMove > 0

  const openCheckpoints = state.checkpoints.filter((c) => c.status !== 'completed').length
  const errands = state.tasks.filter((t) => t.category === 'errands' && t.status !== 'completed')
  const errandMinutes = errands.reduce((sum, t) => sum + t.estimatedMinutes, 0)
  const recoveryDue = !!state.outcome && !state.questOutcome

  return [
    {
      id: 'kai',
      status: rebalanceOpen
        ? `${canMove} thing${canMove === 1 ? '' : 's'} can move to Saturday`
        : state.rebalanceApproved
          ? `Week rebalanced · now ${load.percentage.toFixed(0)}%`
          : `Thursday sits at ${load.percentage.toFixed(0)}%`,
      view: rebalanceOpen ? 'rebalance' : 'load',
      action: rebalanceOpen ? 'See what can move' : 'Show the arithmetic',
      waiting: rebalanceOpen,
    },
    {
      id: 'mira',
      status: state.checkpoints.length === 0
        ? 'No checkpoint yet — the work has no edge'
        : openCheckpoints > 0
          ? `${openCheckpoints} checkpoint${openCheckpoints === 1 ? '' : 's'} still open`
          : 'Every checkpoint closed',
      view: 'work',
      action: state.checkpoints.length === 0 ? 'Make one startable' : 'Open the plan',
      waiting: state.checkpoints.length === 0,
    },
    {
      id: 'sky',
      status: state.outcome
        ? `Last session: ${state.outcome}`
        : state.activeCheckpointId
          ? 'Your checkpoint is held as you left it'
          : 'Here whenever you want company',
      view: state.activeCheckpointId && !state.outcome ? 'session' : 'warmcup',
      action: state.activeCheckpointId && !state.outcome ? 'Resume the session' : 'Sit a while',
      waiting: !!state.activeCheckpointId && !state.outcome,
    },
    {
      id: 'sol',
      status: recoveryDue
        ? 'You banked work — recovery is owed'
        : state.recoveryDone
          ? `Garden at ${state.gardenGrowth} of 4`
          : 'Rest has no prerequisite here',
      view: recoveryDue ? 'recover' : 'garden',
      action: recoveryDue ? 'Take the recovery' : 'Visit the garden',
      waiting: recoveryDue,
    },
    {
      id: 'goh',
      status: errands.length
        ? `${errands.length} errand${errands.length === 1 ? '' : 's'} · ${errandMinutes} min together`
        : 'Nothing small left outstanding',
      view: 'lanterns',
      action: errands.length ? 'Group them up' : 'Light the lanterns',
      waiting: false,
    },
  ]
}

interface Props {
  state: GameState
  load: DailyLoad
  go: (view: ViewId) => void
}

export function GuardianDock({ state, load, go }: Props) {
  const [open, setOpen] = useState<GuardianId | null>(null)
  const entries = useMemo(() => build(state, load), [state, load])
  const waiting = entries.filter((e) => e.waiting).length

  return (
    <div className="dock" aria-label="Guardians">
      <div className="dock-head">
        <span>Guardians</span>
        {waiting > 0 && <b>{waiting} waiting</b>}
      </div>

      {entries.map((entry) => {
        const guardian = GUARDIANS[entry.id]
        const isOpen = open === entry.id
        return (
          <div key={entry.id} className={`dock-row${isOpen ? ' is-open' : ''}${entry.waiting ? ' is-waiting' : ''}`}>
            <button
              type="button"
              className="dock-face"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : entry.id)}
            >
              <img src={`/game/portraits/${entry.id}.png`} alt="" width="190" height="285" />
              {entry.waiting && <span className="dock-dot" aria-hidden="true" />}
              <span className="dock-name">{guardian.name}</span>
              <span className="sr">
                {guardian.role}. {entry.status}. {entry.waiting ? 'Waiting on you.' : ''}
              </span>
            </button>

            {isOpen && (
              <div className="dock-card">
                <div className="dock-role">{guardian.role}</div>
                <p>{entry.status}</p>
                <button type="button" className="dock-go" onClick={() => { setOpen(null); go(entry.view) }}>
                  {entry.action} →
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
