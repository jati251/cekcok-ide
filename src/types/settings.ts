import { ToolId } from './editor'

export type SidebarTab = 'explorer' | 'search' | 'git' | 'node' | 'settings'

export type ToolPanelPosition = 'left' | 'right' | 'bottom' | 'hidden'
export type ToolLayout = Record<ToolId, ToolPanelPosition>

export type SidebarPosition = 'left' | 'right'
export type PanelPosition = 'bottom' | 'right'

export interface UserSettings {
  theme: string
  fontSize: number
  fontFamily: string
  ideFontFamily: string
  tabSize: number
  wordWrap: 'on' | 'off'
  minimapEnabled: boolean
  autoSave: 'off' | 'afterDelay' | 'onFocusChange'
  lineNumbers: 'on' | 'off' | 'relative'
  startupBehavior: 'restoreLastProject' | 'welcomePage' | 'empty'
  showHiddenFiles: boolean
  showIgnoredFiles: boolean
  sidebarPosition: SidebarPosition
  panelPosition: PanelPosition
  splitDirection: 'horizontal' | 'vertical'
}
