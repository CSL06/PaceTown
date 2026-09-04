/**
 * Storage adapter.
 *
 * The prototype persists to localStorage; production may replace this module
 * with IndexedDB behind the same function signatures. Nothing outside state.ts
 * needs to know which store is in use.
 */

export interface RawStorage {
  load: () => string | null
  save: (raw: string) => void
  clear: () => void
}

export function localStorageAdapter(key: string): RawStorage {
  return {
    load: () => {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    save: (raw: string) => {
      try {
        localStorage.setItem(key, raw)
      } catch {
        // Private mode, or the quota is full. The session still works; it just
        // will not survive a reload, which is better than crashing mid-session.
      }
    },
    clear: () => {
      try {
        localStorage.removeItem(key)
      } catch {
        /* nothing to clear */
      }
    },
  }
}
