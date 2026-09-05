/**
 * Campus Grove layout.
 *
 * Coordinates are percentages of the world, so the same numbers work at any
 * render size. The world is drawn from
 * assets/app-runtime-v1/game/world/campus-daylight.webp.
 *
 * The source illustration is 1200x800. The world is exactly 3x that, so the
 * map upscales on a whole-pixel grid, and a native 64x96 sprite stands 32
 * map-pixels tall — a little under a doorway, which is the proportion the
 * illustration was drawn for. Any other multiple either blurs the map or
 * forces a fractional sprite, which is what mangled the pixel art before.
 */

import type { GuardianId } from '../domain'

export const MAP_W = 1200
export const MAP_H = 800
/** Integer upscale of the illustration. Changing this blurs the map. */
export const MAP_SCALE = 3
export const WORLD_W = MAP_W * MAP_SCALE
export const WORLD_H = MAP_H * MAP_SCALE

/** Native sprite frame size. Rendered 1:1 — never scaled. */
export const SPRITE_W = 64
export const SPRITE_H = 96

export type PlaceId =
  | 'library' | 'clock' | 'garden' | 'recover' | 'hall' | 'cafe' | 'market'
  | 'home' | 'council' | 'mailbox' | 'post' | 'backpack' | 'calm' | 'park'

export interface Place {
  id: PlaceId
  name: string
  /** Anchor on the illustration, in world percent. */
  px: number
  py: number
  /** The panel this place opens. */
  view: ViewId
  /** Optional player standing point for entering this place. */
  arrival?: { px: number; py: number }
  who?: GuardianId
  blurb: string
}

export interface GuardianPlacement {
  /** Sprite feet position on the world, in percent. */
  px: number
  py: number
  /** The cast sheet is front-facing only, so do not imply unsupported turns. */
  facing: 'down'
}

export type ViewId =
  | 'intake' | 'understand' | 'rebalance' | 'work' | 'session'
  | 'recover' | 'ripples' | 'pocket' | 'firefly' | 'chime' | 'warmcup' | 'lanterns'
  | 'keepsakes' | 'collection'
  | 'journal' | 'council' | 'mailbox' | 'calm' | 'home'
  | 'backpack' | 'garden' | 'load' | 'townlist' | 'briefing'
  | 'settings' | 'shop'

export const PLACES: readonly Place[] = [
  { id: 'library', name: 'Library', px: 22.9, py: 20.6, arrival: { px: 22.9, py: 34.0 }, view: 'work', who: 'mira',
    blurb: 'Understand, work plans, checkpoints' },
  { id: 'clock', name: 'Clock Tower', px: 49.8, py: 11.0, arrival: { px: 58.0, py: 28.0 }, view: 'rebalance', who: 'kai',
    blurb: 'Forecast and Rebalance Workshop' },
  { id: 'garden', name: 'Recovery Pavilion', px: 79.2, py: 16.3,
    arrival: { px: 88.0, py: 28.0 }, view: 'recover', who: 'sol',
    blurb: 'Choose a digital or away-from-screen recovery' },
  { id: 'recover', name: 'Recovery Garden', px: 69.5, py: 30.5,
    arrival: { px: 62.0, py: 43.0 }, view: 'garden',
    blurb: 'Growth from sustainable choices' },
  { id: 'hall', name: 'Town Hall', px: 49.8, py: 36.0, view: 'intake',
    blurb: 'Task intake and brief review' },
  { id: 'cafe', name: 'Sky’s Tea Corner', px: 14.5, py: 42.5, arrival: { px: 28.0, py: 62.0 }, view: 'warmcup', who: 'sky',
    blurb: 'Body doubling and Warm Cup' },
  { id: 'market', name: 'Market', px: 78.0, py: 47.0, arrival: { px: 66.0, py: 61.0 }, view: 'lanterns', who: 'goh',
    blurb: 'Errands and Night Lanterns' },
  { id: 'home', name: 'Home', px: 91.5, py: 44.0,
    arrival: { px: 96.0, py: 61.0 }, view: 'home',
    blurb: 'Quiet Mode, Exit Quest, your data' },
  { id: 'council', name: 'Guardian Council', px: 49.8, py: 52.0,
    arrival: { px: 49.8, py: 75 }, view: 'council',
    blurb: 'One recommendation when pressures compete' },
  { id: 'mailbox', name: 'Future Mailbox', px: 16.0, py: 74.0, view: 'mailbox',
    blurb: 'Send a next action to your future self' },
  { id: 'post', name: 'Post Office', px: 27.5, py: 80.0, view: 'journal',
    blurb: 'Journal and postcards' },
  { id: 'backpack', name: 'Backpack point', px: 49.8, py: 79.0, view: 'backpack',
    blurb: 'Inspect what you are carrying' },
  { id: 'calm', name: 'Calm Corner', px: 77.0, py: 74.0, view: 'calm',
    blurb: 'All five activities, no prerequisites' },
  { id: 'park', name: 'Park', px: 91.0, py: 85.0, view: 'pocket', who: 'sol',
    blurb: 'Pocket of Green, outdoor recovery' },
]

/** Solid footprints, generous enough to walk between. Radii are world pixels.
 * rx/ry are used where a painted pond or planter is visibly elliptical. */
export interface WorldBlocker {
  id: string
  px: number
  py: number
  r: number
  rx?: number
  ry?: number
}

export const BLOCKERS: readonly WorldBlocker[] = [
  { id: 'library', px: 22.9, py: 19, r: 320 },
  { id: 'clock-tower', px: 49.8, py: 12, r: 230 },
  { id: 'recovery-pavilion', px: 79.2, py: 17, r: 250, rx: 230, ry: 210 },
  { id: 'recovery-pond', px: 69.0, py: 33.0, r: 210, rx: 360, ry: 145 },
  { id: 'cafe', px: 14.5, py: 41, r: 225 },
  { id: 'cafe-building', px: 14.5, py: 51, r: 280 },
  // The market's visible stall is already covered by the larger building
  // footprint below. A second circle here seals the only road to the garden.
  { id: 'market-building', px: 78.0, py: 53, r: 170 },
  { id: 'market-east-building', px: 90.0, py: 52.0, r: 250, rx: 250, ry: 210 },
  { id: 'home', px: 91.5, py: 42, r: 143 },
  { id: 'calm-corner', px: 77.0, py: 72, r: 105 },
  { id: 'west-pond', px: 2.0, py: 40, r: 135 },
  // The central tree and circular planter are the most common place for a
  // player to appear embedded in the artwork. Keep its centre solid while
  // leaving the surrounding path open for a full circuit.
  { id: 'guardian-council-planter', px: 49.8, py: 61, r: 280, rx: 260, ry: 205 },
  { id: 'east-pond', px: 96.0, py: 30, r: 170, rx: 260, ry: 160 },
]

/** Space reserved around a sprite's feet while resolving outdoor collision. */
export const PLAYER_COLLISION_MARGIN = 26

/** Walkable bounds, in world percent, matching the movement clamp. */
export const WALK_BOUNDS = { minX: 2.5, maxX: 97.5, minY: 13.125, maxY: 97.5 }

/** Returns true when a saved or requested player point overlaps solid scenery. */
export function isBlockedPosition(
  point: { px: number; py: number },
  margin = PLAYER_COLLISION_MARGIN,
): boolean {
  if (!Number.isFinite(point.px) || !Number.isFinite(point.py)) return true
  const x = (point.px / 100) * WORLD_W
  const y = (point.py / 100) * WORLD_H
  return BLOCKERS.some((b) => {
    const rx = (b.rx ?? b.r) + margin
    const ry = (b.ry ?? b.r) + margin
    return Math.hypot((x - (b.px / 100) * WORLD_W) / rx,
      (y - (b.py / 100) * WORLD_H) / ry) < 1
  })
}

/** Project a point outside a blocker along its radial ellipse direction. */
export function resolveBlockerPosition(
  x: number,
  y: number,
  blocker: WorldBlocker,
  margin = 0,
): { x: number; y: number } {
  const bx = (blocker.px / 100) * WORLD_W
  const by = (blocker.py / 100) * WORLD_H
  const rx = (blocker.rx ?? blocker.r) + margin
  const ry = (blocker.ry ?? blocker.r) + margin
  const dx = x - bx
  const dy = y - by
  const distance = Math.hypot(dx / rx, dy / ry)
  if (distance >= 1) return { x, y }
  if (distance <= 0.001) return { x: bx, y: by + ry }
  return { x: bx + dx / distance, y: by + dy / distance }
}

/** A complete validity check for saved positions and travel destinations. */
export function isWalkablePosition(point: { px: number; py: number }): boolean {
  return Number.isFinite(point.px) && Number.isFinite(point.py) &&
    point.px >= WALK_BOUNDS.minX && point.px <= WALK_BOUNDS.maxX &&
    point.py >= WALK_BOUNDS.minY && point.py <= WALK_BOUNDS.maxY &&
    !isBlockedPosition(point)
}

/** Keep a requested position usable without discarding any other save data. */
export function safePosition(
  point: { px: number; py: number },
  fallback: { px: number; py: number } = SPAWN,
): { px: number; py: number } {
  return isWalkablePosition(point) ? { px: point.px, py: point.py } : { ...fallback }
}

/** Interaction radius, in world pixels. Generous on purpose. */
export const TALK_RADIUS = 203

/** Clear path below the central planter. */
export const SPAWN = { px: 49.8, py: 75 }

/** Where the avatar stands when it arrives at a place. */
export function doorstep(place: Place): { px: number; py: number } {
  return place.arrival ?? { px: place.px, py: Math.min(97, place.py + 7) }
}

export const GUARDIAN_AT: Record<GuardianId, PlaceId> = {
  mira: 'library',
  kai: 'clock',
  sol: 'garden',
  goh: 'market',
  sky: 'cafe',
}

/** Explicit feet positions keep each guardian on a path beside their district.
 * These are deliberately independent from player arrival points. */
export const GUARDIAN_POSITIONS: Record<GuardianId, GuardianPlacement> = {
  mira: { px: 20.5, py: 34.0, facing: 'down' },
  kai: { px: 54.0, py: 31.0, facing: 'down' },
  sol: { px: 85.0, py: 30.5, facing: 'down' },
  goh: { px: 70.0, py: 61.0, facing: 'down' },
  sky: { px: 25.0, py: 61.0, facing: 'down' },
}

/** Order of frames in assets/app-runtime-v1/game/world/cast-sheet.webp. */
export const CAST_ORDER: readonly GuardianId[] = ['mira', 'kai', 'sol', 'goh', 'sky']

export const GUARDIANS: Record<GuardianId, { name: string; role: string }> = {
  mira: { name: 'Mira', role: 'Library · Understand' },
  kai: { name: 'Kai', role: 'Clock Tower · Plan' },
  sol: { name: 'Sol', role: 'Garden · Sustain' },
  sky: { name: 'Sky', role: 'Café · Accompany' },
  goh: { name: 'Goh', role: 'Market · Complete' },
}

/** The guardian who owns the shared-rule next step — used to focus the dock. */
export function focusGuardianFor(view: ViewId | null): GuardianId | null {
  switch (view) {
    case 'rebalance': case 'load': return 'kai'
    case 'recover': case 'garden': return 'sol'
    case 'session': case 'work': return 'mira'
    case 'warmcup': return 'sky'
    case 'lanterns': return 'goh'
    default: return null
  }
}

/** One-line title-hook copy mirroring the quest card's recommendation. */
export function nextStepFor(view: ViewId | null): string {
  switch (view) {
    case 'rebalance': return 'Kai found things that can move — start there.'
    case 'recover': return 'You banked work — recovery is next.'
    case 'garden': return 'The garden is ready for you.'
    case 'session': return 'Your checkpoint is waiting.'
    default: return 'One checkpoint next — the Library is waiting.'
  }
}

/** Where Kai's first-run intro should point: brand-new saves start at intake. */
export function firstStepForIntro(state: { journal: unknown[]; rebalanceSeen: boolean }): ViewId {
  if (state.journal.length === 0) return 'intake'
  return state.rebalanceSeen ? 'work' : 'rebalance'
}
