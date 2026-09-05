import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './auth/AuthContext'
import { ThemeProvider } from './theme/ThemeProvider'
import { ErrorBoundary } from './ui/ErrorBoundary'
import AuthPage from './auth/AuthPage'
import Landing from './landing/Landing'
import './theme/theme.css'
import './theme/pixel.css'
import './styles.css'

// The landing page is the first paint, so it ships in the entry chunk. The
// game's art and the older mentor demo are pulled down only when visited.
const Onboarding = lazy(() => import('./onboarding/Onboarding'))
// Owns the loading screen and waits for the artwork as well as the code.
const TownGate = lazy(() => import('./game/TownGate'))
const DemoEntry = lazy(() => import('./game/DemoEntry'))
const MentorDemo = lazy(() => import('./App'))

// Offline shell in production builds only — a dev-time worker would serve
// stale bundles while iterating.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* Offline support is best-effort; the app works without it. */
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
          <Suspense fallback={<div className="route-fallback">Opening PaceTown…</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="/welcome" element={<RequireAuth><Onboarding /></RequireAuth>} />
              <Route path="/town" element={<RequireAuth><TownGate /></RequireAuth>} />
              {/* The presenter's one-click front door, and the "try it now"
                  link: signs in as a guest and opens the seeded week. */}
              <Route path="/game" element={<DemoEntry />} />
              <Route path="/demo" element={<MentorDemo />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
