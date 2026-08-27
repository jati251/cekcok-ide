import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { FileNode } from '../../types/ide'
import { FullIDEStore } from '../useIDEStore'

export interface WorkspaceSlice {
  fileTree: FileNode[]
  expandedFolders: Record<string, boolean>
  folderChildren: Record<string, FileNode[]>

  setFileTree: (files: FileNode[]) => void
  toggleFolder: (path: string) => Promise<void>
  collapseAllFolders: () => void
  refreshDirectory: (path?: string) => Promise<void>

  createFileInDir: (dirPath: string, name: string) => Promise<void>
  createFolderInDir: (dirPath: string, name: string) => Promise<void>
  deletePathItem: (path: string) => Promise<void>
  renamePathItem: (oldPath: string, newPath: string) => Promise<void>
  movePathItem: (sourcePath: string, targetNode: FileNode) => Promise<void>
}

export const createWorkspaceSlice: StateCreator<FullIDEStore, [], [], WorkspaceSlice> = (set, get) => ({
  fileTree: [],
  expandedFolders: {},
  folderChildren: {},

  setFileTree: (files) => set({ fileTree: files }),

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
      await safeInvoke('create_file', { path: `${dirPath}/${name}` })
      await get().refreshDirectory(dirPath)
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  createFolderInDir: async (dirPath, name) => {
    try {
      await safeInvoke('create_dir', { path: `${dirPath}/${name}` })
      await get().refreshDirectory(dirPath)
    } catch (err) {
      console.error(err)
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
  }
})
