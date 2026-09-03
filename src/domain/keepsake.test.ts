import { describe, expect, it } from 'vitest'
import {
  PALETTE, PALETTE_LIST, keepsakeBlockedBy, photoDecision, quantise, snapToPalette,
} from './keepsake'

describe('palette snapping', () => {
  it('returns a colour from the canonical palette', () => {
    const out = snapToPalette(110, 128, 82)
    expect(PALETTE_LIST).toContainEqual(out)
  })

  it('keeps a palette colour exactly as it is', () => {
    for (const colour of PALETTE_LIST) {
      expect(snapToPalette(colour[0], colour[1], colour[2])).toEqual(colour)
    }
  })

  it('sends near-black to navy and near-white to cream', () => {
    expect(snapToPalette(0, 0, 0)).toEqual(PALETTE.navy)
    expect(snapToPalette(255, 255, 255)).toEqual(PALETTE.cream)
  })

  it('sends foliage green to sage', () => {
    expect(snapToPalette(90, 140, 70)).toEqual(PALETTE.sage)
  })
})

describe('quantise', () => {
  it('leaves only palette colours behind', () => {
    const data = new Uint8ClampedArray(4 * 64)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = (i * 7) % 256
      data[i + 1] = (i * 13) % 256
      data[i + 2] = (i * 29) % 256
      data[i + 3] = 128
    }
    quantise(data)
    for (let i = 0; i < data.length; i += 4) {
      expect(PALETTE_LIST).toContainEqual([data[i], data[i + 1], data[i + 2]])
      expect(data[i + 3]).toBe(255)
    }
  })
})

describe('photo handling — four separate consent decisions', () => {
  it('verify and discard keeps nothing', () => {
    expect(photoDecision('verify_and_discard')).toEqual({
      retainsOriginal: false, createsKeepsake: false,
    })
  })

  it('keepsake and discard original keeps only the generated art', () => {
    expect(photoDecision('keepsake_and_discard_original')).toEqual({
      retainsOriginal: false, createsKeepsake: true,
    })
  })

  it('save both privately is the only choice that retains the photo', () => {
    const retaining = (['verify_and_discard', 'keepsake_and_discard_original',
      'save_both_privately', 'cancel'] as const)
      .filter((c) => photoDecision(c).retainsOriginal)
    expect(retaining).toEqual(['save_both_privately'])
  })

  it('cancel keeps nothing', () => {
    expect(photoDecision('cancel')).toEqual({ retainsOriginal: false, createsKeepsake: false })
  })
})

describe('verification and generation are independent', () => {
  it('a failed or uncertain verification never blocks a keepsake', () => {
    // §14: an attractive generated result is never evidence a quest happened,
    // and a failed check never takes the memory away.
    expect(keepsakeBlockedBy('pass')).toBe(false)
    expect(keepsakeBlockedBy('uncertain')).toBe(false)
    expect(keepsakeBlockedBy('fail')).toBe(false)
  })
})
