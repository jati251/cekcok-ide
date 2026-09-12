import React, { useEffect, useCallback, useState, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { FilePlus, FolderPlus, RefreshCw, ChevronsDownUp, Eye, LocateFixed } from 'lucide-react'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import { FileTreeItem } from '../FileTreeItem'
import { EmptySpaceContextMenu } from '../EmptySpaceContextMenu'
import { renderFileOrFolderIcon } from '../../utils/fileIcons'

export const ExplorerSidebar: React.FC = () => {
  const {
    currentDir,
    fileTree,
    setFileTree,
    setCurrentDir,
    collapseAllFolders,
    revealActiveFileInExplorer,
    settings,
    updateSettings,
    createFileInDir,
    createFolderInDir,
    refreshDirectory,
    creatingItemState,
    setCreatingItemState,
    startCreateItem,
    setSelectedNode,
  } = useIDEStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [rootNodeName, setRootNodeName] = useState('')
  const rootInputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRootRef = useRef(false)

  const isCreatingAtRoot = creatingItemState?.parentPath === currentDir

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const loadDirectory = useCallback(
    async (dirPath: string) => {
      if (!dirPath) return
      try {
        const { showHiddenFiles } = settings
        const files = await invoke<FileNode[]>('read_dir', { 
          path: dirPath,
          show_hidden: showHiddenFiles,
        })
        setFileTree(files)
      } catch (error) {
        console.error('Failed to read directory:', error)
      }
    },
    [setFileTree, settings]
  )

  useEffect(() => {
    loadDirectory(currentDir)
  }, [currentDir, loadDirectory])

  useEffect(() => {
    if (isCreatingAtRoot) {
      rootInputRef.current?.focus()
      rootInputRef.current?.select()
    }
  }, [isCreatingAtRoot])

  useEffect(() => {
    const handleTriggerNewFile = () => {
      if (!currentDir) return
      startCreateItem(false)
    }
    const handleTriggerNewFolder = () => {
      if (!currentDir) return
      startCreateItem(true)
    }

    window.addEventListener('trigger-new-file', handleTriggerNewFile)
    window.addEventListener('trigger-new-folder', handleTriggerNewFolder)
    return () => {
      window.removeEventListener('trigger-new-file', handleTriggerNewFile)
      window.removeEventListener('trigger-new-folder', handleTriggerNewFolder)
    }
  }, [currentDir, startCreateItem])

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

  const handleRootNodeSubmit = async () => {
    if (isSubmittingRootRef.current) return
    const trimmed = rootNodeName.trim()
    if (!trimmed || !creatingItemState) {
      setCreatingItemState(null)
      setRootNodeName('')
      return
    }

    isSubmittingRootRef.current = true
    try {
      if (creatingItemState.isDir) {
        await createFolderInDir(currentDir, trimmed)
      } else {
        await createFileInDir(currentDir, trimmed)
      }
      await refreshDirectory(currentDir)
    } catch (err) {
      console.error('Failed to create item at root:', err)
    } finally {
      setCreatingItemState(null)
      setRootNodeName('')
      isSubmittingRootRef.current = false
    }
  }

  const rootFolderName = currentDir.split(/[/\\]/).filter(Boolean).pop() || currentDir

  if (!currentDir) {
    return (
      <div className="flex flex-col h-full">
        <div
          style={{
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
            color: 'var(--color-ide-muted)',
          }}
          className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b"
        >
          NO FOLDER OPENED
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="text-xs opacity-60">You have not yet opened a folder.</div>
          <button
            onClick={handleOpenFolder}
            className="bg-ide-accent hover:bg-ide-accent-hover text-white text-[11px] font-semibold px-4 py-2 rounded transition-colors cursor-pointer w-full shadow-xs uppercase tracking-wide"
          >
            Open Folder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full"
      onClick={() => setSelectedNode(null)}
    >
      <div
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
          color: 'var(--color-ide-muted)',
        }}
        className="flex justify-between items-center px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b"
      >
        <span
          style={{ color: 'var(--color-ide-text)' }}
          className="truncate max-w-[130px] font-mono text-[11px] font-bold"
          title={currentDir}
        >
          {rootFolderName}
        </span>
        <div className="flex gap-0.5 items-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => startCreateItem(false)}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="New File"
          >
            <FilePlus size={13} />
          </button>
          <button
            onClick={() => startCreateItem(true)}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="New Folder"
          >
            <FolderPlus size={13} />
          </button>
          <button
            onClick={() => loadDirectory(currentDir)}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="Refresh Explorer"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={collapseAllFolders}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="Collapse All Folders"
          >
            <ChevronsDownUp size={13} />
          </button>
          <button
            onClick={() => revealActiveFileInExplorer()}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="Reveal Active File in Explorer"
          >
            <LocateFixed size={12} />
          </button>
          <button
            onClick={() => {
              updateSettings({ showHiddenFiles: !settings.showHiddenFiles })
              setTimeout(() => loadDirectory(currentDir), 50)
            }}
            className={`transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer ${
              settings.showHiddenFiles ? 'text-ide-accent bg-ide-accent/15' : 'opacity-60 hover:opacity-100'
            }`}
            title={settings.showHiddenFiles ? 'Hide Hidden Files (dotfiles)' : 'Show Hidden Files (.env, .gitignore)'}
          >
            <Eye size={12} />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-1.5 space-y-0.5"
        onContextMenu={handleContextMenu}
      >
        {/* Inline Root Creation Input (when creating item at root directory) */}
        {isCreatingAtRoot && (
          <div
            style={{
              backgroundColor: 'var(--color-ide-sidebar)',
              borderColor: 'var(--color-ide-accent)',
            }}
            className="flex items-center gap-1.5 py-1 px-2 mb-1 rounded border shadow-inner"
          >
            <span className="w-4 shrink-0 flex items-center justify-center">
              {renderFileOrFolderIcon(
                rootNodeName || (creatingItemState?.isDir ? 'folder' : 'file'),
                !!creatingItemState?.isDir,
                false
              )}
            </span>
            <input
              ref={rootInputRef}
              type="text"
              placeholder={creatingItemState?.isDir ? 'Folder name...' : 'File name (e.g. index.ts)...'}
              value={rootNodeName}
              onChange={(e) => setRootNodeName(e.target.value)}
              onBlur={handleRootNodeSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRootNodeSubmit()
                if (e.key === 'Escape') {
                  setCreatingItemState(null)
                  setRootNodeName('')
                }
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-accent)',
                color: 'var(--color-ide-text)',
              }}
              className="text-xs px-1.5 py-0.5 rounded border outline-none w-full shadow-inner"
            />
          </div>
        )}

        {fileTree.length === 0 && !isCreatingAtRoot ? (
          <div className="p-4 text-center text-xs opacity-50 italic pointer-events-none">No files in directory</div>
        ) : (
          <div className="space-y-0.5">
            {fileTree.map((file) => (
              <FileTreeItem key={file.path} node={file} depth={0} />
            ))}
          </div>
        )}
      </div>

      {contextMenu && (
        <EmptySpaceContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFile={() => startCreateItem(false, currentDir)}
          onNewFolder={() => startCreateItem(true, currentDir)}
        />
      )}
    </div>
  )
}
