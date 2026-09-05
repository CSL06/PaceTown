export const STATION_POSITION = {
  entry: { x: 50, y: 92 }, board: { x: 50, y: 57 },
  kai: { x: 68, y: 73 }, door: { x: 72, y: 54 },
} as const
export type RoomStation = 'board' | 'kai' | 'door'
export const STATION_LABEL = { board: 'Open calendar', kai: 'Talk to Kai', door: 'Exit to campus' }
