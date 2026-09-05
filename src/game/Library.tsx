import { useEffect, useMemo, useRef, useState } from 'react'
import {
  REWARDS, WEEK_DAYS, createGuidanceProvider, extractDeliverables, guidanceOptionsFor,
  guideLines, guardianFor, resolveCheckpoint, sessionReward,
  taskTime, tasksForDay,
  type BlockerKind, type Checkpoint, type GuidanceIntent, type GuardianId,
  type HelpMode, type SessionOutcome, type Task,
} from '../domain'
import { grow, record, type GameState } from './state'
import { GUARDIANS, type ViewId } from './layout'
import { LIBRARY_LABEL, LIBRARY_STATIONS, type LibraryStation } from './libraryLayout'
import { useRoomMovement } from './useRoomMovement'
import './library.css'

type Flow = 'task' | 'summary' | 'blocker' | 'checkpoint' | 'session' | 'ask' | 'answer' | 'finish' | 'outcome' | 'reflect' | 'book' | 'welcome'

interface Props {
  state: GameState
  update: (fn: (state: GameState) => GameState) => void
  go: (view: ViewId | null) => void
  toast: (message: string) => void
  onExit: () => void
}

const fmtClock = (seconds: number) => {
  const value = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

const CURRENT_DAY = 'thu'
const GUIDANCE_PROVIDER = createGuidanceProvider()

function likelyTasks(tasks: readonly Task[], day: string): Task[] {
  return tasksForDay(tasks, day)
}

/** The current save has one optional assignment brief, not one brief per task.
 * Keep it away from scheduled commitments such as shifts and lectures instead
 * of pretending the ERD instructions belong to whichever card was clicked. */
function briefDeliverables(state: GameState, task: Task | null): string[] {
  if (!task || state.briefTaskId !== task.id) return []
  return state.deliverables.length ? state.deliverables : extractDeliverables(state.brief)
}

/** True when the student left something behind: a note, a next action, or time. */
export function hasProgress(state: GameState): boolean {
  return state.progressNote.trim().length > 0
    || state.nextAction.trim().length > 0
    || state.session.elapsedSec > 0
}

function inferMode(question: string): HelpMode {
  const q = question.toLowerCase()
  if (/error|bug|wrong|fail|debug|query|code/.test(q)) return 'Debug'
  if (/review|check|feedback|improve|read this/.test(q)) return 'Review'
  if (/idea|brainstorm|option|approach/.test(q)) return 'Brainstorm'
  if (/plan|steps|break down|too big/.test(q)) return 'Plan'
  if (/next|what now|continue/.test(q)) return 'What next?'
  return 'Explain'
}

function MiraPanel({ children, kicker, title, onClose }: {
  children: React.ReactNode
  kicker: string
  title: string
  onClose: () => void
}) {
  return (
    <section className="library-panel" role="dialog" aria-modal="true" aria-labelledby="library-dialog-title">
      <header>
        <div><span>{kicker}</span><h1 id="library-dialog-title">{title}</h1></div>
        <button type="button" aria-label="Step back" onClick={onClose}>×</button>
      </header>
      {children}
    </section>
  )
}

export function Library({ state, update, go, toast, onExit }: Props) {
  const initialFlow: Flow | null = state.view === 'session' ? 'session' : state.view === 'work' ? 'task' : null
  const [flow, setFlow] = useState<Flow | null>(initialFlow)
  const initialActiveTask = state.tasks.find((task) => task.id === state.activeTaskId && task.status !== 'completed')
  const [queueDay, setQueueDay] = useState(initialActiveTask?.day ?? CURRENT_DAY)
  const [queuePage, setQueuePage] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(state.activeTaskId)
  const [selectedBlocker, setSelectedBlocker] = useState<BlockerKind | null>(state.blocker)
  const [showMoreBlockers, setShowMoreBlockers] = useState(false)
  const [proposal, setProposal] = useState<Checkpoint[]>([])
  const [proposalIndex, setProposalIndex] = useState(0)
  const [proposalMessage, setProposalMessage] = useState('')
  const [proposalGuardian, setProposalGuardian] = useState<GuardianId>('mira')
  const [guidancePending, setGuidancePending] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string[]>([])
  const [ticking, setTicking] = useState(false)
  const [draftOutcome, setDraftOutcome] = useState<SessionOutcome | null>(state.outcome)
  const [taskFinished, setTaskFinished] = useState(false)
  const [progress, setProgress] = useState(state.progressNote)
  const [nextAction, setNextAction] = useState(state.nextAction)
  const deskButton = useRef<HTMLButtonElement>(null)
  const candidates = useMemo(() => likelyTasks(state.tasks, queueDay), [queueDay, state.tasks])
  const selectedTask = candidates.find((task) => task.id === selectedTaskId) ?? candidates[0] ?? null
  const active = state.checkpoints.find((checkpoint) => checkpoint.id === state.activeCheckpointId) ?? null
  const sessionTask = state.tasks.find((task) => task.id === state.activeTaskId) ?? selectedTask
  const { room, avatar, near, walkTo, press } = useRoomMovement<LibraryStation>(flow !== null, {
    stations: LIBRARY_STATIONS,
    avatarClass: 'library-player',
    minY: 35,
    talkRadius: 125,
  })

  useEffect(() => {
    if (!ticking) return
    const id = window.setInterval(() => {
      update((current) => {
        const elapsedSec = current.session.elapsedSec + 1
        if (current.session.timerMode === 'down' && elapsedSec >= current.session.timerLenSec) {
          window.clearInterval(id)
          setTicking(false)
          toast('Timebox reached. Your checkpoint stays open until you decide what happened.')
        }
        return { ...current, session: { ...current.session, elapsedSec } }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [ticking, toast, update])

  const closeFlow = () => {
    setFlow(null)
    setTicking(false)
    if (state.view) go(null)
  }

  const openMira = () => {
    const unfinishedActive = state.tasks.find((task) => task.id === state.activeTaskId && task.status !== 'completed')
    const day = unfinishedActive?.day ?? CURRENT_DAY
    setQueueDay(day)
    setQueuePage(0)
    setSelectedTaskId(unfinishedActive?.id ?? likelyTasks(state.tasks, day)[0]?.id ?? null)
    setFlow('task')
  }

  const openDesk = () => {
    if (!active || !state.blocker) {
      openMira()
      return
    }
    const resumed = active && state.blocker && hasProgress(state)
    update((current) => ({
      ...current,
      outcome: null,
      session: {
        ...current.session,
        timerLenSec: active.estimatedMinutes * 60,
      },
    }))
    setDraftOutcome(null)
    setTaskFinished(false)
    setFlow(resumed ? 'welcome' : 'session')
  }

  const interact = (station: LibraryStation) => {
    if (station === 'mira') openMira()
    else if (station === 'desk') openDesk()
    else if (station === 'book') setFlow('book')
    else onExit()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e' && !event.repeat && !flow && near) {
        event.preventDefault()
        interact(near)
      } else if (event.key === 'Escape') {
        if (flow) closeFlow()
        else onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const beginCheckpoint = (
    task: Task,
    blocker: BlockerKind,
    checkpoints: Checkpoint[],
    chosen: Checkpoint,
    enterSession: boolean,
  ) => {
    update((current) => record({
      ...current,
      blocker,
      checkpoints,
      activeTaskId: task.id,
      activeCheckpointId: chosen.id,
      outcome: null,
      savedSessionKey: null,
      // A new checkpoint starts with no history: never inherit the previous
      // task's progress note or next action.
      progressNote: '',
      nextAction: '',
      session: {
        ...current.session,
        elapsedSec: 0,
        timerMode: chosen.timerPreference ?? 'down',
        timerLenSec: chosen.estimatedMinutes * 60,
        helpMode: null,
        pausedFrom: null,
      },
    }, 'Prepared one manageable checkpoint', `${chosen.title} · ${chosen.estimatedMinutes} minutes.`, REWARDS.beginSession))
    toast(enterSession ? `Started · ${chosen.title}` : 'Your place is ready at the study desk.')
    setProgress('')
    setNextAction('')
    setTaskFinished(false)
    if (enterSession) setFlow('session')
    else {
      closeFlow()
      window.requestAnimationFrame(() => deskButton.current?.focus())
    }
  }

  const requestGuidance = async (intent: GuidanceIntent, enterSession = false) => {
    if (!selectedTask || guidancePending) return
    setGuidancePending(true)
    try {
      const response = await GUIDANCE_PROVIDER.propose({
        task: selectedTask,
        intent,
        context: state.briefTaskId === selectedTask.id
          ? { brief: state.brief, deliverables: briefDeliverables(state, selectedTask) }
          : undefined,
      })
      const checkpoint: Checkpoint = {
        ...response.checkpoint,
        id: `guided-${selectedTask.id}-${Date.now()}`,
        status: 'pending',
      }
      setSelectedBlocker(response.canonicalBlocker)
      setProposal([checkpoint])
      setProposalIndex(0)
      setProposalMessage(response.message)
      setProposalGuardian(response.guardian)
      if (enterSession) beginCheckpoint(selectedTask, response.canonicalBlocker, [checkpoint], checkpoint, true)
      else setFlow('checkpoint')
    } finally {
      setGuidancePending(false)
    }
  }

  const acceptCheckpoint = () => {
    if (!selectedTask || !selectedBlocker || !proposal[proposalIndex]) return
    beginCheckpoint(selectedTask, selectedBlocker, proposal, proposal[proposalIndex], false)
  }

  const askMira = () => {
    if (!question.trim() || !active || !state.blocker) return
    const mode = inferMode(question)
    const ctx = {
      taskTitle: sessionTask?.title,
      checkpointTitle: active.title,
      checkpointMinutes: active.estimatedMinutes,
      definitionOfDone: active.definitionOfDone,
      deliverables: briefDeliverables(state, sessionTask),
    }
    const specific = /many[- ]to[- ]many|junction|associative entit/i.test(question)
      ? [
        'A many-to-many relationship means each record on either side may connect to several on the other side.',
        'In a relational design, put a junction entity between them. Its rows hold the two foreign keys, plus any facts about that connection.',
        `For ${sessionTask?.title ?? 'this task'}, name the two entities first, then write what one row in their connection represents. That is enough for this checkpoint.`,
      ]
      : guideLines(state.blocker, mode, ctx, guardianFor(state.blocker))
    setAnswer(specific)
    update((current) => ({ ...current, session: { ...current.session, helpMode: mode } }))
    setFlow('answer')
  }

  const saveOutcome = () => {
    if (!active || !draftOutcome) return
    const key = `${active.id}:${draftOutcome}${taskFinished ? ':task' : ''}`
    update((current) => {
      const resolvedCheckpoints = taskFinished
        ? current.checkpoints.map((checkpoint) => ({ ...checkpoint, status: 'completed' as const }))
        : resolveCheckpoint(current.checkpoints, active.id, draftOutcome)
      const changed = {
        ...current,
        outcome: draftOutcome,
        progressNote: progress,
        nextAction,
        tasks: taskFinished
          ? current.tasks.map((task) => task.id === current.activeTaskId ? { ...task, status: 'completed' as const } : task)
          : current.tasks,
        checkpoints: resolvedCheckpoints,
        activeCheckpointId: draftOutcome === 'completed' ? null : current.activeCheckpointId,
        activeTaskId: taskFinished ? null : current.activeTaskId,
        savedSessionKey: key,
        session: { ...current.session, pausedFrom: null },
      }
      if (current.savedSessionKey === key) return changed
      if (taskFinished) {
        return grow(record(changed, `Finished “${sessionTask?.title ?? 'task'}”`, progress, sessionReward(draftOutcome)))
      }
      return grow(record(
        record(changed, `${draftOutcome === 'completed' ? 'Completed' : 'Saved progress on'} “${active.title}”`,
          progress, sessionReward(draftOutcome)),
        'Saved a clear next action', nextAction, REWARDS.savedNextAction,
      ))
    })
    setTicking(false)
    toast('Progress saved. Future-you has a clear next step.')
    closeFlow()
  }

  const currentProposal = proposal[proposalIndex]
  const allBlockerOptions = selectedTask ? guidanceOptionsFor(selectedTask) : []
  const blockerOptions = showMoreBlockers ? allBlockerOptions : allBlockerOptions.slice(0, 3)
  const remaining = state.session.timerLenSec - state.session.elapsedSec
  const queueIndex = Math.max(0, WEEK_DAYS.findIndex((day) => day.key === queueDay))
  const queueLabel = WEEK_DAYS[queueIndex]?.label ?? queueDay
  const queuePages = Math.max(1, Math.ceil(candidates.length / 3))
  const visibleCandidates = candidates.slice(queuePage * 3, queuePage * 3 + 3)
  const visibleStart = candidates.length ? queuePage * 3 + 1 : 0
  const visibleEnd = Math.min(candidates.length, visibleStart + visibleCandidates.length - 1)
  const earlierCount = queuePage * 3
  const laterCount = Math.max(0, candidates.length - visibleEnd)
  const changeQueueDay = (offset: number) => {
    const next = WEEK_DAYS[(queueIndex + offset + WEEK_DAYS.length) % WEEK_DAYS.length]
    setQueueDay(next.key)
    setQueuePage(0)
    setSelectedTaskId(null)
  }

  return (
    <div ref={room} className={`library-scene${flow ? ' is-open' : ''}`}>
      <img className="library-room" src="/game/scenes/library/interior.png"
        alt="A bright, sunlit library with a study desk, Mira's consultation desk, and an enchanted book" />
      <div className="library-room-controls" inert={flow ? true : undefined} aria-hidden={flow ? true : undefined}>
        <header className="library-hud">
          <div><span>The Library</span><strong>Make one thing understandable</strong></div>
          <button type="button" onClick={onExit}>Exit to campus</button>
        </header>

        <button ref={deskButton} className={`library-hotspot library-desk${active ? ' is-ready' : ''}`} type="button"
          onClick={() => walkTo(LIBRARY_STATIONS.desk, openDesk)}>
          <span>{active ? 'Your place is ready' : 'Study desk'}</span>
          <small>{active ? active.title : 'Choose one checkpoint first'}</small>
        </button>
        <button className="library-hotspot library-mira" type="button"
          onClick={() => walkTo(LIBRARY_STATIONS.mira, openMira)}>
          <span className="library-mira-sprite" aria-hidden="true" />
          <span>Talk to Mira</span><small>Find one clear starting point</small>
        </button>
        <button className="library-hotspot library-book" type="button"
          onClick={() => walkTo(LIBRARY_STATIONS.book, () => setFlow('book'))}>
          <span>Reference book</span><small>Ask about one concept</small>
        </button>
        <button className="library-hotspot library-door" type="button"
          onClick={() => walkTo(LIBRARY_STATIONS.door, onExit)}>
          <span>Exit</span><small>Return to Campus Grove</small>
        </button>

        <div ref={avatar} className="library-player avatar f-up" aria-label="Your avatar"
          style={{ left: '50%', top: '92%', backgroundImage: 'url(/game/world/player-sheet.webp)' }} />
        <div className="library-dpad" aria-label="Room movement">
          {(['up', 'left', 'down', 'right'] as const).map((direction) => (
            <button key={direction} type="button" aria-label={`Move ${direction}`}
              onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); press(direction, true) }}
              onPointerUp={() => press(direction, false)} onPointerCancel={() => press(direction, false)}
              onLostPointerCapture={() => press(direction, false)}>
              {{ up: '↑', left: '←', down: '↓', right: '→' }[direction]}
            </button>
          ))}
        </div>
        <p className="library-room-hint">WASD / arrows to walk · E to interact · Esc to step back</p>
        {near && <div className="library-near-prompt">E · {LIBRARY_LABEL[near]}</div>}
      </div>

      {flow === 'task' && (
        <MiraPanel kicker="Mira · first, choose one thing" title={`${queueLabel}'s open work`} onClose={closeFlow}>
          <div className="library-day-switch" aria-label="Choose a calendar day">
            <button type="button" onClick={() => changeQueueDay(-1)} aria-label="Previous day">‹</button>
            <strong>{queueLabel}</strong>
            <button type="button" onClick={() => changeQueueDay(1)} aria-label="Next day">›</button>
          </div>
          <div className="library-choices">
            {visibleCandidates.map((task) => (
              <button key={task.id} type="button" onClick={() => { setSelectedTaskId(task.id); setFlow('summary') }}>
                <strong>{task.title}</strong>
                <span>{taskTime(task) ?? `${task.estimatedMinutes} min`} · {task.flexibility === 'fixed' ? 'fixed in calendar' : 'flexible'}</span>
                {task.id === state.activeTaskId && active && hasProgress(state)
                  ? <span>You did this before — resume at your desk</span>
                  : null}
              </button>
            ))}
          </div>
          {candidates.length > 0 && <p className="library-queue-summary" role="status">
            Showing {visibleStart}–{visibleEnd} of {candidates.length} unfinished commitment{candidates.length === 1 ? '' : 's'}.
            {laterCount > 0 ? ` ${laterCount} more ${laterCount === 1 ? 'is' : 'are'} waiting later.` : ''}
            {earlierCount > 0 ? ` ${earlierCount} ${earlierCount === 1 ? 'is' : 'are'} earlier in the day.` : ''}
          </p>}
          {queuePages > 1 && <div className="library-queue-page" aria-label="More tasks on this day">
            <button type="button" disabled={queuePage === 0} onClick={() => setQueuePage((page) => page - 1)}>
              Earlier{earlierCount > 0 ? ` (${Math.min(3, earlierCount)})` : ''}
            </button>
            <span>{queuePage + 1} of {queuePages}</span>
            <button type="button" disabled={queuePage >= queuePages - 1} onClick={() => setQueuePage((page) => page + 1)}>
              Later{laterCount > 0 ? ` (${Math.min(3, laterCount)})` : ''}
            </button>
          </div>}
          {!candidates.length && <p className="library-copy">There is no unfinished work on {queueLabel}. Move to another day, or step away for now.</p>}
          <button className="library-text-button" type="button" onClick={closeFlow}>Not now</button>
        </MiraPanel>
      )}

      {flow === 'summary' && selectedTask && (
        <MiraPanel kicker="Mira · make the task concrete" title={selectedTask.title} onClose={() => setFlow('task')}>
          <p className="library-copy">
            This is a {selectedTask.estimatedMinutes}-minute {selectedTask.category} commitment due {selectedTask.urgency}.
            {' '}{briefDeliverables(state, selectedTask)[0]
              ? `The brief names “${briefDeliverables(state, selectedTask)[0]}”.`
              : selectedTask.flexibility === 'fixed'
                ? 'Its time is fixed in the calendar, but you can still prepare for it or mark it done.'
                : 'We only need to find its first visible step.'}
          </p>
          <div className="library-actions">
            <button className="library-primary" type="button" disabled={guidancePending}
              onClick={() => requestGuidance('ready', true)}>
              {guidancePending ? 'Preparing your place…' : 'Nothing is blocking me — start'}
            </button>
            <button type="button" disabled={guidancePending} onClick={() => {
              setShowMoreBlockers(false)
              setFlow('blocker')
            }}>Something is getting in the way</button>
          </div>
        </MiraPanel>
      )}

      {flow === 'blocker' && selectedTask && (
        <MiraPanel kicker="Mira · one short question" title="What is making it difficult right now?" onClose={() => setFlow('summary')}>
          <div className="library-choices compact">
            {blockerOptions.map((blocker) => (
              <button key={blocker.id} type="button" disabled={guidancePending}
                onClick={() => requestGuidance(blocker.id)}>
                <strong>{blocker.label}</strong>
              </button>
            ))}
          </div>
          {!showMoreBlockers && allBlockerOptions.length > 3 && <button className="library-text-button" type="button" onClick={() => setShowMoreBlockers(true)}>More choices</button>}
        </MiraPanel>
      )}

      {flow === 'checkpoint' && selectedBlocker && currentProposal && (
        <MiraPanel kicker={`${GUARDIANS[proposalGuardian].name} suggests one step`} title={proposalMessage} onClose={() => setFlow('blocker')}>
          <article className="checkpoint-card">
            <span>{currentProposal.estimatedMinutes} minute checkpoint</span>
            <h2>{currentProposal.title}</h2>
            <p><b>Done means:</b> {currentProposal.definitionOfDone}</p>
          </article>
          <div className="library-actions">
            <button className="library-primary" type="button" onClick={acceptCheckpoint}>Use this step</button>
            <button type="button" onClick={() => setProposal((items) => items.map((item, index) => index === proposalIndex
              ? { ...item, estimatedMinutes: Math.max(5, Math.ceil(item.estimatedMinutes / 2)) } : item))}>Make it smaller</button>
            {proposal.length > 1 && <button type="button" onClick={() => setProposalIndex((index) => (index + 1) % proposal.length)}>Something else</button>}
          </div>
        </MiraPanel>
      )}

      {flow === 'welcome' && active && (
        <MiraPanel kicker="Mira · you were here before" title="Welcome back" onClose={closeFlow}>
          <p className="library-copy">Nothing was lost. Here is where you left it.</p>
          <div className="library-choices compact">
            <div><strong>{state.progressNote.trim() || 'No note last time'}</strong><span>What changed</span></div>
            <div><strong>{state.nextAction.trim() || 'Not set yet'}</strong><span>Saved next action</span></div>
            <div><strong>{Math.ceil(state.session.elapsedSec / 60)} min so far</strong><span>Time in this session</span></div>
          </div>
          <div className="library-actions">
            <button className="library-primary" type="button" onClick={() => setFlow('session')}>Keep going</button>
            <button type="button" onClick={closeFlow}>Not now</button>
          </div>
        </MiraPanel>
      )}

      {(flow === 'session' || flow === 'ask' || flow === 'answer') && active && state.blocker && (
        <MiraPanel kicker={`Pace Session · ${sessionTask?.title ?? 'one task'}`} title={active.title} onClose={closeFlow}>
          {flow === 'session' && <>
            <div className="session-focus"><span>Done when</span><p>{active.definitionOfDone}</p></div>
            <div className="session-timer">
              <strong>{state.session.timerMode === 'none'
                ? 'Untimed'
                : fmtClock(state.session.timerMode === 'down' ? remaining : state.session.elapsedSec)}</strong>
              {state.session.timerMode !== 'none' && <button type="button" onClick={() => setTicking((value) => !value)}>{ticking ? 'Pause' : state.session.elapsedSec ? 'Resume' : 'Start'}</button>}
            </div>
            <label className="library-field">Your working space
              <textarea rows={7} value={state.session.scratchpad} placeholder="Rough notes belong here. They do not need to be tidy."
                onChange={(event) => update((current) => ({ ...current, session: { ...current.session, scratchpad: event.target.value } }))} />
            </label>
            <div className="library-actions">
              <button className="library-primary" type="button" onClick={() => setFlow('ask')}>Ask Mira</button>
              <button type="button" onClick={() => { setTicking(false); setFlow('finish') }}>I'm finished…</button>
              <button type="button" onClick={() => { setTicking(false); setFlow('outcome') }}>Pause or record progress</button>
              <button type="button" onClick={() => { update((current) => ({ ...current, session: { ...current.session, pausedFrom: 'session' } })); go('recover') }}>I need a reset</button>
            </div>
          </>}
          {flow === 'ask' && <>
            <p className="library-copy">Ask about the exact point where you are stuck. Mira will keep the current task and checkpoint in view.</p>
            <label className="library-field">What do you need help with?
              <textarea autoFocus rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="For example: Why does a many-to-many relationship need another entity?" />
            </label>
            <div className="library-actions"><button className="library-primary" type="button" disabled={!question.trim()} onClick={askMira}>Ask this</button><button type="button" onClick={() => setFlow('session')}>Back to work</button></div>
          </>}
          {flow === 'answer' && <>
            <div className="mira-answer"><img src="/game/portraits/mira.webp" alt="Mira" /><div><span>Mira · suggestion, not your submitted work</span>{answer.map((line) => <p key={line}>{line}</p>)}</div></div>
            <div className="library-actions"><button className="library-primary" type="button" onClick={() => { setQuestion(''); setFlow('session') }}>Use this and keep working</button><button type="button" onClick={() => setFlow('ask')}>Ask another question</button></div>
          </>}
        </MiraPanel>
      )}

      {flow === 'finish' && active && (
        <MiraPanel kicker="Mira · you decide what is done" title="What did you finish?" onClose={() => setFlow('session')}>
          <div className="library-choices compact">
            <button type="button" onClick={() => {
              setTaskFinished(false); setDraftOutcome('completed'); setFlow('reflect')
            }}><strong>Only this checkpoint</strong><span>The larger task stays open.</span></button>
            <button type="button" onClick={() => {
              setTaskFinished(true); setDraftOutcome('completed'); setFlow('reflect')
            }}><strong>The whole task</strong><span>Mark {sessionTask?.title ?? 'the commitment'} completed.</span></button>
          </div>
          <button className="library-text-button" type="button" onClick={() => setFlow('session')}>I am not sure yet</button>
        </MiraPanel>
      )}

      {flow === 'outcome' && active && (
        <MiraPanel kicker="Mira · one honest check-in" title="How did that go?" onClose={() => setFlow('session')}>
          <div className="library-choices compact">
            {([
              ['partial', 'Made some progress'], ['blocked', 'Still stuck'],
              ['rescheduled', 'Need to stop for now'],
            ] as [SessionOutcome, string][]).map(([outcome, label]) => (
              <button key={outcome} type="button" onClick={() => {
                setTaskFinished(false)
                setDraftOutcome(outcome)
                setFlow('reflect')
              }}><strong>{label}</strong></button>
            ))}
          </div>
        </MiraPanel>
      )}

      {flow === 'reflect' && draftOutcome && active && (
        <MiraPanel kicker="Mira · leave a trail for future-you"
          title={taskFinished ? `Finish ${sessionTask?.title ?? 'this task'}?` : draftOutcome === 'completed' ? 'Finish this checkpoint?' : 'Save what changed'}
          onClose={() => setFlow(taskFinished ? 'outcome' : 'session')}>
          <p className="library-copy">
            {taskFinished
              ? 'This marks the entire commitment completed and removes it from Mira’s open-work list.'
              : draftOutcome === 'completed'
                ? 'This completes only the current checkpoint. The larger task stays open.'
                : 'The checkpoint stays open, and your notes will be waiting when you return.'}
          </p>
          <label className="library-field">{taskFinished ? 'What did you finish?' : 'What changed?'}
            <input value={progress} onChange={(event) => setProgress(event.target.value)} placeholder="Even a rough attempt counts." />
          </label>
          {!taskFinished && <label className="library-field">What is the easiest next action?
            <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="Something you could start in two minutes." />
          </label>}
          <div className="library-actions"><button className="library-primary" type="button" onClick={saveOutcome}>
            {taskFinished ? 'Yes, mark the task finished' : draftOutcome === 'completed' ? 'Complete this checkpoint' : 'Save and stand up'}
          </button>{draftOutcome !== 'completed' && <button type="button" onClick={() => go('recover')}>Take a recovery break</button>}</div>
        </MiraPanel>
      )}

      {flow === 'book' && (
        <MiraPanel kicker="Enchanted reference book" title="Bring one question, not the whole subject" onClose={closeFlow}>
          <p className="library-copy">The book works best from inside a Pace Session, where it knows which task and checkpoint you mean.</p>
          <div className="library-actions"><button className="library-primary" type="button" onClick={active ? openDesk : openMira}>{active ? 'Return to your desk' : 'Choose a task with Mira'}</button></div>
        </MiraPanel>
      )}
    </div>
  )
}
