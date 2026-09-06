/**
 * The campus itself: the illustration, Load Weather over it, the guardians
 * standing at their districts, place markers, and the player.
 *
 * Nothing here computes pressure — it reads a DailyLoad from the domain layer
 * and expresses it as weather.
 */

import { memo } from 'react'
import { weightedDemand, type DailyLoad, type DemandCategory, type Task } from '../domain'
import {
  BLOCKERS, CAST_ORDER, GUARDIAN_AT, GUARDIAN_POSITIONS, GUARDIANS, PLAYER_COLLISION_MARGIN,
  PLACES, doorstep, groundZ, type Place, type PlaceId,
} from './layout'
import type { CosmeticSlot } from '../domain'
import type { WorldRefs } from './useWorld'

const MAP = '/game/world/campus-daylight.webp'
const PLAYER_SHEET = '/game/world/player-sheet.webp'
const CAST_SHEET = '/game/world/cast-sheet.webp'

/** Pressure by area, mixing fixed minutes with weighted flexible demand. */
export function pressureByArea(tasks: readonly Task[], day: string): Record<DemandCategory, number> {
  const by: Record<DemandCategory, number> = { time: 0, mental: 0, physical: 0, social: 0, errands: 0 }
  for (const t of tasks) {
    if (t.day !== day) continue
    by[t.category] += t.flexibility === 'fixed' ? t.estimatedMinutes : weightedDemand(t)
  }
  return by
}

function level(value: number, mid: number, high: number): 0 | 1 | 2 {
  return value >= high ? 2 : value >= mid ? 1 : 0
}

export interface WeatherRow {
  icon: string
  place: string
  level: 0 | 1 | 2
  states: [string, string, string]
}

/** Load Weather makes the town busier, never damaged (vision §8). */
export function loadWeather(tasks: readonly Task[], day: string): WeatherRow[] {
  const by = pressureByArea(tasks, day)
  return [
    { icon: '▤', place: 'Library', level: level(by.mental, 120, 220),
      states: ['clear', 'light fog', 'fog and drifting pages'] },
    { icon: '◷', place: 'Clock Tower', level: level(by.time, 200, 360),
      states: ['steady', 'quickening', 'fast, wind rising'] },
    { icon: '❧', place: 'Garden', level: level(by.physical, 80, 140),
      states: ['bright', 'softening', 'shaded and slow'] },
    { icon: '⌾', place: 'Café', level: level(by.social, 45, 90),
      states: ['quiet', 'filling', 'busy'] },
    { icon: '▦', place: 'Market', level: level(by.errands, 40, 80),
      states: ['tidy', 'parcels arriving', 'parcels stacked'] },
  ]
}

/**
 * Two small signs of life, placed against the illustration.
 *
 * Steam rises from the cups on the café terrace beside Sky, and the recovery
 * pond catches the light. Both are deliberately tiny and slow: the brief is a
 * town that feels inhabited, not one that competes with the panel a student is
 * trying to read. Each carries its own foot position so it sorts into the
 * scene like a character does — the steam is behind Sky, not painted over her.
 */
const STEAM: readonly { px: number; py: number; delay: number }[] = [
  // On the cups themselves. Measured off the terrace tables rather than
  // guessed: one table beside Sky, one under the far umbrella.
  { px: 20.3, py: 58.0, delay: 0 },
  { px: 21.1, py: 58.3, delay: 1.9 },
  { px: 25.6, py: 58.0, delay: 3.4 },
]

const RIPPLES: readonly { px: number; py: number; delay: number }[] = [
  { px: 66.5, py: 32.5, delay: 0 },
  { px: 71.5, py: 34.0, delay: 2.8 },
]

/**
 * The lamp posts the illustration already draws, read off the map.
 *
 * The town knows what time it is — `daylight()` has always returned
 * afternoon, dusk or night as the loop advances — but nothing in the world
 * answered to it except a flat colour wash over everything. Lighting the
 * lamps costs nothing and is the difference between a tinted picture and an
 * evening.
 */
const LAMPS: readonly { px: number; py: number }[] = [
  { px: 40.4, py: 74.5 }, { px: 53.4, py: 74.5 },
  { px: 33.4, py: 56.5 }, { px: 30.2, py: 30.5 },
  { px: 57.8, py: 40.2 }, { px: 76.2, py: 34.0 },
  { px: 86.8, py: 62.0 }, { px: 79.6, py: 82.0 },
]

/** The day advances with the loop, not the clock. */
export function daylight(stepsDone: number): 'afternoon' | 'dusk' | 'night' {
  return stepsDone >= 6 ? 'night' : stepsDone >= 3 ? 'dusk' : 'afternoon'
}

interface Props {
  refs: WorldRefs
  load: DailyLoad
  tasks: readonly Task[]
  day: string
  near: Place | null
  leadPlace: PlaceId | null
  quiet: boolean
  stepsDone: number
  /** Bought appearance. Never affects anything but how the town looks. */
  equipped: Record<CosmeticSlot, string>
  /** True while a conversation is open, so ambient routines hold still. */
  talking?: boolean
  onEnter: (place: Place) => void
}

function CampusView({
  refs, tasks, day, near, leadPlace, quiet, stepsDone, equipped, talking = false, onEnter,
}: Props) {
  const weather = loadWeather(tasks, day)
  const byPlace = new Map(weather.map((w) => [w.place, w.level]))

  // Quiet Mode suppresses ambient cosmetics, since their whole job is motion.
  const cosmetic = quiet
    ? `cos-${equipped.sky}`
    : Object.values(equipped).map((id) => `cos-${id}`).join(' ')
  const debugMap = import.meta.env.DEV && typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debugMap') === '1'

  return (
    <div className={`stage${quiet ? ' is-quiet' : ''} ${cosmetic}`} ref={refs.stage}>
      <div className="world" ref={refs.world}>
        <img className="map" src={MAP} alt="Campus Grove in bright late-morning sunshine" draggable={false} />

        {debugMap && (
          <div className="world-debug" aria-hidden="true">
            {BLOCKERS.map((blocker) => {
              const radiusX = (blocker.rx ?? blocker.r) + PLAYER_COLLISION_MARGIN
              const radiusY = (blocker.ry ?? blocker.r) + PLAYER_COLLISION_MARGIN
              return <span key={blocker.id} className="world-debug-blocker" title={blocker.id}
                style={{
                  left: `calc(${blocker.px}% - ${radiusX}px)`,
                  top: `calc(${blocker.py}% - ${radiusY}px)`,
                  width: `${radiusX * 2}px`, height: `${radiusY * 2}px`,
                }} />
            })}
            {Object.entries(GUARDIAN_POSITIONS).map(([id, at]) => (
              <span key={`guardian-${id}`} className="world-debug-point guardian"
                style={{ left: `${at.px}%`, top: `${at.py}%` }} />
            ))}
            {PLACES.map((place) => {
              const at = doorstep(place)
              return <span key={`arrival-${place.id}`} className="world-debug-point arrival"
                style={{ left: `${at.px}%`, top: `${at.py}%` }} />
            })}
          </div>
        )}

        {/* Mental load — fog over the Library */}
        {Array.from({ length: byPlace.get('Library') ?? 0 }, (_, i) => (
          <span key={`fog${i}`} className="fx fog"
            style={{ left: `${14 + i * 4}%`, top: `${12 + i * 4}%`, width: '22%', height: '20%',
              opacity: 0.55 + i * 0.25 }} />
        ))}
        {/* Café crowds and Market parcels need authored pixel assets before
            they return. The old CSS rectangles read as random map artifacts. */}
        {/* Physical — the Garden softens into shade */}
        {(byPlace.get('Garden') ?? 0) > 0 && (
          <span className="fx shade" style={{ left: '72%', top: '12%', width: '16%', height: '14%' }} />
        )}

        {CAST_ORDER.map((id, i) => {
          const place = PLACES.find((p) => p.id === GUARDIAN_AT[id])
          if (!place) return null
          const at = GUARDIAN_POSITIONS[id]
          // The cast sheet holds one front-facing frame each, so nobody can
          // turn to look at you. A deeper, quicker breath while you are in
          // range is the acknowledgement that is available without new art.
          const attentive = !quiet && !talking && near?.id === GUARDIAN_AT[id]
          return (
            <div key={id}
              className={`spr cast f-${at.facing}${quiet ? '' : ' idle'}`
                + `${talking ? ' hold' : ''}${attentive ? ' attentive' : ''}`}
              role="img" aria-label={GUARDIANS[id].name}
              style={{
                left: `${at.px}%`, top: `${at.py}%`,
                // Sorted by the feet, so whoever stands further down the map
                // is drawn in front. See groundZ in layout.ts.
                zIndex: groundZ(at.py),
                backgroundImage: `url(${CAST_SHEET})`,
                backgroundPositionX: `${(i / (CAST_ORDER.length - 1)) * 100}%`,
              }} />
          )
        })}

        {/* Ambient life. Quiet Mode removes it, as it does everything that
            moves; reduced motion is handled in game.css. */}
        {!quiet && STEAM.map((w, i) => (
          <span key={`steam${i}`} className="amb-steam" aria-hidden="true"
            style={{ left: `${w.px}%`, top: `${w.py}%`, zIndex: groundZ(w.py),
              animationDelay: `${w.delay}s` }} />
        ))}
        {/* Lit from dusk. Quiet Mode leaves them dark like everything else
            that moves — the glow breathes, so it counts. */}
        {!quiet && daylight(stepsDone) !== 'afternoon' && LAMPS.map((lamp, i) => (
          <span key={`lamp${i}`} className="lamp-glow" aria-hidden="true"
            style={{ left: `${lamp.px}%`, top: `${lamp.py}%`, zIndex: groundZ(lamp.py),
              animationDelay: `${(i % 4) * 0.9}s` }} />
        ))}

        {!quiet && RIPPLES.map((r, i) => (
          <span key={`ripple${i}`} className="amb-ripple" aria-hidden="true"
            style={{ left: `${r.px}%`, top: `${r.py}%`, zIndex: groundZ(r.py),
              animationDelay: `${r.delay}s` }} />
        ))}

        {PLACES.map((place) => {
          const at = doorstep(place)
          const classes = ['marker']
          if (near?.id === place.id) classes.push('near')
          if (leadPlace === place.id) classes.push('lead')
          return (
            <button key={place.id} type="button" className={classes.join(' ')}
              style={{ left: `${at.px}%`, top: `${at.py}%` }}
              aria-label={`${place.name}. ${place.blurb}`}
              onClick={() => onEnter(place)}>
              <span className="ring" aria-hidden="true" />
              <span className="nm">{place.name}</span>
            </button>
          )
        })}

        {/* The avatar's z-index is rewritten every frame by useWorld's paint(),
            for the same foot-sorting reason as the cast above. */}
        <div className="spr avatar f-down" ref={refs.avatar} role="img" aria-label="Your avatar"
          style={{ backgroundImage: `url(${PLAYER_SHEET})` }} />

        <div className={`daytint ${daylight(stepsDone)}`} aria-hidden="true" />
        <div className="cos-grade" aria-hidden="true" />
      </div>

      {/* Particle layers belong to the viewport, not to world coordinates: a
          couple of dozen sprites spread over a 3600px world would vanish. */}
      <div className="cos-fall" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 4.6) % 100}%`, animationDelay: `${(i % 11) * 0.85}s` }} />
        ))}
      </div>
      <div className="cos-glow" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i}
            style={{ left: `${6 + (i * 7.1) % 88}%`, top: `${18 + (i * 11.3) % 66}%`,
              animationDelay: `${(i % 7) * 0.8}s` }} />
        ))}
      </div>
      <div className="cos-rain" aria-hidden="true" />

      {/* Ambient life. Until now the only thing that moved through the world
          was the player: the guardians bob at fixed posts and the weather sits
          still. These are motes in the late-afternoon light — slow enough to
          read as air rather than as particles demanding attention. Quiet Mode
          removes them, as it does everything else that moves. */}
      {!quiet && (
        <div className="motes" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i}
              style={{
                left: `${(i * 6.3) % 100}%`,
                top: `${(i * 11.7) % 100}%`,
                animationDelay: `${(i % 8) * 2.4}s`,
                animationDuration: `${16 + (i % 5) * 4}s`,
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

export const Campus = memo(CampusView)
