import { describe, expect, it } from 'vitest'
import {
  COSMETICS, DEFAULT_COSMETICS, SLOTS, buy, catalogueValue, cosmeticById,
  cosmeticsInSlot, isOwned,
} from './cosmetics'

describe('catalogue', () => {
  it('gives every slot exactly one free default', () => {
    for (const slot of SLOTS) {
      const free = cosmeticsInSlot(slot.id).filter((c) => c.cost === 0)
      expect(free).toHaveLength(1)
      expect(DEFAULT_COSMETICS[slot.id]).toBe(free[0].id)
    }
  })

  it('has no duplicate ids', () => {
    const ids = COSMETICS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never prices anything in a currency you cannot earn', () => {
    // Every cost is a whole number of coins. No premium tier, no fractions.
    for (const item of COSMETICS) {
      expect(Number.isInteger(item.cost)).toBe(true)
      expect(item.cost).toBeGreaterThanOrEqual(0)
    }
  })

  it('sums the catalogue for the completion display', () => {
    expect(catalogueValue()).toBe(COSMETICS.reduce((n, c) => n + c.cost, 0))
  })
})

describe('ownership', () => {
  it('treats free items as owned without buying them', () => {
    expect(isOwned('sky-afternoon', [])).toBe(true)
  })

  it('does not treat paid items as owned until bought', () => {
    expect(isOwned('sky-overcast', [])).toBe(false)
    expect(isOwned('sky-overcast', ['sky-overcast'])).toBe(true)
  })

  it('says no to an id that is not in the catalogue', () => {
    expect(isOwned('sky-nonsense', ['sky-nonsense'])).toBe(false)
    expect(cosmeticById('sky-nonsense')).toBeUndefined()
  })
})

describe('buying', () => {
  it('deducts the cost and adds the item', () => {
    const result = buy('sky-overcast', 100, [])
    expect(result.ok).toBe(true)
    expect(result.coins).toBe(100 - cosmeticById('sky-overcast')!.cost)
    expect(result.owned).toContain('sky-overcast')
  })

  it('refuses when the coins are not there, and charges nothing', () => {
    const result = buy('lights-fireflies', 10, [])
    expect(result.ok).toBe(false)
    expect(result.refusal).toBe('too_expensive')
    expect(result.coins).toBe(10)
    expect(result.owned).toEqual([])
  })

  it('refuses to sell the same thing twice', () => {
    const result = buy('sky-overcast', 100, ['sky-overcast'])
    expect(result.ok).toBe(false)
    expect(result.refusal).toBe('owned')
    expect(result.coins).toBe(100)
  })

  it('refuses a free item rather than pretending to sell it', () => {
    const result = buy('sky-afternoon', 100, [])
    expect(result.ok).toBe(false)
    expect(result.refusal).toBe('owned')
  })

  it('refuses an unknown id', () => {
    const result = buy('nope', 100, [])
    expect(result.ok).toBe(false)
    expect(result.refusal).toBe('unknown')
  })

  it('never mutates the inventory it was given', () => {
    const owned: string[] = []
    buy('sky-overcast', 100, owned)
    expect(owned).toEqual([])
  })

  it('can afford an item priced exactly at the balance', () => {
    const item = cosmeticById('sky-overcast')!
    const result = buy(item.id, item.cost, [])
    expect(result.ok).toBe(true)
    expect(result.coins).toBe(0)
  })
})
