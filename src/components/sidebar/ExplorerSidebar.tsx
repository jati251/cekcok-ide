import React, { useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { motion } from 'framer-motion'
import { open } from '@tauri-apps/plugin-dialog'
import { toast } from 'react-hot-toast'
import { FilePlus, FolderPlus, RefreshCw, ChevronsDownUp, Eye, EyeOff } from 'lucide-react'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import { FileTreeItem } from '../FileTreeItem'
import { EmptySpaceContextMenu } from '../EmptySpaceContextMenu'

export const ExplorerSidebar: React.FC = () => {
  const {
    currentDir,
    fileTree,
    setFileTree,
    setCurrentDir,
    openFile,
    collapseAllFolders,
    settings,
    updateSettings,
  } = useIDEStore()

  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

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
      toast.error(`Error creating ${isDir ? 'folder' : 'file'}: ${error}`)
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
    <div className="flex flex-col h-full">
      <div
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
          color: 'var(--color-ide-muted)',
        }}
        className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b"
      >
        <span
          style={{ color: 'var(--color-ide-text)' }}
          className="truncate max-w-[120px] font-mono text-[11px] font-bold"
          title={currentDir}
        >
          {rootFolderName}
        </span>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => handleCreateNode(false)}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => handleCreateNode(true)}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={() => {
              updateSettings({ showHiddenFiles: !settings.showHiddenFiles })
              setTimeout(() => loadDirectory(currentDir), 50)
            }}
            className={`transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer ${
              settings.showHiddenFiles ? 'text-ide-accent bg-ide-accent/15' : 'opacity-70 hover:opacity-100'
            }`}
            title={settings.showHiddenFiles ? 'Hide Hidden Files (dotfiles)' : 'Show Hidden Files (.env, .gitignore)'}
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => {
              updateSettings({ showIgnoredFiles: !settings.showIgnoredFiles })
            }}
            className={`transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer ${
              settings.showIgnoredFiles ? 'text-ide-accent bg-ide-accent/15' : 'opacity-70 hover:opacity-100'
            }`}
            title={settings.showIgnoredFiles ? 'Hide Ignored Files (.gitignore)' : 'Show Ignored Files (.gitignore)'}
          >
            <EyeOff size={13} />
          </button>
          <button
            onClick={collapseAllFolders}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
            title="Collapse All Folders"
          >
            <ChevronsDownUp size={14} />
          </button>
          <button
            onClick={() => loadDirectory(currentDir)}
            className="opacity-70 hover:opacity-100 transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
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

      <div 
        className="flex-1 overflow-y-auto p-1.5 space-y-0.5"
        onContextMenu={handleContextMenu}
      >
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#888] italic pointer-events-none">No files in directory</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {fileTree.map((file) => (
              <motion.div
                key={file.path}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <FileTreeItem node={file} depth={0} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {contextMenu && (
        <EmptySpaceContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFile={() => handleCreateNode(false)}
          onNewFolder={() => handleCreateNode(true)}
        />
      )}
    </div>
  )
}
