import { UserSettings, GitStatusResult } from '../types/ide'

export const STORAGE_KEYS = {
  SETTINGS: 'cekcok_ide_settings',
  RECENTS: 'cekcok_ide_recents',
  LAST_PROJECT: 'cekcok_ide_last_project',
} as const

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: "'Consolas', 'Menlo', 'Courier New', monospace",
  tabSize: 2,
  wordWrap: 'on',
  minimapEnabled: true,
  autoSave: 'afterDelay',
  lineNumbers: 'on',
  startupBehavior: 'restoreLastProject',
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
  ZOOM_MIN: 0.6,
  ZOOM_MAX: 1.8,
  ZOOM_DEFAULT: 1.0,
} as const
