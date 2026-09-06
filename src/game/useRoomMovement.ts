import { useEffect, useRef, useState } from 'react'
import { ENTRY, STATION_POSITION, type RoomStation } from './clockLayout'

type Direction = 'up' | 'down' | 'left' | 'right'
const KEYS: Record<string, Direction> = {
  w: 'up', a: 'left', s: 'down', d: 'right',
  arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right',
}

interface RoomMovementOptions<Station extends string> {
  stations?: Record<Station, { x: number; y: number }>
  avatarClass?: string
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
  talkRadius?: number
}

export function useRoomMovement<Station extends string = RoomStation>(
  blocked: boolean,
  options: RoomMovementOptions<Station> = {},
) {
  const stations = options.stations ?? STATION_POSITION as Record<Station, { x: number; y: number }>
  const avatarClass = options.avatarClass ?? 'clock-player'
  const minX = options.minX ?? 8
  const maxX = options.maxX ?? 92
  const minY = options.minY ?? 54
  const maxY = options.maxY ?? 94
  const talkRadius = options.talkRadius ?? 120
  const room = useRef<HTMLDivElement>(null)
  const avatar = useRef<HTMLDivElement>(null)
  const position = useRef({ x: ENTRY.x, y: ENTRY.y })
  const keys = useRef<Partial<Record<Direction, boolean>>>({})
  const target = useRef<{ x: number; y: number; arrive: () => void } | null>(null)
  const [near, setNear] = useState<Station | null>(null)

  useEffect(() => {
    keys.current = {}
    target.current = null
    let raf = 0
    let last: number | null = null
    let facing: Direction = 'up'
    const step = (now: number) => {
      const dt = last === null ? 0 : Math.max(0, Math.min((now - last) / 1000, .05))
      last = now
      const el = avatar.current
      const bounds = room.current
      if (el && bounds) {
        const width = bounds.clientWidth || 1280
        const height = bounds.clientHeight || 720
        let dx = Number(!!keys.current.right) - Number(!!keys.current.left)
        let dy = Number(!!keys.current.down) - Number(!!keys.current.up)
        let distance = Infinity
        if (dx || dy) target.current = null
        else if (target.current && !blocked) {
          dx = (target.current.x - position.current.x) * width / 100
          dy = (target.current.y - position.current.y) * height / 100
          distance = Math.hypot(dx, dy)
        }
        const magnitude = Math.hypot(dx, dy)
        if (!blocked && magnitude > 0) {
          const travel = Math.min(distance, 280 * dt)
          position.current.x = Math.max(minX, Math.min(maxX, position.current.x + dx / magnitude * travel / width * 100))
          position.current.y = Math.max(minY, Math.min(maxY, position.current.y + dy / magnitude * travel / height * 100))
          facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')
        }
        el.className = `${avatarClass} avatar f-${facing}${!blocked && magnitude > 0 ? ' walking' : ''}`
        el.style.left = `${position.current.x}%`
        el.style.top = `${position.current.y}%`
        const nearest = (Object.keys(stations) as Station[]).map((id) => ({ id,
          distance: Math.hypot((stations[id].x - position.current.x) * width / 100,
            (stations[id].y - position.current.y) * height / 100),
        })).sort((a, b) => a.distance - b.distance)[0]
        setNear(nearest && nearest.distance <= talkRadius ? nearest.id : null)
        if (!blocked && target.current && distance <= 280 * dt) {
          const action = target.current.arrive
          target.current = null
          el.classList.remove('walking')
          action()
        }
      }
      raf = requestAnimationFrame(step)
    }
    const down = (event: KeyboardEvent) => {
      const direction = KEYS[event.key.toLowerCase()]
      if (!blocked && direction && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        keys.current[direction] = true
      }
    }
    const up = (event: KeyboardEvent) => { const direction = KEYS[event.key.toLowerCase()]; if (direction) keys.current[direction] = false }
    const release = () => { keys.current = {}; target.current = null }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', release)
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', release)
    }
  }, [avatarClass, blocked, maxX, maxY, minX, minY, stations, talkRadius])

  return { room, avatar, position, near,
    walkTo: (point: { x: number; y: number }, arrive: () => void) => { target.current = { ...point, arrive } },
    press: (direction: Direction, held: boolean) => { keys.current[direction] = held },
  }
}
