/**
 * Dev shortcut — `/reset` wipes the game save and session, then lands on the
 * presenter front door. Home keeps the careful delete path; this is for
 * iterating and demoing.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from './auth/session'
import { clearState } from './game/state'

export default function ResetPage() {
  const navigate = useNavigate()
  useEffect(() => {
    clearState()
    signOut()
    navigate('/game', { replace: true })
  }, [navigate])
  return <div className="route-fallback">Resetting PaceTown…</div>
}
