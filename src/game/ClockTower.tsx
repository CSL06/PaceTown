import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  REWARDS, WEEK_DAYS, applySelected, dailyLoad, proposeRebalance,
  taskTime, tasksForDay, wakingMinutes, weekLoads, type Task,
} from '../domain'
import { grow, record, type GameState } from './state'
import type { ViewId } from './layout'
import './scene-kit.css'
import './clock-tower.css'
import { useRoomMovement } from './useRoomMovement'
import { dayIndex, moveCalendarTask } from '../domain/calendar'
import { STATION_POSITION, STATION_LABEL } from './clockLayout'

const SOURCE_DAY = 'thu'
const DEFAULT_DESTINATION = 'sat'

interface Props {
  state: GameState
  update: (fn: (state: GameState) => GameState) => void
  go: (view: ViewId | null) => void
  toast: (message: string) => void
  onExit: () => void
}

/** True when the Week Board should open on Kai's proposal preview first. */
export function shouldAutoOpenPreview(state: Pick<GameState, 'tasks' | 'capacity' | 'rebalanceSeen'>): boolean {
  if (state.rebalanceSeen) return false
  const waking = wakingMinutes(state.capacity)
  return proposeRebalance(state.tasks, { day: SOURCE_DAY, destination: DEFAULT_DESTINATION, waking }).moves.length > 0
}

function pct(value: number): string {
  return Number.isFinite(value) ? value.toFixed(0) : '∞'
}

function TaskBlock({ task, selected, suggested, leaving, onToggle, onInspect, draggable = false }: {
  task: Task
  selected?: boolean
  suggested?: boolean
  leaving?: boolean
  onToggle?: () => void
  draggable?: boolean
  onInspect?: () => void
}) {
  const time = taskTime(task)
  const className = [
    'week-task', `is-${task.category}`, task.flexibility === 'fixed' ? 'is-fixed' : '',
    task.status === 'completed' ? 'is-completed' : '',
    selected ? 'is-selected' : '', suggested ? 'is-ghost' : '', leaving ? 'is-leaving' : '',
  ].filter(Boolean).join(' ')
  const content = (
    <>
      <span className="week-task-top">
        <span>{time ?? `${task.estimatedMinutes} min · ${task.flexibility}`}</span>
        {task.status === 'completed'
          ? <span aria-label="Completed commitment">Done ✓</span>
          : task.flexibility === 'fixed' && <span aria-label="Fixed commitment">⌑</span>}
      </span>
      <strong>{task.title}</strong>
      {suggested && <span className="week-task-note">Preview here</span>}
    </>
  )

  return <div data-task-id={suggested || task.status === 'completed' ? undefined : task.id}
    draggable={draggable && task.flexibility === 'flexible' && task.status !== 'completed'}
    onDragStart={(event) => { event.dataTransfer.setData('text/plain', task.id); event.dataTransfer.effectAllowed = 'move' }}>
    {onInspect ? (
    <button type="button" className={className} onClick={onInspect} aria-label={`Details for ${task.title}`}>
      {content}
    </button>
  ) : <div className={className}>{content}</div>}
    {draggable && task.flexibility === 'flexible' && task.status !== 'completed' && <span className="task-drag-handle" data-drag-id={task.id} aria-label={`Drag ${task.title}`}>⠿</span>}
    {onToggle && <button type="button" className="preview-select" aria-pressed={selected} onClick={onToggle}>
      {selected ? 'Include in preview ✓' : 'Include in preview'}</button>}
  </div>
}

function WeekBoard({ state, update, go, toast, onClose }: Omit<Props, 'onExit'> & { onClose: () => void }) {
  const waking = wakingMinutes(state.capacity)
  const [destination, setDestination] = useState(DEFAULT_DESTINATION)
  const [selected, setSelected] = useState<string[] | null>(null)
  const [mobileDay, setMobileDay] = useState(SOURCE_DAY)
  const [previewOpen, setPreviewOpen] = useState(() => shouldAutoOpenPreview(state))
  const [inspected, setInspected] = useState<string | null>(null)
  const [undoTasks, setUndoTasks] = useState<Task[] | null>(null)
  const [dropTarget, setDropTarget] = useState<{ day: string; beforeId?: string } | null>(null)
  const touchDrag = useRef<string | null>(null)
  const [dragLabel, setDragLabel] = useState('')
  const [moveMessage, setMoveMessage] = useState('Drag flexible tasks to another day. Fixed commitments stay locked.')
  const moveTask = (id: string, day: string, beforeId?: string) => {
    const task = state.tasks.find((item) => item.id === id)
    if (!task || task.flexibility === 'fixed' || dayIndex(day) < 0 || beforeId === id) return
    const shift = dayIndex(day) - dayIndex(task.day)
    const daysLate = Math.max(0, shift - task.deadlineDays)
    setUndoTasks(state.tasks)
    update((current) => ({ ...current, tasks: moveCalendarTask(current.tasks, id, day, beforeId) }))
    setPreviewOpen(false)
    setSelected([])
    const destinationLabel = WEEK_DAYS.find((entry) => entry.key === day)?.label
    setMoveMessage(daysLate
      ? `${task.title} moved to ${destinationLabel}, ${daysLate} day${daysLate === 1 ? '' : 's'} past its deadline.`
      : `${task.title} moved to ${destinationLabel}.`)
  }
  const locateDrop = (element: Element | null, y: number, day: string) => {
    const card = element?.closest<HTMLElement>('[data-task-id]')
    if (!card) return { day }
    const after = y >= card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2
    const cards = Array.from(card.closest('.week-day-body')?.querySelectorAll<HTMLElement>('[data-task-id]') ?? [])
    const next = after ? cards[cards.indexOf(card) + 1] : card
    return { day, beforeId: next?.dataset.taskId }
  }
  const dropOn = (event: React.DragEvent, day: string) => {
    event.preventDefault()
    const target = locateDrop(event.target as Element, event.clientY, day)
    moveTask(event.dataTransfer.getData('text/plain'), day, target.beforeId)
    setDropTarget(null)
  }

  const proposal = useMemo(() => proposeRebalance(state.tasks, {
    day: SOURCE_DAY, destination, waking,
  }), [state.tasks, destination, waking])
  const selectedIds = previewOpen ? selected ?? proposal.moves.map((move) => move.taskId) : []
  const selectedMoves = proposal.moves.filter((move) => selectedIds.includes(move.taskId))
  const previewTasks = applySelected(state.tasks, proposal, selectedIds)
  const loads = weekLoads(previewTasks, waking)
  const originalLoads = weekLoads(state.tasks, waking)
  const movableIds = new Set(proposal.moves.map((move) => move.taskId))
  const selectedSet = new Set(selectedIds)

  const destinationOptions = WEEK_DAYS
    .filter(({ key }) => ['fri', 'sat', 'sun'].includes(key))
    .map((day) => ({
      ...day,
      proposal: proposeRebalance(state.tasks, { day: SOURCE_DAY, destination: day.key, waking }),
      load: dailyLoad(state.tasks, day.key, waking),
    }))
    .filter((option) => option.proposal.moves.length > 0)

  const toggle = (id: string) => setSelected((current) => {
    const chosen = current ?? proposal.moves.map((move) => move.taskId)
    return chosen.includes(id) ? chosen.filter((taskId) => taskId !== id) : [...chosen, id]
  })

  const approve = () => {
    if (!selectedMoves.length) return
    const applied = applySelected(state.tasks, proposal, selectedIds)
    const titles = selectedMoves.map((move) => move.title).join(', ')
    const afterSource = dailyLoad(applied, SOURCE_DAY, waking)
    const reward = state.rebalanceApproved ? { xp: 0, coins: 0 } : REWARDS.rebalance
    update((current) => grow(record({
      ...current,
      tasks: applied,
      rebalanceSeen: true,
      rebalanceApproved: true,
    }, 'Rebalanced an overloaded day',
    `${titles} — moved to ${WEEK_DAYS.find((day) => day.key === destination)?.label}. ` +
      `Thursday ${pct(originalLoads.thu.percentage)}% → ${pct(afterSource.percentage)}%.`,
    reward)))
    toast(`Week rebalanced${reward.xp ? ` · +${reward.xp} XP` : ''}`)
    setUndoTasks(null)
    setSelected([])
    setPreviewOpen(false)
  }

  return (
    <section className="clock-board-screen" role="dialog" aria-modal="true"
      onDragEnd={() => setDropTarget(null)}
      onPointerDown={(event) => {
        const handle = (event.target as Element).closest<HTMLElement>('[data-drag-id]')
        if (!handle || event.pointerType === 'mouse') return
        event.preventDefault()
        touchDrag.current = handle.dataset.dragId!
        setDragLabel(state.tasks.find((task) => task.id === touchDrag.current)?.title ?? '')
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!touchDrag.current) return
        const hit = document.elementFromPoint(event.clientX, event.clientY)
        const day = hit?.closest<HTMLElement>('[data-day]')?.dataset.day
        if (day) { setMobileDay(day); setDropTarget(locateDrop(hit, event.clientY, day)) }
        else setDropTarget(null)
        const scroller = hit?.closest<HTMLElement>('.week-day-body')
        if (scroller) {
          const rect = scroller.getBoundingClientRect()
          if (event.clientY < rect.top + 40) scroller.scrollTop -= 12
          if (event.clientY > rect.bottom - 40) scroller.scrollTop += 12
        }
      }}
      onPointerUp={() => {
        if (touchDrag.current && dropTarget) moveTask(touchDrag.current, dropTarget.day, dropTarget.beforeId)
        touchDrag.current = null; setDropTarget(null); setDragLabel('')
      }}
      onPointerCancel={() => { touchDrag.current = null; setDropTarget(null); setDragLabel('') }}
      aria-label="Weekly planning board">
      {dragLabel && <div className="drag-feedback">Moving {dragLabel} · release at the highlighted position</div>}
      <header className="clock-board-head">
        <div>
          <span className="clock-kicker">Clock Tower · Week Board</span>
          <h1>Your week, in one place</h1>
          <p>Fixed commitments stay put. Suggested moves remain previews until you approve.</p>
        </div>
        <button className="clock-close" type="button" onClick={onClose} autoFocus
          aria-label="Step away from week board">×</button>
      </header>

      <nav className="week-tabs" aria-label="Choose day to view">
        {WEEK_DAYS.map((day) => (
          <button key={day.key} data-day={day.key} type="button" aria-pressed={mobileDay === day.key}
            onDragOver={(event) => { event.preventDefault(); setMobileDay(day.key); setDropTarget({ day: day.key }) }} onDrop={(event) => dropOn(event, day.key)}
            onClick={() => setMobileDay(day.key)}>
            <span>{day.short}</span>
            <b className={`load-${loads[day.key].band.key}`}>{pct(loads[day.key].percentage)}%</b>
          </button>
        ))}
      </nav>

      <div className="week-frame">
        <div className="week-grid" role="list" aria-label="Commitments from Monday through Sunday">
          {WEEK_DAYS.map((day) => {
            const tasks = tasksForDay(state.tasks, day.key, true)
            const load = loads[day.key]
            const ghosts = day.key === destination
              ? selectedMoves.map((move) => state.tasks.find((task) => task.id === move.taskId)!).filter(Boolean)
              : []
            return (
              <section key={day.key} role="listitem" data-day={day.key}
                aria-label={day.label} onDragOver={(event) => { event.preventDefault(); setDropTarget(locateDrop(event.target as Element, event.clientY, day.key)) }}
                onDrop={(event) => dropOn(event, day.key)}
                className={`week-day${mobileDay === day.key ? ' is-mobile-active' : ''}${dropTarget?.day === day.key ? ' is-drop-target' : ''}`}>
                <header>
                  <div><strong>{day.short}</strong><span>{day.label}</span></div>
                  <span className={`day-load load-${load.band.key}`}>
                    <b>{pct(load.percentage)}%</b>{load.band.label}
                  </span>
                </header>
                <div className="week-day-body">
                  {tasks.length === 0 && ghosts.length === 0 && <p className="week-empty">Open space</p>}
                  {tasks.map((task) => <div key={task.id} style={{display:'contents'}}>
                    {dropTarget?.day === day.key && dropTarget.beforeId === task.id && <div className="drop-line" />}
                    <TaskBlock key={task.id} task={task}
                      onInspect={() => setInspected(task.id)}
                      draggable
                      selected={selectedSet.has(task.id)}
                      leaving={day.key === SOURCE_DAY && selectedSet.has(task.id)}
                      onToggle={previewOpen && day.key === SOURCE_DAY && movableIds.has(task.id) ? () => toggle(task.id) : undefined} />
                  </div>)}
                  {dropTarget?.day === day.key && !dropTarget.beforeId && <div className="drop-line" />}
                  {ghosts.map((task) => <TaskBlock key={`ghost-${task.id}`} task={task} suggested />)}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <aside className="kai-plan" aria-label="Kai's rebalancing suggestion">
        <p role="status">{moveMessage}</p>
        {undoTasks && <button type="button" onClick={() => { update((current) => ({ ...current, tasks: undoTasks })); setUndoTasks(null); setMoveMessage('Move undone.'); setPreviewOpen(false) }}>Undo last move</button>}
        <button type="button" onClick={() => { setPreviewOpen((open) => !open); setSelected(null) }}>{previewOpen ? 'Dismiss preview' : 'Ask Kai to rebalance'}</button>
        {inspected && (() => { const task = state.tasks.find((item) => item.id === inspected); return task && <section className="task-details" aria-label="Task details">
          <h2>{task.title}</h2><p>{taskTime(task) ?? 'No set time'} · {task.estimatedMinutes} minutes</p>
          <p>{task.flexibility === 'fixed'
            ? 'Locked: this is a fixed commitment.'
            : task.deadlineDays < 0
              ? `Flexible · currently scheduled ${Math.abs(task.deadlineDays)} day(s) after its deadline.`
              : `Flexible · deadline in ${task.deadlineDays} day(s) from its scheduled day.`}</p>
          <p>{task.notes}</p><button type="button" onClick={() => setInspected(null)}>Close details</button>
        </section> })()}
        <img src="/game/portraits/kai.webp" alt="Kai" />
        <div className="kai-copy">
          <span className="clock-kicker">Kai · planning guardian</span>
          {!previewOpen && !state.rebalanceSeen ? (
            <><h2>Your saved week.</h2><p>Drag a flexible task into place, or click any commitment to inspect it. Ask me when you want a suggested rebalance.</p></>
          ) : state.rebalanceSeen || proposal.moves.length === 0 ? (
            <>
              <h2>The week is telling the truth now.</h2>
              <p>What remains on Thursday is real. We can make the work smaller instead of moving it again.</p>
            </>
          ) : (
            <>
              <h2>Move only what has room to move.</h2>
              <p>Select the softly outlined Thursday tasks, then compare a destination. Dashed blocks are previews.</p>
            </>
          )}
        </div>

        {previewOpen && destinationOptions.length > 0 && (
          <>
            <div className="load-preview" aria-label="Load before and after the selected preview">
              <div><span>Thursday</span><b>{pct(originalLoads.thu.percentage)}%</b><i>→</i><strong>{pct(loads.thu.percentage)}%</strong></div>
              <div><span>{WEEK_DAYS.find((day) => day.key === destination)?.label}</span>
                <b>{pct(originalLoads[destination].percentage)}%</b><i>→</i><strong>{pct(loads[destination].percentage)}%</strong></div>
            </div>
            <div className="destination-picker" aria-label="Suggested destination day">
              {destinationOptions.map((option) => (
                <button key={option.key} type="button" aria-pressed={destination === option.key}
                  onClick={() => { setDestination(option.key); setSelected(null); setMobileDay(option.key) }}>
                  <span>{option.label}</span>
                  <small>{pct(option.load.percentage)}% now</small>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="clock-actions">
          {previewOpen && proposal.moves.length > 0 && (
            <button className="clock-primary" type="button" disabled={!selectedMoves.length} onClick={approve}>
              Approve {selectedMoves.length} move{selectedMoves.length === 1 ? '' : 's'}
            </button>
          )}
          <button type="button" onClick={() => go('work')}>Make one task smaller</button>
          <button type="button" onClick={onClose}>Step back into the room</button>
        </div>
      </aside>
      <p className="clock-disclaimer">Load is schedule pressure, not a judgement of you.</p>
    </section>
  )
}

export function ClockTower({ state, update, go, toast, onExit }: Props) {
  const [boardOpen, setBoardOpen] = useState(false)
  const [kaiOpen, setKaiOpen] = useState(false)
  const { room, avatar, near, walkTo, press } = useRoomMovement(boardOpen)
  const boardButton = useRef<HTMLButtonElement>(null)
  const waking = wakingMinutes(state.capacity)
  const thursday = dailyLoad(state.tasks, SOURCE_DAY, waking)

  const visit = (next: keyof typeof STATION_POSITION, action: () => void) => walkTo(STATION_POSITION[next], action)

  const closeBoard = useCallback(() => {
    setBoardOpen(false)
    window.requestAnimationFrame(() => boardButton.current?.focus())
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e' && !event.repeat && !boardOpen) {
        if (near) {
          event.preventDefault()
          if (near === 'board') setBoardOpen(true)
          else if (near === 'kai') setKaiOpen((open) => !open)
          else onExit()
        }
        return
      }
      if (event.key !== 'Escape') return
      if (boardOpen) closeBoard()
      else if (kaiOpen) setKaiOpen(false)
      else onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [boardOpen, kaiOpen, closeBoard, onExit, near])

  return (
    <div ref={room} className={`clock-scene${boardOpen ? ' is-board-open' : ''}`}>
      <img className="clock-room" src="/game/scenes/clock-tower/interior.webp"
        alt="A bright, sunlit planning room inside the Clock Tower" />
      <div className="clock-sun" aria-hidden="true" />

      <div className="clock-room-controls" inert={boardOpen ? true : undefined}
        aria-hidden={boardOpen ? true : undefined}>
      <header className="clock-hud">
        <div><span>Clock Tower</span><strong>Weekly planning room</strong></div>
        <div className={`clock-load load-${thursday.band.key}`}>
          <span>Thursday</span><strong>{pct(thursday.percentage)}%</strong>
        </div>
        <button type="button" onClick={onExit}>Exit to campus</button>
      </header>

      <button ref={boardButton} className="clock-hotspot hotspot-board" type="button"
        onClick={() => visit('board', () => setBoardOpen(true))}>
        <span>Open Week Board</span><small>See every commitment clearly</small>
      </button>

      <button className="clock-hotspot hotspot-kai" type="button"
        onClick={() => visit('kai', () => setKaiOpen((open) => !open))}>
        <span className="clock-kai-sprite" aria-hidden="true" />
        <span>Talk to Kai</span><small>Ask what can safely move</small>
      </button>

      <button className="clock-hotspot hotspot-door" type="button"
        onClick={() => visit('door', onExit)}>
        <span>Exit</span><small>Return to Campus Grove</small>
      </button>

      <div ref={avatar} className="clock-player avatar f-up" aria-label="Your avatar"
        style={{ left: '50%', top: '92%', backgroundImage: 'url(/game/world/player-sheet.webp)' }} />
      <div className="clock-dpad" aria-label="Room movement">
        {(['up', 'left', 'down', 'right'] as const).map((direction) => (
          <button key={direction} type="button" aria-label={`Move ${direction}`}
            onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); press(direction, true) }}
            onPointerUp={() => press(direction, false)} onPointerCancel={() => press(direction, false)}
            onLostPointerCapture={() => press(direction, false)}>
            {{ up: '↑', left: '←', down: '↓', right: '→' }[direction]}
          </button>
        ))}
      </div>

      {kaiOpen && !boardOpen && (
        <div className="clock-speech" role="status">
          <strong>Kai</strong>
          <p>{thursday.percentage > 95
            ? 'Thursday is carrying too much. The board can show what is fixed, what is flexible, and where space actually exists.'
            : 'Thursday is within the heavy range now. The board still keeps the whole week visible.'}</p>
          <button type="button" onClick={() => setBoardOpen(true)}>Open the Week Board</button>
        </div>
      )}

      <p className="clock-room-hint">WASD / arrows to walk · E near the board, Kai or exit · Esc to step back</p>
      {near && <div className="clock-near-prompt">E · {STATION_LABEL[near]}</div>}
      </div>

      {boardOpen && (
        <WeekBoard state={state} update={update} go={go} toast={toast}
          onClose={closeBoard} />
      )}
    </div>
  )
}
