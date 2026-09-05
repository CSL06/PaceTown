/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { SAVE_KEY, SAVE_VERSION, initialState, loadState } from './state'
import { SPAWN } from './layout'

beforeEach(() => localStorage.clear())

describe('guardianOverride', () => {
  it('defaults to null — the blocker routing decides', () => {
    expect(initialState().guardianOverride).toBeNull()
  })

  it('reads null on saves written before the field existed', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, blocker: 'too_large' }))
    const loaded = loadState()
    expect(loaded.guardianOverride).toBeNull()
    expect(loaded.blocker).toBe('too_large')
  })
})

describe('campus position migration', () => {
  it('moves a v7 save out of the central planter without changing progress', () => {
    const old = { ...initialState(), version: 7, avatar: { px: 49.8, py: 61 }, xp: 42 }
    localStorage.setItem(SAVE_KEY, JSON.stringify(old))

    const loaded = loadState()

    expect(loaded.avatar).toEqual(SPAWN)
    expect(loaded.xp).toBe(42)
    expect(loaded.version).toBe(SAVE_VERSION)
  })

  it('repairs an invalid position even when the save is already current', () => {
    const current = { ...initialState(), avatar: { px: 49.8, py: 61 }, coins: 7 }
    localStorage.setItem(SAVE_KEY, JSON.stringify(current))

    const loaded = loadState()

    expect(loaded.avatar).toEqual(SPAWN)
    expect(loaded.coins).toBe(7)
  })
})
