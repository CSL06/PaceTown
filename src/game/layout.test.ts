import { describe, expect, it } from 'vitest'
import {
  BLOCKERS, doorstep, firstStepForIntro, focusGuardianFor, groundZ, GUARDIAN_POSITIONS,
  isBlockedPosition, resolveBlockerPosition,
  GUARDIAN_AT, isWalkablePosition, MAP_H, MAP_SCALE, MAP_W, nextStepFor, PLACES, safePosition,
  SPAWN, SPRITE_W, TALK_RADIUS, WORLD_H, WORLD_W,
} from './layout'
import { nearestPlace } from './useWorld'

describe('campus placement', () => {
  it('keeps the council arrival and initial spawn on the path below the planter', () => {
    const council = PLACES.find((place) => place.id === 'council')!
    expect(doorstep(council)).toEqual({ px: 49.8, py: 75 })
    expect(isBlockedPosition(SPAWN)).toBe(false)
    expect(isBlockedPosition({ px: 49.8, py: 61 })).toBe(true)
  })

  it('keeps every travel arrival inside bounds and outside scenery', () => {
    for (const place of PLACES) expect(isWalkablePosition(doorstep(place))).toBe(true)
  })

  it('uses clear paving-side arrivals for the visually crowded districts', () => {
    expect(doorstep(PLACES.find((place) => place.id === 'library')!)).toEqual({ px: 22.9, py: 34 })
    expect(doorstep(PLACES.find((place) => place.id === 'clock')!)).toEqual({ px: 58, py: 28 })
    // Moved north with Sky: at py 62 both of them straddled the terrace
    // railing, and a flat map image cannot occlude a sprite's feet.
    expect(doorstep(PLACES.find((place) => place.id === 'cafe')!)).toEqual({ px: 28, py: 60.2 })
    expect(doorstep(PLACES.find((place) => place.id === 'market')!)).toEqual({ px: 66, py: 61 })
  })

  it('keeps the approach to Sol open around the pond and pavilion', () => {
    expect(doorstep(PLACES.find((place) => place.id === 'garden')!)).toEqual({ px: 88, py: 28 })
    for (const point of [
      { px: 55, py: 45 }, { px: 56, py: 40 }, { px: 76, py: 40 },
      { px: 84, py: 38 }, { px: 87, py: 28 },
    ]) expect(isWalkablePosition(point)).toBe(true)
  })

  it('detects Council at the same arrival used by travel and markers', () => {
    expect(nearestPlace(doorstep(PLACES.find((place) => place.id === 'council')!))?.id)
      .toBe('council')
  })

  it('keeps guardian feet on valid ground with explicit positions', () => {
    for (const placement of Object.values(GUARDIAN_POSITIONS)) {
      expect(isWalkablePosition(placement)).toBe(true)
      expect(placement.facing).toBe('down')
    }
  })

  it('keeps arrivals beside guardians without stacking the two sprites', () => {
    for (const [guardian, placeId] of Object.entries(GUARDIAN_AT)) {
      const standing = GUARDIAN_POSITIONS[guardian as keyof typeof GUARDIAN_POSITIONS]
      const arrival = doorstep(PLACES.find((place) => place.id === placeId)!)
      const distance = Math.hypot(
        (standing.px - arrival.px) / 100 * WORLD_W,
        (standing.py - arrival.py) / 100 * WORLD_H,
      )
      // A sprite is SPRITE_W wide, so that is the figure "not stacked"
      // actually means. The old literal 80 was a world-pixel value that
      // silently stopped meaning anything when the world was re-based.
      expect(distance).toBeGreaterThan(SPRITE_W)
      expect(distance).toBeLessThan(TALK_RADIUS)
    }
  })

  it('repairs invalid, non-finite, and exact-centre requests safely', () => {
    expect(safePosition({ px: Number.NaN, py: 40 })).toEqual(SPAWN)
    expect(safePosition({ px: 0, py: 40 })).toEqual(SPAWN)
    expect(safePosition({ px: 49.8, py: 61 })).toEqual(SPAWN)
    expect(isWalkablePosition({ px: 49.8, py: 61 })).toBe(false)
  })

  it('keeps the paving ring around the planter usable', () => {
    expect(isWalkablePosition(SPAWN)).toBe(true)
    expect(isWalkablePosition({ px: 61, py: 61 })).toBe(true)
    expect(isWalkablePosition({ px: 38.6, py: 61 })).toBe(true)
  })


  it('blocks the recovery pond and east market building shown in the artwork', () => {
    expect(isBlockedPosition({ px: 69, py: 33 })).toBe(true)
    expect(isBlockedPosition({ px: 90, py: 52 })).toBe(true)
  })

  it('states the real size of the illustration', () => {
    // This was documented as 1200x800 at an integer 3x upscale. It is neither,
    // and the wrong figure is the kind that quietly propagates into new art.
    expect([MAP_W, MAP_H]).toEqual([1536, 1024])
  })

  it('upscales the map by a whole number', () => {
    // A fractional multiple lands source pixels on 2- or 3-pixel blocks, which
    // is what made straight edges in the artwork stair-step unevenly.
    expect(Number.isInteger(MAP_SCALE)).toBe(true)
    expect(WORLD_W).toBe(MAP_W * MAP_SCALE)
    expect(WORLD_H).toBe(MAP_H * MAP_SCALE)
  })

  it('gives every place an explicit arrival rather than a generic offset', () => {
    // The old fallback was "anchor + 7% down", which dropped the Backpack
    // point inside the closed south gate.
    for (const place of PLACES) {
      expect(place.arrival, `${place.name} should not rely on the generic offset`)
        .toBeDefined()
    }
  })

  it('no longer claims a guardian stands in the Park', () => {
    // Sol's domain thematically, but Sol stands at the Pavilion — the Town
    // List was putting his portrait and name on an empty lawn.
    expect(PLACES.find((place) => place.id === 'park')!.who).toBeUndefined()
    // Every remaining `who` is a guardian actually stationed there.
    for (const place of PLACES) {
      if (place.who) expect(GUARDIAN_AT[place.who]).toBe(place.id)
    }
  })

  it('keeps the player out of the water on the west edge', () => {
    // A single small pond ellipse used to leave the waterfall reach and the
    // lower lake walkable, so you could stroll across the river.
    for (const point of [
      { px: 8, py: 16 }, { px: 5, py: 20 }, { px: 4, py: 28 }, { px: 3, py: 50 },
    ]) expect(isBlockedPosition(point), `${point.px},${point.py} is open water`).toBe(true)
  })

  it('closes the south gate and its wall without sealing the plaza', () => {
    expect(isBlockedPosition({ px: 49.8, py: 86 })).toBe(true)
    expect(isBlockedPosition({ px: 35, py: 89 })).toBe(true)
    expect(isBlockedPosition({ px: 61, py: 89 })).toBe(true)
    // The paving in front of the gate is still where the player stands.
    expect(isWalkablePosition({ px: 49.8, py: 78 })).toBe(true)
    expect(isWalkablePosition(SPAWN)).toBe(true)
  })

  it('blocks the scenery that sat outside every footprint', () => {
    expect(isBlockedPosition({ px: 25.5, py: 50 })).toBe(true)   // cafe shopfront
    expect(isBlockedPosition({ px: 69, py: 50 })).toBe(true)     // west market stalls
    expect(isBlockedPosition({ px: 76.5, py: 82 })).toBe(true)   // gazebo base
  })

  it('keeps every destination connected to spawn by walkable ground', () => {
    const start = { px: Math.round(SPAWN.px), py: Math.round(SPAWN.py) }
    const queue = [start]
    const reached = new Set([`${start.px},${start.py}`])
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

    for (let index = 0; index < queue.length; index += 1) {
      const point = queue[index]
      for (const [dx, dy] of directions) {
        const next = { px: point.px + dx, py: point.py + dy }
        const key = `${next.px},${next.py}`
        if (reached.has(key) || !isWalkablePosition(next)) continue
        reached.add(key)
        queue.push(next)
      }
    }

    for (const place of PLACES) {
      const arrival = doorstep(place)
      const connected = [...reached].some((key) => {
        const [px, py] = key.split(',').map(Number)
        return Math.abs(px - arrival.px) <= 1.5 && Math.abs(py - arrival.py) <= 1.5
      })
      expect(connected, `${place.name} should be reachable`).toBe(true)
    }
  })
})

describe('rectangular footprints', () => {
  const wall = { id: 'test-wall', px: 50, py: 50, r: 200, rx: 200, ry: 100, shape: 'rect' as const }

  it('covers the corners an ellipse of the same extents would miss', () => {
    // The whole reason buildings became rectangles: at 0.9 of each half-extent
    // a corner is inside the box but outside the inscribed ellipse.
    const cornerX = (50 / 100) * WORLD_W + 200 * 0.9
    const cornerY = (50 / 100) * WORLD_H + 100 * 0.9
    const inside = Math.hypot((cornerX - (50 / 100) * WORLD_W) / 200,
      (cornerY - (50 / 100) * WORLD_H) / 100) < 1
    expect(inside, 'this corner should be outside the ellipse').toBe(false)
    // The rect resolver still ejects it, because for a box it is inside.
    const out = resolveBlockerPosition(cornerX, cornerY, wall, 0)
    expect(out.x === cornerX && out.y === cornerY).toBe(false)
  })

  it('ejects along the nearest face so you slide instead of being flung', () => {
    const cx = (50 / 100) * WORLD_W
    const cy = (50 / 100) * WORLD_H
    // Deep horizontally, shallow vertically: should leave through the top.
    const out = resolveBlockerPosition(cx + 10, cy - 95, wall, 0)
    expect(out.x).toBe(cx + 10)
    expect(out.y).toBe(cy - 100)

    // Shallow horizontally: should leave through the side, keeping y.
    const side = resolveBlockerPosition(cx + 195, cy + 10, wall, 0)
    expect(side.x).toBe(cx + 200)
    expect(side.y).toBe(cy + 10)
  })

  it('leaves a point already outside untouched', () => {
    const out = resolveBlockerPosition(10, 10, wall, 0)
    expect(out).toEqual({ x: 10, y: 10 })
  })

  it('models the buildings as boxes and the scenery as ellipses', () => {
    const shapeOf = (id: string) => BLOCKERS.find((b) => b.id === id)?.shape ?? 'ellipse'
    for (const id of ['library', 'cafe-building', 'home', 'south-gate']) {
      expect(shapeOf(id), `${id} is drawn as a building`).toBe('rect')
    }
    for (const id of ['recovery-pond', 'west-pond', 'guardian-council-planter']) {
      expect(shapeOf(id), `${id} is drawn round`).toBe('ellipse')
    }
  })
})

describe('groundZ', () => {
  it('sorts characters back to front by their feet', () => {
    // Someone lower down the map stands nearer the camera.
    expect(groundZ(61)).toBeGreaterThan(groundZ(34))
    expect(groundZ(97)).toBeGreaterThan(groundZ(61))
  })

  it('stays between the markers below and the atmosphere above', () => {
    // Markers sit at 4 and the day tint at 1200; the band must not collide.
    for (const py of [13.125, 50, 97.5]) {
      expect(groundZ(py)).toBeGreaterThan(4)
      expect(groundZ(py)).toBeLessThan(1200)
    }
  })

  it('survives a position outside the world without inverting the order', () => {
    expect(groundZ(-40)).toBe(0)
    expect(groundZ(400)).toBe(1000)
  })
})

describe('focusGuardianFor', () => {
  it('maps each next-step view to the guardian who owns it', () => {
    expect(focusGuardianFor('rebalance')).toBe('kai')
    expect(focusGuardianFor('recover')).toBe('sol')
    expect(focusGuardianFor('session')).toBe('mira')
    expect(focusGuardianFor('work')).toBe('mira')
    expect(focusGuardianFor('garden')).toBe('sol')
    expect(focusGuardianFor('load')).toBe('kai')
    expect(focusGuardianFor('warmcup')).toBe('sky')
    expect(focusGuardianFor('lanterns')).toBe('goh')
    expect(focusGuardianFor(null)).toBeNull()
  })
})

describe('nextStepFor', () => {
  it('returns a one-line recommendation per view', () => {
    expect(nextStepFor('rebalance')).toMatch(/can move/i)
    expect(nextStepFor('recover')).toMatch(/recovery/i)
    expect(nextStepFor('work')).toMatch(/checkpoint/i)
    expect(nextStepFor(null)).toMatch(/checkpoint/i)
  })
})

describe('firstStepForIntro', () => {
  it('leads a brand-new player to Town Hall, returning players to the loop', () => {
    expect(firstStepForIntro({ journal: [], rebalanceSeen: false })).toBe('intake')
    expect(firstStepForIntro({ journal: [{ at: 1 }], rebalanceSeen: false })).toBe('rebalance')
    expect(firstStepForIntro({ journal: [{ at: 1 }], rebalanceSeen: true })).toBe('work')
  })
})
