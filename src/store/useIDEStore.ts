import { create } from 'zustand'

export interface FileNode {
  name: string
  path: string
  is_dir: boolean
  isDirty?: boolean
}

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

  // Actions
  setFileTree: (files: FileNode[]) => void
  setCurrentDir: (dir: string) => void
  openFile: (file: FileNode) => void
  closeFile: (path: string) => void
  setActiveFile: (file: FileNode | null) => void
  setFileDirty: (path: string, isDirty: boolean) => void
  toggleSidebar: () => void
  toggleTerminal: () => void
}

export const useIDEStore = create<IDEState>((set) => ({
  currentDir: '.',
  fileTree: [],
  
  openFiles: [],
  activeFile: null,

  sidebarOpen: true,
  terminalOpen: true,

  setFileTree: (files) => set({ fileTree: files }),
  setCurrentDir: (dir) => set({ currentDir: dir }),
  
  openFile: (file) => set((state) => {
    // If already open, just make it active
    const isOpen = state.openFiles.some(f => f.path === file.path)
    return {
      openFiles: isOpen ? state.openFiles : [...state.openFiles, file],
      activeFile: file
    }
  }),
  
  closeFile: (path) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.path !== path)
    let newActiveFile = state.activeFile
    
    // If we closed the active file, focus the last one in the list (or null)
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

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
}))
