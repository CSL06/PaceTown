export const LIBRARY_STATIONS = {
  desk: { x: 50, y: 42 },
  mira: { x: 72, y: 55 },
  book: { x: 22, y: 55 },
  door: { x: 50, y: 91 },
} as const

export type LibraryStation = keyof typeof LIBRARY_STATIONS

export const LIBRARY_LABEL: Record<LibraryStation, string> = {
  desk: 'Sit down to work',
  mira: 'Talk to Mira',
  book: 'Open the reference book',
  door: 'Exit to campus',
}
