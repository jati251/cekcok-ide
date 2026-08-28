import { UserSettings, GitStatusResult } from '../types/ide'

export const STORAGE_KEYS = {
  SETTINGS: 'cekcok_ide_settings',
  RECENTS: 'cekcok_ide_recents',
  LAST_PROJECT: 'cekcok_ide_last_project',
} as const

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'vs-dark',
  fontSize: 12,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', monospace",
  ideFontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  tabSize: 2,
  wordWrap: 'on',
  minimapEnabled: true,
  autoSave: 'afterDelay',
  lineNumbers: 'on',
  startupBehavior: 'restoreLastProject',
  formatOnSave: true,
  showHiddenFiles: false,
  showIgnoredFiles: true,
  sidebarPosition: 'left',
  panelPosition: 'bottom',
  splitDirection: 'vertical',
}

export const INITIAL_GIT_STATUS: GitStatusResult = {
  is_repo: false,
  branch: '',
  staged: [],
  unstaged: [],
  ahead: 0,
  behind: 0,
}

export const LAYOUT_CONSTRAINTS = {
  SIDEBAR_MIN_WIDTH: 160,
  SIDEBAR_MAX_WIDTH: 700,
  SIDEBAR_DEFAULT_WIDTH: 260,
  TERMINAL_MIN_HEIGHT: 80,
  TERMINAL_MAX_HEIGHT: 600,
  TERMINAL_DEFAULT_HEIGHT: 220,
  TERMINAL_MIN_WIDTH: 200,
  TERMINAL_MAX_WIDTH: 800,
  TERMINAL_DEFAULT_WIDTH: 360,
  SPLIT_MIN_RATIO: 0.2,
  SPLIT_MAX_RATIO: 0.8,
  SPLIT_DEFAULT_RATIO: 0.5,
  ZOOM_MIN: 0.6,
  ZOOM_MAX: 1.8,
  ZOOM_DEFAULT: 1.0,
} as const
