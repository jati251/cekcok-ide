import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { FileNode } from '../../types/ide'
import { LAYOUT_CONSTRAINTS } from '../../constants/defaults'
import { FullIDEStore } from '../useIDEStore'

export interface FileSlice {
  fileTree: FileNode[]
  expandedFolders: Record<string, boolean>
  folderChildren: Record<string, FileNode[]>

  splitEditorOpen: boolean
  splitRatio: number
  activePane: 1 | 2
  pane1Files: FileNode[]
  pane1ActiveFile: FileNode | null
  pane2Files: FileNode[]
  pane2ActiveFile: FileNode | null

  // Aliases for compatibility
  openFiles: FileNode[]
  activeFile: FileNode | null

  setFileTree: (files: FileNode[]) => void
  setSplitRatio: (ratio: number) => void
  toggleFolder: (path: string) => Promise<void>
  collapseAllFolders: () => void
  refreshDirectory: (path?: string) => Promise<void>

  createFileInDir: (dirPath: string, name: string) => Promise<void>
  createFolderInDir: (dirPath: string, name: string) => Promise<void>
  deletePathItem: (path: string) => Promise<void>
  renamePathItem: (oldPath: string, newPath: string) => Promise<void>
  movePathItem: (sourcePath: string, targetNode: FileNode) => Promise<void>

  setActivePane: (pane: 1 | 2) => void
  toggleSplitEditor: () => void
  setSplitEditorOpen: (open: boolean) => void
  openFile: (file: FileNode) => void
  openFileInPane: (file: FileNode, pane: 1 | 2) => void
  closeFile: (path: string) => void
  closeFileInPane: (path: string, pane: 1 | 2) => void
  requestCloseFile: (path: string, pane: 1 | 2) => void
  handleUnsavedConfirm: (action: 'save' | 'dont_save' | 'cancel') => Promise<void>

  closeOtherTabsInPane: (path: string, pane: 1 | 2) => void
  closeTabsToRightInPane: (path: string, pane: 1 | 2) => void
  closeAllTabsInPane: (pane: 1 | 2) => void
  reorderTabsInPane: (pane: 1 | 2, fromIndex: number, toIndex: number) => void
  moveTabBetweenPanes: (filePath: string, fromPane: 1 | 2, toPane: 1 | 2, targetIndex?: number) => void

  setActiveFile: (file: FileNode | null) => void
  setActiveFileInPane: (file: FileNode | null, pane: 1 | 2) => void
  setFileDirty: (path: string, isDirty: boolean) => void
  setFileContent: (path: string, content: string) => void
  saveFile: (path: string) => Promise<void>
  saveActiveFile: () => Promise<void>

  openSettingsTab: () => void
  openWelcomeTab: () => void
}

export const createFileSlice: StateCreator<FullIDEStore, [], [], FileSlice> = (set, get) => ({
  fileTree: [],
  expandedFolders: {},
  folderChildren: {},

  splitEditorOpen: false,
  splitRatio: LAYOUT_CONSTRAINTS.SPLIT_DEFAULT_RATIO,
  activePane: 1,
  pane1Files: [],
  pane1ActiveFile: null,
  pane2Files: [],
  pane2ActiveFile: null,

  openFiles: [],
  activeFile: null,

  setFileTree: (files) => set({ fileTree: files }),

  setSplitRatio: (ratio) => set({
    splitRatio: Math.max(LAYOUT_CONSTRAINTS.SPLIT_MIN_RATIO, Math.min(ratio, LAYOUT_CONSTRAINTS.SPLIT_MAX_RATIO))
  }),

  refreshDirectory: async (path) => {
    const targetDir = path || get().currentDir
    try {
      const files = await safeInvoke<FileNode[]>('read_dir', {
        path: targetDir,
        showHidden: get().settings.showHiddenFiles,
      })
      if (targetDir === get().currentDir) {
        set({ fileTree: files })
      } else {
        set((state) => ({
          folderChildren: { ...state.folderChildren, [targetDir]: files }
        }))
      }
    } catch (err) {
      console.error(`Failed to refresh directory ${targetDir}:`, err)
    }
  },

  createFileInDir: async (dirPath, name) => {
    const sep = dirPath.endsWith('/') || dirPath.endsWith('\\') ? '' : '/'
    const fullPath = `${dirPath}${sep}${name}`
    await safeInvoke('create_file', { path: fullPath })
    await get().refreshDirectory(dirPath)
    get().openFile({ name, path: fullPath, is_dir: false })
  },

  createFolderInDir: async (dirPath, name) => {
    const sep = dirPath.endsWith('/') || dirPath.endsWith('\\') ? '' : '/'
    const fullPath = `${dirPath}${sep}${name}`
    await safeInvoke('create_dir', { path: fullPath })
    await get().refreshDirectory(dirPath)
  },

  deletePathItem: async (path) => {
    await safeInvoke('delete_path', { path })
    get().closeFile(path)
    // Find parent dir to refresh
    const parent = path.substring(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))) || get().currentDir
    await get().refreshDirectory(parent)
    if (parent !== get().currentDir) {
      await get().refreshDirectory(get().currentDir)
    }
  },

  renamePathItem: async (oldPath, newPath) => {
    await safeInvoke('rename_path', { oldPath, newPath })
    get().closeFile(oldPath)
    const newName = newPath.split(/[/\\]/).pop() || newPath
    get().openFile({ name: newName, path: newPath, is_dir: false })
    const parent = oldPath.substring(0, Math.max(oldPath.lastIndexOf('/'), oldPath.lastIndexOf('\\'))) || get().currentDir
    await get().refreshDirectory(parent)
    if (parent !== get().currentDir) {
      await get().refreshDirectory(get().currentDir)
    }
  },

  movePathItem: async (sourcePath, targetNode) => {
    const sep = sourcePath.includes('/') ? '/' : '\\'
    const sourceName = sourcePath.split(/[/\\]/).pop()
    if (!sourceName) return

    let targetDir = targetNode.path
    if (!targetNode.is_dir) {
      targetDir = targetNode.path.substring(0, Math.max(targetNode.path.lastIndexOf('/'), targetNode.path.lastIndexOf('\\'))) || get().currentDir
    }

    const newPath = `${targetDir}${sep}${sourceName}`
    
    // Don't move if it's the exact same directory
    const sourceDir = sourcePath.substring(0, Math.max(sourcePath.lastIndexOf('/'), sourcePath.lastIndexOf('\\'))) || get().currentDir
    if (sourceDir === targetDir) return

    await get().renamePathItem(sourcePath, newPath)
  },

  toggleFolder: async (path) => {
    const isExpanded = !!get().expandedFolders[path]
    if (isExpanded) {
      set((state) => ({
        expandedFolders: { ...state.expandedFolders, [path]: false }
      }))
    } else {
      if (!get().folderChildren[path]) {
        try {
          const children = await safeInvoke<FileNode[]>('read_dir', {
            path,
            showHidden: get().settings.showHiddenFiles,
          })
          set((state) => ({
            folderChildren: { ...state.folderChildren, [path]: children },
            expandedFolders: { ...state.expandedFolders, [path]: true }
          }))
          return
        } catch (err) {
          console.error(`Failed to read folder: ${path}`, err)
        }
      }
      set((state) => ({
        expandedFolders: { ...state.expandedFolders, [path]: true }
      }))
    }
  },

  collapseAllFolders: () => set({ expandedFolders: {} }),

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

  requestCloseFile: (path, pane) => {
    const files = pane === 1 ? get().pane1Files : get().pane2Files
    const file = files.find(f => f.path === path)
    if (!file) return

    if (file.isDirty) {
      get().setPendingCloseFile({ path: file.path, pane, name: file.name })
    } else {
      get().closeFileInPane(path, pane)
    }
  },

  handleUnsavedConfirm: async (action) => {
    const pending = get().pendingCloseFile
    if (!pending) return

    if (action === 'cancel') {
      get().setPendingCloseFile(null)
      return
    }

    if (action === 'save') {
      await get().saveFile(pending.path)
    }

    get().closeFileInPane(pending.path, pending.pane)
    get().setPendingCloseFile(null)
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

  reorderTabsInPane: (pane, fromIndex, toIndex) => set((state) => {
    const list = pane === 1 ? [...state.pane1Files] : [...state.pane2Files]
    const [moved] = list.splice(fromIndex, 1)
    if (!moved) return {}
    list.splice(toIndex, 0, moved)

    if (pane === 1) {
      return { pane1Files: list, openFiles: list }
    } else {
      return { pane2Files: list }
    }
  }),

  moveTabBetweenPanes: (filePath, fromPane, toPane, targetIndex) => set((state) => {
    if (fromPane === toPane) return {}
    const fromList = fromPane === 1 ? [...state.pane1Files] : [...state.pane2Files]
    const toList = toPane === 1 ? [...state.pane1Files] : [...state.pane2Files]
    
    const fileIndex = fromList.findIndex(f => f.path === filePath)
    if (fileIndex === -1) return {}
    const [file] = fromList.splice(fileIndex, 1)

    const existingInTo = toList.findIndex(f => f.path === filePath)
    if (existingInTo === -1) {
      if (typeof targetIndex === 'number') {
        toList.splice(targetIndex, 0, file)
      } else {
        toList.push(file)
      }
    }

    const newFromActive = fromList.length > 0 ? fromList[fromList.length - 1] : null

    if (fromPane === 1) {
      return {
        pane1Files: fromList,
        pane1ActiveFile: newFromActive,
        openFiles: fromList,
        activeFile: newFromActive,
        pane2Files: toList,
        pane2ActiveFile: file,
        activePane: 2
      }
    } else {
      return {
        pane2Files: fromList,
        pane2ActiveFile: newFromActive,
        pane1Files: toList,
        pane1ActiveFile: file,
        openFiles: toList,
        activeFile: file,
        activePane: 1
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
      await safeInvoke('write_file', { path: target.path, content: target.content })
      get().setFileDirty(path, false)
      get().refreshGitStatus()
      
      // Save local history snapshot (WebStorm feature)
      // Import dynamically to avoid circular dependencies if any
      const { saveLocalHistory } = await import('../../utils/localHistory')
      await saveLocalHistory(path, target.content)
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

  openSettingsTab: () => {
    const settingsFile: FileNode = {
      name: 'Settings',
      path: 'settings://preferences',
      is_dir: false,
    }
    get().openFile(settingsFile)
  },

  openWelcomeTab: () => {
    const welcomeFile: FileNode = {
      name: 'Get Started',
      path: 'welcome://get-started',
      is_dir: false,
    }
    get().openFile(welcomeFile)
  }
})
