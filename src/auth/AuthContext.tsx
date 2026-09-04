/**
 * Auth context and the route guard.
 *
 * The whole app reads the session from here, never from localStorage, so the
 * day session.ts starts talking to a server there is nothing else to change.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  currentSession, signInAsGuest, signOut, subscribe, type Account, type Session,
} from './session'

interface AuthValue {
  session: Session | null
  account: Account | null
  /** True when browsing without a real account. */
  isGuest: boolean
  /** False only for the first tick, before the stored session is read. */
  ready: boolean
  signOut: () => void
  exploreAsGuest: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  /* Read synchronously on the first render rather than in an effect: the
     local store needs no await, so there is never a window where the app does
     not know who is signed in — and no extra render to get there. An async
     provider would make `ready` a real piece of state again. */
  const [session, setSession] = useState<Session | null>(currentSession)
  const ready = true

  useEffect(() => {
    const stop = subscribe(setSession)

    // Signing out in one tab signs out the others.
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pacetown.session' || e.key === null) setSession(currentSession())
    }
    window.addEventListener('storage', onStorage)
    return () => {
      stop()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      account: session?.account ?? null,
      isGuest: !!session?.account.guest,
      ready,
      signOut,
      exploreAsGuest: () => { signInAsGuest() },
    }),
    [session, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

/**
 * Wraps the routes that need an account. Sends visitors to the login screen
 * and remembers where they were going, so signing in lands them there rather
 * than dumping them on the landing page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  const location = useLocation()

  // Rendering the guarded route before the stored session is read would flash
  // the login screen at someone who is already signed in.
  if (!ready) return <div className="route-fallback">Opening PaceTown…</div>
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
