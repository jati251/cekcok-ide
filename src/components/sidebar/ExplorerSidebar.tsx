import React, { useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { FilePlus, FolderPlus, RefreshCw, ChevronsDownUp } from 'lucide-react'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import { FileTreeItem } from '../FileTreeItem'

export const ExplorerSidebar: React.FC = () => {
  const {
    currentDir,
    fileTree,
    setFileTree,
    setCurrentDir,
    openFile,
    collapseAllFolders,
  } = useIDEStore()

  const loadDirectory = useCallback(
    async (dirPath: string) => {
      try {
        const files = await invoke<FileNode[]>('read_dir', { path: dirPath })
        setFileTree(files)
      } catch (error) {
        console.error('Failed to read directory:', error)
      }
    },
    [setFileTree]
  )

  useEffect(() => {
    loadDirectory(currentDir)
  }, [currentDir, loadDirectory])

  const handleOpenFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
      })
      if (selectedPath && typeof selectedPath === 'string') {
        setCurrentDir(selectedPath)
      }
    } catch (error) {
      console.error('Failed to open folder:', error)
    }
  }

  const handleCreateNode = async (isDir: boolean) => {
    const name = prompt(`Enter ${isDir ? 'folder' : 'file'} name:`)
    if (!name) return

    const separator = currentDir.endsWith('/') || currentDir.endsWith('\\') ? '' : '/'
    const fullPath = `${currentDir}${separator}${name}`

    try {
      if (isDir) {
        await invoke('create_dir', { path: fullPath })
      } else {
        await invoke('create_file', { path: fullPath })
      }
      await loadDirectory(currentDir)
      if (!isDir) {
        openFile({ name, path: fullPath, is_dir: false })
      }
    } catch (error) {
      alert(`Error creating ${isDir ? 'folder' : 'file'}: ${error}`)
    }
  }

  const rootFolderName = currentDir.split(/[/\\]/).filter(Boolean).pop() || currentDir

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
        <span
          className="truncate max-w-[120px] text-white/90 font-mono text-[11px]"
          title={currentDir}
        >
          {rootFolderName}
        </span>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => handleCreateNode(false)}
            className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => handleCreateNode(true)}
            className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={collapseAllFolders}
            className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
            title="Collapse All Folders"
          >
            <ChevronsDownUp size={13} />
          </button>
          <button
            onClick={() => loadDirectory(currentDir)}
            className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
            title="Refresh Explorer"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleOpenFolder}
            className="text-[10px] hover:text-white text-[#bbb] bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors ml-1 font-mono cursor-pointer"
            title="Open Folder"
          >
            OPEN
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#888] italic">No files in directory</div>
        ) : (
          fileTree.map((file) => (
            <FileTreeItem key={file.path} node={file} depth={0} />
          ))
        )}
      </div>
    </div>
  )
}
