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
  CAST_ORDER, GUARDIAN_AT, GUARDIANS, PLACES, doorstep, type Place, type PlaceId,
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
  onEnter: (place: Place) => void
}

function CampusView({ refs, tasks, day, near, leadPlace, quiet, stepsDone, equipped, onEnter }: Props) {
  const weather = loadWeather(tasks, day)
  const byPlace = new Map(weather.map((w) => [w.place, w.level]))

  // Quiet Mode suppresses ambient cosmetics, since their whole job is motion.
  const cosmetic = quiet
    ? `cos-${equipped.sky}`
    : Object.values(equipped).map((id) => `cos-${id}`).join(' ')

  return (
    <div className={`stage${quiet ? ' is-quiet' : ''} ${cosmetic}`} ref={refs.stage}>
      <div className="world" ref={refs.world}>
        <img className="map" src={MAP} alt="Campus Grove in bright late-morning sunshine" draggable={false} />

        {/* Mental load — fog over the Library */}
        {Array.from({ length: byPlace.get('Library') ?? 0 }, (_, i) => (
          <span key={`fog${i}`} className="fx fog"
            style={{ left: `${14 + i * 4}%`, top: `${12 + i * 4}%`, width: '22%', height: '20%',
              opacity: 0.55 + i * 0.25 }} />
        ))}
        {/* Errands — parcels stack at the Market */}
        {Array.from({ length: (byPlace.get('Market') ?? 0) * 3 }, (_, i) => (
          <span key={`p${i}`} className="fx parcel"
            style={{ left: `${74.5 + (i % 3) * 1.6}%`, top: `${53 + Math.floor(i / 3) * 1.7}%` }} />
        ))}
        {/* Social — the Café fills */}
        {Array.from({ length: (byPlace.get('Café') ?? 0) * 3 }, (_, i) => (
          <span key={`c${i}`} className="fx crowd"
            style={{ left: `${12 + i * 1.8}%`, top: `${57 + (i % 2) * 1.4}%` }} />
        ))}
        {/* Physical — the Garden softens into shade */}
        {(byPlace.get('Garden') ?? 0) > 0 && (
          <span className="fx shade" style={{ left: '72%', top: '12%', width: '16%', height: '14%' }} />
        )}

        {CAST_ORDER.map((id, i) => {
          const place = PLACES.find((p) => p.id === GUARDIAN_AT[id])
          if (!place) return null
          const at = doorstep(place)
          return (
            <div key={id} className={`spr cast${quiet ? '' : ' idle'}`} role="img"
              aria-label={GUARDIANS[id].name}
              style={{
                left: `${at.px - 2.4}%`, top: `${at.py + 3}%`,
                backgroundImage: `url(${CAST_SHEET})`,
                backgroundPositionX: `${(i / (CAST_ORDER.length - 1)) * 100}%`,
              }} />
          )
        })}

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
