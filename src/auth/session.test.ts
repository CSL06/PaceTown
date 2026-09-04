import { beforeEach, describe, expect, it } from 'vitest'
import {
  currentSession, emailProblem, hasAccounts, normaliseEmail, passwordProblem,
  passwordStrength, signIn, signInAsGuest, signInWithGoogle, signOut, signUp,
  subscribe, upgradeGuest,
} from './session'

/** Node has no localStorage; the store only needs these four methods. */
function installStorage(): void {
  const map = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
      clear: () => map.clear(),
    },
  })
}

beforeEach(installStorage)

const SAM = { name: 'Sam Okafor', email: 'Sam@University.edu', password: 'grove-pace-24' }

describe('validation', () => {
  it('rejects addresses that are not addresses', () => {
    expect(emailProblem('')).toBeTruthy()
    expect(emailProblem('sam')).toBeTruthy()
    expect(emailProblem('sam@localhost')).toBeTruthy()
    expect(emailProblem('sam@uni.edu')).toBeNull()
  })

  it('requires eight characters, and nothing else', () => {
    expect(passwordProblem('short')).toBeTruthy()
    expect(passwordProblem('longenough')).toBeNull()
  })

  it('scores strength without ever blocking a sign-in', () => {
    expect(passwordStrength('abc').score).toBe(0)
    expect(passwordStrength('abcdefgh').score).toBe(1)
    expect(passwordStrength('abcdefgh12').score).toBe(2)
    expect(passwordStrength('abcdefghijKL34!').score).toBe(3)
  })

  it('folds case and whitespace so one person has one account', () => {
    expect(normaliseEmail('  Sam@Uni.EDU ')).toBe('sam@uni.edu')
  })
})

describe('sign up', () => {
  it('creates an account and starts a session', async () => {
    const result = await signUp(SAM)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.account.email).toBe('sam@university.edu')
    expect(result.value.account.provider).toBe('password')
    expect(currentSession()?.account.id).toBe(result.value.account.id)
    expect(hasAccounts()).toBe(true)
  })

  it('never stores the password, hashed or otherwise, on the public account', async () => {
    const result = await signUp(SAM)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const leaked = JSON.stringify(result.value.account)
    expect(leaked).not.toContain(SAM.password)
    expect(leaked).not.toContain('hash')
    expect(leaked).not.toContain('salt')
  })

  it('keeps no plaintext password anywhere in storage', async () => {
    await signUp(SAM)
    expect(localStorage.getItem('pacetown.accounts')).not.toContain(SAM.password)
  })

  it('refuses a second account on the same address, whatever the casing', async () => {
    await signUp(SAM)
    const again = await signUp({ ...SAM, email: 'SAM@university.edu' })
    expect(again.ok).toBe(false)
    if (again.ok) return
    expect(again.error).toMatch(/already/i)
  })

  it('rejects a short password before touching storage', async () => {
    const result = await signUp({ ...SAM, password: 'abc' })
    expect(result.ok).toBe(false)
    expect(hasAccounts()).toBe(false)
  })
})

describe('sign in', () => {
  it('accepts the right password', async () => {
    await signUp(SAM)
    signOut()
    const result = await signIn('sam@university.edu', SAM.password)
    expect(result.ok).toBe(true)
    expect(currentSession()).not.toBeNull()
  })

  it('rejects the wrong password', async () => {
    await signUp(SAM)
    signOut()
    const result = await signIn(SAM.email, 'not-the-password')
    expect(result.ok).toBe(false)
  })

  it('gives the same message for a wrong password and an unknown account', async () => {
    await signUp(SAM)
    signOut()
    const wrong = await signIn(SAM.email, 'nope-nope-nope')
    const unknown = await signIn('nobody@uni.edu', 'nope-nope-nope')
    expect(wrong.ok).toBe(false)
    expect(unknown.ok).toBe(false)
    if (wrong.ok || unknown.ok) return
    // Different messages here would let anyone enumerate who has an account.
    expect(wrong.error).toBe(unknown.error)
  })

  it('sends a Google account back to the Google button', async () => {
    await signInWithGoogle({ name: 'Sam', email: 'sam@gmail.com' })
    signOut()
    const result = await signIn('sam@gmail.com', 'anything-at-all')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/google/i)
  })
})

describe('google', () => {
  it('creates the account on first use and reuses it after', async () => {
    const first = await signInWithGoogle({ name: 'Sam', email: 'sam@gmail.com' })
    expect(first.ok).toBe(true)
    signOut()
    const second = await signInWithGoogle({ name: 'Someone Else', email: 'Sam@Gmail.com' })
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(second.value.account.id).toBe(first.value.account.id)
    expect(second.value.account.name).toBe('Sam')
  })

  it('falls back to the local part when no name comes back', async () => {
    const result = await signInWithGoogle({ name: '   ', email: 'sam@gmail.com' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.account.name).toBe('sam')
  })
})

describe('guest', () => {
  it('starts a session with no credentials', () => {
    const session = signInAsGuest()
    expect(session.account.guest).toBe(true)
    expect(session.account.provider).toBe('guest')
    expect(currentSession()?.account.id).toBe(session.account.id)
  })

  it('returns to the same guest rather than piling up new ones', () => {
    const first = signInAsGuest()
    signOut()
    const second = signInAsGuest()
    expect(second.account.id).toBe(first.account.id)
  })

  it('upgrades in place, so the local save stays attached', async () => {
    const guest = signInAsGuest()
    const result = await upgradeGuest(SAM)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.account.id).toBe(guest.account.id)
    expect(result.value.account.guest).toBe(false)
    expect(result.value.account.email).toBe('sam@university.edu')
  })

  it('can sign in with the password set during the upgrade', async () => {
    signInAsGuest()
    await upgradeGuest(SAM)
    signOut()
    const result = await signIn(SAM.email, SAM.password)
    expect(result.ok).toBe(true)
  })

  it('refuses to upgrade onto an address someone else already has', async () => {
    await signUp(SAM)
    signOut()
    signInAsGuest()
    const result = await upgradeGuest(SAM)
    expect(result.ok).toBe(false)
  })

  it('falls back to a normal sign-up when nobody is signed in as a guest', async () => {
    const result = await upgradeGuest(SAM)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.account.guest).toBeFalsy()
  })
})

describe('sessions', () => {
  it('clears on sign out', async () => {
    await signUp(SAM)
    expect(currentSession()).not.toBeNull()
    signOut()
    expect(currentSession()).toBeNull()
  })

  it('notifies subscribers on sign in and sign out', async () => {
    const seen: (string | null)[] = []
    const stop = subscribe((s) => seen.push(s?.account.email ?? null))
    await signUp(SAM)
    signOut()
    stop()
    expect(seen).toEqual(['sam@university.edu', null])
  })

  it('ignores a session whose account no longer exists', async () => {
    await signUp(SAM)
    localStorage.removeItem('pacetown.accounts')
    expect(currentSession()).toBeNull()
  })

  it('survives corrupt storage rather than throwing', async () => {
    localStorage.setItem('pacetown.accounts', '{not json')
    localStorage.setItem('pacetown.session', 'also not json')
    expect(currentSession()).toBeNull()
    expect(hasAccounts()).toBe(false)
    const result = await signUp(SAM)
    expect(result.ok).toBe(true)
  })
})
