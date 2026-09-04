/**
 * First run (plan §7).
 *
 * Four short steps that replace the seeded student's Thursday with the
 * player's own. Everything collected here is a default, not a commitment:
 * each answer is editable later from Settings, every step can be skipped, and
 * skipping the lot leaves the demo week in place so the app still works.
 *
 * Step two parses as you type using the real parser, so nobody has to trust a
 * promise about what the app understood — they can see it, including what it
 * guessed at.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  REGULATIONS, REGULATION_IDS, dailyLoad, parseSchedule, wakingMinutes,
  type RegulationId,
} from '../domain'
import { loadState, saveState } from '../game/state'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeProvider'
import './onboarding.css'

const DAY = 'thu'

const STEPS = ['Your hours', 'Your week', 'Recovery', 'Comfort'] as const

/** Shown as a placeholder, never pre-filled — nobody should submit our week. */
const EXAMPLE =
  'Database lecture 9 to 12, 90 minute commute, shift from 6 to 10, ' +
  'essay due tomorrow takes 120 minutes, groceries 45 minutes'

function hourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24
  const suffix = h < 12 ? 'am' : 'pm'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}${suffix}`
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const { theme, setSetting } = useTheme()

  const [step, setStep] = useState(0)
  const [wakeHour, setWakeHour] = useState(8)
  const [sleepHour, setSleepHour] = useState(23)
  const [scheduleText, setScheduleText] = useState('')
  const [prefs, setPrefs] = useState<RegulationId[]>([])
  const [quiet, setQuiet] = useState(false)
  const [contrast, setContrast] = useState(false)

  const firstName = account?.name?.split(' ')[0] ?? 'there'
  const waking = wakingMinutes({ wakeHour, sleepHour })

  /* Parsed live, so the feedback is the real thing and not a mock-up. */
  const parsed = useMemo(() => {
    const text = scheduleText.trim()
    if (!text) return null
    const result = parseSchedule(text, DAY)
    if (result.tasks.length === 0) return null
    return { ...result, load: dailyLoad(result.tasks, DAY, waking) }
  }, [scheduleText, waking])

  const togglePref = (id: RegulationId) => {
    setPrefs((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  /** Writes the answers into the save. Anything left blank keeps its default. */
  const finish = (useAnswers: boolean) => {
    const state = loadState()
    saveState({
      ...state,
      onboarded: true,
      ...(useAnswers
        ? {
          capacity: { ...state.capacity, wakeHour, sleepHour },
          ...(parsed ? { scheduleText: scheduleText.trim(), tasks: parsed.tasks } : {}),
          recoveryPrefs: prefs,
          quiet,
          contrast,
        }
        : {}),
    })
    navigate('/town', { replace: true })
  }

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))
  const isLast = step === STEPS.length - 1

  return (
    <div className="ob">
      <div className="ob-shell">
        <header className="ob-head">
          <span className="ob-mark" aria-hidden="true">P</span>
          <div>
            <h1>Welcome, {firstName}.</h1>
            <p>Four short questions, about a minute. You can change any of it later.</p>
          </div>
        </header>

        <ol className="ob-steps" aria-label="Progress">
          {STEPS.map((name, i) => (
            <li key={name} className={i === step ? 'is-on' : i < step ? 'is-done' : undefined}
              aria-current={i === step ? 'step' : undefined}>
              <span className="ob-step-n">{i < step ? '✓' : i + 1}</span>
              <span className="ob-step-name">{name}</span>
            </li>
          ))}
        </ol>

        <div className="ob-body">
          {step === 0 && (
            <section className="ob-step">
              <h2>When are you usually awake?</h2>
              <p className="ob-lede">
                This is the only number the whole model rests on. Everything PaceTown says
                about pressure is measured against these hours — not against a standard day.
              </p>

              <div className="ob-hours">
                <label>
                  <span>Usually up around</span>
                  <select value={wakeHour} onChange={(e) => setWakeHour(Number(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => i + 4).map((h) => (
                      <option key={h} value={h}>{hourLabel(h)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Usually asleep around</span>
                  <select value={sleepHour} onChange={(e) => setSleepHour(Number(e.target.value))}>
                    {Array.from({ length: 10 }, (_, i) => i + 20).map((h) => (
                      <option key={h} value={h}>{hourLabel(h)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="ob-readout">
                That gives you <b>{(waking / 60).toFixed(1)} waking hours</b> a day
                — <span className="mono">{waking}</span> minutes to fit everything into.
              </p>
              <p className="ob-note">
                No judgement attached to either number. A late sleeper is not a worse student.
              </p>
            </section>
          )}

          {step === 1 && (
            <section className="ob-step">
              <h2>What does a heavy day look like?</h2>
              <p className="ob-lede">
                Write it however you would say it out loud. Commas between things. PaceTown
                reads it as you type and shows you exactly what it understood.
              </p>

              <label className="ob-field">
                <span>Your day, in plain language</span>
                <textarea
                  rows={4}
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  placeholder={EXAMPLE}
                />
              </label>

              {parsed ? (
                <div className="ob-parse">
                  <div className="ob-parse-head">
                    <span className="ob-eyebrow">Understood</span>
                    <span className="ob-conf">
                      {Math.round(parsed.confidence * 100)}% of it recognised
                    </span>
                  </div>
                  <ul className="ob-tasks">
                    {parsed.tasks.map((task) => (
                      <li key={task.id}>
                        <span className="ob-dot" data-cat={task.category} aria-hidden="true" />
                        <span className="ob-task-name">{task.title}</span>
                        <span className="ob-task-min mono">{task.estimatedMinutes}m</span>
                        <span className="ob-task-flex">{task.flexibility}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="ob-readout">
                    That day sits at{' '}
                    <b data-band={parsed.load.band.key}>{parsed.load.percentage.toFixed(0)}%</b>
                    {' '}of your waking hours — <span className="mono">{parsed.load.band.label}</span>.
                  </p>
                  {parsed.ambiguities.length > 0 && (
                    <details className="ob-amb">
                      <summary>{parsed.ambiguities.length} assumption{parsed.ambiguities.length === 1 ? '' : 's'} made</summary>
                      <ul>{parsed.ambiguities.map((a) => <li key={a}>{a}</li>)}</ul>
                    </details>
                  )}
                </div>
              ) : (
                <p className="ob-empty">
                  Leave this blank and PaceTown starts with a worked example week you can
                  edit — nothing here is required.
                </p>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="ob-step">
              <h2>What actually helps you rest?</h2>
              <p className="ob-lede">
                Pick as many as you like, or none. This only changes what gets offered
                first — every activity stays available to you at any time, with no
                prerequisite.
              </p>

              <div className="ob-picks">
                {REGULATION_IDS.map((id) => {
                  const activity = REGULATIONS[id]
                  const on = prefs.includes(id)
                  return (
                    <button key={id} type="button" className={`ob-pick${on ? ' is-on' : ''}`}
                      aria-pressed={on} onClick={() => togglePref(id)}>
                      <span className="ob-pick-check" aria-hidden="true">{on ? '✓' : ''}</span>
                      <span>
                        <b>{activity.name}</b>
                        <small>{activity.blurb}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="ob-step">
              <h2>How should it look and move?</h2>
              <p className="ob-lede">
                All three are togglable at any time from the town, and none of them
                remove a feature.
              </p>

              <div className="ob-picks">
                <button type="button" className={`ob-pick${quiet ? ' is-on' : ''}`}
                  aria-pressed={quiet} onClick={() => setQuiet((v) => !v)}>
                  <span className="ob-pick-check" aria-hidden="true">{quiet ? '✓' : ''}</span>
                  <span><b>Quiet Mode</b><small>No weather, no ambient motion, no idle animation.</small></span>
                </button>

                <button type="button" className={`ob-pick${contrast ? ' is-on' : ''}`}
                  aria-pressed={contrast} onClick={() => setContrast((v) => !v)}>
                  <span className="ob-pick-check" aria-hidden="true">{contrast ? '✓' : ''}</span>
                  <span><b>High contrast</b><small>Stronger edges and text. Status never relies on colour alone.</small></span>
                </button>

                <button type="button" className={`ob-pick${theme === 'dark' ? ' is-on' : ''}`}
                  aria-pressed={theme === 'dark'}
                  onClick={() => setSetting(theme === 'dark' ? 'light' : 'dark')}>
                  <span className="ob-pick-check" aria-hidden="true">{theme === 'dark' ? '✓' : ''}</span>
                  <span><b>Dark theme</b><small>Currently {theme}. Follows your system until you choose here.</small></span>
                </button>
              </div>
            </section>
          )}
        </div>

        <footer className="ob-foot">
          <button type="button" className="ob-skip" onClick={() => finish(false)}>
            Skip — use the example week
          </button>
          <div className="ob-nav">
            {step > 0 && (
              <button type="button" className="ob-secondary" onClick={back}>Back</button>
            )}
            <button type="button" className="ob-primary"
              onClick={isLast ? () => finish(true) : next}>
              {isLast ? 'Enter Campus Grove' : 'Continue'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
