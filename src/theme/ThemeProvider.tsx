/**
 * Theme state.
 *
 * Three settings, not two: light, dark, and "system", which follows the OS and
 * keeps following it when the OS changes. A two-way toggle silently overrides
 * a preference the visitor already expressed at the system level, so system is
 * the default and stays available.
 *
 * The resolved theme is written to `<html data-theme>`; theme.css does the
 * rest. Nothing else in the app reads or branches on the theme.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react'

const STORAGE_KEY = 'pacetown.theme'

export type ThemeSetting = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeValue {
  /** What the visitor chose. */
  setting: ThemeSetting
  /** What is actually on screen. */
  theme: ResolvedTheme
  setSetting: (setting: ThemeSetting) => void
  /** Light ⇄ dark, leaving "system" behind once used. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

function readSetting(): ThemeSetting {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    /* Fall through to the default. */
  }
  return 'system'
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [setting, setSettingState] = useState<ThemeSetting>(readSetting)
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)

  /* Follow the OS while the setting is "system" — including a change made
     after the page has loaded. */
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!query) return
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const theme: ResolvedTheme = setting === 'system' ? system : setting

  useEffect(() => {
    const root = document.documentElement
    // "system" leaves the attribute off, so theme.css's media query governs
    // and the page still themes correctly before this ever runs.
    if (setting === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', setting)

    // Keep the browser chrome (mobile address bar, PWA splash) in step.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#101A22' : '#FFFCF5')
  }, [setting, theme])

  const setSetting = useCallback((next: ThemeSetting) => {
    setSettingState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* The choice holds for this session only. */
    }
  }, [])

  const toggle = useCallback(() => {
    setSetting(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setSetting])

  const value = useMemo<ThemeValue>(
    () => ({ setting, theme, setSetting, toggle }),
    [setting, theme, setSetting, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
