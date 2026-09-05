/**
 * The guardian dialogue bar. Portrait-first, typewritten, and always
 * skippable — one click completes the line, the next advances.
 */

import { useEffect, useRef, useState } from 'react'
import type { GuardianId } from '../domain'
import { GUARDIANS } from './layout'

export interface DialogueChoice {
  label: string
  onPick: () => void
}

export interface DialogueScript {
  who: GuardianId
  lines: string[]
  choices?: DialogueChoice[]
}

interface Props {
  script: DialogueScript
  reducedMotion: boolean
  onClose: () => void
}

export function Dialogue({ script, reducedMotion, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(reducedMotion ? script.lines[0] ?? '' : '')
  const timer = useRef<number>(0)

  const line = script.lines[index] ?? ''
  const typing = shown.length < line.length
  const lastLine = index >= script.lines.length - 1

  useEffect(() => {
    setIndex(0)
  }, [script])

  useEffect(() => {
    if (reducedMotion) { setShown(line); return }
    setShown('')
    let i = 0
    timer.current = window.setInterval(() => {
      i += 1
      setShown(line.slice(0, i))
      if (i >= line.length) window.clearInterval(timer.current)
    }, 16)
    return () => window.clearInterval(timer.current)
  }, [line, reducedMotion])

  const advance = () => {
    if (typing) {
      window.clearInterval(timer.current)
      setShown(line)
      return
    }
    if (!lastLine) { setIndex((i) => i + 1); return }
    if (!script.choices?.length) onClose()
  }

  const showChoices = !typing && lastLine && !!script.choices?.length
  const who = GUARDIANS[script.who]

  return (
    <div className="dlg" onClick={advance} role="dialog" aria-live="polite">
      <div className="dlg-inner">
        <img className="dlg-face" src={`/game/portraits/${script.who}.webp`} alt="" />
        <div className="dlg-body">
          <div className="dlg-name">{who.name}<span>{who.role}</span></div>
          <p className="dlg-text">
            {shown}
            {typing && <span className="dlg-caret" aria-hidden="true" />}
          </p>
          {showChoices && (
            <div className="qa">
              {script.choices!.map((c, i) => (
                <button key={c.label} type="button" className={i === 0 ? 'go' : undefined}
                  onClick={(e) => { e.stopPropagation(); onClose(); c.onPick() }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {!showChoices && (
            <div className="dlg-hint">
              {typing ? 'Click to finish the line' : lastLine ? 'Click to close' : 'Click to continue'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
