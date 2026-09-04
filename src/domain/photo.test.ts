import { describe, expect, it } from 'vitest'
import {
  classifyPixel, statsFromPixels, verifyPocketPhoto,
} from './photo'

describe('classifyPixel', () => {
  it('reads foliage green as green', () => {
    expect(classifyPixel(90, 140, 70)).toBe('green')
  })

  it('reads daylight blue as sky', () => {
    expect(classifyPixel(120, 170, 220)).toBe('sky')
  })

  it('reads warm indoor tones as other', () => {
    expect(classifyPixel(150, 110, 90)).toBe('other')
  })
})

describe('verifyPocketPhoto', () => {
  it('passes a green photo', () => {
    const data = new Uint8ClampedArray(4 * 100)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 90; data[i + 1] = 140; data[i + 2] = 70; data[i + 3] = 255
    }
    const result = verifyPocketPhoto(statsFromPixels(data))
    expect(result.overall).toBe('pass')
    expect(result.source).toBe('local')
  })

  it('returns uncertain — never a hard fail — for an ambiguous photo', () => {
    const data = new Uint8ClampedArray(4 * 100)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 150; data[i + 1] = 110; data[i + 2] = 90; data[i + 3] = 255
    }
    expect(verifyPocketPhoto(statsFromPixels(data)).overall).toBe('uncertain')
  })

  it('fails only when there is no image data at all', () => {
    expect(verifyPocketPhoto(statsFromPixels(new Uint8ClampedArray(0))).overall).toBe('fail')
  })
})
