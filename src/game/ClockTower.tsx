import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  REWARDS, WEEK_DAYS, applySelected, dailyLoad, proposeRebalance,
  taskTime, tasksForDay, wakingMinutes, weekLoads, type Task,
} from '../domain'
import { grow, record, type GameState } from './state'
import type { ViewId } from './layout'
import './clock-tower.css'
import { useRoomMovement } from './useRoomMovement'
import { dayIndex } from '../domain/calendar'

const SOURCE_DAY = 'thu'
const DEFAULT_DESTINATION = 'sat'
const STATION_POSITION = {
  entry: { x: 50, y: 92 },
  board: { x: 50, y: 57 },
  kai: { x: 68, y: 73 },
  door: { x: 72, y: 54 },
} as const

interface Props {
  state: GameState
  update: (fn: (state: GameState) => GameState) => void
  go: (view: ViewId | null) => void
  toast: (message: string) => void
  onExit: () => void
}

function pct(value: number): string {
  return Number.isFinite(value) ? value.toFixed(0) : '∞'
}

function TaskBlock({ task, selected, suggested, leaving, onToggle, draggable = false }: {
  task: Task
  selected?: boolean
  suggested?: boolean
  leaving?: boolean
  onToggle?: () => void
  draggable?: boolean
}) {
  const time = taskTime(task)
  const className = [
    'week-task', `is-${task.category}`, task.flexibility === 'fixed' ? 'is-fixed' : '',
    selected ? 'is-selected' : '', suggested ? 'is-ghost' : '', leaving ? 'is-leaving' : '',
  ].filter(Boolean).join(' ')
  const content = (
    <>
      <span className="week-task-top">
        <span>{time ?? `${task.estimatedMinutes} min · ${task.flexibility}`}</span>
        {task.flexibility === 'fixed' && <span aria-label="Fixed commitment">⌑</span>}
      </span>
      <strong>{task.title}</strong>
      {suggested && <span className="week-task-note">Preview here</span>}
    </>
  )

  return <div draggable={draggable && task.flexibility === 'flexible'}
    onDragStart={(event) => { event.dataTransfer.setData('text/plain', task.id); event.dataTransfer.effectAllowed = 'move' }}>
    {onToggle ? (
    <button type="button" className={className} aria-pressed={selected} onClick={onToggle}
      aria-label={`${selected ? 'Remove' : 'Select'} ${task.title} for moving`}>
      {content}
    </button>
  ) : <div className={className}>{content}</div>}
  </div>
}

function WeekBoard({ state, update, go, toast, onClose }: Omit<Props, 'onExit'> & { onClose: () => void }) {
  const waking = wakingMinutes(state.capacity)
  const [destination, setDestination] = useState(DEFAULT_DESTINATION)
  const [selected, setSelected] = useState<string[] | null>(null)
  const [mobileDay, setMobileDay] = useState(SOURCE_DAY)
  const [moveMessage, setMoveMessage] = useState('Drag flexible tasks to another day. Fixed commitments stay locked.')
  const moveTask = (id: string, day: string) => {
    const task = state.tasks.find((item) => item.id === id)
    if (!task || task.flexibility === 'fixed' || dayIndex(day) < 0 || task.day === day) return
    const shift = dayIndex(day) - dayIndex(task.day)
    if (shift > task.deadlineDays) {
      setMoveMessage(`${task.title} cannot move past its deadline.`)
      return
    }
    update((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === id
      ? { ...item, day, deadlineDays: item.deadlineDays - shift } : item) }))
    setSelected([])
    setMoveMessage(`${task.title} moved to ${WEEK_DAYS.find((entry) => entry.key === day)?.label}.`)
  }
  const dropOn = (event: React.DragEvent, day: string) => {
    event.preventDefault()
    moveTask(event.dataTransfer.getData('text/plain'), day)
  }

  const proposal = useMemo(() => proposeRebalance(state.tasks, {
    day: SOURCE_DAY, destination, waking,
  }), [state.tasks, destination, waking])
  const selectedIds = selected ?? proposal.moves.map((move) => move.taskId)
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
    update((current) => grow(record({
      ...current,
      tasks: applied,
      rebalanceSeen: true,
      rebalanceApproved: true,
    }, 'Rebalanced an overloaded day',
    `${titles} — moved to ${WEEK_DAYS.find((day) => day.key === destination)?.label}. ` +
      `Thursday ${pct(originalLoads.thu.percentage)}% → ${pct(afterSource.percentage)}%.`,
    REWARDS.rebalance)))
    toast(`Week rebalanced · +${REWARDS.rebalance.xp} XP`)
    setSelected([])
  }

  return (
    <section className="clock-board-screen" role="dialog" aria-modal="true"
      aria-label="Weekly planning board">
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
          <button key={day.key} type="button" aria-pressed={mobileDay === day.key}
            onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOn(event, day.key)}
            onClick={() => setMobileDay(day.key)}>
            <span>{day.short}</span>
            <b className={`load-${loads[day.key].band.key}`}>{pct(loads[day.key].percentage)}%</b>
          </button>
        ))}
      </nav>

      <div className="week-frame">
        <div className="week-grid" role="list" aria-label="Commitments from Monday through Sunday">
          {WEEK_DAYS.map((day) => {
            const tasks = tasksForDay(state.tasks, day.key)
            const load = loads[day.key]
            const ghosts = day.key === destination
              ? selectedMoves.map((move) => state.tasks.find((task) => task.id === move.taskId)!).filter(Boolean)
              : []
            return (
              <section key={day.key} role="listitem"
                aria-label={day.label} onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropOn(event, day.key)}
                className={`week-day${mobileDay === day.key ? ' is-mobile-active' : ''}`}>
                <header>
                  <div><strong>{day.short}</strong><span>{day.label}</span></div>
                  <span className={`day-load load-${load.band.key}`}>
                    <b>{pct(load.percentage)}%</b>{load.band.label}
                  </span>
                </header>
                <div className="week-day-body">
                  {tasks.length === 0 && ghosts.length === 0 && <p className="week-empty">Open space</p>}
                  {tasks.map((task) => (
                    <TaskBlock key={task.id} task={task}
                      draggable
                      selected={selectedSet.has(task.id)}
                      leaving={day.key === SOURCE_DAY && selectedSet.has(task.id)}
                      onToggle={day.key === SOURCE_DAY && movableIds.has(task.id) ? () => toggle(task.id) : undefined} />
                  ))}
                  {ghosts.map((task) => <TaskBlock key={`ghost-${task.id}`} task={task} suggested />)}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <aside className="kai-plan" aria-label="Kai's rebalancing suggestion">
        <p role="status">{moveMessage}</p>
        <img src="/game/portraits/kai.png" alt="Kai" />
        <div className="kai-copy">
          <span className="clock-kicker">Kai · planning guardian</span>
          {state.rebalanceSeen || proposal.moves.length === 0 ? (
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

        {!state.rebalanceSeen && destinationOptions.length > 0 && (
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
          {!state.rebalanceSeen && proposal.moves.length > 0 && (
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
  const { room, avatar, position, walkTo, press } = useRoomMovement(boardOpen)
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
        const bounds = room.current
        if (!bounds) return
        const nearest = (['board', 'kai', 'door'] as const).map((id) => ({ id,
          distance: Math.hypot((STATION_POSITION[id].x - position.current.x) * bounds.clientWidth / 100,
            (STATION_POSITION[id].y - position.current.y) * bounds.clientHeight / 100),
        })).sort((a, b) => a.distance - b.distance)[0]
        if (nearest.distance <= 120) {
          event.preventDefault()
          if (nearest.id === 'board') setBoardOpen(true)
          else if (nearest.id === 'kai') setKaiOpen((open) => !open)
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
  }, [boardOpen, kaiOpen, closeBoard, onExit, position, room])

  return (
    <div ref={room} className={`clock-scene${boardOpen ? ' is-board-open' : ''}`}>
      <img className="clock-room" src="/game/scenes/clock-tower/interior.png"
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
        style={{ left: '50%', top: '92%', backgroundImage: 'url(/game/world/player-sheet.png)' }} />
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
      </div>

      {boardOpen && (
        <WeekBoard state={state} update={update} go={go} toast={toast}
          onClose={closeBoard} />
      )}
    </div>
  )
}
