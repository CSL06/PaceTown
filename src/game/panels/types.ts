import type { DailyLoad } from '../../domain'
import type { Place, ViewId } from '../layout'
import type { GameState } from '../state'

export interface PanelProps {
  state: GameState
  load: DailyLoad
  update: (fn: (s: GameState) => GameState) => void
  go: (view: ViewId | null) => void
  toast: (message: string) => void
  /** Optional live-world travel callback; present in the campus shell. */
  travel?: (place: Place) => void
}
