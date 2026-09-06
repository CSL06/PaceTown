/**
 * Clock Tower floor plan.
 *
 * `ENTRY` is kept out of the station map deliberately. It used to live in it,
 * and because proximity is computed by walking every key of that map, standing
 * on your own spawn point counted as being "near" a station — one with no
 * label, so the room showed a prompt reading "E ·" with nothing after it.
 * A place you arrive at is not a thing you can interact with.
 */

/** Where the player is placed on arriving in the room. Deliberately not
 * `as const`: the movement ref is seeded from it and then written every frame,
 * so a literal type here makes the position read-only by accident. */
export const ENTRY: { x: number; y: number } = { x: 50, y: 92 }

export type RoomStation = 'board' | 'kai' | 'door'

/** Only the things you can walk up to and press E on. */
export const STATION_POSITION: Record<RoomStation, { x: number; y: number }> = {
  board: { x: 50, y: 57 },
  kai: { x: 68, y: 73 },
  door: { x: 72, y: 54 },
}

export const STATION_LABEL: Record<RoomStation, string> = {
  board: 'Open calendar',
  kai: 'Talk to Kai',
  door: 'Exit to campus',
}
