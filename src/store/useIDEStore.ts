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

export interface IDEState {
  // File System State
  currentDir: string
  fileTree: FileNode[]
  
  // Editor State
  openFiles: FileNode[]
  activeFile: FileNode | null
  
  // UI State
  sidebarOpen: boolean
  terminalOpen: boolean
  activeSidebarTab: SidebarTab
  commandPaletteOpen: boolean
  quickOpenOpen: boolean

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
  openFile: (file: FileNode) => void
  closeFile: (path: string) => void
  setActiveFile: (file: FileNode | null) => void
  setFileDirty: (path: string, isDirty: boolean) => void
  setFileContent: (path: string, content: string) => void
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
  
  openFiles: [],
  activeFile: null,

  sidebarOpen: true,
  terminalOpen: true,
  activeSidebarTab: 'explorer',
  commandPaletteOpen: false,
  quickOpenOpen: false,

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
  
  openFile: (file) => set((state) => {
    const isOpen = state.openFiles.some(f => f.path === file.path)
    return {
      openFiles: isOpen ? state.openFiles : [...state.openFiles, file],
      activeFile: file
    }
  }),
  
  closeFile: (path) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.path !== path)
    let newActiveFile = state.activeFile
    
    if (state.activeFile?.path === path) {
      newActiveFile = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null
    }
    
    return {
      openFiles: newOpenFiles,
      activeFile: newActiveFile
    }
  }),
  
  setActiveFile: (file) => set({ activeFile: file }),
  
  setFileDirty: (path, isDirty) => set((state) => ({
    openFiles: state.openFiles.map(f => f.path === path ? { ...f, isDirty } : f),
    activeFile: state.activeFile?.path === path ? { ...state.activeFile, isDirty } : state.activeFile
  })),
  
  setFileContent: (path, content) => set((state) => ({
    openFiles: state.openFiles.map(f => f.path === path ? { ...f, content } : f),
    activeFile: state.activeFile?.path === path ? { ...state.activeFile, content } : state.activeFile
  })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  
  setActiveSidebarTab: (tab) => set((state) => {
    // If clicking same tab that is already active, toggle sidebar open/closed
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
