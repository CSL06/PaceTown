/**
 * "Try it on your own week" — the landing page's hands-on section.
 *
 * Everything above this on the page describes what PaceTown does. This lets
 * you do it. Type a day in plain language and the real parser reads it, the
 * real load model weighs it, and the number moves as you type — no mock data,
 * no scripted response, the same functions the app runs on.
 *
 * The waking-hours slider is the point of the whole section: dragging it makes
 * the relationship between capacity and pressure physical. The same nine
 * commitments are "fine" at sixteen waking hours and "unsustainable" at ten,
 * and that is the product's entire argument in one control.
 */

import { useMemo, useState } from 'react'
import {
  bandFor, dailyLoad, parseSchedule, type DemandCategory,
} from '../domain'

const DAY = 'thu'

/** Prefilled so the section is alive on arrival, and obviously editable. */
const SEED = 'Lecture from 9 to 12, 45 minute commute, shift from 6 to 10, essay due tomorrow takes 120 minutes'

/** One tap each, to show the parser coping with more than the seed. */
const ADDITIONS: { label: string; text: string }[] = [
  { label: '+ Lab 2 to 4', text: 'lab from 2 to 4' },
  { label: '+ Groceries', text: 'weekly groceries 45 minutes' },
  { label: '+ Reading', text: 'reading for seminar 60 minutes' },
  { label: '+ Gym', text: 'gym 40 minutes' },
  { label: '+ Society', text: 'film society at 5' },
]

const CATEGORY_LABEL: Record<DemandCategory, string> = {
  time: 'Fixed time',
  mental: 'Thinking',
  physical: 'Physical',
  social: 'Social',
  errands: 'Errands',
}

export function TryIt() {
  const [text, setText] = useState(SEED)
  const [hours, setHours] = useState(15)

  const waking = hours * 60

  const result = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return null
    const parsed = parseSchedule(trimmed, DAY)
    if (parsed.tasks.length === 0) return null
    return { ...parsed, load: dailyLoad(parsed.tasks, DAY, waking) }
  }, [text, waking])

  // Shown even with no tasks, so the band chip never flickers out of existence.
  const band = result ? result.load.band : bandFor(0)
  const percent = result ? result.load.percentage : 0

  const add = (fragment: string) => {
    setText((current) => {
      const base = current.trim()
      if (!base) return fragment
      return `${base.replace(/[,\s]+$/, '')}, ${fragment}`
    })
  }

  return (
    <section className="lp-section lp-try" id="try">
      <div className="lp-section-head" data-reveal>
        <p className="lp-eyebrow">Try it · nothing is sent anywhere</p>
        <h2>Put your own day in.</h2>
        <p>
          The same parser and the same arithmetic the app runs on, working in your
          browser as you type. No account, no upload.
        </p>
      </div>

      <div className="lp-try-grid" data-reveal data-reveal-index="1">
        <div className="lp-try-input">
          <label className="lp-try-label" htmlFor="try-week">
            A heavy day, however you would say it out loud
          </label>
          <textarea
            id="try-week"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Lecture from 9 to 12, shift from 6 to 10, essay due tomorrow takes 120 minutes"
            spellCheck={false}
          />

          <div className="lp-try-chips">
            {ADDITIONS.map((a) => (
              <button key={a.label} type="button" onClick={() => add(a.text)}>
                {a.label}
              </button>
            ))}
            <button type="button" className="lp-try-clear" onClick={() => setText('')}>
              Clear
            </button>
          </div>

          <label className="lp-try-label lp-try-slider-label" htmlFor="try-hours">
            Hours you are usually awake
            <b className="mono">{hours}h</b>
          </label>
          <input
            id="try-hours"
            className="lp-try-slider"
            type="range"
            min={10}
            max={18}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          <p className="lp-try-hint">
            Drag it. The same day is a different weight depending on how much of it you have.
          </p>
        </div>

        <div className="lp-try-out" aria-live="polite">
          {result ? (
            <>
              <div className="lp-try-num">
                <span className="lp-try-pct mono" data-band={band.key}>
                  {percent.toFixed(0)}<small>%</small>
                </span>
                <span className="lp-band" data-band={band.key}>{band.label}</span>
              </div>

              <div className="lp-try-bar" role="img"
                aria-label={`Daily load ${percent.toFixed(0)} percent, ${band.label}`}>
                {Array.from({ length: 24 }, (_, i) => (
                  <span key={i}
                    className={i < Math.round(Math.min(percent, 120) / 5) ? 'is-lit' : undefined}
                    data-band={band.key} />
                ))}
                <i className="lp-try-cap" style={{ left: `${(100 / 120) * 100}%` }} />
              </div>

              <ul className="lp-try-list">
                {result.tasks.map((task) => (
                  <li key={task.id}>
                    <span className="lp-try-dot" data-cat={task.category} aria-hidden="true" />
                    <span className="lp-try-name">{task.title}</span>
                    <span className="lp-try-meta mono">{task.estimatedMinutes}m</span>
                    <span className="lp-try-kind">
                      {task.flexibility === 'fixed' ? 'locked' : CATEGORY_LABEL[task.category]}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="lp-try-foot">
                {result.tasks.length} commitment{result.tasks.length === 1 ? '' : 's'} read
                {result.ambiguities.length > 0 && (
                  <> · {result.ambiguities.length} assumption
                    {result.ambiguities.length === 1 ? '' : 's'} shown, never hidden</>
                )}
              </p>

              {result.ambiguities.length > 0 && (
                <details className="lp-try-amb">
                  <summary>What it had to guess</summary>
                  <ul>{result.ambiguities.map((a) => <li key={a}>{a}</li>)}</ul>
                </details>
              )}
            </>
          ) : (
            <div className="lp-try-empty">
              <p><b>Nothing to read yet.</b></p>
              <p>
                Write a day above, or tap one of the buttons. The parser is local and
                deterministic — it will show you every assumption it makes.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
