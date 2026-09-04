/**
 * Pace Keepsake stylisation (implementation plan §16).
 *
 * The deterministic local filter: downsample to the world grid and snap every
 * pixel to the canonical palette. This is what runs when no image model is
 * available, and AI availability never gates quest completion or rewards.
 */

export type Rgb = readonly [number, number, number]

/** The canonical palette from assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md §1. */
export const PALETTE: Record<string, Rgb> = {
  sage: [0x6d, 0x80, 0x52],
  duskTeal: [0x1f, 0x61, 0x70],
  amber: [0xd9, 0xa2, 0x34],
  rose: [0x92, 0x56, 0x6a],
  cream: [0xef, 0xe3, 0xcc],
  plum: [0x50, 0x3d, 0x62],
  stone: [0xc7, 0xb8, 0x9b],
  water: [0x4e, 0x9f, 0xa8],
  navy: [0x17, 0x26, 0x38],
}

export const PALETTE_LIST: readonly Rgb[] = Object.values(PALETTE)

/** Nearest palette colour by squared distance in RGB. */
export function snapToPalette(r: number, g: number, b: number): Rgb {
  let best = PALETTE_LIST[0]
  let bestDistance = Infinity
  for (const colour of PALETTE_LIST) {
    const dr = r - colour[0]
    const dg = g - colour[1]
    const db = b - colour[2]
    const distance = dr * dr + dg * dg + db * db
    if (distance < bestDistance) {
      bestDistance = distance
      best = colour
    }
  }
  return best
}

/** Snap an RGBA buffer in place. Alpha is forced opaque — keepsakes are cards. */
export function quantise(data: Uint8ClampedArray): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = snapToPalette(data[i], data[i + 1], data[i + 2])
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  return data
}

export type PhotoHandling =
  | 'verify_and_discard'
  | 'keepsake_and_discard_original'
  | 'save_both_privately'
  | 'cancel'

export interface PhotoDecision {
  /** Whether the original image is kept after the flow completes. */
  retainsOriginal: boolean
  /** Whether a stylised keepsake is produced. */
  createsKeepsake: boolean
}

/**
 * The four choices are separate consent decisions (§14). Encoding them means
 * "verify and discard" can never accidentally retain a photo.
 */
export function photoDecision(choice: PhotoHandling): PhotoDecision {
  switch (choice) {
    case 'verify_and_discard':
      return { retainsOriginal: false, createsKeepsake: false }
    case 'keepsake_and_discard_original':
      return { retainsOriginal: false, createsKeepsake: true }
    case 'save_both_privately':
      return { retainsOriginal: true, createsKeepsake: true }
    case 'cancel':
    default:
      return { retainsOriginal: false, createsKeepsake: false }
  }
}

/**
 * Verification and keepsake generation are independent operations: an
 * uncertain or failed verification never blocks a keepsake, and a keepsake is
 * never evidence that a quest happened (§14).
 */
export function keepsakeBlockedBy(verification: 'pass' | 'uncertain' | 'fail'): false {
  void verification
  return false
}

export type KeepsakeCategory =
  | 'garden' | 'cafe' | 'library' | 'market' | 'path' | 'weather' | 'postcard'

export const KEEPSAKE_CATEGORIES: readonly KeepsakeCategory[] = [
  'garden', 'cafe', 'library', 'market', 'path', 'weather', 'postcard',
]

/** Which memory a quest photo becomes (vision §14). */
export function categoryForQuest(quest: string): KeepsakeCategory {
  if (quest === 'pocket_of_green') return 'garden'
  if (quest === 'warm_cup') return 'cafe'
  if (quest === 'ready_space') return 'library'
  if (quest === 'errand_route') return 'market'
  if (quest === 'gentle_loop') return 'path'
  if (quest === 'find_sky') return 'weather'
  return 'postcard'
}

export type KeepsakePlacement =
  | 'collection' | 'journal' | 'recovery_garden' | 'town' | 'future_mailbox'

export const KEEPSAKE_PLACEMENTS: readonly KeepsakePlacement[] = [
  'collection', 'journal', 'recovery_garden', 'town', 'future_mailbox',
]

/** Suggested placements per category (vision §14). */
export function suggestedPlacements(category: KeepsakeCategory): KeepsakePlacement[] {
  switch (category) {
    case 'garden': return ['recovery_garden', 'collection', 'journal']
    case 'cafe': return ['town', 'collection', 'journal']
    case 'weather': return ['journal', 'collection', 'future_mailbox']
    case 'path': return ['collection', 'recovery_garden', 'journal']
    default: return ['collection', 'journal', 'future_mailbox']
  }
}
