/**
 * Town cosmetics.
 *
 * Appearance only, bought with coins earned in the loop (vision §15, plan §7).
 * There is no premium currency, no real money, no loot box and no randomness:
 * every item has a fixed price and you can see exactly what you are getting
 * before you spend. Nothing here alters load, rewards, or any outcome.
 *
 * Cosmetics are grouped into slots, and one item per slot is equipped at a
 * time. The "default" item in every slot is free and owned from the start, so
 * a player can always undo a choice without paying twice.
 */

export type CosmeticSlot = 'sky' | 'lights' | 'blossom' | 'weather'

export interface Cosmetic {
  id: string
  slot: CosmeticSlot
  name: string
  blurb: string
  /** In coins. Zero means it ships owned. */
  cost: number
}

/* Every slot has to be something the renderer can actually draw over the fixed
   campus illustration. Selling a bench style we cannot show would be a lie. */
export const SLOTS: { id: CosmeticSlot; name: string; blurb: string }[] = [
  { id: 'sky', name: 'Sky', blurb: 'The hour the town sits in' },
  { id: 'lights', name: 'Lights', blurb: 'How the grove is lit' },
  { id: 'blossom', name: 'Blossom', blurb: 'What is falling through the square' },
  { id: 'weather', name: 'Weather', blurb: 'The air over the town' },
]

export const COSMETICS: readonly Cosmetic[] = [
  { id: 'sky-afternoon', slot: 'sky', name: 'Late afternoon', blurb: 'Peach and unhurried. The hour the town was drawn in.', cost: 0 },
  { id: 'sky-overcast', slot: 'sky', name: 'Soft overcast', blurb: 'Flat, cool light with the glare taken out.', cost: 35 },
  { id: 'sky-evening', slot: 'sky', name: 'Blue evening', blurb: 'Later, deeper, and quieter with it.', cost: 65 },
  { id: 'sky-golden', slot: 'sky', name: 'Golden hour', blurb: 'Twenty minutes before the light goes, held open.', cost: 85 },

  { id: 'lights-lamps', slot: 'lights', name: 'Iron lamps', blurb: 'The standard lamps along every path.', cost: 0 },
  { id: 'lights-lanterns', slot: 'lights', name: 'Paper lanterns', blurb: 'Warm amber, strung between the trees.', cost: 55 },
  { id: 'lights-fireflies', slot: 'lights', name: 'Fireflies', blurb: 'The grove lights itself, slowly and at random.', cost: 90 },

  { id: 'blossom-none', slot: 'blossom', name: 'Still air', blurb: 'Nothing falling. The square as it is.', cost: 0 },
  { id: 'blossom-pink', slot: 'blossom', name: 'Cherry blossom', blurb: 'Pink petals drifting across the whole town.', cost: 45 },
  { id: 'blossom-gold', slot: 'blossom', name: 'Autumn leaves', blurb: 'Amber and slower, turning as they fall.', cost: 70 },

  { id: 'weather-clear', slot: 'weather', name: 'Clear', blurb: 'Nothing between you and the town.', cost: 0 },
  { id: 'weather-haze', slot: 'weather', name: 'Soft haze', blurb: 'A little warmth in the air, edges gone gentle.', cost: 30 },
  { id: 'weather-drizzle', slot: 'weather', name: 'Light drizzle', blurb: 'The good kind. Everyone indoors, and you are fine.', cost: 60 },
]

/** The free item in each slot, owned from the first launch. */
export const DEFAULT_COSMETICS: Record<CosmeticSlot, string> = SLOTS.reduce(
  (acc, slot) => {
    const free = COSMETICS.find((c) => c.slot === slot.id && c.cost === 0)
    if (free) acc[slot.id] = free.id
    return acc
  },
  {} as Record<CosmeticSlot, string>,
)

export function cosmeticById(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id)
}

export function cosmeticsInSlot(slot: CosmeticSlot): Cosmetic[] {
  return COSMETICS.filter((c) => c.slot === slot)
}

export function isOwned(id: string, owned: readonly string[]): boolean {
  const item = cosmeticById(id)
  if (!item) return false
  return item.cost === 0 || owned.includes(id)
}

export type PurchaseRefusal = 'unknown' | 'owned' | 'too_expensive'

export interface PurchaseResult {
  ok: boolean
  refusal?: PurchaseRefusal
  /** Coins remaining if the purchase went through. */
  coins: number
  owned: string[]
}

/**
 * Buys a cosmetic. Pure: it reports what the new wallet and inventory would
 * be and never mutates. A purchase that cannot happen costs nothing.
 */
export function buy(id: string, coins: number, owned: readonly string[]): PurchaseResult {
  const item = cosmeticById(id)
  if (!item) return { ok: false, refusal: 'unknown', coins, owned: [...owned] }
  if (isOwned(id, owned)) return { ok: false, refusal: 'owned', coins, owned: [...owned] }
  if (coins < item.cost) return { ok: false, refusal: 'too_expensive', coins, owned: [...owned] }
  return { ok: true, coins: coins - item.cost, owned: [...owned, id] }
}

/** Total spent to own everything — used to show how far along the set is. */
export function catalogueValue(): number {
  return COSMETICS.reduce((sum, c) => sum + c.cost, 0)
}
