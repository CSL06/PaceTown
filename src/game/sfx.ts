/**
 * Campus Grove sound.
 *
 * Synthesised, not sampled — same reasoning as the landing page's score: no
 * files to download, no licence to clear, and it themes with the product
 * rather than being borrowed from a pack.
 *
 * The brief is unusual and worth stating, because it is the opposite of most
 * game audio. This app is for people who are already overloaded. Nothing here
 * may startle: no sharp transients, no bright high frequencies, no rising
 * urgency, and nothing loud enough to be noticed on its own. Every sound is
 * short, soft-edged, and sits low in the mix. The failure sound in particular
 * is *gentler* than the success one, because being told you got something
 * wrong should never be the loudest thing that happens to you.
 *
 * Quiet Mode silences all of it. So does a browser that refuses an
 * AudioContext — every call is a no-op rather than a thrown error.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let enabled = true
let failed = false

/** Overall ceiling. Deliberately low: this is texture, not signal. */
const MASTER = 0.3

function audio(): AudioContext | null {
  if (failed || !enabled) return null
  if (ctx) {
    // Browsers suspend contexts created before a gesture; nudge it each time.
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
    return ctx
  }
  const Ctor = window.AudioContext
    ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) { failed = true; return null }
  try {
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = MASTER
    master.connect(ctx.destination)
    return ctx
  } catch {
    failed = true
    return null
  }
}

/** One second of white noise, reused for every footstep. */
function noiseBuffer(c: AudioContext): AudioBuffer {
  if (noise) return noise
  const buffer = c.createBuffer(1, c.sampleRate, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  noise = buffer
  return buffer
}

/**
 * A single soft tone. Sine only, with a few milliseconds of attack so it can
 * never click, and an exponential tail so it never cuts.
 */
function tone(freq: number, at: number, dur: number, gain: number, type: OscillatorType = 'sine') {
  const c = ctx
  if (!c || !master) return
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)

  const amp = c.createGain()
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur)

  osc.connect(amp).connect(master)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

/** A filtered noise burst — footsteps, and anything with texture. */
function thud(at: number, gain: number, cutoff: number, dur: number) {
  const c = ctx
  if (!c || !master) return
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c)
  src.playbackRate.value = 0.8 + Math.random() * 0.4

  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(cutoff, at)
  filter.Q.value = 0.7

  const amp = c.createGain()
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur)

  src.connect(filter).connect(amp).connect(master)
  src.start(at)
  src.stop(at + dur + 0.02)
}

export function setSfxEnabled(on: boolean): void {
  enabled = on
  if (!on && ctx) void ctx.suspend().catch(() => {})
  if (on && ctx?.state === 'suspended') void ctx.resume().catch(() => {})
}

/**
 * A short haptic tap. Silently absent on desktop and on iOS Safari, which is
 * fine — it is reinforcement, never the only feedback.
 */
export function haptic(ms = 8): void {
  if (!enabled) return
  try { navigator.vibrate?.(ms) } catch { /* unsupported */ }
}

export const sfx = {
  /** Any ordinary button. Barely there on purpose. */
  click() {
    const c = audio(); if (!c) return
    tone(520, c.currentTime, 0.07, 0.09, 'triangle')
  },

  /** Opening a place. Two notes up, like a door giving way. */
  enter() {
    const c = audio(); if (!c) return
    const t = c.currentTime
    tone(392, t, 0.16, 0.1)
    tone(587, t + 0.05, 0.2, 0.075)
    thud(t, 0.05, 420, 0.12)
  },

  /** Closing. The same shape, downward. */
  close() {
    const c = audio(); if (!c) return
    const t = c.currentTime
    tone(494, t, 0.12, 0.07)
    tone(330, t + 0.04, 0.16, 0.055)
  },

  /** Footstep. Quiet enough to notice only when it stops. */
  step() {
    const c = audio(); if (!c) return
    thud(c.currentTime, 0.035, 300 + Math.random() * 120, 0.07)
  },

  /** Something was banked. Warm, resolved, and over quickly. */
  reward() {
    const c = audio(); if (!c) return
    const t = c.currentTime
    tone(587, t, 0.18, 0.1)
    tone(784, t + 0.07, 0.26, 0.085)
  },

  /** A level. The only sound allowed three notes. */
  levelUp() {
    const c = audio(); if (!c) return
    const t = c.currentTime
    tone(523, t, 0.2, 0.1)
    tone(659, t + 0.09, 0.22, 0.095)
    tone(880, t + 0.18, 0.42, 0.085)
  },

  /**
   * Something could not happen. Low, soft and *quieter* than reward — a
   * refusal in this product is information, not a reprimand.
   */
  deny() {
    const c = audio(); if (!c) return
    const t = c.currentTime
    tone(233, t, 0.16, 0.055)
  },
}
