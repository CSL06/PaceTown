/**
 * Account and session store.
 *
 * A local, browser-only implementation of the shape a hosted auth provider
 * would expose. Everything is async and everything returns a Result rather
 * than throwing, so swapping this file for Supabase, Firebase or a bespoke
 * API is a change of implementation and not a change of call sites.
 *
 * Passwords are salted and stretched with PBKDF2 before they are stored.
 * That is not a security claim — a local store can always be read by whoever
 * owns the browser — it is so no plaintext password ever sits in localStorage
 * for a student who reused one.
 */

export type AuthProviderId = 'password' | 'google' | 'guest'

export interface Account {
  id: string
  name: string
  email: string
  provider: AuthProviderId
  /** A guest has no credentials and can be upgraded to a real account. */
  guest?: boolean
  /** 0–360, derived from the email. Gives every account a stable avatar colour. */
  hue: number
  createdAt: number
}

export interface Session {
  account: Account
  startedAt: number
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

interface StoredAccount extends Account {
  /** Absent for OAuth accounts, which never carry a password. */
  hash?: string
  salt?: string
}

const ACCOUNTS_KEY = 'pacetown.accounts'
const SESSION_KEY = 'pacetown.session'

const PBKDF2_ITERATIONS = 120_000

/* ---------------------------------------------------------------- storage */

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    /* Private mode or a full quota. The session still works for this tab. */
  }
}

/** Strips the credential fields before anything leaves this module. */
function publicOf(account: StoredAccount): Account {
  const { hash: _hash, salt: _salt, ...rest } = account
  return rest
}

/* ------------------------------------------------------------- primitives */

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hueFor(email: string): number {
  let h = 0
  for (let i = 0; i < email.length; i += 1) h = (h * 31 + email.charCodeAt(i)) % 360
  return h
}

function randomId(): string {
  const bytes = new Uint8Array(9)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * PBKDF2 over the password. `crypto.subtle` is unavailable on insecure
 * origins, so a plain hash stands in there — a prototype served over http on
 * a phone should still be able to sign in.
 */
async function derive(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  if (!crypto.subtle) {
    let h = 0
    const input = `${salt}:${password}`
    for (let i = 0; i < input.length; i += 1) h = (Math.imul(h, 31) + input.charCodeAt(i)) | 0
    return `weak-${(h >>> 0).toString(16)}`
  }
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits)
}

/* ------------------------------------------------------------ validation */

export function emailProblem(email: string): string | null {
  const value = normaliseEmail(email)
  if (!value) return 'Enter your email address.'
  // Deliberately permissive: one @, something either side, a dot in the domain.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'That does not look like an email address.'
  return null
}

export function passwordProblem(password: string): string | null {
  if (!password) return 'Choose a password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  return null
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3
  label: string
}

export function passwordStrength(password: string): PasswordStrength {
  if (password.length < 8) return { score: 0, label: 'Too short' }
  let variety = 0
  if (/[a-z]/.test(password)) variety += 1
  if (/[A-Z]/.test(password)) variety += 1
  if (/[0-9]/.test(password)) variety += 1
  if (/[^A-Za-z0-9]/.test(password)) variety += 1
  if (password.length >= 14 && variety >= 3) return { score: 3, label: 'Strong' }
  if (password.length >= 10 && variety >= 2) return { score: 2, label: 'Good' }
  return { score: 1, label: 'Okay' }
}

/* --------------------------------------------------------------- sessions */

const listeners = new Set<(session: Session | null) => void>()

function emit(session: Session | null): void {
  for (const listener of listeners) listener(session)
}

export function subscribe(listener: (session: Session | null) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function currentSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed?.account?.id) return null
    // A session whose account has since been deleted is not a session.
    const known = readAccounts().some((a) => a.id === parsed.account.id)
    return known ? parsed : null
  } catch {
    return null
  }
}

function startSession(account: Account): Session {
  const session: Session = { account, startedAt: Date.now() }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* The session lives in memory for this tab instead. */
  }
  emit(session)
  return session
}

export function signOut(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* Nothing to remove. */
  }
  emit(null)
}

/* ------------------------------------------------------------------ flows */

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export async function signUp({ name, email, password }: SignUpInput): Promise<Result<Session>> {
  const address = normaliseEmail(email)
  const emailIssue = emailProblem(address)
  if (emailIssue) return { ok: false, error: emailIssue }
  const passwordIssue = passwordProblem(password)
  if (passwordIssue) return { ok: false, error: passwordIssue }
  if (!name.trim()) return { ok: false, error: 'Tell us what to call you.' }

  const accounts = readAccounts()
  if (accounts.some((a) => a.email === address)) {
    return { ok: false, error: 'That email already has an account. Sign in instead.' }
  }

  const salt = randomId()
  const account: StoredAccount = {
    id: randomId(),
    name: name.trim(),
    email: address,
    provider: 'password',
    hue: hueFor(address),
    createdAt: Date.now(),
    salt,
    hash: await derive(password, salt),
  }
  writeAccounts([...accounts, account])
  return { ok: true, value: startSession(publicOf(account)) }
}

export async function signIn(email: string, password: string): Promise<Result<Session>> {
  const address = normaliseEmail(email)
  const account = readAccounts().find((a) => a.email === address)

  // One message for both failures, so this cannot be used to enumerate who
  // has an account.
  const rejection: Result<Session> = { ok: false, error: 'That email and password do not match an account.' }
  if (!account) return rejection

  if (account.provider === 'google') {
    return { ok: false, error: 'This account uses Google. Continue with Google instead.' }
  }
  if (!account.salt || !account.hash) return rejection
  const candidate = await derive(password, account.salt)
  if (candidate !== account.hash) return rejection

  return { ok: true, value: startSession(publicOf(account)) }
}

/**
 * Stands in for an OAuth redirect. A real provider returns a verified profile
 * here; this asks the caller for one, creates the account on first use, and
 * signs the same account in on every use after that.
 */
export async function signInWithGoogle(profile: { name: string; email: string }): Promise<Result<Session>> {
  const address = normaliseEmail(profile.email)
  const emailIssue = emailProblem(address)
  if (emailIssue) return { ok: false, error: emailIssue }

  const accounts = readAccounts()
  const existing = accounts.find((a) => a.email === address)
  if (existing) return { ok: true, value: startSession(publicOf(existing)) }

  const account: StoredAccount = {
    id: randomId(),
    name: profile.name.trim() || address.split('@')[0],
    email: address,
    provider: 'google',
    hue: hueFor(address),
    createdAt: Date.now(),
  }
  writeAccounts([...accounts, account])
  return { ok: true, value: startSession(publicOf(account)) }
}

/**
 * Explore-without-an-account. The plan asks for a prominent demo path, and a
 * landing page that forces a sign-up before anyone can see the product is a
 * landing page that converts badly.
 *
 * A guest is a real local account with no credentials, so everything
 * downstream — the session, the save, the HUD — works unchanged. Only one
 * guest ever exists, so leaving and coming back returns to the same town.
 */
export function signInAsGuest(): Session {
  const accounts = readAccounts()
  const existing = accounts.find((a) => a.provider === 'guest')
  if (existing) return startSession(publicOf(existing))

  const account: StoredAccount = {
    id: randomId(),
    name: 'Guest',
    email: 'guest@pacetown.local',
    provider: 'guest',
    guest: true,
    hue: 34,
    createdAt: Date.now(),
  }
  writeAccounts([...accounts, account])
  return startSession(publicOf(account))
}

/**
 * Turns the signed-in guest into a real account, keeping its id so the save
 * in localStorage stays attached to it.
 */
export async function upgradeGuest(input: SignUpInput): Promise<Result<Session>> {
  const session = currentSession()
  if (!session?.account.guest) return signUp(input)

  const address = normaliseEmail(input.email)
  const emailIssue = emailProblem(address)
  if (emailIssue) return { ok: false, error: emailIssue }
  const passwordIssue = passwordProblem(input.password)
  if (passwordIssue) return { ok: false, error: passwordIssue }
  if (!input.name.trim()) return { ok: false, error: 'Tell us what to call you.' }

  const accounts = readAccounts()
  if (accounts.some((a) => a.email === address && a.id !== session.account.id)) {
    return { ok: false, error: 'That email already has an account. Sign in instead.' }
  }

  const salt = randomId()
  const upgraded: StoredAccount = {
    ...session.account,
    name: input.name.trim(),
    email: address,
    provider: 'password',
    guest: false,
    hue: hueFor(address),
    salt,
    hash: await derive(input.password, salt),
  }
  writeAccounts(accounts.map((a) => (a.id === upgraded.id ? upgraded : a)))
  return { ok: true, value: startSession(publicOf(upgraded)) }
}

/** True when at least one account exists — the login screen defaults to it. */
export function hasAccounts(): boolean {
  return readAccounts().length > 0
}
