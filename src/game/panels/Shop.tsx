/**
 * The town shop (plan §7).
 *
 * Cosmetic only, bought with coins earned in the loop. No premium currency,
 * no real money, no randomness, and nothing here touches load, rewards or any
 * outcome — so nobody can buy their way to a lighter week.
 *
 * The catalogue and the purchase arithmetic live in domain/cosmetics.ts; this
 * file only renders them and records the result.
 */

import { useState } from 'react'
import {
  COSMETICS, SLOTS, buy, catalogueValue, cosmeticById, cosmeticsInSlot, isOwned,
  type CosmeticSlot,
} from '../../domain'
import { record } from '../state'
import { HelpDot } from './HelpDot'
import type { PanelProps } from './types'

export function Shop({ state, load, update, toast }: PanelProps) {
  const [slot, setSlot] = useState<CosmeticSlot>('sky')
  /** What the player is looking at, which may not be what is equipped. */
  const [preview, setPreview] = useState<string | null>(null)

  const items = cosmeticsInSlot(slot)
  const equippedId = state.equipped[slot]
  const shownId = preview && cosmeticById(preview)?.slot === slot ? preview : equippedId
  const shown = cosmeticById(shownId)

  const ownedCount = COSMETICS.filter((c) => isOwned(c.id, state.owned)).length

  const purchase = (id: string) => {
    const result = buy(id, state.coins, state.owned)
    if (!result.ok) {
      toast(result.refusal === 'too_expensive'
        ? 'Not enough coins yet — nothing was spent'
        : 'You already have that one')
      return
    }
    const item = cosmeticById(id)!
    update((s) => record(
      { ...s, coins: result.coins, owned: result.owned, equipped: { ...s.equipped, [item.slot]: id } },
      `Bought ${item.name} for the town`,
      `${item.cost} coins. Appearance only — nothing about your week changed.`,
    ))
    toast(`${item.name} is yours`)
  }

  const equip = (id: string) => {
    const item = cosmeticById(id)
    if (!item) return
    update((s) => ({ ...s, equipped: { ...s.equipped, [item.slot]: id } }))
    toast(`${item.name} in place`)
  }

  return (
    <div className="card">
      <div className="eyebrow">Shop</div>
      <h2>Make the town yours <HelpDot view="home" state={state} load={load} /></h2>
      <p className="lede">
        Appearance only. Nothing sold here changes your load, your rewards, or what the
        guardians recommend — and there is no currency but the coins you earned.
      </p>

      <div className="shop-wallet">
        <div>
          <span className="lbl">Coins</span>
          <b className="mono">{state.coins}</b>
        </div>
        <div>
          <span className="lbl">Collected</span>
          <b className="mono">{ownedCount}/{COSMETICS.length}</b>
        </div>
        <div>
          <span className="lbl">Whole set costs</span>
          <b className="mono">{catalogueValue()}</b>
        </div>
      </div>

      <div className="shop-slots" role="tablist" aria-label="Categories">
        {SLOTS.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={s.id === slot}
            className={`set-chip${s.id === slot ? ' is-on' : ''}`}
            onClick={() => { setSlot(s.id); setPreview(null) }}>
            {s.name}
          </button>
        ))}
      </div>

      {shown && (
        <div className="shop-preview">
          <div className={`shop-swatch sw-${shown.id}`} aria-hidden="true" />
          <div>
            <div className="eyebrow">
              {shownId === equippedId ? 'In place now' : 'Previewing'}
            </div>
            <h3 style={{ fontSize: 18, marginTop: 4 }}>{shown.name}</h3>
            <p className="note" style={{ marginTop: 6 }}>{shown.blurb}</p>
          </div>
        </div>
      )}

      <div className="opts">
        {items.map((item) => {
          const owned = isOwned(item.id, state.owned)
          const equipped = equippedId === item.id
          const affordable = state.coins >= item.cost
          return (
            <div key={item.id} className={`shop-row${equipped ? ' is-on' : ''}`}>
              <button type="button" className="shop-pick"
                onMouseEnter={() => setPreview(item.id)}
                onFocus={() => setPreview(item.id)}
                onClick={() => setPreview(item.id)}>
                <span className={`shop-swatch small sw-${item.id}`} aria-hidden="true" />
                <span>
                  <b>{item.name}</b>
                  <small>{item.blurb}</small>
                </span>
              </button>

              <div className="shop-act">
                {equipped ? (
                  <span className="shop-tag">In place</span>
                ) : owned ? (
                  <button className="secondary" type="button" onClick={() => equip(item.id)}>
                    Use this
                  </button>
                ) : (
                  <button className="primary" type="button" disabled={!affordable}
                    onClick={() => purchase(item.id)}>
                    {item.cost} coins
                  </button>
                )}
                {!owned && !affordable && (
                  <span className="note">{item.cost - state.coins} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="disclaimer">
        Coins come from finishing checkpoints and recording recovery. Partial and blocked
        outcomes pay too, so nothing here is gated behind a perfect week.
      </p>
    </div>
  )
}
