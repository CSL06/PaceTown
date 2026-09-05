/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { SAVE_KEY, SAVE_VERSION, initialState, loadState } from './state'

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
