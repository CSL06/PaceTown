/**
 * The live town — the landing page's playable hero.
 *
 * It opens on autopilot: the avatar walks a scenic route between the
 * guardians, and each one speaks as it arrives. The first key press, tap or
 * click hands control over to the visitor. Nothing is a video and nothing is
 * a mockup — this is the same map, the same sprites and the same layout data
 * the real game runs on.
 *
 * Position and camera are written straight to the DOM each frame. Only the
 * things a person actually reads — who is speaking, who is nearby — go
 * through React state.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BLOCKERS, CAST_ORDER, GUARDIANS, GUARDIAN_AT, PLACES, SPRITE_H, SPRITE_W,
  WORLD_H, WORLD_W, doorstep,
} from '../game/layout'
import type { GuardianId } from '../domain'

const MAP = '/game/world/campus-daylight.png'
const PLAYER_SHEET = '/game/world/player-sheet.png'
const CAST_SHEET = '/game/world/cast-sheet.png'

const SPEED = 430
const ARRIVE = 26

type Facing = 'up' | 'down' | 'left' | 'right'

const KEYS: Record<string, Facing> = {
  w: 'up', a: 'left', s: 'down', d: 'right',
  arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right',
}

/** The tour, in the order the loop actually runs. */
const ROUTE: GuardianId[] = ['kai', 'mira', 'sky', 'goh', 'sol']

/** What each guardian says on arrival — their real job, in their own voice. */
const LINES: Record<GuardianId, string[]> = {
  kai: [
    'Thursday is at 108%. That is arithmetic, not a judgement.',
    'Two of your flexible things can move to Saturday. Nothing shifts until you say so.',
  ],
  mira: [
    'Tell me what is blocking you and we will find the first visible step.',
    'One checkpoint. Not the whole assignment — just the part you can see the edge of.',
  ],
  sky: [
    'You can work here. I will not ask how it is going.',
    'Company, not pressure. Some weeks that is the whole difference.',
  ],
  goh: [
    'Small things finish. Errands group well — bring me the list in your head.',
    'Four little wins still count as four.',
  ],
  sol: [
    'This watering achieves nothing, and that is exactly the point.',
    'Ten minutes with something green. Outside, a window, a plant — all the same.',
  ],
}

interface Bubble {
  who: GuardianId
  text: string
}

interface Props {
  /** Pauses the whole simulation when the scene is off screen. */
  active?: boolean
  reducedMotion: boolean
}

export function LiveTown({ active = true, reducedMotion }: Props) {
  const stage = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const avatar = useRef<HTMLDivElement>(null)

  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [manual, setManual] = useState(false)

  const pos = useRef({ x: WORLD_W * 0.498, y: WORLD_H * 0.66 })
  const camera = useRef({ x: 0, y: 0, set: false })
  const facing = useRef<Facing>('down')
  const keys = useRef<Record<string, boolean>>({})
  /** Where the avatar is heading: a click target, or the next tour stop. */
  const target = useRef<{ x: number; y: number } | null>(null)
  /* -1 so the first nextLeg lands on ROUTE[0] rather than skipping it. */
  const leg = useRef(-1)
  const takenOver = useRef(false)
  const paused = useRef(false)
  const speaking = useRef<GuardianId | null>(null)
  const waitUntil = useRef(0)
  const lineIndex = useRef(0)

  const guardianSpots = useRef(
    CAST_ORDER.map((id, i) => {
      const place = PLACES.find((p) => p.id === GUARDIAN_AT[id])!
      const at = doorstep(place)
      return {
        id,
        i,
        // The sprite stands slightly left of the marker so the two do not overlap.
        x: ((at.px - 2.4) / 100) * WORLD_W,
        y: ((at.py + 3) / 100) * WORLD_H,
        placeName: place.name,
      }
    }),
  ).current

  /** Hands control to the visitor and cancels the tour. */
  const takeOver = useCallback(() => {
    if (takenOver.current) return
    takenOver.current = true
    target.current = null
    setManual(true)
  }, [])

  const stopAt = useCallback((id: GuardianId) => {
    const lines = LINES[id]
    const text = lines[lineIndex.current % lines.length]
    speaking.current = id
    setBubble({ who: id, text })
  }, [])

  useEffect(() => { paused.current = !active }, [active])

  useEffect(() => {
    const stageEl = stage.current
    const worldEl = world.current
    const avatarEl = avatar.current
    if (!stageEl || !worldEl || !avatarEl) return

    let raf = 0
    let last = performance.now()

    const paint = (walking: boolean) => {
      avatarEl.className = `lt-spr lt-avatar f-${facing.current}${walking && !reducedMotion ? ' walking' : ''}`
      avatarEl.style.transform =
        `translate(${Math.round(pos.current.x - SPRITE_W / 2)}px, ${Math.round(pos.current.y - SPRITE_H)}px)`
    }

    const camerate = (dt: number) => {
      const w = stageEl.clientWidth
      const h = stageEl.clientHeight
      const wantX = Math.min(0, Math.max(w - WORLD_W, w / 2 - pos.current.x))
      const wantY = Math.min(0, Math.max(h - WORLD_H, h / 2 - pos.current.y))
      if (!camera.current.set) {
        camera.current = { x: wantX, y: wantY, set: true }
      } else {
        // Trails the avatar rather than locking to it, so the town drifts.
        const ease = Math.min(1, dt * 3.4)
        camera.current.x += (wantX - camera.current.x) * ease
        camera.current.y += (wantY - camera.current.y) * ease
      }
      worldEl.style.transform =
        `translate(${Math.round(camera.current.x)}px, ${Math.round(camera.current.y)}px)`
    }

    const nextLeg = (now: number) => {
      speaking.current = null
      setBubble(null)
      leg.current += 1
      // Advance to each guardian's next line only after a full lap.
      if (leg.current > 0 && leg.current % ROUTE.length === 0) lineIndex.current += 1
      waitUntil.current = now
      const id = ROUTE[leg.current % ROUTE.length]
      const spot = guardianSpots.find((g) => g.id === id)!
      // Stand beside the guardian, not on top of them.
      target.current = { x: spot.x + 96, y: spot.y + 10 }
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (paused.current) return

      let vx = 0
      let vy = 0

      if (keys.current.left) vx -= 1
      if (keys.current.right) vx += 1
      if (keys.current.up) vy -= 1
      if (keys.current.down) vy += 1

      if (!vx && !vy && target.current) {
        const dx = target.current.x - pos.current.x
        const dy = target.current.y - pos.current.y
        const distance = Math.hypot(dx, dy)
        if (distance < ARRIVE) {
          target.current = null
          if (!takenOver.current) {
            // Autopilot: say the line, hold, then walk to the next guardian.
            stopAt(ROUTE[leg.current % ROUTE.length])
            waitUntil.current = now + 4200
          }
        } else {
          vx = dx / distance
          vy = dy / distance
        }
      }

      // Autopilot idles between stops; a held key always wins.
      if (!takenOver.current && !target.current && now >= waitUntil.current) nextLeg(now)

      if (!vx && !vy) { paint(false); camerate(dt); return }

      const m = Math.hypot(vx, vy) || 1
      let x = pos.current.x + (vx / m) * SPEED * dt
      let y = pos.current.y + (vy / m) * SPEED * dt
      x = Math.max(90, Math.min(WORLD_W - 90, x))
      y = Math.max(315, Math.min(WORLD_H - 60, y))

      for (const b of BLOCKERS) {
        const bx = (b.px / 100) * WORLD_W
        const by = (b.py / 100) * WORLD_H
        const dx = x - bx
        const dy = y - by
        const d = Math.hypot(dx, dy)
        if (d < b.r && d > 0.001) { x = bx + (dx / d) * b.r; y = by + (dy / d) * b.r }
      }

      pos.current = { x, y }
      facing.current = Math.abs(vx) > Math.abs(vy)
        ? (vx > 0 ? 'right' : 'left')
        : (vy > 0 ? 'down' : 'up')

      paint(true)
      camerate(dt)

      // Walking up to someone under your own steam makes them speak too.
      if (takenOver.current) {
        let nearest: GuardianId | null = null
        for (const g of guardianSpots) {
          if (Math.hypot(g.x - x, g.y - y) < 230) { nearest = g.id; break }
        }
        if (nearest !== speaking.current) {
          speaking.current = nearest
          if (nearest) {
            const lines = LINES[nearest]
            setBubble({ who: nearest, text: lines[lineIndex.current % lines.length] })
          } else {
            setBubble(null)
          }
        }
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const k = KEYS[e.key.toLowerCase()]
      if (!k) return
      // Only capture the keys when the scene is actually focused, or the page
      // cannot be scrolled with the arrow keys.
      if (!stageEl.contains(document.activeElement) && document.activeElement !== stageEl) return
      e.preventDefault()
      takeOver()
      keys.current[k] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = KEYS[e.key.toLowerCase()]
      if (k) keys.current[k] = false
    }
    const release = () => { keys.current = {} }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', release)

    if (reducedMotion) {
      // No tour and no idle bob, but the scene should not be mute: show one
      // guardian's line and let the visitor walk to the rest at their own pace.
      takenOver.current = true
      setManual(true)
      speaking.current = ROUTE[0]
      setBubble({ who: ROUTE[0], text: LINES[ROUTE[0]][0] })
    }

    paint(false)
    camerate(1)
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', release)
    }
  }, [guardianSpots, reducedMotion, stopAt, takeOver])

  /** Click or tap anywhere in the town to walk there. */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const stageEl = stage.current
    if (!stageEl) return
    stageEl.focus({ preventScroll: true })
    const rect = stageEl.getBoundingClientRect()
    takeOver()
    target.current = {
      x: e.clientX - rect.left - camera.current.x,
      y: e.clientY - rect.top - camera.current.y,
    }
  }

  const press = (dir: Facing, held: boolean) => {
    takeOver()
    keys.current[dir] = held
  }

  return (
    <div className="lt">
      <div
        className="lt-stage"
        ref={stage}
        tabIndex={0}
        role="application"
        aria-label="Campus Grove, live. Walk with the arrow keys or by tapping the town."
        onPointerDown={onPointerDown}
      >
        <div className="lt-world" ref={world}>
          <img className="lt-map" src={MAP} alt="" draggable={false} />

          {guardianSpots.map((g) => (
            <div key={g.id} className="lt-actor" style={{ transform: `translate(${g.x}px, ${g.y}px)` }}>
              <div
                className={`lt-spr lt-cast${reducedMotion ? '' : ' idle'}`}
                role="img"
                aria-label={`${GUARDIANS[g.id].name}, at the ${g.placeName}`}
                style={{
                  backgroundImage: `url(${CAST_SHEET})`,
                  backgroundPositionX: `${(g.i / (CAST_ORDER.length - 1)) * 100}%`,
                }}
              />
              <span className="lt-tag">{GUARDIANS[g.id].name}</span>
              {bubble?.who === g.id && (
                <div className="lt-bubble" role="status">
                  {bubble.text}
                  <i aria-hidden="true" />
                </div>
              )}
            </div>
          ))}

          <div className="lt-spr lt-avatar f-down" ref={avatar} role="img" aria-label="You"
            style={{ backgroundImage: `url(${PLAYER_SHEET})` }} />
        </div>

        <div className="lt-vignette" aria-hidden="true" />

        <div className={`lt-coach${manual ? ' faded' : ''}`}>
          {manual
            ? <><b>You have the controls.</b> Click to walk, or use W A S D.</>
            : <><b>The town is running itself.</b> Click anywhere to take over.</>}
        </div>

        <div className="lt-dpad" aria-hidden="true">
          {(['up', 'left', 'down', 'right'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              tabIndex={-1}
              className={dir === 'up' ? 'up' : undefined}
              onPointerDown={(e) => { e.stopPropagation(); press(dir, true) }}
              onPointerUp={() => press(dir, false)}
              onPointerLeave={() => press(dir, false)}
            >
              {{ up: '↑', left: '←', down: '↓', right: '→' }[dir]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
