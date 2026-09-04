/** First-time `?`: what this screen is, what to do, which guardian helps and why. */
import { useEffect, useRef, useState } from 'react'
import type { DailyLoad } from '../../domain'
import { HELP, adaptiveLine, type HelpContent } from '../help'
import { GUARDIANS, type ViewId } from '../layout'
import type { GameState } from '../state'

export function HelpDot({ view, state, load }: { view: ViewId; state: GameState; load: DailyLoad }) {
  const content = (HELP as Partial<Record<ViewId, HelpContent>>)[view]
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!content) return null
  const live = adaptiveLine(view, state, load)
  const who = GUARDIANS[content.guardian.who].name

  return (
    <span className="helpdot-wrap" ref={box}>
      <button type="button" className="helpdot" aria-expanded={open}
        aria-label={`What is ${content.title}?`} onClick={() => setOpen((o) => !o)}>?</button>
      {open && (
        <span className="helppop" role="dialog" aria-label={content.title}>
          <b>{content.title}</b>
          <span>{content.what}</span>
          <span>{content.how}</span>
          <span className="helpguide">{who}: {content.guardian.why}</span>
          {live && <span className="helplive">{live}</span>}
        </span>
      )}
    </span>
  )
}
