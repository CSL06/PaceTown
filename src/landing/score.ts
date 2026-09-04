/**
 * "Grove Nights" — the generated score for the landing page.
 *
 * An original C-pop-flavoured lo-fi bed, synthesised in Web Audio. Because it
 * is generated rather than recorded, it carries no licence question at all,
 * downloads nothing, and never repeats exactly.
 *
 * The vocabulary it draws on:
 *
 *   - The "royal road" progression (IV–V–iii–vi), the harmonic backbone under
 *     a great deal of Mandopop and J-pop ballad writing.
 *   - A major pentatonic melody (gong mode on D). Leaving out the 4th and 7th
 *     is most of what gives a line its East Asian colour.
 *   - A plucked voice shaped after a guzheng — hard attack, fast decay, filter
 *     closing as it rings — over a sustained pad.
 *   - A breathy sine lead with vibrato, standing in for a dizi.
 *
 * Notes are scheduled ahead of the audio clock rather than fired from timers,
 * so the rhythm does not drift when the main thread is busy.
 */

const BPM = 76
const BEAT = 60 / BPM
const BAR = BEAT * 4

/** How far ahead of the clock notes are queued, and how often we top up. */
const SCHEDULE_AHEAD = 0.4
const TICK_MS = 60

/** D major pentatonic across two and a bit octaves. */
const PENTATONIC = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83]

interface Chord {
  bass: number
  notes: number[]
  /** Indices into PENTATONIC that land on a chord tone. */
  strong: number[]
}

/* IV – V – iii – vi in D major. */
const PROGRESSION: Chord[] = [
  { bass: 43, notes: [55, 59, 62, 66], strong: [2, 5, 7] },   // Gmaj7
  { bass: 45, notes: [57, 61, 64, 71], strong: [1, 3, 6] },   // Aadd9
  { bass: 42, notes: [54, 57, 61, 64], strong: [1, 3, 6] },   // F#m7
  { bass: 47, notes: [59, 62, 66, 69], strong: [0, 2, 4] },   // Bm7
]

/** Rhythms in beats, one bar each. Kept sparse — this plays under text. */
const RHYTHMS: number[][] = [
  [0, 1.5, 2.5],
  [0.5, 1, 2, 3],
  [0, 1, 2.5],
  [0, 0.75, 1.5, 3],
  [1, 2, 3.5],
]

function hz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * A plucked string: bright transient, fast decay, and a filter closing as it
 * rings. Two slightly detuned saws give it body without a chorus effect.
 */
function pluck(ctx: AudioContext, out: AudioNode, midi: number, at: number, gain = 0.13): void {
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.006)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + 1.5)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 1.4
  filter.frequency.setValueAtTime(3600, at)
  filter.frequency.exponentialRampToValueAtTime(620, at + 1.1)
  filter.connect(amp)
  amp.connect(out)

  for (const detune of [-4, 5]) {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = hz(midi)
    osc.detune.value = detune
    const voice = ctx.createGain()
    voice.gain.value = 0.42
    osc.connect(voice).connect(filter)
    osc.start(at)
    osc.stop(at + 1.7)
  }

  // A sine an octave down keeps the pluck from sounding thin.
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.value = hz(midi - 12)
  const subGain = ctx.createGain()
  subGain.gain.value = 0.16
  sub.connect(subGain).connect(amp)
  sub.start(at)
  sub.stop(at + 1.7)
}

/** Soft round bass. Felt more than heard. */
function bass(ctx: AudioContext, out: AudioNode, midi: number, at: number): void {
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(0.19, at + 0.05)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + BAR * 0.95)
  amp.connect(out)

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = hz(midi)
  osc.connect(amp)
  osc.start(at)
  osc.stop(at + BAR)

  // A quiet triangle an octave up gives it definition on small speakers.
  const harm = ctx.createOscillator()
  harm.type = 'triangle'
  harm.frequency.value = hz(midi + 12)
  const harmGain = ctx.createGain()
  harmGain.gain.value = 0.09
  harm.connect(harmGain).connect(amp)
  harm.start(at)
  harm.stop(at + BAR)
}

/** The sustained bed the plucks sit on. */
function pad(ctx: AudioContext, out: AudioNode, notes: number[], at: number): void {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 0.6
  filter.frequency.setValueAtTime(760, at)
  filter.frequency.linearRampToValueAtTime(1250, at + BAR * 0.6)
  filter.frequency.linearRampToValueAtTime(700, at + BAR)

  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(0.075, at + 0.9)
  amp.gain.setValueAtTime(0.075, at + BAR * 0.75)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + BAR + 0.6)
  filter.connect(amp)
  amp.connect(out)

  notes.forEach((midi, i) => {
    const osc = ctx.createOscillator()
    osc.type = i === 0 ? 'sine' : 'triangle'
    osc.frequency.value = hz(midi)
    osc.detune.value = (i % 2 === 0 ? 1 : -1) * (2 + i * 2)
    const voice = ctx.createGain()
    voice.gain.value = i === 0 ? 0.45 : 0.24
    osc.connect(voice).connect(filter)
    osc.start(at)
    osc.stop(at + BAR + 0.9)
  })
}

/**
 * The lead: a sine with vibrato that only opens up after the note has settled,
 * which is roughly how a bamboo flute behaves.
 */
function lead(ctx: AudioContext, out: AudioNode, midi: number, at: number, hold: number): void {
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(0.085, at + 0.07)
  amp.gain.setValueAtTime(0.085, at + hold * 0.6)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + hold)
  amp.connect(out)

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = hz(midi)
  osc.connect(amp)

  const vibrato = ctx.createOscillator()
  vibrato.type = 'sine'
  vibrato.frequency.value = 5.2
  const depth = ctx.createGain()
  depth.gain.setValueAtTime(0, at)
  depth.gain.linearRampToValueAtTime(7, at + 0.34)
  vibrato.connect(depth).connect(osc.detune)

  osc.start(at)
  vibrato.start(at)
  osc.stop(at + hold + 0.25)
  vibrato.stop(at + hold + 0.25)
}

export interface Score {
  stop: () => void
}

/**
 * Starts the score and returns a handle that stops it. Everything is routed
 * through `out`, so the caller owns the master fade.
 */
export function startScore(ctx: AudioContext, out: GainNode): Score {
  // A gentle slap-back gives the plucks some room without a reverb impulse.
  const echo = ctx.createDelay(1)
  echo.delayTime.value = BEAT * 0.75
  const echoGain = ctx.createGain()
  echoGain.gain.value = 0.26
  const echoTone = ctx.createBiquadFilter()
  echoTone.type = 'lowpass'
  echoTone.frequency.value = 1800
  echo.connect(echoTone).connect(echoGain).connect(echo)
  echoGain.connect(out)

  let bar = 0
  let nextBarAt = ctx.currentTime + 0.12
  let melodyIndex = 4
  let stopped = false

  const scheduleBar = (chord: Chord, at: number) => {
    bass(ctx, out, chord.bass, at)
    pad(ctx, out, chord.notes, at)

    // Arpeggio: up through the chord, then a partial descent. Skipped on the
    // fourth bar of each phrase so the loop breathes.
    if (bar % 4 !== 3) {
      const shape = [0, 1, 2, 3, 2, 1]
      shape.forEach((degree, i) => {
        const when = at + i * BEAT * 0.5
        if (when >= at + BAR) return
        const note = chord.notes[degree] + (i > 3 ? 12 : 0)
        pluck(ctx, echo, note, when, i === 0 ? 0.14 : 0.085)
      })
    }

    // Melody: a random walk on the pentatonic that resolves to a chord tone
    // on the downbeat, so it stays consonant however it wanders.
    for (const beat of pick(RHYTHMS)) {
      const isDownbeat = beat === 0
      if (isDownbeat) {
        melodyIndex = pick(chord.strong)
      } else {
        const stepChoices = [-2, -1, -1, 1, 1, 2]
        melodyIndex = Math.max(0, Math.min(PENTATONIC.length - 1, melodyIndex + pick(stepChoices)))
      }
      const when = at + beat * BEAT
      const hold = BEAT * (isDownbeat ? 1.6 : 1.1)
      lead(ctx, out, PENTATONIC[melodyIndex], when, hold)
      // Doubling the lead an octave down on downbeats thickens the phrase.
      if (isDownbeat) pluck(ctx, echo, PENTATONIC[melodyIndex] - 12, when, 0.06)
    }
  }

  const tick = () => {
    if (stopped) return
    while (nextBarAt < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleBar(PROGRESSION[bar % PROGRESSION.length], nextBarAt)
      nextBarAt += BAR
      bar += 1
    }
  }

  tick()
  const timer = window.setInterval(tick, TICK_MS)

  return {
    stop: () => {
      stopped = true
      window.clearInterval(timer)
      // Let the tail ring out; the caller's master gain is already fading.
      window.setTimeout(() => {
        try {
          echoGain.disconnect()
          echo.disconnect()
          echoTone.disconnect()
        } catch {
          /* Already torn down with the context. */
        }
      }, 2000)
    },
  }
}
