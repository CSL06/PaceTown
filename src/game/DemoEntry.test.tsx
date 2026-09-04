/**
 * @vitest-environment jsdom
 *
 * The demo path is what prototypeflow.md tells a presenter to open, so it is
 * worth pinning: one URL, no form, straight into the seeded week.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { currentSession, signUp } from '../auth/session'
import DemoEntry from './DemoEntry'
import { SAVE_KEY, initialState, loadState, resetDemo, saveState } from './state'

function TownStub() {
  return <p>campus grove</p>
}

function renderDemo() {
  return render(
    <MemoryRouter initialEntries={['/game']}>
      <AuthProvider>
        <Routes>
          <Route path="/game" element={<DemoEntry />} />
          <Route path="/town" element={<TownStub />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())

describe('DemoEntry', () => {
  it('lands in the town with no account and no form', async () => {
    expect(currentSession()).toBeNull()
    renderDemo()
    expect(await screen.findByText('campus grove')).toBeInTheDocument()
  })

  it('signs in a guest on the way through', async () => {
    renderDemo()
    await screen.findByText('campus grove')
    expect(currentSession()?.account.guest).toBe(true)
  })

  it('marks the save onboarded, so the wizard never interrupts a demo', async () => {
    renderDemo()
    await screen.findByText('campus grove')
    expect(loadState().onboarded).toBe(true)
  })

  it('keeps an existing account rather than replacing it with a guest', async () => {
    await signUp({ name: 'Sam', email: 'sam@uni.edu', password: 'grove-pace-24' })
    renderDemo()
    await screen.findByText('campus grove')
    const session = currentSession()
    expect(session?.account.guest).toBeFalsy()
    expect(session?.account.email).toBe('sam@uni.edu')
  })

  it('does not wipe a real save it happens to find', async () => {
    await signUp({ name: 'Sam', email: 'sam@uni.edu', password: 'grove-pace-24' })
    saveState({ ...initialState(), onboarded: true, xp: 340, coins: 90 })
    renderDemo()
    await screen.findByText('campus grove')
    expect(loadState().xp).toBe(340)
    expect(loadState().coins).toBe(90)
  })
})

describe('resetDemo', () => {
  it('restores the seeded week', () => {
    saveState({ ...initialState(), onboarded: true, xp: 500, tasks: [] })
    resetDemo()
    const after = loadState()
    expect(after.xp).toBe(0)
    expect(after.tasks.length).toBeGreaterThan(0)
  })

  it('stays onboarded, so a reset does not bounce you into the wizard', () => {
    saveState({ ...initialState(), onboarded: true, xp: 500 })
    resetDemo()
    expect(loadState().onboarded).toBe(true)
  })

  it('clears the journal and progress a previous run left behind', () => {
    saveState({
      ...initialState(),
      onboarded: true,
      coins: 75,
      gardenGrowth: 3,
      journal: [{ at: Date.now(), text: 'from the last demo' }],
    })
    resetDemo()
    const after = loadState()
    expect(after.journal).toEqual([])
    expect(after.coins).toBe(0)
    expect(after.gardenGrowth).toBe(0)
  })

  it('writes a save at the current version', () => {
    resetDemo()
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY)!)
    expect(raw.version).toBe(initialState().version)
  })
})
