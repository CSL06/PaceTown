/**
 * Profile and settings (plan §7).
 *
 * Everything onboarding asked for, editable afterwards, plus the data
 * controls. Nothing in here is buried behind a confirmation except the two
 * actions that actually destroy something.
 */

import { useState } from 'react'
import {
  REGULATIONS, REGULATION_IDS, wakingMinutes, type RegulationId,
} from '../../domain'
import { useTheme, type ThemeSetting } from '../../theme/ThemeProvider'
import { clearState, resetDemo } from '../state'
import { clearProblems, problemsAsText, recentProblems } from '../../ui/errorLog'
import { HelpDot } from './HelpDot'
import type { PanelProps } from './types'

function hourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24
  const suffix = h < 12 ? 'am' : 'pm'
  return `${h % 12 === 0 ? 12 : h % 12}${suffix}`
}

const TIMER_CHOICES: [string, number][] = [
  ['10 minutes', 10 * 60],
  ['20 minutes', 20 * 60],
  ['30 minutes', 30 * 60],
  ['45 minutes', 45 * 60],
]

const THEME_CHOICES: [ThemeSetting, string][] = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'Match system'],
]

export function Settings({ state, load, update, toast }: PanelProps) {
  const { setting: themeSetting, setSetting: setThemeSetting } = useTheme()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [showProblems, setShowProblems] = useState(false)
  const problems = recentProblems()
  const waking = wakingMinutes(state.capacity)

  const togglePref = (id: RegulationId) => {
    update((s) => ({
      ...s,
      recoveryPrefs: s.recoveryPrefs.includes(id)
        ? s.recoveryPrefs.filter((x) => x !== id)
        : [...s.recoveryPrefs, id],
    }))
  }

  const exportSave = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pacetown-save-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast('Save exported as JSON')
  }

  return (
    <div className="card">
      <div className="eyebrow">Settings</div>
      <h2>Your defaults <HelpDot view="home" state={state} load={load} /></h2>
      <p className="lede">
        Every value here is a default, not a commitment. Changing one never rewrites
        work you have already recorded.
      </p>

      {/* ---------------------------------------------------------- capacity */}
      <div className="card">
        <div className="eyebrow">Capacity</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>Waking hours</h3>
        <p className="note">
          The number every load percentage is measured against. Currently{' '}
          <b className="mono">{(waking / 60).toFixed(1)}</b> hours a day.
        </p>
        <div className="set-row">
          <label>
            <span>Up around</span>
            <select value={state.capacity.wakeHour}
              onChange={(e) => update((s) => ({
                ...s, capacity: { ...s.capacity, wakeHour: Number(e.target.value) },
              }))}>
              {Array.from({ length: 12 }, (_, i) => i + 4).map((h) => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Asleep around</span>
            <select value={state.capacity.sleepHour}
              onChange={(e) => update((s) => ({
                ...s, capacity: { ...s.capacity, sleepHour: Number(e.target.value) },
              }))}>
              {Array.from({ length: 10 }, (_, i) => i + 20).map((h) => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="disclaimer">
          Energy and stress stay optional and are never stored as a score or a diagnosis.
        </p>
      </div>

      {/* ---------------------------------------------------------- sessions */}
      <div className="card">
        <div className="eyebrow">Pace Sessions</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>Default timer length</h3>
        <p className="note">
          A starting point only. The timer is adjustable in the session, and running
          out never completes your work — only you do that.
        </p>
        <div className="set-chips">
          {TIMER_CHOICES.map(([label, seconds]) => (
            <button key={label} type="button"
              className={`set-chip${state.session.timerLenSec === seconds ? ' is-on' : ''}`}
              aria-pressed={state.session.timerLenSec === seconds}
              onClick={() => update((s) => ({
                ...s, session: { ...s.session, timerLenSec: seconds },
              }))}>{label}</button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- recovery */}
      <div className="card">
        <div className="eyebrow">Recovery</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>What gets offered first</h3>
        <p className="note">
          Ordering only. Every activity stays available at any time with no prerequisite,
          whether or not it is picked here.
        </p>
        <div className="opts">
          {REGULATION_IDS.map((id) => {
            const on = state.recoveryPrefs.includes(id)
            return (
              <button key={id} className="opt" type="button" aria-pressed={on}
                onClick={() => togglePref(id)}>
                <span className="k">{on ? '◉' : '○'}</span>
                <span>{REGULATIONS[id].name}<small>{REGULATIONS[id].blurb}</small></span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ----------------------------------------------------- accessibility */}
      <div className="card">
        <div className="eyebrow">Comfort and access</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>Motion, contrast and theme</h3>
        <div className="opts">
          <button className="opt" type="button" aria-pressed={state.quiet}
            onClick={() => update((s) => ({ ...s, quiet: !s.quiet }))}>
            <span className="k">{state.quiet ? '◉' : '○'}</span>
            <span>Quiet Mode<small>No weather, ambient life or idle animation. Every action stays available.</small></span>
          </button>
          <button className="opt" type="button" aria-pressed={state.contrast}
            onClick={() => update((s) => ({ ...s, contrast: !s.contrast }))}>
            <span className="k">{state.contrast ? '◉' : '○'}</span>
            <span>High contrast<small>Stronger edges and text. Status is never carried by colour alone.</small></span>
          </button>
        </div>
        <div className="set-chips" style={{ marginTop: 12 }}>
          {THEME_CHOICES.map(([value, label]) => (
            <button key={value} type="button"
              className={`set-chip${themeSetting === value ? ' is-on' : ''}`}
              aria-pressed={themeSetting === value}
              onClick={() => setThemeSetting(value)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- problems */}
      <div className="card">
        <div className="eyebrow">Problem log</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>
          {problems.length === 0
            ? 'Nothing has gone wrong'
            : `${problems.length} problem${problems.length === 1 ? '' : 's'} recorded`}
        </h3>
        <p className="note">
          If something breaks, it is written down here rather than disappearing into a
          console. Nothing is sent anywhere — this is yours to read, and to copy if you
          want to report it.
        </p>
        {problems.length > 0 && (
          <div className="actions">
            <button className="secondary" type="button"
              onClick={() => setShowProblems((v) => !v)}>
              {showProblems ? 'Hide details' : 'Show details'}
            </button>
            <button className="secondary" type="button" onClick={() => {
              void navigator.clipboard?.writeText(problemsAsText())
              toast('Problem log copied')
            }}>Copy for a report</button>
            <button className="secondary" type="button" onClick={() => {
              clearProblems()
              toast('Problem log cleared')
            }}>Clear</button>
          </div>
        )}
        {showProblems && (
          <pre className="problem-log">{problemsAsText()}</pre>
        )}
      </div>

      {/* -------------------------------------------------------------- data */}
      <div className="card">
        <div className="eyebrow">Your data</div>
        <h3 style={{ fontSize: 17, marginTop: 5 }}>Local-first, and yours</h3>
        <p className="note">
          Nothing in PaceTown has left this browser. There is no server to delete it from.
        </p>
        <div className="actions">
          <button className="secondary" type="button" onClick={() => {
            resetDemo()
            window.location.reload()
          }}>Start the example week again</button>
          <button className="secondary" type="button" onClick={exportSave}>
            Export save (JSON)
          </button>
          {confirmingReset ? (
            <>
              <button className="primary" type="button" onClick={() => {
                clearState()
                // A wiped save has no onboarding record, so reloading in place
                // would land on the first-run wizard. Start from the front.
                window.location.assign('/')
              }}>Yes, delete everything</button>
              <button className="secondary" type="button"
                onClick={() => setConfirmingReset(false)}>Cancel</button>
              <span className="note">This removes your week, progress and settings.</span>
            </>
          ) : (
            <button className="secondary" type="button"
              onClick={() => setConfirmingReset(true)}>Delete local data</button>
          )}
        </div>
      </div>
    </div>
  )
}
