/**
 * Client-side problem log.
 *
 * Proper observability needs a hosted service, and there isn't one. But the
 * part that does not need a server is worth having now: catching the errors
 * that currently vanish into a console nobody has open, keeping a bounded
 * record of them, and giving the player something concrete to hand over when
 * they say "it broke".
 *
 * Two rules:
 *
 *   - Nothing leaves the browser. There is no endpoint here, and the log is
 *     shown to the person it belongs to rather than shipped anywhere. If a
 *     reporter is ever wired up, `setReporter` is the single seam and it is
 *     opt-in by construction.
 *   - It cannot become the problem. The buffer is capped, writes are wrapped,
 *     and a failure inside the logger is swallowed — a crash reporter that
 *     crashes is worse than no crash reporter.
 */

const STORAGE_KEY = 'pacetown.problems'
const MAX_ENTRIES = 25
/** Enough to identify a fault, short enough never to fill a quota. */
const MAX_STACK = 1200

export interface ProblemEntry {
  at: number
  kind: 'error' | 'promise' | 'react'
  message: string
  stack?: string
  /** Where it happened, so a report is actionable. */
  route: string
}

type Reporter = (entry: ProblemEntry) => void

let reporter: Reporter | null = null
let installed = false

/**
 * Wire a hosted collector (Sentry and friends) here. Deliberately a function
 * call rather than a build-time import: nothing is sent anywhere unless an
 * application explicitly opts in.
 */
export function setReporter(fn: Reporter | null): void {
  reporter = fn
}

function read(): ProblemEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ProblemEntry[]) : []
  } catch {
    return []
  }
}

function write(entries: ProblemEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* Private mode or a full quota. The session log still works in memory. */
  }
}

export function recordProblem(
  kind: ProblemEntry['kind'],
  message: string,
  stack?: string,
): void {
  try {
    const entry: ProblemEntry = {
      at: Date.now(),
      kind,
      message: String(message).slice(0, 400),
      stack: stack ? String(stack).slice(0, MAX_STACK) : undefined,
      route: typeof location === 'undefined' ? '' : location.pathname,
    }
    // Newest first, oldest discarded.
    write([entry, ...read()].slice(0, MAX_ENTRIES))
    reporter?.(entry)
  } catch {
    /* A logger that throws is worse than no logger. */
  }
}

export function recentProblems(): ProblemEntry[] {
  return read()
}

export function clearProblems(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* Nothing to clear. */
  }
}

/**
 * Starts catching the two things React's error boundary cannot see: errors
 * thrown outside React, and rejected promises nobody handled.
 */
export function installErrorLog(): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  window.addEventListener('error', (e) => {
    recordProblem('error', e.message || 'Unknown error', e.error?.stack)
  })

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason as { message?: string; stack?: string } | undefined
    recordProblem('promise', reason?.message ?? String(e.reason), reason?.stack)
  })
}

/** A plain-text dump, for pasting into a bug report. */
export function problemsAsText(): string {
  const entries = recentProblems()
  if (entries.length === 0) return 'No problems recorded.'
  return entries
    .map((e) => {
      const when = new Date(e.at).toISOString()
      return `[${when}] ${e.kind} at ${e.route}\n  ${e.message}${e.stack ? `\n  ${e.stack.split('\n').slice(0, 4).join('\n  ')}` : ''}`
    })
    .join('\n\n')
}
