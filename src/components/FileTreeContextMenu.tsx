import React, { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { ask } from '@tauri-apps/plugin-dialog'
import { toast } from 'react-hot-toast'
import { 
  FilePlus, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Copy, 
  FolderSearch,
  History
} from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'

interface FileTreeContextMenuProps {
  x: number
  y: number
  node: FileNode
  onClose: () => void
  onNewFile: () => void
  onNewFolder: () => void
  onRename: () => void
}

export const FileTreeContextMenu: React.FC<FileTreeContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
}) => {
  const { currentDir, deletePathItem } = useIDEStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(node.path)
    } catch {
      // ignore
    }
    onClose()
  }

  const handleCopyRelativePath = async () => {
    try {
      const rel = node.path.replace(currentDir, '').replace(/^[/\\]/, '')
      await navigator.clipboard.writeText(rel)
    } catch {
      // ignore
    }
    onClose()
  }

  const handleReveal = async () => {
    try {
      await invoke('reveal_in_file_manager', { path: node.path })
    } catch (err) {
      console.error('Failed to reveal file:', err)
    }
    onClose()
  }

  const handleDelete = async () => {
    const confirmed = await ask(`Are you sure you want to delete '${node.name}'?`, {
      title: 'Delete Confirmation',
      kind: 'warning',
    })
    if (confirmed) {
      await deletePathItem(node.path)
      toast.success(`Deleted ${node.name}`)
    }
    onClose()
  }

  const handleShowLocalHistory = async () => {
    if (node.is_dir) return
    const { getLocalHistory } = await import('../utils/localHistory')
    const history = await getLocalHistory(node.path)
    if (history.length === 0) {
      toast.error('No local history found for this file yet.')
    } else {
      // For now we just alert, a full modal could be built in the future
      toast.success(`Found ${history.length} snapshots for ${node.name}. Latest was saved at ${new Date(history[history.length-1].timestamp).toLocaleString()}`, { duration: 4000 })
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 w-56 bg-[#252526] border border-ide-border rounded-md shadow-2xl py-1 text-xs text-[#cccccc] select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {node.is_dir && (
        <>
          <button
            onClick={() => {
              onNewFile()
              onClose()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            <FilePlus size={14} className="text-[#80a4c2]" />
            <span className="flex-1">New File...</span>
          </button>

          <button
            onClick={() => {
              onNewFolder()
              onClose()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            <FolderPlus size={14} className="text-yellow-400" />
            <span className="flex-1">New Folder...</span>
          </button>

          <div className="h-[1px] bg-ide-border my-1" />
        </>
      )}

      <button
        onClick={() => {
          onRename()
          onClose()
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
      >
        <Edit3 size={14} />
        <span className="flex-1">Rename...</span>
        <span className="text-[10px] opacity-70">Enter</span>
      </button>

      <button
        onClick={handleDelete}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-pointer transition-colors text-left text-red-400"
      >
        <Trash2 size={14} />
        <span className="flex-1">Delete</span>
        <span className="text-[10px] opacity-70">⌫</span>
      </button>

      <div className="h-[1px] bg-ide-border my-1" />

      {!node.is_dir && (
        <button
          onClick={handleShowLocalHistory}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
        >
          <History size={14} className="text-[#a8c7fa]" />
          <span className="flex-1">Show Local History</span>
        </button>
      )}

      <button
        onClick={handleCopyPath}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
      >
        <Copy size={14} />
        <span className="flex-1">Copy Path</span>
      </button>

      <button
        onClick={handleCopyRelativePath}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
      >
        <Copy size={14} />
        <span className="flex-1">Copy Relative Path</span>
      </button>

      <button
        onClick={handleReveal}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
      >
        <FolderSearch size={14} />
        <span className="flex-1">Reveal in Finder / Explorer</span>
      </button>
    </div>
  )
}
