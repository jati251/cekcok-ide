import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { FileNode, FileClipboardState, ClipboardAction } from '../../types/ide'
import { FullIDEStore } from '../useIDEStore'
import { toast } from 'react-hot-toast'

export interface WorkspaceSlice {
  fileTree: FileNode[]
  expandedFolders: Record<string, boolean>
  folderChildren: Record<string, FileNode[]>
  fileClipboard: FileClipboardState | null
  selectedNode: FileNode | null
  creatingItemState: { parentPath: string; isDir: boolean } | null

  setFileTree: (files: FileNode[]) => void
  setSelectedNode: (node: FileNode | null) => void
  setCreatingItemState: (state: { parentPath: string; isDir: boolean } | null) => void
  startCreateItem: (isDir: boolean, targetPath?: string) => Promise<void>
  toggleFolder: (path: string) => Promise<void>
  collapseAllFolders: () => void
  revealActiveFileInExplorer: (filePath?: string) => Promise<void>
  refreshDirectory: (path?: string) => Promise<void>

  createFileInDir: (dirPath: string, name: string) => Promise<void>
  createFolderInDir: (dirPath: string, name: string) => Promise<void>
  deletePathItem: (path: string) => Promise<void>
  renamePathItem: (oldPath: string, newPath: string) => Promise<void>
  movePathItem: (sourcePath: string, targetNode: FileNode) => Promise<void>
  
  setFileClipboard: (action: ClipboardAction, file: FileNode) => void
  pasteFileToDir: (targetDirPath: string) => Promise<void>
  duplicateFile: (path: string) => Promise<void>
}

export const createWorkspaceSlice: StateCreator<FullIDEStore, [], [], WorkspaceSlice> = (set, get) => ({
  fileTree: [],
  expandedFolders: {},
  folderChildren: {},
  fileClipboard: null,
  selectedNode: null,
  creatingItemState: null,

  setFileTree: (files) => set({ fileTree: files }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setCreatingItemState: (state) => set({ creatingItemState: state }),

  startCreateItem: async (isDir, targetPath) => {
    const { currentDir, selectedNode, expandedFolders, folderChildren } = get()
    if (!currentDir) {
      toast.error('Please open a folder first.')
      return
    }

    let parent = currentDir
    if (targetPath) {
      // Find if targetPath is a folder or file
      const isTargetDir = !!folderChildren[targetPath] || (selectedNode?.path === targetPath && selectedNode?.is_dir)
      if (isTargetDir) {
        parent = targetPath
      } else {
        const lastSlash = Math.max(targetPath.lastIndexOf('/'), targetPath.lastIndexOf('\\'))
        parent = lastSlash > 0 ? targetPath.substring(0, lastSlash) : currentDir
      }
    } else if (selectedNode) {
      if (selectedNode.is_dir) {
        parent = selectedNode.path
      } else {
        const lastSlash = Math.max(selectedNode.path.lastIndexOf('/'), selectedNode.path.lastIndexOf('\\'))
        parent = lastSlash > 0 ? selectedNode.path.substring(0, lastSlash) : currentDir
      }
    }

    // Auto expand parent directory if it's not root
    if (parent !== currentDir) {
      if (!expandedFolders[parent]) {
        await get().toggleFolder(parent)
      }
    }

    set({ creatingItemState: { parentPath: parent, isDir } })
  },

  toggleFolder: async (path) => {
    const isExpanded = get().expandedFolders[path]
    
    if (isExpanded) {
      set((state) => ({
        expandedFolders: { ...state.expandedFolders, [path]: false }
      }))
    } else {
      set((state) => ({
        expandedFolders: { ...state.expandedFolders, [path]: true }
      }))
      
      try {
        const { showHiddenFiles } = get().settings
        const children = await safeInvoke<FileNode[]>('read_dir', { 
          path, 
          showHidden: showHiddenFiles,
          show_hidden: showHiddenFiles,
        })
        set((state) => ({
          folderChildren: { ...state.folderChildren, [path]: children || [] }
        }))
      } catch (err) {
        console.error('Failed to load directory:', err)
      }
    }
  },

  collapseAllFolders: () => {
    set({ expandedFolders: {} })
  },

  revealActiveFileInExplorer: async (filePath?: string) => {
    const target = filePath || get().activeFile?.path
    if (!target || target.startsWith('settings://') || target.startsWith('welcome://') || target.startsWith('diff://')) {
      return
    }

    const { currentDir } = get()
    if (!currentDir || !target.startsWith(currentDir)) return

    const rel = target.slice(currentDir.length).replace(/^[/\\]/, '')
    const parts = rel.split(/[/\\]/)
    
    let running = currentDir
    for (let i = 0; i < parts.length - 1; i++) {
      running = `${running}/${parts[i]}`
      if (!get().expandedFolders[running]) {
        await get().toggleFolder(running)
      }
    }

    const node: FileNode = {
      name: parts[parts.length - 1] || target,
      path: target,
      is_dir: false,
    }
    set({ selectedNode: node })
  },

  refreshDirectory: async (path) => {
    const targetPath = path || get().currentDir
    if (!targetPath) return

    try {
      const { showHiddenFiles } = get().settings
      const files = await safeInvoke<FileNode[]>('read_dir', { 
        path: targetPath, 
        showHidden: showHiddenFiles,
        show_hidden: showHiddenFiles,
      })
      if (path && path !== get().currentDir) {
        set((state) => ({
          folderChildren: { ...state.folderChildren, [path]: files || [] }
        }))
      } else {
        set({ fileTree: files || [] })
      }
    } catch (err) {
      console.error('Failed to refresh directory:', err)
    }
  },

  createFileInDir: async (dirPath, name) => {
    try {
      const sep = dirPath.endsWith('/') || dirPath.endsWith('\\') ? '' : '/'
      const fullPath = `${dirPath}${sep}${name}`
      await safeInvoke('create_file', { path: fullPath })
      await get().refreshDirectory(dirPath)
      get().openFile({ name, path: fullPath, is_dir: false, content: '' })
      toast.success(`Created file ${name}`)
    } catch (err) {
      console.error(err)
      toast.error(`Failed to create file: ${err}`)
      throw err
    }
  },

  createFolderInDir: async (dirPath, name) => {
    try {
      const sep = dirPath.endsWith('/') || dirPath.endsWith('\\') ? '' : '/'
      const fullPath = `${dirPath}${sep}${name}`
      await safeInvoke('create_dir', { path: fullPath })
      await get().refreshDirectory(dirPath)
      set((state) => ({
        expandedFolders: { ...state.expandedFolders, [fullPath]: true }
      }))
      toast.success(`Created folder ${name}`)
    } catch (err) {
      console.error(err)
      toast.error(`Failed to create folder: ${err}`)
      throw err
    }
  },

  deletePathItem: async (path) => {
    try {
      await safeInvoke('delete_path', { path })
      
      const parentDir = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('\\'))
      await get().refreshDirectory(parentDir)

      if (get().pane1ActiveFile?.path === path) get().closeFileInPane(path, 1)
      if (get().pane2ActiveFile?.path === path) get().closeFileInPane(path, 2)
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  renamePathItem: async (oldPath, newPath) => {
    try {
      await safeInvoke('rename_path', { oldPath, newPath })
      const parentDir = oldPath.substring(0, oldPath.lastIndexOf('/')) || oldPath.substring(0, oldPath.lastIndexOf('\\'))
      await get().refreshDirectory(parentDir)
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  movePathItem: async (sourcePath, targetNode) => {
    try {
      const fileName = sourcePath.split(/[/\\]/).pop() || ''
      const newPath = targetNode.is_dir ? `${targetNode.path}/${fileName}` : `${targetNode.path.substring(0, targetNode.path.lastIndexOf('/'))}/${fileName}`
      
      await safeInvoke('rename_path', { oldPath: sourcePath, newPath })
      
      const oldParentDir = sourcePath.substring(0, sourcePath.lastIndexOf('/'))
      const newParentDir = newPath.substring(0, newPath.lastIndexOf('/'))
      
      await get().refreshDirectory(oldParentDir)
      if (oldParentDir !== newParentDir) {
        await get().refreshDirectory(newParentDir)
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  setFileClipboard: (action, file) => set({ fileClipboard: { action, file } }),

  pasteFileToDir: async (targetDirPath) => {
    const { fileClipboard } = get()
    if (!fileClipboard) return

    const { action, file } = fileClipboard
    const fileName = file.name
    const targetPath = `${targetDirPath}/${fileName}`

    if (file.path === targetPath) {
      toast.error('Source and destination are the same.')
      return
    }

    try {
      if (action === 'copy') {
        await safeInvoke('copy_path', { sourcePath: file.path, targetPath })
        toast.success(`Copied ${fileName}`)
      } else if (action === 'cut') {
        await safeInvoke('rename_path', { oldPath: file.path, newPath: targetPath })
        set({ fileClipboard: null }) // Clear clipboard after cut/move
        toast.success(`Moved ${fileName}`)
        
        const oldParentDir = file.path.substring(0, file.path.lastIndexOf('/')) || file.path.substring(0, file.path.lastIndexOf('\\'))
        await get().refreshDirectory(oldParentDir)
      }
      
      await get().refreshDirectory(targetDirPath)
    } catch (err) {
      console.error(err)
      toast.error(`Failed to ${action} file: ${err}`)
    }
  },

  duplicateFile: async (path) => {
    try {
      await safeInvoke('duplicate_path', { path })
      const parentDir = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('\\'))
      await get().refreshDirectory(parentDir)
      toast.success('File duplicated')
    } catch (err) {
      console.error(err)
      toast.error(`Failed to duplicate file: ${err}`)
    }
  }
})
