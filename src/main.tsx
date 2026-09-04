import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import './styles.css'

// Loaded on demand: the campus art and game shell should not weigh down the
// mentor demo. Visiting /game is what pulls them down.
const Game = lazy(() => import('./game/Game'))

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
    <BrowserRouter>
      <Suspense fallback={<div className="route-fallback">Loading Campus Grove…</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
