import { describe, expect, it } from 'vitest'
import { guideLines, type HelpMode } from './guidance'
import { PLAN_TEMPLATES } from './plans'
import type { BlockerKind } from './types'

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
      for (const w of BANNED) expect(t.opener.toLowerCase()).not.toMatch(new RegExp(`\\b${w}\\b`))
    }
  })
})

const LENS_HEAD = /^(Mira explains|Kai plans|Sol keeps|Sky keeps|Goh finishes)/
const LENS_CASE: [BlockerKind, HelpMode, 'mira' | 'kai' | 'sol' | 'sky' | 'goh'][] = [
  ['unclear_start', 'Explain', 'mira'],
  ['too_large', 'Plan', 'kai'],
  ['low_capacity', 'Plan', 'sol'],
  ['perfection_pressure', 'Review', 'sky'],
  ['missing_materials', 'Plan', 'goh'],
]

describe('guardian lens', () => {
  it('opens in the guardian’s plain job, briefly', () => {
    for (const [b, m, g] of LENS_CASE) {
      const head = guideLines(b, m, { taskTitle: 'ERD assignment' }, g)[0]
      expect(head).toMatch(LENS_HEAD)
      expect(sentences(head).length).toBeLessThanOrEqual(2)
      for (const w of BANNED) expect(head.toLowerCase()).not.toMatch(new RegExp(`\\b${w}\\b`))
    }
  })
})
