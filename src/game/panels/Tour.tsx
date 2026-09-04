/**
 * The tour card: coaches the current step, navigates to its panel, and steps
 * forward/back. Rendered as a banner inside the matching panel, or as a
 * floating card on the campus. Progress persists in the save; closing the card
 * never loses your place.
 */

import { TOUR_STEPS } from '../tour'
import type { GameState } from '../state'
import type { ViewId } from '../layout'

interface Props {
  state: GameState
  update: (fn: (s: GameState) => GameState) => void
  go: (view: ViewId | null) => void
  onClose: () => void
  banner?: boolean
}

export function TourCard({ state, update, go, onClose, banner }: Props) {
  const done = state.tourStep >= TOUR_STEPS.length
  const step = done ? null : TOUR_STEPS[state.tourStep]

  const advance = (to: number) =>
    update((s) => ({ ...s, tourStep: Math.max(0, Math.min(TOUR_STEPS.length, to)) }))

  if (done || !step) {
    return (
      <div className={banner ? 'tour-banner' : 'tour-float'} role="status">
        <div className="eyebrow">Guided tour · complete</div>
        <h3>That's the whole loop</h3>
        <p>Understand → make space → one checkpoint → recover → keep a memory.
          Your Journal holds the evidence.</p>
        <div className="qa">
          <button className="go" type="button" onClick={() => go('journal')}>See the Journal</button>
          <button type="button" onClick={() => advance(0)}>Replay tour</button>
          <button type="button" onClick={onClose} aria-label="Close tour">✕</button>
        </div>
      </div>
    )
  }

  return (
    <div className={banner ? 'tour-banner' : 'tour-float'} role="status" aria-live="polite">
      <div className="eyebrow">
        Guided tour · step {state.tourStep + 1} of {TOUR_STEPS.length} · {step.label}
      </div>
      <h3>{step.intro}</h3>
      <ol className="tour-choices">
        {step.choices.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>
      <p className="tour-payoff">{step.payoff}</p>
      <div className="tour-progress" aria-hidden="true">
        {TOUR_STEPS.map((s, i) => (
          <span key={s.id} className={i < state.tourStep ? 'past' : i === state.tourStep ? 'now' : ''} />
        ))}
      </div>
      <div className="qa">
        {state.view !== step.view && (
          <button className="go" type="button" onClick={() => go(step.view)}>Go there</button>
        )}
        <button type="button" disabled={state.tourStep === 0}
          onClick={() => advance(state.tourStep - 1)}>Back</button>
        <button type="button" onClick={() => advance(state.tourStep + 1)}>
          {state.tourStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
        </button>
        <button type="button" onClick={() => advance(TOUR_STEPS.length)}>Skip tour</button>
        {!banner && <button type="button" onClick={onClose} aria-label="Hide tour">Hide</button>}
      </div>
    </div>
  )
}
