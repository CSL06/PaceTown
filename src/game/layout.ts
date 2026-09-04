/**
 * Campus Grove layout.
 *
 * Coordinates are percentages of the world, so the same numbers work at any
 * render size. The world is drawn from public/game/world/campus.png.
 */

import type { GuardianId } from '../domain'

export const WORLD_W = 2400
export const WORLD_H = 1600

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
  | 'backpack' | 'garden' | 'load' | 'townlist' | 'briefing' | 'preview'

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
  { id: 'cafe', name: 'Sky’s Tea Corner', px: 14.5, py: 42.5, view: 'preview', who: 'sky',
    blurb: 'Body doubling and Warm Cup' },
  { id: 'market', name: 'Market', px: 78.0, py: 47.0, view: 'preview', who: 'goh',
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
  { px: 22.9, py: 19, r: 150 }, { px: 49.8, py: 9, r: 80 }, { px: 79.2, py: 14, r: 95 },
  { px: 14.5, py: 41, r: 150 }, { px: 78.0, py: 45, r: 140 }, { px: 91.5, py: 42, r: 95 },
  { px: 77.0, py: 72, r: 70 }, { px: 2.0, py: 40, r: 90 },
]

/** Interaction radius, in world pixels. Generous on purpose. */
export const TALK_RADIUS = 135

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

/** Order of frames in public/game/world/cast-sheet.png. */
export const CAST_ORDER: readonly GuardianId[] = ['mira', 'kai', 'sol', 'goh', 'sky']

export const GUARDIANS: Record<GuardianId, { name: string; role: string }> = {
  mira: { name: 'Mira', role: 'Library · Understand' },
  kai: { name: 'Kai', role: 'Clock Tower · Plan' },
  sol: { name: 'Sol', role: 'Garden · Sustain' },
  sky: { name: 'Sky', role: 'Café · Accompany' },
  goh: { name: 'Goh', role: 'Market · Complete' },
}
