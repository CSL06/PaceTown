/**
 * The presenter's front door — `/game`.
 *
 * prototypeflow.md tells a presenter to open one URL and start talking. Since
 * Campus Grove moved behind an account, that URL had to become a bootstrap
 * rather than a redirect: it signs in as a guest if nobody is signed in,
 * marks the save onboarded so the first-run wizard does not interrupt a demo,
 * and drops straight into the town on the seeded week.
 *
 * It is also the honest "try it now" link — anyone opening it is in the
 * product in one click, with no form in the way.
 *
 * Someone already signed in keeps their own account and their own week; this
 * never signs anyone out and never overwrites a real save.
 */

import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { currentSession } from '../auth/session'
import { markOnboarded } from './state'

export default function DemoEntry() {
  const { ready, exploreAsGuest } = useAuth()
  const [done, setDone] = useState(false)
  // Signing in re-renders this component, so the bootstrap needs a latch or
  // it would run again on the way back through.
  const started = useRef(false)

  useEffect(() => {
    if (!ready || started.current) return
    started.current = true
    if (!currentSession()) exploreAsGuest()
    markOnboarded()
    setDone(true)
  }, [ready, exploreAsGuest])

  if (!done) return <div className="route-fallback">Opening Campus Grove…</div>
  return <Navigate to="/town" replace />
}
