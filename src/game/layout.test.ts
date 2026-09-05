import { describe, expect, it } from 'vitest'
import {
  doorstep, firstStepForIntro, focusGuardianFor, GUARDIAN_POSITIONS, isBlockedPosition,
  GUARDIAN_AT, isWalkablePosition, nextStepFor, PLACES, safePosition, SPAWN,
  TALK_RADIUS, WORLD_H, WORLD_W,
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
    expect(doorstep(PLACES.find((place) => place.id === 'cafe')!)).toEqual({ px: 28, py: 62 })
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
      expect(distance).toBeGreaterThan(80)
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
