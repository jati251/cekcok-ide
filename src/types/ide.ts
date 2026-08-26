export interface FileNode {
  name: string
  path: string
  is_dir: boolean
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

export type SidebarPosition = 'left' | 'right'
export type PanelPosition = 'bottom' | 'right'
export type SplitDirection = 'horizontal' | 'vertical'

export interface UserSettings {
  theme: string
  fontSize: number
  fontFamily: string
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
  type: 'file' | 'tab'
  file: FileNode
  fromPane?: 1 | 2
  fromIndex?: number
}
