/**
 * Sky, keeping you company on the sign-in screen.
 *
 * Not decoration: her mood is driven by real form state, so the character is
 * feedback rather than an animated gif. The detail worth keeping is `secret` —
 * when the password field has focus she turns to her tea and looks away. It
 * costs nothing, it is the same posture the rest of the product takes about
 * private things, and it is the moment people notice.
 *
 * Sprites are the game's own two-frame sheets, so she idles at the same pace
 * here as she does in the town.
 */

import { useEffect, useState } from 'react'

export type SkyMood = 'idle' | 'typing' | 'secret' | 'happy' | 'error'

/** Which sprite set each mood draws from, and whether it animates. */
const SPRITE: Record<SkyMood, { name: string; frames: number }> = {
  idle: { name: 'idle', frames: 2 },
  typing: { name: 'talk', frames: 2 },
  secret: { name: 'tea', frames: 2 },
  happy: { name: 'happy', frames: 1 },
  error: { name: 'idle', frames: 2 },
}

const LINES: Record<SkyMood, { login: string; signup: string }> = {
  idle: {
    login: 'Welcome back. Take your time.',
    signup: 'No rush. This part takes a minute.',
  },
  typing: {
    login: 'I am listening.',
    signup: 'Tell me what to call you.',
  },
  secret: {
    login: 'Looking away while you type that.',
    signup: 'Not watching. Pick something you will remember.',
  },
  happy: {
    login: 'There you are. Come in.',
    signup: 'Good. The town is ready when you are.',
  },
  error: {
    login: 'No harm done. Try that again.',
    signup: 'Nothing lost. Have another go.',
  },
}

interface Props {
  mood: SkyMood
  mode: 'login' | 'signup'
  reducedMotion?: boolean
}

export function SkyGreeter({ mood, mode, reducedMotion = false }: Props) {
  const [frame, setFrame] = useState(0)
  const sprite = SPRITE[mood]

  useEffect(() => {
    if (reducedMotion || sprite.frames < 2) { setFrame(0); return }
    const id = window.setInterval(() => setFrame((f) => (f + 1) % sprite.frames), 620)
    return () => window.clearInterval(id)
  }, [reducedMotion, sprite.frames, sprite.name])

  const src = `/game/sky/${sprite.name}-${sprite.frames > 1 ? frame : 0}.webp`

  return (
    <div className={`sky-greet is-${mood}`}>
      <img
        className="sky-greet-art"
        src={src}
        alt=""
        width={64}
        height={96}
        draggable={false}
      />
      <p className="sky-greet-line" aria-live="polite">
        <b>Sky</b>
        <span>{LINES[mood][mode]}</span>
      </p>
    </div>
  )
}
