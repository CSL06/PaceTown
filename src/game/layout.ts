/**
 * Campus Grove layout.
 *
 * Coordinates are percentages of the world, so the same numbers work at any
 * render size. The world is drawn from
 * assets/app-runtime-v1/game/world/campus-daylight.webp.
 *
 * Scale, which this file previously got wrong twice: the illustration is
 * 1536x1024 (measured, not assumed), and the world is exactly 2x that. An
 * integer multiple is the whole point — at the old 3600x2400 the upscale was
 * 2.34x, so source pixels landed on 2- *or* 3-pixel blocks and every straight
 * edge in the artwork stair-stepped unevenly. At 2x each source pixel is a
 * clean 2x2 block.
 *
 * Everything below expressed in world pixels — blocker radii, TALK_RADIUS,
 * PLAYER_COLLISION_MARGIN, and SPEED/LOOK_AHEAD in useWorld.ts — was rescaled
 * by 3072/3600 when the world was re-based, so the collision geometry still
 * lines up with the same painted scenery.
 */

import type { GuardianId } from '../domain'

/** Native size of campus-daylight.webp. Measured, not assumed. */
export const MAP_W = 1536
export const MAP_H = 1024
/** Integer upscale of the illustration. Whole numbers only — see above. */
export const MAP_SCALE = 2
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
  { id: 'hall', name: 'Town Hall', px: 49.8, py: 36.0,
    arrival: { px: 49.8, py: 44.0 }, view: 'intake',
    blurb: 'Task intake and brief review' },
  { id: 'cafe', name: 'Sky’s Tea Corner', px: 14.5, py: 42.5,
    arrival: { px: 28.0, py: 60.2 }, view: 'warmcup', who: 'sky',
    blurb: 'Body doubling and Warm Cup' },
  { id: 'market', name: 'Market', px: 78.0, py: 47.0, arrival: { px: 66.0, py: 61.0 }, view: 'lanterns', who: 'goh',
    blurb: 'Errands and Night Lanterns' },
  { id: 'home', name: 'Home', px: 91.5, py: 44.0,
    arrival: { px: 96.0, py: 61.0 }, view: 'home',
    blurb: 'Quiet Mode, Exit Quest, your data' },
  { id: 'council', name: 'Guardian Council', px: 49.8, py: 52.0,
    arrival: { px: 49.8, py: 75 }, view: 'council',
    blurb: 'One recommendation when pressures compete' },
  { id: 'mailbox', name: 'Future Mailbox', px: 16.0, py: 74.0,
    arrival: { px: 20.0, py: 78.5 }, view: 'mailbox',
    blurb: 'Send a next action to your future self' },
  { id: 'post', name: 'Post Office', px: 27.5, py: 80.0,
    arrival: { px: 25.0, py: 84.0 }, view: 'journal',
    blurb: 'Journal and postcards' },
  // The generic offset put this one inside the closed south gate.
  { id: 'backpack', name: 'Backpack point', px: 49.8, py: 79.0,
    arrival: { px: 44.5, py: 78.5 }, view: 'backpack',
    blurb: 'Inspect what you are carrying' },
  { id: 'calm', name: 'Calm Corner', px: 77.0, py: 74.0,
    arrival: { px: 69.5, py: 79.0 }, view: 'calm',
    blurb: 'All five activities, no prerequisites' },
  // No `who`: Sol's domain thematically, but Sol stands at the Pavilion, and
  // claiming a guardian here put his portrait and name on an empty lawn.
  { id: 'park', name: 'Park', px: 91.0, py: 85.0,
    arrival: { px: 88.0, py: 80.0 }, view: 'pocket',
    blurb: 'Pocket of Green, outdoor recovery' },
]

/** Solid footprints, generous enough to walk between. Radii are world pixels.
 *
 * `shape` matters more than it looks. Buildings are drawn as rectangles and
 * were all being modelled as ellipses, which is wrong in both directions at
 * once: the ellipse leaves the four corners of a building walk-through while
 * bulging past its edges at the midpoints. `rect` treats rx/ry as half-width
 * and half-height instead, which is what a wall actually is. Ellipses stay the
 * default because ponds, planters and tree beds really are round.
 */
export interface WorldBlocker {
  id: string
  px: number
  py: number
  r: number
  rx?: number
  ry?: number
  shape?: 'ellipse' | 'rect'
}

export const BLOCKERS: readonly WorldBlocker[] = [
  // --- buildings: rectangles, because that is how they are painted -------
  { id: 'library', px: 23.5, py: 20.0, r: 330, rx: 330, ry: 232, shape: 'rect' },
  // One box replaces the three overlapping circles that used to approximate
  // the café: the main body, the shopfront and the terrace under the awning.
  { id: 'cafe-building', px: 20.5, py: 49.5, r: 292, rx: 292, ry: 150, shape: 'rect' },
  { id: 'market-building', px: 78.0, py: 52.5, r: 145, rx: 145, ry: 145, shape: 'rect' },
  { id: 'market-east-building', px: 90.0, py: 51.5, r: 213, rx: 213, ry: 172, shape: 'rect' },
  { id: 'market-west-stalls', px: 69.0, py: 50.0, r: 128, rx: 126, ry: 119, shape: 'rect' },
  { id: 'home', px: 91.5, py: 42.0, r: 122, rx: 122, ry: 122, shape: 'rect' },
  // The gate is drawn shut and its wall runs off to either side. All three
  // are flat masonry, so all three are boxes.
  { id: 'south-gate', px: 48.2, py: 85.8, r: 222, rx: 224, ry: 105, shape: 'rect' },
  { id: 'south-wall-west', px: 35.0, py: 89.0, r: 154, rx: 152, ry: 45, shape: 'rect' },
  { id: 'south-wall-east', px: 61.0, py: 89.0, r: 154, rx: 152, ry: 45, shape: 'rect' },

  // --- round things stay round -------------------------------------------
  { id: 'clock-tower', px: 49.8, py: 12, r: 196 },
  { id: 'recovery-pavilion', px: 79.2, py: 17, r: 213, rx: 196, ry: 179 },
  { id: 'recovery-pond', px: 69.0, py: 33.0, r: 179, rx: 307, ry: 124 },
  // The gazebo's base and steps reach y≈86; the old r:90 circle stopped at
  // y≈76 and left the lower half walk-through.
  { id: 'calm-corner', px: 76.5, py: 77.0, r: 128, rx: 124, ry: 145 },
  // The central tree and circular planter are the most common place for a
  // player to appear embedded in the artwork. Keep its centre solid while
  // leaving the surrounding path open for a full circuit.
  { id: 'guardian-council-planter', px: 49.8, py: 61, r: 239, rx: 222, ry: 175 },

  // --- water --------------------------------------------------------------
  // One small ellipse used to cover a fraction of the river: the waterfall
  // reach and the lower lake were both walkable, so you could stroll across
  // the water at the west edge.
  { id: 'north-river', px: 7.5, py: 17.5, r: 128, rx: 126, ry: 113 },
  { id: 'west-river', px: 4.0, py: 27.0, r: 119, rx: 109, ry: 135 },
  { id: 'west-pond', px: 2.5, py: 46.0, r: 128, rx: 126, ry: 213 },
  { id: 'east-pond', px: 96.0, py: 30, r: 145, rx: 222, ry: 137 },
]


/** Space reserved around a sprite's feet while resolving outdoor collision. */
export const PLAYER_COLLISION_MARGIN = 22

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
    const dx = x - (b.px / 100) * WORLD_W
    const dy = y - (b.py / 100) * WORLD_H
    return b.shape === 'rect'
      ? Math.abs(dx) < rx && Math.abs(dy) < ry
      : Math.hypot(dx / rx, dy / ry) < 1
  })
}

/** Push a point out of a blocker: radially for an ellipse, and along the
 * shallowest axis for a rectangle so you slide along a wall instead of being
 * flung around its corner. */
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

  if (blocker.shape === 'rect') {
    const overlapX = rx - Math.abs(dx)
    const overlapY = ry - Math.abs(dy)
    if (overlapX <= 0 || overlapY <= 0) return { x, y }
    // Leave by the nearest face. Ejecting along the deeper axis would shove a
    // player walking into a long wall out at its end.
    return overlapX < overlapY
      ? { x: bx + (dx < 0 ? -rx : rx), y }
      : { x, y: by + (dy < 0 ? -ry : ry) }
  }

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
export const TALK_RADIUS = 173

/**
 * Paint order for anything standing on the ground.
 *
 * Overlapping characters have to be drawn back-to-front by their feet, or a
 * character standing behind another is drawn in front of them. The player
 * used to be pinned above every guardian with a flat `z-index: 7`, so walking
 * north past Sky put you in front of her while you were visibly behind her.
 *
 * The band is 130..975 for the walkable range of `py`, which sits above the
 * markers (4) and below the atmosphere layers (1200+). See game.css.
 */
export function groundZ(py: number): number {
  return Math.round(Math.min(100, Math.max(0, py)) * 10)
}

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
  sky: { px: 24.5, py: 59.2, facing: 'down' },
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
