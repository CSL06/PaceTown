/**
 * The last line of defence.
 *
 * Without this, one throw anywhere in the tree unmounts the whole app and
 * leaves a blank page. For something holding a student's week in
 * localStorage, a blank page is indistinguishable from lost data — so the
 * fallback's first job is to say the save is intact, and its second is to
 * hand it over as a file before the person does anything else.
 *
 * A class component because React still has no hook for this.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { SAVE_KEY } from '../game/state'
import './error.css'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  componentStack: string | null
}

/** Everything the app owns in the browser, for the rescue download. */
const OWNED_KEYS = [SAVE_KEY, 'pacetown.accounts', 'pacetown.session', 'pacetown.theme', 'pacetown.ambient']

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ componentStack: info.componentStack ?? null })
    // Nothing is sent anywhere: there is no error service wired up, and
    // inventing one silently would be worse than the console.
    console.error('PaceTown crashed:', error, info.componentStack)
  }

  /** Bundles local storage into a file so a crash cannot cost anyone a week. */
  private rescue = (): void => {
    const dump: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      reason: 'crash-recovery',
      error: this.state.error?.message ?? null,
    }
    for (const key of OWNED_KEYS) {
      try {
        const raw = localStorage.getItem(key)
        if (raw === null) continue
        try {
          dump[key] = JSON.parse(raw)
        } catch {
          dump[key] = raw
        }
      } catch {
        /* Storage is unreadable; the rest of the dump is still worth having. */
      }
    }

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pacetown-recovery-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  /** Re-render from scratch without touching the save. */
  private retry = (): void => {
    this.setState({ error: null, componentStack: null })
  }

  render(): ReactNode {
    const { error, componentStack } = this.state
    if (!error) return this.props.children

    return (
      <div className="eb" role="alert">
        <div className="eb-card">
          <span className="eb-mark" aria-hidden="true">P</span>
          <h1>Something in PaceTown broke.</h1>
          <p className="eb-lede">
            That is our fault, not yours. <strong>Your saved week has not been touched</strong> —
            it is still in this browser exactly as it was a moment ago.
          </p>

          <div className="eb-actions">
            <button className="eb-primary" type="button" onClick={this.retry}>
              Try that again
            </button>
            <button className="eb-secondary" type="button" onClick={() => window.location.assign('/')}>
              Back to the landing page
            </button>
          </div>

          <div className="eb-rescue">
            <h2>Want a copy first?</h2>
            <p>
              Downloads everything PaceTown has stored — your week, your progress and your
              settings — as one JSON file you keep.
            </p>
            <button className="eb-secondary" type="button" onClick={this.rescue}>
              Download my data
            </button>
          </div>

          <details className="eb-details">
            <summary>Technical detail</summary>
            <p className="eb-msg">{error.message || String(error)}</p>
            {componentStack && <pre>{componentStack.trim()}</pre>}
          </details>
        </div>
      </div>
    )
  }
}
