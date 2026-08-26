import React, { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { 
  FilePlus, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Copy, 
  FolderSearch 
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
    if (confirm(`Are you sure you want to delete '${node.name}'?`)) {
      await deletePathItem(node.path)
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
