import type { DailyLoad } from '../../domain'
import type { ViewId } from '../layout'
import type { GameState } from '../state'

export interface PanelProps {
  state: GameState
  load: DailyLoad
  update: (fn: (s: GameState) => GameState) => void
  go: (view: ViewId | null) => void
  toast: (message: string) => void
}
