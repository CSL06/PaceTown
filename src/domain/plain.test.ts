import { describe, expect, it } from 'vitest'
import { PLAN_TEMPLATES, type BlockerKind } from './plans'

export const BANNED = [
  'weighted', 'timebox', 'overloaded', 'xp', 'streak', 'parse', 'assumption', 'burnout', 'diagnos',
]

export const sentences = (s: string) =>
  s.split(/[.!?…]+/).map((p) => p.trim()).filter(Boolean)

const OPENER_WORD: Record<BlockerKind, string> = {
  unclear_start: 'look',
  too_large: 'fits',
  missing_knowledge: 'name',
  missing_materials: 'list',
  low_capacity: 'small',
  perfection_pressure: 'rough',
  other: 'guess',
}

describe('plain-language guardians', () => {
  it('every plan opener is short, plain, and direct', () => {
    for (const [id, t] of Object.entries(PLAN_TEMPLATES)) {
      expect(t.opener.toLowerCase()).toContain(OPENER_WORD[id as BlockerKind])
      expect(sentences(t.opener).length).toBeLessThanOrEqual(2)
      for (const w of BANNED) expect(t.opener.toLowerCase()).not.toContain(w)
    }
  })
})
