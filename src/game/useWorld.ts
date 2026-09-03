/**
 * Movement, camera and proximity.
 *
 * Position lives in a ref and is written straight to the DOM each frame —
 * routing 60fps movement through React state would re-render the whole tree
 * sixty times a second. Only discrete changes (which place you are near)
 * become state.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BLOCKERS, PLACES, TALK_RADIUS, WORLD_H, WORLD_W, type Place,
} from './layout'

const KEY_MAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  w: 'up', a: 'left', s: 'down', d: 'right',
  arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right',
}

const SPEED = 330 // world pixels per second

export type Facing = 'up' | 'down' | 'left' | 'right'

export interface WorldRefs {
  stage: React.RefObject<HTMLDivElement | null>
  world: React.RefObject<HTMLDivElement | null>
  avatar: React.RefObject<HTMLDivElement | null>
}

interface Options {
  enabled: boolean
  reducedMotion: boolean
  initial: { px: number; py: number }
  initialFacing: Facing
  onMoved: (pos: { px: number; py: number }, facing: Facing) => void
}

export function useWorld(refs: WorldRefs, opts: Options) {
  const pos = useRef({ ...opts.initial })
  const facing = useRef<Facing>(opts.initialFacing)
  const keys = useRef<Record<string, boolean>>({})
  const [near, setNear] = useState<Place | null>(null)
  const nearRef = useRef<Place | null>(null)
  const enabled = useRef(opts.enabled)
  enabled.current = opts.enabled

  const applyCamera = useCallback(() => {
    const stage = refs.stage.current
    const world = refs.world.current
    if (!stage || !world) return
    const ax = (pos.current.px / 100) * WORLD_W
    const ay = (pos.current.py / 100) * WORLD_H
    const cx = Math.min(0, Math.max(stage.clientWidth - WORLD_W, stage.clientWidth / 2 - ax))
    const cy = Math.min(0, Math.max(stage.clientHeight - WORLD_H, stage.clientHeight / 2 - ay))
    world.style.transform = `translate(${Math.round(cx)}px, ${Math.round(cy)}px)`
  }, [refs.stage, refs.world])

  const paint = useCallback((walking: boolean) => {
    const el = refs.avatar.current
    if (!el) return
    el.className = `spr avatar f-${facing.current}${walking && !opts.reducedMotion ? ' walking' : ''}`
    el.style.left = `${pos.current.px}%`
    el.style.top = `${pos.current.py}%`
  }, [refs.avatar, opts.reducedMotion])

  const checkProximity = useCallback(() => {
    const ax = (pos.current.px / 100) * WORLD_W
    const ay = (pos.current.py / 100) * WORLD_H
    let best: Place | null = null
    let bestDistance = TALK_RADIUS
    for (const place of PLACES) {
      const dx = (place.px / 100) * WORLD_W - ax
      const dy = ((place.py + 7) / 100) * WORLD_H - ay
      const d = Math.hypot(dx, dy)
      if (d < bestDistance) { bestDistance = d; best = place }
    }
    if (best !== nearRef.current) {
      nearRef.current = best
      setNear(best)
    }
  }, [])

  /** Teleport to a place — used by the Town List, which must reach everything. */
  const moveTo = useCallback((p: { px: number; py: number }, f: Facing = 'down') => {
    pos.current = { ...p }
    facing.current = f
    paint(false)
    applyCamera()
    checkProximity()
    opts.onMoved(pos.current, facing.current)
  }, [paint, applyCamera, checkProximity, opts])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let saveTimer = 0

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!enabled.current) return

      let vx = 0
      let vy = 0
      if (keys.current.left) vx -= 1
      if (keys.current.right) vx += 1
      if (keys.current.up) vy -= 1
      if (keys.current.down) vy += 1

      if (!vx && !vy) { paint(false); return }

      const m = Math.hypot(vx, vy)
      vx /= m; vy /= m

      let x = (pos.current.px / 100) * WORLD_W + vx * SPEED * dt
      let y = (pos.current.py / 100) * WORLD_H + vy * SPEED * dt
      x = Math.max(60, Math.min(WORLD_W - 60, x))
      y = Math.max(210, Math.min(WORLD_H - 40, y))

      for (const b of BLOCKERS) {
        const bx = (b.px / 100) * WORLD_W
        const by = (b.py / 100) * WORLD_H
        const dx = x - bx
        const dy = y - by
        const d = Math.hypot(dx, dy)
        if (d < b.r && d > 0.001) { x = bx + (dx / d) * b.r; y = by + (dy / d) * b.r }
      }

      pos.current = { px: (x / WORLD_W) * 100, py: (y / WORLD_H) * 100 }
      facing.current = Math.abs(vx) > Math.abs(vy)
        ? (vx > 0 ? 'right' : 'left')
        : (vy > 0 ? 'down' : 'up')

      paint(true)
      applyCamera()
      checkProximity()

      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => opts.onMoved(pos.current, facing.current), 500)
    }

    const down = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key.toLowerCase()]
      if (k && enabled.current) { e.preventDefault(); keys.current[k] = true }
    }
    const up = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key.toLowerCase()]
      if (k) keys.current[k] = false
    }
    const release = () => { keys.current = {} }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', release)
    window.addEventListener('resize', applyCamera)
    raf = requestAnimationFrame(step)

    paint(false)
    applyCamera()
    checkProximity()

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(saveTimer)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', release)
      window.removeEventListener('resize', applyCamera)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyCamera, paint, checkProximity])

  const press = useCallback((dir: 'up' | 'down' | 'left' | 'right', held: boolean) => {
    keys.current[dir] = held
  }, [])

  return { near, moveTo, press, position: pos, facing }
}
