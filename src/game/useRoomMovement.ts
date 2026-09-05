import { useEffect, useRef } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'
const KEYS: Record<string, Direction> = {
  w: 'up', a: 'left', s: 'down', d: 'right',
  arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right',
}

export function useRoomMovement(blocked: boolean) {
  const room = useRef<HTMLDivElement>(null)
  const avatar = useRef<HTMLDivElement>(null)
  const position = useRef({ x: 50, y: 92 })
  const keys = useRef<Partial<Record<Direction, boolean>>>({})
  const target = useRef<{ x: number; y: number; arrive: () => void } | null>(null)

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
          position.current.x = Math.max(8, Math.min(92, position.current.x + dx / magnitude * travel / width * 100))
          position.current.y = Math.max(54, Math.min(94, position.current.y + dy / magnitude * travel / height * 100))
          facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')
        }
        el.className = `clock-player avatar f-${facing}${!blocked && magnitude > 0 ? ' walking' : ''}`
        el.style.left = `${position.current.x}%`
        el.style.top = `${position.current.y}%`
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
  }, [blocked])

  return { room, avatar,
    walkTo: (point: { x: number; y: number }, arrive: () => void) => { target.current = { ...point, arrive } },
    press: (direction: Direction, held: boolean) => { keys.current[direction] = held },
  }
}
