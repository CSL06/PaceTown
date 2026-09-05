import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'

type Direction = 'down' | 'up' | 'left' | 'right'
type SkyMood = 'idle' | 'talk' | 'tea' | 'breathe' | 'happy'

const SKY = { x: 27, y: 63 }
const BREATH_SECONDS = 12
const PLAYER_SPEED = 18
const PLAYER_NUDGE_DISTANCE = 2.2

const movementKeys: Record<string, Direction> = {
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
}

const dialogue = [
  'Hey. You don’t have to solve the whole week right now.',
  'We can make this moment smaller. Want to take one quiet breath with me?',
]

function App() {
  const [player, setPlayer] = useState({ x: 67, y: 72 })
  const [direction, setDirection] = useState<Direction>('left')
  const [frame, setFrame] = useState(0)
  const [dialogueStep, setDialogueStep] = useState<number | null>(null)
  const [breathingOpen, setBreathingOpen] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const [remaining, setRemaining] = useState(BREATH_SECONDS)
  const [completed, setCompleted] = useState(false)
  const [townListOpen, setTownListOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const stageRef = useRef<HTMLDivElement>(null)
  const heldMovementKeys = useRef(new Map<string, Direction>())

  const distanceToSky = Math.hypot(player.x - SKY.x, player.y - SKY.y)
  const nearSky = distanceToSky < 13

  const horizontalMovementScale = () => {
    const stage = stageRef.current
    if (!stage || stage.clientWidth === 0) return 1
    return stage.clientHeight / stage.clientWidth
  }

  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => setFrame((value) => (value + 1) % 2), 620)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  const move = (nextDirection: Direction) => {
    if (dialogueStep !== null || breathingOpen) return
    setDirection(nextDirection)
    setPlayer((current) => {
      const next = { ...current }
      const horizontalStep = PLAYER_NUDGE_DISTANCE * horizontalMovementScale()
      if (nextDirection === 'left') next.x -= horizontalStep
      if (nextDirection === 'right') next.x += horizontalStep
      if (nextDirection === 'up') next.y -= PLAYER_NUDGE_DISTANCE
      if (nextDirection === 'down') next.y += PLAYER_NUDGE_DISTANCE
      return {
        x: Math.min(92, Math.max(8, next.x)),
        y: Math.min(82, Math.max(39, next.y)),
      }
    })
  }

  const beginPointerMovement = (event: PointerEvent<HTMLButtonElement>, nextDirection: Direction) => {
    if (dialogueStep !== null || breathingOpen) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    heldMovementKeys.current.set(`pointer:${event.pointerId}`, nextDirection)
    setDirection(nextDirection)
  }

  const endPointerMovement = (event: PointerEvent<HTMLButtonElement>) => {
    heldMovementKeys.current.delete(`pointer:${event.pointerId}`)
  }

  const nudgeFromKeyboard = (event: MouseEvent<HTMLButtonElement>, nextDirection: Direction) => {
    if (event.detail === 0) move(nextDirection)
  }

  useEffect(() => {
    const movementBlocked = dialogueStep !== null || breathingOpen
    const heldKeys = heldMovementKeys.current
    heldKeys.clear()
    if (movementBlocked) return

    let animationFrame = 0
    let previousTime = performance.now()

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const nextDirection = movementKeys[key]
      if (!nextDirection) return
      event.preventDefault()
      heldKeys.set(key, nextDirection)
      setDirection(nextDirection)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      heldKeys.delete(event.key.toLowerCase())
    }

    const stopMoving = () => heldKeys.clear()
    const stopMovingWhenHidden = () => {
      if (document.visibilityState === 'hidden') stopMoving()
    }

    const updatePlayer = (time: number) => {
      const elapsedSeconds = Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time

      if (heldKeys.size > 0) {
        let horizontal = 0
        let vertical = 0
        let activeFacing: Direction | null = null
        for (const activeDirection of heldKeys.values()) {
          activeFacing = activeDirection
          if (activeDirection === 'left') horizontal -= 1
          if (activeDirection === 'right') horizontal += 1
          if (activeDirection === 'up') vertical -= 1
          if (activeDirection === 'down') vertical += 1
        }

        const magnitude = Math.hypot(horizontal, vertical)
        if (magnitude > 0 && activeFacing) {
          const distance = PLAYER_SPEED * elapsedSeconds
          const horizontalDistance = distance * horizontalMovementScale()
          setDirection(activeFacing)
          setPlayer((current) => ({
            x: Math.min(92, Math.max(8, current.x + (horizontal / magnitude) * horizontalDistance)),
            y: Math.min(82, Math.max(39, current.y + (vertical / magnitude) * distance)),
          }))
        }
      }

      animationFrame = window.requestAnimationFrame(updatePlayer)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', stopMoving)
    document.addEventListener('visibilitychange', stopMovingWhenHidden)
    animationFrame = window.requestAnimationFrame(updatePlayer)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', stopMoving)
      document.removeEventListener('visibilitychange', stopMovingWhenHidden)
      heldKeys.clear()
    }
  }, [breathingOpen, dialogueStep])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'e' || event.key === 'E' || event.key === 'Enter') && nearSky && dialogueStep === null && !breathingOpen) {
        event.preventDefault()
        setDialogueStep(0)
      }
      if (event.key === 'Escape') {
        setDialogueStep(null)
        setBreathingOpen(false)
        setBreathing(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [breathingOpen, dialogueStep, nearSky])

  useEffect(() => {
    if (!breathing) return
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        const next = Math.max(0, Number((current - 0.1).toFixed(1)))
        if (next === 0) {
          window.clearInterval(interval)
          setBreathing(false)
          setCompleted(true)
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(interval)
  }, [breathing])

  const breathPhase = useMemo(() => {
    if (completed) return { title: 'You made space.', note: 'One small pause still counts.', phase: 'complete' }
    if (!breathing) return { title: 'One quiet breath', note: 'Inhale 4 · hold 2 · exhale 6', phase: 'ready' }
    const elapsed = BREATH_SECONDS - remaining
    if (elapsed < 4) return { title: 'Breathe in', note: `${Math.ceil(4 - elapsed)} seconds`, phase: 'inhale' }
    if (elapsed < 6) return { title: 'Hold gently', note: `${Math.ceil(6 - elapsed)} seconds`, phase: 'hold' }
    return { title: 'Breathe out', note: `${Math.ceil(12 - elapsed)} seconds`, phase: 'exhale' }
  }, [breathing, completed, remaining])

  const skyMood: SkyMood = completed ? 'happy' : breathingOpen ? 'breathe' : dialogueStep !== null ? (dialogueStep === 0 ? 'talk' : 'tea') : 'idle'
  const skyFrame = skyMood === 'happy' ? '/game/sky/happy-0.webp' : `/game/sky/${skyMood}-${frame}.webp`
  const playerSpriteDirection = direction === 'left' ? 'right' : direction === 'right' ? 'left' : direction
  const playerFrame = playerSpriteDirection === 'down'
    ? `/game/player/idle-down-${frame}.webp`
    : `/game/player/idle-${playerSpriteDirection}-0.webp`

  const visitSky = () => {
    setPlayer({ x: 39, y: 67 })
    setDirection('left')
    setTownListOpen(false)
    window.setTimeout(() => setDialogueStep(0), reducedMotion ? 0 : 380)
  }

  const beginBreathing = () => {
    setDialogueStep(null)
    setBreathingOpen(true)
    setRemaining(BREATH_SECONDS)
    setCompleted(false)
  }

  return (
    <main className={`app ${reducedMotion ? 'reduce-motion' : ''}`}>
      <a className="skip-link" href="#town-list">Skip to Town List</a>

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">P</span>
          <div>
            <h1>PaceTown</h1>
            <p className="prototype-caption">Mentor prototype</p>
          </div>
        </div>
        <p className="brand-line">Find your pace. Grow your place.</p>
        <div className="topbar-actions">
          <div className="pace-chip" title="Example prototype state">
            <span className="pace-dot" aria-hidden="true" />
            <span><small>Demo check-in</small> Busy, but here</span>
          </div>
          <Link className="icon-button" to="/game">Campus Grove</Link>
          <button className="icon-button" type="button" aria-pressed={reducedMotion} onClick={() => setReducedMotion((value) => !value)}>
            {reducedMotion ? 'Motion off' : 'Motion on'}
          </button>
        </div>
      </header>

      <section className="game-shell" aria-label="PaceTown campus">
        <div className="world-wrap">
          <div className="world" ref={stageRef} tabIndex={0} aria-label="Campus. Move with arrow keys or W A S D.">
            <div className="sunwash" aria-hidden="true" />

            <div className="location-label cafe-label">Sky’s Tea Corner</div>

            <div className="tea-counter" aria-hidden="true" />
            <div className="character sky" style={{ left: `${SKY.x}%`, top: `${SKY.y}%` }}>
              <span className="name-tag">Sky</span>
              <img src={skyFrame} alt="Sky, a gentle guide with glasses and plum clothes" width="64" height="96" />
              <span className="character-shadow" aria-hidden="true" />
            </div>

            <div className="character player" style={{ left: `${player.x}%`, top: `${player.y}%` }}>
              <span className="name-tag player-tag">You</span>
              <img src={playerFrame} alt="Your player character" width="64" height="96" />
              <span className="character-shadow" aria-hidden="true" />
            </div>

            {nearSky && dialogueStep === null && !breathingOpen && (
              <button className="interaction-prompt" type="button" onClick={() => setDialogueStep(0)}>
                <kbd>E</kbd><span>Talk to Sky</span>
              </button>
            )}

            <div className="world-hint" aria-hidden="true">
              <span className="key-cluster">WASD</span>
              <span>Walk over to Sky</span>
            </div>

            <div className="mobile-controls" aria-label="Movement controls">
              {(['up', 'left', 'down', 'right'] as const).map((moveDirection) => (
                <button
                  key={moveDirection}
                  type="button"
                  aria-label={`Move ${moveDirection}`}
                  onPointerDown={(event) => beginPointerMovement(event, moveDirection)}
                  onPointerUp={endPointerMovement}
                  onPointerCancel={endPointerMovement}
                  onLostPointerCapture={endPointerMovement}
                  onClick={(event) => nudgeFromKeyboard(event, moveDirection)}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  {{ up: '↑', left: '←', down: '↓', right: '→' }[moveDirection]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside id="town-list" className={`town-panel ${townListOpen ? 'is-open' : ''}`} aria-label="Town List">
          <div className="panel-heading">
            <div>
              <h2>Town List</h2>
            </div>
            <button className="close-panel" type="button" onClick={() => setTownListOpen(false)} aria-label="Close Town List">×</button>
          </div>
          <p className="panel-intro">Prefer a list? Every town activity is available here too.</p>
          <button className="place-card active-place" type="button" onClick={visitSky}>
            <span className="place-icon tea-place-icon" aria-hidden="true" />
            <span><strong>Sky’s Tea Corner</strong><small>Talk, breathe, or take a quiet pause</small></span>
            <span aria-hidden="true">→</span>
          </button>
          <div className="place-card disabled-place" aria-disabled="true">
            <span className="place-icon coming-place-icon" aria-hidden="true"><i /></span>
            <span><strong>More of town</strong><small>Planned after mentor feedback</small></span>
          </div>
          <div className="prototype-note">
            <strong>What this slice tests</strong>
            <p>Can one comforting character and one tiny activity make stress support feel inviting?</p>
          </div>
        </aside>

        <button className="town-list-toggle" type="button" onClick={() => setTownListOpen(true)}>
          <span aria-hidden="true">☰</span> Town List
        </button>
      </section>

      {dialogueStep !== null && (
        <section className="dialogue-card" aria-label="Conversation with Sky" aria-live="polite">
          <img src={skyFrame} alt="" width="64" height="96" />
          <div className="dialogue-copy">
            <div className="dialogue-name"><strong>Sky</strong><span>Tea Corner guide</span></div>
            <p>{dialogue[dialogueStep]}</p>
            <div className="dialogue-actions">
              {dialogueStep === 0 ? (
                <button className="primary-button" type="button" onClick={() => setDialogueStep(1)}>Stay a moment</button>
              ) : (
                <button className="primary-button" type="button" onClick={beginBreathing}>Try one calming breath</button>
              )}
              <button className="text-button" type="button" onClick={() => setDialogueStep(null)}>Not right now</button>
            </div>
          </div>
          <button className="dialogue-close" type="button" onClick={() => setDialogueStep(null)} aria-label="Close conversation">×</button>
        </section>
      )}

      {breathingOpen && (
        <div className="activity-backdrop" role="presentation">
          <section className="breathing-card" role="dialog" aria-modal="true" aria-labelledby="breath-title">
            <button className="dialogue-close" type="button" onClick={() => { setBreathingOpen(false); setBreathing(false) }} aria-label="Close breathing activity">×</button>
            <p className="activity-context">A moment with Sky</p>
            <h2 id="breath-title">{breathPhase.title}</h2>
            <p className="breath-note" aria-live="polite">{breathPhase.note}</p>
            <div className={`breath-orb ${breathPhase.phase}`} aria-hidden="true">
              <span className="tea-cup"><i /><b /></span>
            </div>
            <div className="breath-progress" aria-label={`${Math.round(((BREATH_SECONDS - remaining) / BREATH_SECONDS) * 100)} percent complete`}>
              <span style={{ transform: `scaleX(${(BREATH_SECONDS - remaining) / BREATH_SECONDS})` }} />
            </div>
            {completed ? (
              <div className="activity-actions">
                <button className="primary-button" type="button" onClick={() => setBreathingOpen(false)}>Return to campus</button>
                <button className="text-button" type="button" onClick={() => { setCompleted(false); setRemaining(BREATH_SECONDS); setBreathing(true) }}>Breathe again</button>
              </div>
            ) : (
              <button className="primary-button start-breath" type="button" onClick={() => setBreathing((value) => !value)}>
                {breathing ? 'Pause' : remaining < BREATH_SECONDS ? 'Continue' : 'Begin'}
              </button>
            )}
            <p className="safety-copy">Go at your own pace. Stop if this feels uncomfortable.</p>
          </section>
        </div>
      )}

      <div className="sr-only" aria-live="polite">{nearSky ? 'You are close enough to talk to Sky.' : ''}</div>
    </main>
  )
}

export default App
