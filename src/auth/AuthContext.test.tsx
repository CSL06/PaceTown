/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth, useAuth } from './AuthContext'
import { signInAsGuest, signOut, signUp } from './session'

function Protected() {
  return <p>the town</p>
}

function LoginStub() {
  return <p>sign in first</p>
}

/** Renders the guard with a login route to be redirected to. */
function renderGuarded(at = '/town') {
  return render(
    <MemoryRouter initialEntries={[at]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route path="/town" element={<RequireAuth><Protected /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())

describe('RequireAuth', () => {
  it('sends a signed-out visitor to the login screen', async () => {
    renderGuarded()
    expect(await screen.findByText('sign in first')).toBeInTheDocument()
    expect(screen.queryByText('the town')).not.toBeInTheDocument()
  })

  it('lets a signed-in account through', async () => {
    await signUp({ name: 'Sam', email: 'sam@uni.edu', password: 'grove-pace-24' })
    renderGuarded()
    expect(await screen.findByText('the town')).toBeInTheDocument()
  })

  it('lets a guest through', async () => {
    signInAsGuest()
    renderGuarded()
    expect(await screen.findByText('the town')).toBeInTheDocument()
  })

  it('does not flash the login screen before the stored session is read', () => {
    signInAsGuest()
    renderGuarded()
    // The very first paint must not have decided the visitor is signed out.
    expect(screen.queryByText('sign in first')).not.toBeInTheDocument()
  })
})

describe('useAuth', () => {
  function Probe() {
    const { account, isGuest, signOut: out } = useAuth()
    return (
      <div>
        <span data-testid="who">{account ? account.name : 'nobody'}</span>
        <span data-testid="guest">{String(isGuest)}</span>
        <button type="button" onClick={out}>leave</button>
      </div>
    )
  }

  const renderProbe = () => render(
    <MemoryRouter><AuthProvider><Probe /></AuthProvider></MemoryRouter>,
  )

  it('reports nobody when signed out', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('nobody'))
    expect(screen.getByTestId('guest')).toHaveTextContent('false')
  })

  it('reports the signed-in account', async () => {
    await signUp({ name: 'Sam Okafor', email: 'sam@uni.edu', password: 'grove-pace-24' })
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('Sam Okafor'))
    expect(screen.getByTestId('guest')).toHaveTextContent('false')
  })

  it('flags a guest as a guest', async () => {
    signInAsGuest()
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('guest')).toHaveTextContent('true'))
  })

  it('re-renders when the session ends elsewhere', async () => {
    await signUp({ name: 'Sam', email: 'sam@uni.edu', password: 'grove-pace-24' })
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('Sam'))
    await userEvent.click(screen.getByRole('button', { name: 'leave' }))
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('nobody'))
  })

  it('picks up a sign-out that happened outside React', async () => {
    await signUp({ name: 'Sam', email: 'sam@uni.edu', password: 'grove-pace-24' })
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('Sam'))
    signOut()
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('nobody'))
  })
})
