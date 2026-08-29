import React from 'react'
import { FilePlus, FolderPlus, ClipboardPaste, Coffee, FileCode } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { useClickOutside } from '../hooks/useClickOutside'

interface EmptySpaceContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onNewFile: () => void
  onNewFolder: () => void
}

export const EmptySpaceContextMenu: React.FC<EmptySpaceContextMenuProps> = ({
  x,
  y,
  onClose,
  onNewFile,
  onNewFolder,
}) => {
  const { fileClipboard, pasteFileToDir, currentDir } = useIDEStore()
  const menuRef = useClickOutside<HTMLDivElement>(onClose, true)

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 w-52 bg-[#252526] border border-ide-border rounded-md shadow-2xl py-1 text-xs text-[#cccccc] select-none"
      onClick={(e) => e.stopPropagation()}
    >
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

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('trigger-new-node-file', { detail: { targetDir: currentDir } }))
          onClose()
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-cyan-600 hover:text-white cursor-pointer transition-colors text-left text-cyan-400"
      >
        <FileCode size={14} className="text-cyan-400" />
        <span className="flex-1">New TypeScript / React File...</span>
      </button>

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('trigger-new-java-file', { detail: { targetDir: currentDir } }))
          onClose()
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors text-left text-emerald-400"
      >
        <Coffee size={14} className="text-emerald-400" />
        <span className="flex-1">New Java / Spring File...</span>
      </button>

      <div className="h-[1px] bg-ide-border my-1" />

      <button
        onClick={() => {
          pasteFileToDir(currentDir)
          onClose()
        }}
        disabled={!fileClipboard}
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors text-left ${
          fileClipboard 
            ? 'hover:bg-ide-accent hover:text-white cursor-pointer' 
            : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <ClipboardPaste size={14} />
        <span className="flex-1">Paste</span>
      </button>
    </div>
  )
}
