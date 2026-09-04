/**
 * Local photo verification (implementation plan §16).
 *
 * This module is pure: it judges pre-computed image statistics, so it is
 * testable without a DOM or camera. Extracting the statistics from pixels
 * lives in the game layer, which calls `verifyPhotoStats`.
 *
 * Verification checks only the stated visible criteria — never location,
 * duration, emotional state, distance, or identity. Ambiguous input returns
 * `uncertain`, never `fail`: the student can always correct it manually, and
 * verification never blocks a keepsake.
 */

export interface PhotoStats {
  /** Share of pixels that read as green foliage (0–1). */
  greenRatio: number
  /** Share of pixels that read as sky/daylight (0–1). */
  skyRatio: number
  /** Mean brightness (0–1). */
  brightness: number
  pixelCount: number
}

export interface PhotoCriterion {
  label: string
  passed: boolean
  confidence: number
}

export interface PhotoVerificationResult {
  criteria: PhotoCriterion[]
  overall: 'pass' | 'uncertain' | 'fail'
  explanation: string
  source: 'local' | 'ai' | 'manual'
}

/** Pocket of Green visible criteria (implementation plan §14, IRL-01). */
export function verifyPocketPhoto(stats: PhotoStats): PhotoVerificationResult {
  if (stats.pixelCount <= 0) {
    return {
      criteria: [],
      overall: 'fail',
      explanation: 'No image data was provided.',
      source: 'local',
    }
  }

  const natureRatio = stats.greenRatio + stats.skyRatio
  const nature: PhotoCriterion = {
    label: 'Greenery, sky, daylight, or nature-like detail is present',
    passed: natureRatio >= 0.08,
    confidence: Math.min(1, Math.round(natureRatio * 100) / 100 + 0.3),
  }
  const readable: PhotoCriterion = {
    label: 'The image is bright enough to review',
    passed: stats.brightness >= 0.12,
    confidence: stats.brightness >= 0.12 ? 0.9 : 0.4,
  }

  const overall = nature.passed && readable.passed ? 'pass' : 'uncertain'
  return {
    criteria: [nature, readable],
    overall,
    explanation: overall === 'pass'
      ? 'The photo appears to show greenery, sky, or daylight.'
      : 'The local check could not confirm greenery or daylight — confirm manually if this was your Pocket of Green.',
    source: 'local',
  }
}

/**
 * Classify one pixel for the Pocket of Green statistics. Kept here so the
 * game layer and tests share one definition of "green" and "sky".
 */
export function classifyPixel(r: number, g: number, b: number): 'green' | 'sky' | 'other' {
  if (g > r + 18 && g > b + 8 && g > 70) return 'green'
  if (b > r + 25 && b > 120 && g > 110) return 'sky'
  return 'other'
}

export function statsFromPixels(data: Uint8ClampedArray): PhotoStats {
  let green = 0
  let sky = 0
  let brightnessSum = 0
  const pixels = Math.floor(data.length / 4)
  for (let i = 0; i < data.length; i += 4) {
    const kind = classifyPixel(data[i], data[i + 1], data[i + 2])
    if (kind === 'green') green += 1
    if (kind === 'sky') sky += 1
    brightnessSum += (data[i] + data[i + 1] + data[i + 2]) / (3 * 255)
  }
  return {
    greenRatio: pixels ? green / pixels : 0,
    skyRatio: pixels ? sky / pixels : 0,
    brightness: pixels ? brightnessSum / pixels : 0,
    pixelCount: pixels,
  }
}
