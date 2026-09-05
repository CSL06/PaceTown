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
  who?: GuardianId
  blurb: string
}

export type ViewId =
  | 'intake' | 'understand' | 'rebalance' | 'work' | 'session'
  | 'recover' | 'ripples' | 'pocket' | 'firefly' | 'chime' | 'warmcup' | 'lanterns'
  | 'keepsakes' | 'collection'
  | 'journal' | 'council' | 'mailbox' | 'calm' | 'home'
  | 'backpack' | 'garden' | 'load' | 'townlist' | 'briefing'
  | 'settings' | 'shop'

export const PLACES: readonly Place[] = [
  { id: 'library', name: 'Library', px: 22.9, py: 20.6, view: 'work', who: 'mira',
    blurb: 'Understand, work plans, checkpoints' },
  { id: 'clock', name: 'Clock Tower', px: 49.8, py: 11.0, view: 'rebalance', who: 'kai',
    blurb: 'Forecast and Rebalance Workshop' },
  { id: 'garden', name: 'Garden Pavilion', px: 79.2, py: 16.3, view: 'ripples', who: 'sol',
    blurb: 'Gentle Ripples at the fountain' },
  { id: 'recover', name: 'Recovery Garden', px: 69.5, py: 30.5, view: 'garden',
    blurb: 'Growth from sustainable choices' },
  { id: 'hall', name: 'Town Hall', px: 49.8, py: 36.0, view: 'intake',
    blurb: 'Task intake and brief review' },
  { id: 'cafe', name: 'Sky’s Tea Corner', px: 14.5, py: 42.5, view: 'warmcup', who: 'sky',
    blurb: 'Body doubling and Warm Cup' },
  { id: 'market', name: 'Market', px: 78.0, py: 47.0, view: 'lanterns', who: 'goh',
    blurb: 'Errands and Night Lanterns' },
  { id: 'home', name: 'Home', px: 91.5, py: 44.0, view: 'home',
    blurb: 'Quiet Mode, Exit Quest, your data' },
  { id: 'council', name: 'Guardian Council', px: 49.8, py: 52.0, view: 'council',
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

/** Solid footprints, generous enough to walk between. Radii are world pixels. */
export const BLOCKERS: readonly { px: number; py: number; r: number }[] = [
  { px: 22.9, py: 19, r: 225 }, { px: 49.8, py: 9, r: 120 }, { px: 79.2, py: 14, r: 143 },
  { px: 14.5, py: 41, r: 225 }, { px: 78.0, py: 45, r: 210 }, { px: 91.5, py: 42, r: 143 },
  { px: 77.0, py: 72, r: 105 }, { px: 2.0, py: 40, r: 135 },
]

/** Interaction radius, in world pixels. Generous on purpose. */
export const TALK_RADIUS = 203

export const SPAWN = { px: 49.8, py: 66 }

/** Where the avatar stands when it arrives at a place. */
export function doorstep(place: Place): { px: number; py: number } {
  return { px: place.px, py: Math.min(97, place.py + 7) }
}

export const GUARDIAN_AT: Record<GuardianId, PlaceId> = {
  mira: 'library',
  kai: 'clock',
  sol: 'garden',
  goh: 'market',
  sky: 'cafe',
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
