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
  BLOCKERS, CAST_ORDER, GUARDIANS, GUARDIAN_AT, GUARDIAN_POSITIONS, isWalkablePosition,
  PLAYER_COLLISION_MARGIN, PLACES, resolveBlockerPosition, SPAWN, SPRITE_H, SPRITE_W, WALK_BOUNDS,
  WORLD_H, WORLD_W,
} from '../game/layout'
import type { GuardianId } from '../domain'

const MAP = '/game/world/campus-daylight.webp'
const PLAYER_SHEET = '/game/world/player-sheet.webp'
const CAST_SHEET = '/game/world/cast-sheet.webp'

const SPEED = 430
const ARRIVE = 26

type Facing = 'up' | 'down' | 'left' | 'right'

const KEYS: Record<string, Facing> = {
  w: 'up', a: 'left', s: 'down', d: 'right',
  arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right',
}

/** The tour, in the order the loop actually runs. */
const ROUTE: GuardianId[] = ['kai', 'mira', 'sky', 'goh', 'sol']

/** Road bends for each leg of the preview tour. Direct lines cut through the
 * central planter and painted buildings even when both endpoints are clear. */
const TOUR_TRANSIT: Record<string, { px: number; py: number }[]> = {
  // Start by sweeping around the west side of the central planter.
  'start->kai': [{ px: 40, py: 75 }, { px: 40, py: 40 }],
  'sky->goh': [{ px: 49, py: 71 }, { px: 58, py: 72 }, { px: 72, py: 66 }],
  // Come around the south edge of the recovery pond, then use the east path
  // to Sol instead of cutting through the pond/pavilion overlap.
  'goh->sol': [{ px: 55, py: 45 }, { px: 56, py: 40 }, { px: 76, py: 40 }, { px: 84, py: 38 }],
  // The return leg uses the same road in reverse before dropping below the
  // central planter for the next lap.
  'sol->kai': [
    { px: 84, py: 38 }, { px: 76, py: 45 }, { px: 70, py: 50 },
    { px: 56, py: 50 }, { px: 40, py: 45 }, { px: 38, py: 40 },
    { px: 38, py: 75 }, { px: 38, py: 40 },
  ],
}

const TOUR_APPROACH: Partial<Record<GuardianId, { px: number; py: number }>> = {
  // The default right-side offset lands inside the pond edge for these two.
  kai: { px: 56.7, py: 31.4 },
  sol: { px: 87, py: 28 },
}

/** What each guardian says on arrival — their real job, in their own voice. */
const LINES: Record<GuardianId, string[]> = {
  kai: [
    'Thursday is carrying fixed commitments and flexible work. That is arithmetic, not a judgement.',
    'Some flexible things can move to Saturday. Nothing shifts until you say so.',
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

const GUARDIAN_SPOTS = CAST_ORDER.map((id, i) => {
  const place = PLACES.find((candidate) => candidate.id === GUARDIAN_AT[id])!
  const at = GUARDIAN_POSITIONS[id]
  return {
    id,
    i,
    x: at.px / 100 * WORLD_W,
    y: at.py / 100 * WORLD_H,
    placeName: place.name,
  }
})

interface Bubble {
  who: GuardianId
  text: string
}

interface Props {
  /** Pauses the whole simulation when the scene is off screen. */
  active?: boolean
  reducedMotion: boolean
  onTakeOver?: () => void
}

export function LiveTown({ active = true, reducedMotion, onTakeOver }: Props) {
  const stage = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const avatar = useRef<HTMLDivElement>(null)

  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [manual, setManual] = useState(false)

  const pos = useRef({ x: WORLD_W * SPAWN.px / 100, y: WORLD_H * SPAWN.py / 100 })
  const camera = useRef({ x: 0, y: 0, set: false })
  const facing = useRef<Facing>('down')
  const keys = useRef<Record<string, boolean>>({})
  /** Where the avatar is heading: a click target, or the next tour stop. */
  const target = useRef<{ x: number; y: number } | null>(null)
  const waypointQueue = useRef<{ x: number; y: number }[]>([])
  /* -1 so the first nextLeg lands on ROUTE[0] rather than skipping it. */
  const leg = useRef(-1)
  const takenOver = useRef(false)
  const paused = useRef(false)
  const speaking = useRef<GuardianId | null>(null)
  const waitUntil = useRef(0)
  const lineIndex = useRef(0)

  const guardianSpots = GUARDIAN_SPOTS

  /** Hands control to the visitor and cancels the tour. */
  const takeOver = useCallback(() => {
    if (takenOver.current) return
    takenOver.current = true
    target.current = null
    waypointQueue.current = []
    setManual(true)
    onTakeOver?.()
  }, [onTakeOver])

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
      const approach = TOUR_APPROACH[id]
      const finalStop = approach
        ? { x: approach.px / 100 * WORLD_W, y: approach.py / 100 * WORLD_H }
        : { x: spot.x + 96, y: spot.y + 10 }
      const previous = leg.current > 0 ? ROUTE[(leg.current - 1) % ROUTE.length] : null
      const transit = TOUR_TRANSIT[previous ? `${previous}->${id}` : `start->${id}`] ?? []
      waypointQueue.current = [
        ...transit.map((point) => ({
          x: point.px / 100 * WORLD_W,
          y: point.py / 100 * WORLD_H,
        })),
        finalStop,
      ]
      target.current = waypointQueue.current.shift() ?? finalStop
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
          if (waypointQueue.current.length > 0) {
            target.current = waypointQueue.current.shift() ?? null
          } else {
            target.current = null
          }
          if (!takenOver.current && !target.current) {
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
      x = Math.max(WORLD_W * WALK_BOUNDS.minX / 100, Math.min(WORLD_W * WALK_BOUNDS.maxX / 100, x))
      y = Math.max(WORLD_H * WALK_BOUNDS.minY / 100, Math.min(WORLD_H * WALK_BOUNDS.maxY / 100, y))

      for (let pass = 0; pass < 2; pass += 1) {
        for (const b of BLOCKERS) {
          const resolved = resolveBlockerPosition(x, y, b, PLAYER_COLLISION_MARGIN)
          x = resolved.x
          y = resolved.y
        }
      }

      if (!isWalkablePosition({ px: x / WORLD_W * 100, py: y / WORLD_H * 100 })) {
        x = pos.current.x
        y = pos.current.y
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
