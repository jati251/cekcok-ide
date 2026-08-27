export interface FileNode {
  name: string
  path: string
  is_dir: boolean
  is_hidden?: boolean
  is_ignored?: boolean
  isDirty?: boolean
  content?: string
}

export interface GitFileChange {
  path: string
  status: string
}

export interface GitStatusResult {
  is_repo: boolean
  branch: string
  staged: GitFileChange[]
  unstaged: GitFileChange[]
  ahead: number
  behind: number
}

export interface PackageJson {
  name?: string
  version?: string
  description?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export type SidebarTab = 'explorer' | 'search' | 'git' | 'node' | 'settings'
export type BottomPanelTab = 'problems' | 'output' | 'debug' | 'ports' | 'terminal'

export type ToolId = SidebarTab | BottomPanelTab

export type ToolPanelPosition = 'left' | 'right' | 'bottom' | 'hidden'
export type ToolLayout = Record<ToolId, ToolPanelPosition>

export type SidebarPosition = 'left' | 'right'
export type PanelPosition = 'bottom' | 'right'
export type SplitDirection = 'horizontal' | 'vertical'

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
  splitDirection: SplitDirection
}

export interface PendingCloseFile {
  path: string
  pane: 1 | 2
  name: string
}

export interface SearchResultItem {
  file_path: string
  file_name: string
  line_number: number
  line_text: string
}

export interface DragPayload {
  type: 'file' | 'tab' | 'tool'
  file?: FileNode
  fromPane?: 1 | 2
  fromIndex?: number
  toolId?: ToolId
}


export interface DiagnosticItem {
  id: string
  file: string
  line: number
  col: number
  message: string
  severity: 'error' | 'warning' | 'info'
  source?: string
}

export type OutputChannel = 'Git' | 'Build' | 'System'

export interface PortItem {
  port: number
  process: string
  url: string
  isAuto?: boolean
}

export interface TerminalSession {
  id: string
  name: string
}

