/**
 * Sign in and sign up.
 *
 * One component for both, because they differ by three fields and a verb.
 * The Google path is a clearly labelled local simulation: it asks for the
 * profile a provider would hand back, and never for a Google password. A
 * prototype must not put a convincing credential prompt in front of anyone.
 */

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  emailProblem, hasAccounts, passwordProblem, passwordStrength,
  currentSession, signIn, signInWithGoogle, upgradeGuest,
} from './session'
import { useAuth } from './AuthContext'
import { useFocusTrap } from '../ui/useFocusTrap'
import { SkyGreeter, type SkyMood } from './SkyGreeter'
import { markOnboarded } from '../game/state'
import './auth.css'

type Mode = 'login' | 'signup'

interface Props { mode: Mode }

const HIGHLIGHTS: [string, string][] = [
  ['Nothing moves without you', 'Every proposal has an approve button. The app never rearranges your week on its own.'],
  ['Partial counts', 'Stopping early is a recorded outcome, not a broken streak.'],
  ['Your data stays yours', 'Saves live in your browser and export to a file whenever you want.'],
]

export default function AuthPage({ mode }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, exploreAsGuest } = useAuth()
  const ids = useId()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleOpen, setGoogleOpen] = useState(false)
  const [googleName, setGoogleName] = useState('')
  const [googleEmail, setGoogleEmail] = useState('')

  /* Sky reacts to what you are actually doing, so these track it. */
  const [typing, setTyping] = useState(false)
  const [secretFocus, setSecretFocus] = useState(false)
  const [capsOn, setCapsOn] = useState(false)

  const firstField = useRef<HTMLInputElement>(null)
  const modalRef = useFocusTrap<HTMLDivElement>(googleOpen)
  const typingTimer = useRef(0)
  const isSignup = mode === 'signup'
  const from = (location.state as { from?: string } | null)?.from ?? '/town'

  /* Someone who is already signed in has no business on this screen. */
  useEffect(() => {
    if (session) navigate(from, { replace: true })
  }, [session, from, navigate])

  useEffect(() => {
    firstField.current?.focus()
    setError(null)
  }, [mode])

  const strength = passwordStrength(password)

  /* Typing is a moment, not a state, so it decays back to idle on its own. */
  const markTyping = () => {
    setTyping(true)
    window.clearTimeout(typingTimer.current)
    typingTimer.current = window.setTimeout(() => setTyping(false), 1400)
  }
  useEffect(() => () => window.clearTimeout(typingTimer.current), [])

  const reducedMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, [],
  )

  /* Order matters: a problem outranks progress, and privacy outranks chatter. */
  const mood: SkyMood = error ? 'error'
    : busy ? 'happy'
    : secretFocus ? 'secret'
    : typing ? 'typing'
    : 'idle'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return

    // Validate before the await, so the message is instant.
    const issue = emailProblem(email) ?? (isSignup ? passwordProblem(password) : null)
    if (issue) { setError(issue); return }

    setBusy(true)
    setError(null)
    /* Captured before the call, because after it there is no guest left to
       ask about. */
    const wasGuest = currentSession()?.account.guest === true

    /* `upgradeGuest` converts the signed-in guest in place, keeping its id
       and leaving no orphan account behind; it falls back to `signUp` when
       there is no guest, so this is the correct call in both cases. The HUD
       offers this as "Keep this progress", and creating a second account
       alongside the guest is not what that promises. */
    const result = isSignup
      ? await upgradeGuest({ name, email, password })
      : await signIn(email, password)
    setBusy(false)

    if (!result.ok) { setError(result.error); return }
    /* A brand new account has no week yet, so it goes through onboarding. An
       upgraded guest already has one — sending them to /welcome would walk
       them through setting up a week they have been playing. */
    navigate(isSignup && !wasGuest ? '/welcome' : from, { replace: true })
  }

  const finishGoogle = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const result = await signInWithGoogle({ name: googleName, email: googleEmail })
    setBusy(false)
    if (!result.ok) { setError(result.error); return }
    setGoogleOpen(false)
    navigate(from, { replace: true })
  }

  return (
    <div className="au">
      <div className="au-form-side">
        <Link className="au-brand" to="/">
          <span className="au-mark" aria-hidden="true">P</span>
          <span>PaceTown</span>
        </Link>

        <div className="au-form-wrap">
          <SkyGreeter mood={mood} mode={mode} reducedMotion={reducedMotion} />

          <header className="au-head">
            <h1>{isSignup ? 'Make a place to keep your week.' : 'Welcome back.'}</h1>
            <p>
              {isSignup
                ? 'One account, and Campus Grove remembers where you left off.'
                : 'Your town is exactly as you left it.'}
            </p>
          </header>

          <button
            type="button"
            className="au-google"
            onClick={() => { setGoogleOpen(true); setError(null) }}
            disabled={busy}
          >
            <span className="au-g" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="18" height="18" focusable="false">
                <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.1z" />
                <path fill="#34A853" d="M24 46c6 0 11-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.6-3.9-12.3-9.1H4.3v5.7C7.8 41 15.3 46 24 46z" />
                <path fill="#FBBC05" d="M11.7 28.1c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.4 2 24s.8 6.9 2.3 9.8l7.4-5.7z" />
                <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.3 2 7.8 7 4.3 14.2l7.4 5.7c1.7-5.2 6.6-9.1 12.3-9.1z" />
              </svg>
            </span>
            Continue with Google
          </button>
          <p className="au-simnote">
            Google sign-in is simulated locally in this prototype — it will never ask for
            a Google password.
          </p>

          <div className="au-or"><span>or with email</span></div>

          <form onSubmit={submit} noValidate>
            {isSignup && (
              <label className="au-field" htmlFor={`${ids}-name`}>
                <span>What should we call you?</span>
                <input
                  id={`${ids}-name`} ref={isSignup ? firstField : undefined}
                  type="text" autoComplete="name" value={name}
                  onChange={(e) => { setName(e.target.value); markTyping() }} placeholder="Sam"
                />
              </label>
            )}

            <label className="au-field" htmlFor={`${ids}-email`}>
              <span>Email</span>
              <input
                id={`${ids}-email`} ref={isSignup ? undefined : firstField}
                type="email" inputMode="email" autoComplete="email" value={email}
                onChange={(e) => { setEmail(e.target.value); markTyping() }} placeholder="you@university.edu"
              />
            </label>

            <label className="au-field" htmlFor={`${ids}-password`}>
              <span className="au-label-row">
                Password
                <button type="button" className="au-reveal" onClick={() => setReveal((v) => !v)}>
                  {reveal ? 'Hide' : 'Show'}
                </button>
              </span>
              <input
                id={`${ids}-password`}
                type={reveal ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setSecretFocus(true)}
                onBlur={() => { setSecretFocus(false); setCapsOn(false) }}
                onKeyUp={(e) => setCapsOn(e.getModifierState?.('CapsLock') ?? false)}
                placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
              />
            </label>

            {capsOn && (
              <p className="au-caps" role="status">Caps Lock is on.</p>
            )}

            {isSignup && password.length > 0 && (
              <div className="au-strength" data-score={strength.score}>
                <span /><span /><span />
                <small>{strength.label}</small>
              </div>
            )}

            {error && <p className="au-error" role="alert">{error}</p>}

            <button className="au-submit" type="submit" disabled={busy}>
              {busy ? 'One moment…' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="au-switch">
            {isSignup ? (
              <>Already have an account? <Link to="/login">Sign in</Link></>
            ) : (
              <>
                {hasAccounts() ? 'Need an account? ' : 'First time here? '}
                <Link to="/signup">Create one</Link>
              </>
            )}
          </p>

          <p className="au-explore">
            <button type="button" onClick={() => {
              exploreAsGuest()
              // The seeded week is the point of the demo path, so skip the
              // first-run wizard rather than bouncing through it.
              markOnboarded()
              navigate('/town')
            }}>
              Explore Demo Town without an account
            </button>
            <small>Your progress saves locally and can be kept later.</small>
          </p>

          <p className="au-back"><Link to="/">← Back to the landing page</Link></p>
        </div>
      </div>

      <aside className="au-art-side" aria-hidden="true">
        <div className="au-art" />
        <div className="au-art-veil" />
        <div className="au-art-copy">
          <p className="au-art-kicker">Campus Grove</p>
          <h2>Find your pace.<br />Grow your place.</h2>
          <ul>
            {HIGHLIGHTS.map(([title, body]) => (
              <li key={title}><b>{title}</b><span>{body}</span></li>
            ))}
          </ul>
          <div className="au-art-cast">
            {(['mira', 'kai', 'sol', 'sky', 'goh'] as const).map((id) => (
              <img key={id} src={`/game/portraits/${id}.webp`} alt="" loading="lazy" />
            ))}
          </div>
        </div>
      </aside>

      {googleOpen && (
        <div className="au-modal-scrim" onClick={() => setGoogleOpen(false)}>
          <div
            className="au-modal" ref={modalRef} role="dialog" aria-modal="true"
            aria-labelledby={`${ids}-gtitle`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="au-modal-tag">Simulated provider</p>
            <h2 id={`${ids}-gtitle`}>Continue with Google</h2>
            <p className="au-modal-body">
              A real deployment would send you to Google and get a verified profile back.
              This prototype has no server, so tell it what that profile would say. No
              password is asked for or stored.
            </p>
            <form onSubmit={finishGoogle}>
              <label className="au-field">
                <span>Name on the account</span>
                <input type="text" value={googleName} required
                  onChange={(e) => setGoogleName(e.target.value)} placeholder="Sam Okafor" />
              </label>
              <label className="au-field">
                <span>Google email</span>
                <input type="email" value={googleEmail} required
                  onChange={(e) => setGoogleEmail(e.target.value)} placeholder="sam@gmail.com" />
              </label>
              {error && <p className="au-error" role="alert">{error}</p>}
              <div className="au-modal-actions">
                <button className="au-submit" type="submit" disabled={busy}>
                  {busy ? 'One moment…' : 'Continue'}
                </button>
                <button className="au-cancel" type="button" onClick={() => setGoogleOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
