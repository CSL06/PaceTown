/**
 * The guided tour — a new-user tutorial that walks the prototype flow.
 *
 * Every input the tour needs is prefilled (seeded schedule and brief), so the
 * visitor only ever picks choices: press a button, tick a box, choose an
 * option. The tour performs nothing itself — it coaches the next step while
 * the real panels, domain engines, rewards, and journal run underneath, so
 * what the visitor experiences is the system genuinely working.
 */

import type { ViewId } from './layout'

export interface TourStep {
  id: string
  /** Short label for the progress strip. */
  label: string
  /** The panel this step happens in. */
  view: ViewId
  /** One line: what you are doing. */
  intro: string
  /** The exact choices to make, in order. Nothing to type. */
  choices: string[]
  /** One line: what the system just proved. */
  payoff: string
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'tour-intake',
    label: 'Say the week',
    view: 'intake',
    intro: 'Your week is already typed in. You only have to approve it.',
    choices: [
      'Glance at the 9 commitments, confidence 1.00, and the 3 visible assumptions.',
      'Optional: Review as editable list, change one row.',
      'Press Save these commitments.',
    ],
    payoff: 'The parser turned sentences into commitments — live, with every guess shown.',
  },
  {
    id: 'tour-understand',
    label: 'See the math',
    view: 'understand',
    intro: 'Thursday is at 108%. Here is exactly why.',
    choices: [
      'Find the ERD assignment row (≈207 weighted).',
      'Press See what can move.',
    ],
    payoff: 'Every number is arithmetic you can read — minutes × priority × effort × urgency.',
  },
  {
    id: 'tour-rebalance',
    label: 'Make space',
    view: 'rebalance',
    intro: 'Kai proposes moves. Nothing has moved yet.',
    choices: [
      'Optional: uncheck a move and watch Thursday’s after-value change.',
      'Press Approve these 2 moves.',
    ],
    payoff: 'Thursday 108% → 91.5%. Locked items never moved; approval was yours.',
  },
  {
    id: 'tour-work',
    label: 'Pick one step',
    view: 'work',
    intro: 'One scary assignment becomes one small checkpoint.',
    choices: [
      'Pick “I do not know where to begin”.',
      'Choose the ~20-minute checkpoint (rewrite it if you like).',
      'Press Start a Pace Session.',
    ],
    payoff: 'The plan followed your blocker and your brief — not an example.',
  },
  {
    id: 'tour-session',
    label: 'Work with Mira',
    view: 'session',
    intro: 'One checkpoint, with company and escape routes.',
    choices: [
      'Under Ask Mira, press Explain.',
      'Pick Partial progress, keep the next action.',
      'Press Save and leave.',
    ],
    payoff: 'Partial progress counted (20 XP). The timer never decides anything.',
  },
  {
    id: 'tour-ripples',
    label: 'Pause here',
    view: 'ripples',
    intro: 'A sensory pause. No score, no failure.',
    choices: [
      'Tap the pond a few times.',
      'Press Done for now → Lighter → Resume checkpoint.',
    ],
    payoff: 'Rest banked, session intact — notes, timer, and all.',
  },
  {
    id: 'tour-pocket',
    label: 'Reset away',
    view: 'pocket',
    intro: 'The same rest, away from the screen.',
    choices: [
      'Pick open-window observation.',
      'Choose self-confirm, then Done.',
    ],
    payoff: 'Self-confirmation earns exactly what a photo would. No proof pressure.',
  },
  {
    id: 'tour-keepsake',
    label: 'Keep a memory',
    view: 'keepsakes',
    intro: 'Turn the quest into private pixel art — only if you want it.',
    choices: [
      'Pick Create keepsake, discard original.',
      'Tick the 4 privacy confirmations, press Generate.',
      'Approve the preview into the Recovery Garden.',
    ],
    payoff: 'Metadata stripped, original deleted as chosen, zero extra rewards.',
  },
  {
    id: 'tour-journal',
    label: 'Read the story',
    view: 'journal',
    intro: 'Everything you did, written down. Nothing to reconstruct.',
    choices: [
      'Read the timeline: rebalance, session, recovery, keepsake.',
      'Note the next action waiting for next time.',
    ],
    payoff: 'The town responded — XP, a taller plant, lighter fog. Tour complete.',
  },
]
