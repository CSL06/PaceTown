/**
 * First-time explainer copy: one `?` popup per view.
 *
 * Fixed core per view (what / how / which guardian and why) plus one live
 * line where it changes a decision. Game words are explained inline:
 * a checkpoint is one small step with a clear finish line; rebalance means
 * moving flexible work to another day with your approval.
 */

import {
  BLOCKERS, DEMO_DESTINATION, guardianFor, proposeRebalance, wakingMinutes,
  type DailyLoad, type GuardianId,
} from '../domain'
import { GUARDIANS, type ViewId } from './layout'
import type { GameState } from './state'

export interface HelpGuardian {
  who: GuardianId
  why: string
}

export interface HelpContent {
  title: string
  what: string
  how: string
  guardian: HelpGuardian
  adaptive?: (state: GameState, load: DailyLoad) => string | null
}

const name = (g: GuardianId) => GUARDIANS[g].name

export const HELP: Record<ViewId, HelpContent> = {
  intake: {
    title: 'Town Hall',
    what: 'Your week, typed in plain words, turned into a list of commitments.',
    how: 'Edit the text, review it as an editable list, then save. Nothing saves until you approve it.',
    guardian: { who: 'kai', why: 'Kai plans time. He reads this list to tell you what Thursday holds.' },
  },
  understand: {
    title: 'Understand',
    what: 'Why Thursday reads the way it does: every flexible task with its math.',
    how: 'Read the rows, then choose “See what can move”. Nothing has changed yet.',
    guardian: { who: 'kai', why: 'Kai reads these numbers. He will say what can move.' },
    adaptive: (_s, load) => `Thursday reads ${load.percentage.toFixed(1)}%. Over 100 means more planned than fits — never a grade.`,
  },
  rebalance: {
    title: 'Rebalance Workshop',
    what: 'Kai’s proposal to move flexible work to Saturday. Locked times stay; deadlines hold.',
    how: 'Uncheck moves to preview the result, then approve or reject. Reject leaves the week untouched.',
    guardian: { who: 'kai', why: 'Kai wrote this proposal. He never moves anything without your approval.' },
    adaptive: (s) => {
      if (s.rebalanceSeen) return 'You already decided this. What is left is real work in the Library.'
      const p = proposeRebalance(s.tasks, { day: 'thu', destination: DEMO_DESTINATION, waking: wakingMinutes(s.capacity) })
      return p.moves.length === 0
        ? 'Nothing can safely move. Continue to the Library.'
        : `Kai can move ${p.moves.length} ${p.moves.length === 1 ? 'thing' : 'things'}. Uncheck any move to preview.`
    },
  },
  work: {
    title: 'Library · Choose the work',
    what: 'Pick what blocks you, and get a small plan of checkpoints. A checkpoint is one small step with a clear finish line.',
    how: 'Choose a blocker, pick a checkpoint, then start a Pace Session. Every word stays editable.',
    guardian: { who: 'mira', why: 'Mira untangles study knots. Your blocker choice may call a different guardian — the live line says who.' },
    adaptive: (s) => {
      if (!s.blocker) return 'No blocker picked yet. Choosing one calls the right guardian.'
      const b = BLOCKERS.find((x) => x.id === s.blocker)
      return `${name(guardianFor(s.blocker))} is with you here: you picked “${b?.label ?? s.blocker}”.`
    },
  },
  session: {
    title: 'Pace Session',
    what: 'One checkpoint, one optional timer, one scratchpad. The timer never completes work — only you can.',
    how: 'Ask the guardian, write what changed and the easiest next action, then save and leave.',
    guardian: { who: 'mira', why: 'A guardian sits with you. Your blocker decides which one — the live line says who.' },
    adaptive: (s) => {
      if (!s || !Array.isArray(s.checkpoints)) return null
      if (!s.blocker) return 'Pick a checkpoint in the Library first. Sessions attach to one checkpoint.'
      const g = name(guardianFor(s.blocker))
      const c = s.checkpoints.find((x) => x.id === s.activeCheckpointId)
      return c ? `${g} is with you. Current checkpoint: “${c.title}”.` : `${g} is with you. Choose a checkpoint in the Library to begin.`
    },
  },
  recover: {
    title: 'Recover',
    what: 'Two equal ways to pause: something here, or something away from the screen. Neither earns more.',
    how: 'Pick Gentle Ripples or Pocket of Green — or choose Not now. Declining costs nothing.',
    guardian: { who: 'sol', why: 'Sol keeps effort sustainable. Pausing is a complete result here.' },
  },
  ripples: {
    title: 'Gentle Ripples',
    what: 'A paced sensory pause at the fountain. No score, no failure state.',
    how: 'Tap the water, say how it feels, then choose where to return.',
    guardian: { who: 'sol', why: 'Sol hosts this water. Achieving nothing here is the point.' },
  },
  pocket: {
    title: 'Pocket of Green',
    what: 'A short calm reset with something green. Outside, window, plant, or picture — all four count the same.',
    how: 'Choose a setting, confirm by your word or an optional photo, then complete.',
    guardian: { who: 'sol', why: 'Sol keeps this equal for every setting. No path earns more.' },
  },
  firefly: {
    title: 'Firefly Stories',
    what: 'Five lights, five short readings about rest and starting. Follow one or skip them all.',
    how: 'Read or skip, place one glow, then choose where to return.',
    guardian: { who: 'mira', why: 'Mira gathered these readings. One small idea is enough.' },
  },
  chime: {
    title: 'Chime Drift',
    what: 'Slow notes drift past a clock hand. Tap them or simply watch — timing is never scored.',
    how: 'Tap, press Space, or watch. Leave whenever you are ready.',
    guardian: { who: 'kai', why: 'Kai keeps this pace slow. There is nothing to be late for.' },
  },
  warmcup: {
    title: 'Warm Cup',
    what: 'Choose a drink, pour, stir, and sit by the window. The sequence cannot be ruined.',
    how: 'Follow the steps in any order that feels right. No wrong moves exist here.',
    guardian: { who: 'sky', why: 'Sky sits with you while the cup is made. Company, not instruction.' },
  },
  lanterns: {
    title: 'Night Lanterns',
    what: 'Choose a symbol for what is on your mind and place a lantern. Words stay private and optional.',
    how: 'Pick a symbol, light the lantern, place it. That is the whole activity.',
    guardian: { who: 'goh', why: 'Goh finishes small things. Naming the concern is the finish here.' },
  },
  keepsakes: {
    title: 'Pace Keepsakes',
    what: 'Turn a Pocket photo into a private pixel-art memory. Optional — the quest already counted.',
    how: 'Choose a photo treatment, name it, keep it. This changes no reward.',
    guardian: { who: 'sol', why: 'Sol keeps memories pressure-free. Keep one only if you want one.' },
  },
  collection: {
    title: 'Keepsake Collection',
    what: 'Your private grid of kept memories. Nothing here is shared or scored.',
    how: 'Look back whenever you like. Returning to town is always one tap away.',
    guardian: { who: 'sol', why: 'Sol tends this shelf. It only ever grows.' },
  },
  journal: {
    title: 'Journal',
    what: 'What Thursday actually held, written automatically from real events. No streaks, no guilt.',
    how: 'Read back any time. Your saved next action waits at the bottom after a session.',
    guardian: { who: 'mira', why: 'Mira keeps study notes honest. This log never judges.' },
  },
  council: {
    title: 'Guardian Council',
    what: 'Three guardians read the same numbers you can see and propose one next step. You decide.',
    how: 'Read the voices, pick the recommendation or choose for yourself. The bell changes nothing by itself.',
    guardian: { who: 'kai', why: 'Kai chairs the numbers. All three speak, then you decide.' },
    adaptive: (s) => {
      const open = !s.rebalanceSeen &&
        proposeRebalance(s.tasks, { day: 'thu', destination: DEMO_DESTINATION, waking: wakingMinutes(s.capacity) }).moves.length > 0
      const rec = open ? 'Rebalance the week' : s.outcome && !s.questOutcome ? 'Recover' : 'Choose the work'
      return `Right now the Council leans: ${rec}.`
    },
  },
  mailbox: {
    title: 'Future Mailbox',
    what: 'Send a next action to your future self. It waits instead of nagging.',
    how: 'Write the note, put it in the mailbox. Read waiting notes any time.',
    guardian: { who: 'sky', why: 'Sky keeps this pressure-free. Notes wait; nothing nags.' },
  },
  calm: {
    title: 'Calm Corner',
    what: 'All five recovery activities with no prerequisites. No load score needed.',
    how: 'Pick any activity. Leaving early is always valid.',
    guardian: { who: 'sol', why: 'Sol keeps every door here open. Rest needs no permission.' },
  },
  home: {
    title: 'Home',
    what: 'Quiet Mode, the Exit Quest, and your local data. Stopping is a valid outcome.',
    how: 'Toggle comfort settings, close the day on purpose, or export and delete your data.',
    guardian: { who: 'sol', why: 'Sol keeps stopping valid. Nothing is lost by being away.' },
  },
  backpack: {
    title: 'Backpack',
    what: 'Your Thursday load shown as carried items: locked or flexible. It never bursts.',
    how: 'Bring one item into a session, or move one to Saturday through rebalancing.',
    guardian: { who: 'kai', why: 'Kai reads carried loads. Lighter is a plan, not a grade.' },
  },
  garden: {
    title: 'Recovery Garden',
    what: 'Growth from steady choices: progress, recovery, honest rescheduling, asking for help. Never wilts.',
    how: 'Keep playing gently. Being away never removes anything.',
    guardian: { who: 'sol', why: 'Sol tends this plot. Growth here never decays.' },
  },
  load: {
    title: 'Daily Load',
    what: 'The full Thursday calculation plus Load Weather per place. Every effect has a text equivalent.',
    how: 'Read the maths, then act in the Library or Clock Tower.',
    guardian: { who: 'kai', why: 'Kai owns these numbers. Ask him what can move.' },
  },
  townlist: {
    title: 'Town List',
    what: 'Every place in town, listed. Nothing requires finding things by walking.',
    how: 'Pick a destination to walk there and open it.',
    guardian: { who: 'mira', why: 'Mira makes sure you never get lost.' },
  },
  briefing: {
    title: 'Daily Briefing',
    what: 'Waking hours plus an optional check-in: energy and stress, 1–5, skippable.',
    how: 'Set what you know, skip the rest. This is preference, never diagnosis.',
    guardian: { who: 'sol', why: 'Sol reads capacity gently. Low energy gets smaller plans.' },
  },
  settings: {
    title: 'Settings',
    what: 'Your defaults: waking hours, session length, preferred recovery, motion and contrast.',
    how: 'Change anything at any time. Every value is a starting point, never a commitment you owe.',
    guardian: { who: 'sol', why: 'Sol keeps effort sustainable, so the defaults are his to look after.' },
  },
  shop: {
    title: 'Shop',
    what: 'Ways the town can look, bought with coins you earned in the loop.',
    how: 'Preview anything for free, then buy it if you want it. Appearance only.',
    guardian: { who: 'goh', why: 'Goh keeps the market. Nothing he sells changes your week.' },
    adaptive: (s) => `You have ${s.coins} coin${s.coins === 1 ? '' : 's'}. Nothing here affects load or rewards.`,
  },
}

/** Crash-safe live line. Unknown views and failing adaptives yield null (static text only). */
export function adaptiveLine(view: ViewId, state: GameState, load: DailyLoad): string | null {
  try {
    return HELP[view]?.adaptive?.(state, load) ?? null
  } catch {
    return null
  }
}
