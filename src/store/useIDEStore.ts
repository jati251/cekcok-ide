import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'

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

export interface UserSettings {
  theme: string
  fontSize: number
  fontFamily: string
  tabSize: number
  wordWrap: 'on' | 'off'
  minimapEnabled: boolean
  autoSave: 'off' | 'afterDelay' | 'onFocusChange'
  lineNumbers: 'on' | 'off' | 'relative'
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: "'Consolas', 'Menlo', 'Courier New', monospace",
  tabSize: 2,
  wordWrap: 'on',
  minimapEnabled: true,
  autoSave: 'afterDelay',
  lineNumbers: 'on'
}

const loadSavedSettings = (): UserSettings => {
  try {
    const saved = localStorage.getItem('cekcok_ide_settings')
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS
}

export interface PendingCloseFile {
  path: string
  pane: 1 | 2
  name: string
}

export interface IDEState {
  // File System State
  currentDir: string
  fileTree: FileNode[]
  
  // Multi-View Split Editor State
  splitEditorOpen: boolean
  activePane: 1 | 2
  pane1Files: FileNode[]
  pane1ActiveFile: FileNode | null
  pane2Files: FileNode[]
  pane2ActiveFile: FileNode | null

  // Backward-compat aliases
  openFiles: FileNode[]
  activeFile: FileNode | null

  // Modular Workspace Dimensions
  sidebarWidth: number
  terminalHeight: number
  
  // UI State
  sidebarOpen: boolean
  terminalOpen: boolean
  activeSidebarTab: SidebarTab
  commandPaletteOpen: boolean
  quickOpenOpen: boolean
  pendingCloseFile: PendingCloseFile | null

  // User Settings
  settings: UserSettings

  // Git State
  gitStatus: GitStatusResult
  isGitLoading: boolean

  // Node.js / Package State
  packageJson: PackageJson | null

  // Terminal Runner Hook
  pendingTerminalCommand: string | null

  // Actions
  setFileTree: (files: FileNode[]) => void
  setCurrentDir: (dir: string) => void
  setSidebarWidth: (w: number) => void
  setTerminalHeight: (h: number) => void
  updateSettings: (partial: Partial<UserSettings>) => void
  
  // Pane & File actions
  setActivePane: (pane: 1 | 2) => void
  toggleSplitEditor: () => void
  setSplitEditorOpen: (open: boolean) => void
  openFile: (file: FileNode) => void
  closeFile: (path: string) => void
  setActiveFile: (file: FileNode | null) => void
  setFileDirty: (path: string, isDirty: boolean) => void
  setFileContent: (path: string, content: string) => void
  
  openFileInPane: (file: FileNode, pane: 1 | 2) => void
  closeFileInPane: (path: string, pane: 1 | 2) => void
  requestCloseFile: (path: string, pane: 1 | 2) => void
  handleUnsavedConfirm: (action: 'save' | 'dont_save' | 'cancel') => Promise<void>
  setPendingCloseFile: (file: PendingCloseFile | null) => void
  
  closeOtherTabsInPane: (path: string, pane: 1 | 2) => void
  closeTabsToRightInPane: (path: string, pane: 1 | 2) => void
  closeAllTabsInPane: (pane: 1 | 2) => void

  setActiveFileInPane: (file: FileNode | null, pane: 1 | 2) => void
  saveFile: (path: string) => Promise<void>
  saveActiveFile: () => Promise<void>

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTerminal: () => void
  setTerminalOpen: (open: boolean) => void
  setActiveSidebarTab: (tab: SidebarTab) => void
  setCommandPaletteOpen: (open: boolean) => void
  setQuickOpenOpen: (open: boolean) => void
  runTerminalCommand: (cmd: string) => void
  clearPendingTerminalCommand: () => void
  refreshGitStatus: () => Promise<void>
  refreshPackageJson: () => Promise<void>
}

export const useIDEStore = create<IDEState>((set, get) => ({
  currentDir: '.',
  fileTree: [],
  
  splitEditorOpen: false,
  activePane: 1,
  pane1Files: [],
  pane1ActiveFile: null,
  pane2Files: [],
  pane2ActiveFile: null,

  openFiles: [],
  activeFile: null,

  sidebarWidth: 260,
  terminalHeight: 220,

  sidebarOpen: true,
  terminalOpen: true,
  activeSidebarTab: 'explorer',
  commandPaletteOpen: false,
  quickOpenOpen: false,
  pendingCloseFile: null,

  settings: loadSavedSettings(),

  gitStatus: {
    is_repo: false,
    branch: '',
    staged: [],
    unstaged: [],
    ahead: 0,
    behind: 0,
  },
  isGitLoading: false,

  packageJson: null,
  pendingTerminalCommand: null,

  setFileTree: (files) => set({ fileTree: files }),
  setCurrentDir: (dir) => {
    set({ currentDir: dir })
    get().refreshGitStatus()
    get().refreshPackageJson()
  },

  setSidebarWidth: (w) => set({ sidebarWidth: Math.max(160, Math.min(w, 700)) }),
  setTerminalHeight: (h) => set({ terminalHeight: Math.max(80, Math.min(h, 600)) }),

  updateSettings: (partial) => set((state) => {
    const updated = { ...state.settings, ...partial }
    try {
      localStorage.setItem('cekcok_ide_settings', JSON.stringify(updated))
    } catch {
      // ignore
    }
    return { settings: updated }
  }),

  setActivePane: (pane) => set({ activePane: pane }),
  toggleSplitEditor: () => set((state) => {
    const nextSplit = !state.splitEditorOpen
    if (nextSplit && state.pane2Files.length === 0 && state.pane1ActiveFile) {
      return {
        splitEditorOpen: true,
        activePane: 2,
        pane2Files: [state.pane1ActiveFile],
        pane2ActiveFile: state.pane1ActiveFile
      }
    }
    return { splitEditorOpen: nextSplit }
  }),
  setSplitEditorOpen: (open) => set({ splitEditorOpen: open }),

  openFile: (file) => {
    const currentActivePane = get().activePane
    get().openFileInPane(file, currentActivePane)
  },

  openFileInPane: (file, pane) => set((state) => {
    if (pane === 1) {
      const isOpen = state.pane1Files.some(f => f.path === file.path)
      const newFiles = isOpen ? state.pane1Files : [...state.pane1Files, file]
      return {
        pane1Files: newFiles,
        pane1ActiveFile: file,
        openFiles: newFiles,
        activeFile: file,
        activePane: 1
      }
    } else {
      const isOpen = state.pane2Files.some(f => f.path === file.path)
      const newFiles = isOpen ? state.pane2Files : [...state.pane2Files, file]
      return {
        pane2Files: newFiles,
        pane2ActiveFile: file,
        activePane: 2
      }
    }
  }),

  closeFile: (path) => {
    get().closeFileInPane(path, 1)
    get().closeFileInPane(path, 2)
  },

  setPendingCloseFile: (file) => set({ pendingCloseFile: file }),

  requestCloseFile: (path, pane) => {
    const files = pane === 1 ? get().pane1Files : get().pane2Files
    const file = files.find(f => f.path === path)
    if (!file) return

    if (file.isDirty) {
      set({ pendingCloseFile: { path: file.path, pane, name: file.name } })
    } else {
      get().closeFileInPane(path, pane)
    }
  },

  handleUnsavedConfirm: async (action) => {
    const pending = get().pendingCloseFile
    if (!pending) return

    if (action === 'cancel') {
      set({ pendingCloseFile: null })
      return
    }

    if (action === 'save') {
      await get().saveFile(pending.path)
    }

    // Close the file in the specified pane
    get().closeFileInPane(pending.path, pending.pane)
    set({ pendingCloseFile: null })
  },

  closeFileInPane: (path, pane) => set((state) => {
    if (pane === 1) {
      const newOpenFiles = state.pane1Files.filter(f => f.path !== path)
      let newActiveFile = state.pane1ActiveFile
      if (state.pane1ActiveFile?.path === path) {
        newActiveFile = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null
      }
      return {
        pane1Files: newOpenFiles,
        pane1ActiveFile: newActiveFile,
        openFiles: newOpenFiles,
        activeFile: newActiveFile
      }
    } else {
      const newOpenFiles = state.pane2Files.filter(f => f.path !== path)
      let newActiveFile = state.pane2ActiveFile
      if (state.pane2ActiveFile?.path === path) {
        newActiveFile = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null
      }
      return {
        pane2Files: newOpenFiles,
        pane2ActiveFile: newActiveFile
      }
    }
  }),

  closeOtherTabsInPane: (path, pane) => set((state) => {
    if (pane === 1) {
      const remaining = state.pane1Files.filter(f => f.path === path)
      return {
        pane1Files: remaining,
        pane1ActiveFile: remaining[0] || null,
        openFiles: remaining,
        activeFile: remaining[0] || null
      }
    } else {
      const remaining = state.pane2Files.filter(f => f.path === path)
      return {
        pane2Files: remaining,
        pane2ActiveFile: remaining[0] || null
      }
    }
  }),

  closeTabsToRightInPane: (path, pane) => set((state) => {
    if (pane === 1) {
      const idx = state.pane1Files.findIndex(f => f.path === path)
      if (idx === -1) return {}
      const remaining = state.pane1Files.slice(0, idx + 1)
      const newActive = remaining.some(f => f.path === state.pane1ActiveFile?.path)
        ? state.pane1ActiveFile
        : remaining[remaining.length - 1] || null
      return {
        pane1Files: remaining,
        pane1ActiveFile: newActive,
        openFiles: remaining,
        activeFile: newActive
      }
    } else {
      const idx = state.pane2Files.findIndex(f => f.path === path)
      if (idx === -1) return {}
      const remaining = state.pane2Files.slice(0, idx + 1)
      const newActive = remaining.some(f => f.path === state.pane2ActiveFile?.path)
        ? state.pane2ActiveFile
        : remaining[remaining.length - 1] || null
      return {
        pane2Files: remaining,
        pane2ActiveFile: newActive
      }
    }
  }),

  closeAllTabsInPane: (pane) => set(() => {
    if (pane === 1) {
      return {
        pane1Files: [],
        pane1ActiveFile: null,
        openFiles: [],
        activeFile: null
      }
    } else {
      return {
        pane2Files: [],
        pane2ActiveFile: null
      }
    }
  }),

  setActiveFile: (file) => {
    const pane = get().activePane
    get().setActiveFileInPane(file, pane)
  },

  setActiveFileInPane: (file, pane) => set(() => {
    if (pane === 1) {
      return { pane1ActiveFile: file, activeFile: file, activePane: 1 }
    } else {
      return { pane2ActiveFile: file, activePane: 2 }
    }
  }),

  setFileDirty: (path, isDirty) => set((state) => ({
    pane1Files: state.pane1Files.map(f => f.path === path ? { ...f, isDirty } : f),
    pane1ActiveFile: state.pane1ActiveFile?.path === path ? { ...state.pane1ActiveFile, isDirty } : state.pane1ActiveFile,
    pane2Files: state.pane2Files.map(f => f.path === path ? { ...f, isDirty } : f),
    pane2ActiveFile: state.pane2ActiveFile?.path === path ? { ...state.pane2ActiveFile, isDirty } : state.pane2ActiveFile,
    openFiles: state.openFiles.map(f => f.path === path ? { ...f, isDirty } : f),
    activeFile: state.activeFile?.path === path ? { ...state.activeFile, isDirty } : state.activeFile
  })),

  setFileContent: (path, content) => set((state) => ({
    pane1Files: state.pane1Files.map(f => f.path === path ? { ...f, content } : f),
    pane1ActiveFile: state.pane1ActiveFile?.path === path ? { ...state.pane1ActiveFile, content } : state.pane1ActiveFile,
    pane2Files: state.pane2Files.map(f => f.path === path ? { ...f, content } : f),
    pane2ActiveFile: state.pane2ActiveFile?.path === path ? { ...state.pane2ActiveFile, content } : state.pane2ActiveFile,
    openFiles: state.openFiles.map(f => f.path === path ? { ...f, content } : f),
    activeFile: state.activeFile?.path === path ? { ...state.activeFile, content } : state.activeFile
  })),

  saveFile: async (path) => {
    const allFiles = [...get().pane1Files, ...get().pane2Files]
    const target = allFiles.find(f => f.path === path)
    if (!target || target.content === undefined) return
    try {
      await invoke('write_file', { path: target.path, content: target.content })
      get().setFileDirty(path, false)
      get().refreshGitStatus()
    } catch (err) {
      console.error('Failed to save file:', err)
    }
  },

  saveActiveFile: async () => {
    const pane = get().activePane
    const file = pane === 1 ? get().pane1ActiveFile : get().pane2ActiveFile
    if (file) {
      await get().saveFile(file.path)
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  
  setActiveSidebarTab: (tab) => set((state) => {
    if (state.activeSidebarTab === tab && state.sidebarOpen) {
      return { sidebarOpen: false }
    }
    return { activeSidebarTab: tab, sidebarOpen: true }
  }),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickOpenOpen: (open) => set({ quickOpenOpen: open }),

  runTerminalCommand: (cmd) => set({
    terminalOpen: true,
    pendingTerminalCommand: cmd
  }),
  clearPendingTerminalCommand: () => set({ pendingTerminalCommand: null }),

  refreshGitStatus: async () => {
    const dir = get().currentDir
    set({ isGitLoading: true })
    try {
      const res = await invoke<GitStatusResult>('git_get_status', { cwd: dir })
      set({ gitStatus: res, isGitLoading: false })
    } catch {
      set({ isGitLoading: false })
    }
  },

  refreshPackageJson: async () => {
    const dir = get().currentDir
    const separator = dir.endsWith('/') || dir.endsWith('\\') ? '' : '/'
    const pkgPath = `${dir}${separator}package.json`
    try {
      const content = await invoke<string>('read_file', { path: pkgPath })
      const parsed = JSON.parse(content) as PackageJson
      set({ packageJson: parsed })
    } catch {
      set({ packageJson: null })
    }
  }
}))
