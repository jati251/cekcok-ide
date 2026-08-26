import { useEffect, useRef } from 'react'
import { X, Columns2, MoreHorizontal } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'

interface TabContextMenuProps {
  x: number
  y: number
  file: FileNode
  pane: 1 | 2
  onClose: () => void
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  x,
  y,
  file,
  pane,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    requestCloseFile,
    closeOtherTabsInPane,
    closeTabsToRightInPane,
    closeAllTabsInPane,
    openFileInPane,
    setSplitEditorOpen
  } = useIDEStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed z-50 min-w-[180px] bg-[#252526] border border-ide-border rounded shadow-2xl py-1 text-xs select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => handleAction(() => requestCloseFile(file.path, pane))}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white text-[#cccccc] cursor-pointer text-left"
      >
        <span>Close</span>
        <span className="text-[10px] opacity-70 font-mono">Cmd+W</span>
      </button>

      <div className="h-[1px] bg-ide-border/50 my-1" />

      <button
        onClick={() => handleAction(() => closeOtherTabsInPane(file.path, pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white text-[#cccccc] cursor-pointer text-left"
      >
        <MoreHorizontal size={13} />
        <span>Close Others</span>
      </button>

      <button
        onClick={() => handleAction(() => closeTabsToRightInPane(file.path, pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white text-[#cccccc] cursor-pointer text-left"
      >
        <span>Close to the Right</span>
      </button>

      <button
        onClick={() => handleAction(() => closeAllTabsInPane(pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white text-[#cccccc] cursor-pointer text-left"
      >
        <X size={13} />
        <span>Close All</span>
      </button>

      <div className="h-[1px] bg-ide-border/50 my-1" />

      <button
        onClick={() => handleAction(() => {
          openFileInPane(file, 2)
          setSplitEditorOpen(true)
        })}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white text-[#cccccc] cursor-pointer text-left"
      >
        <Columns2 size={13} />
        <span>Split Right</span>
      </button>
    </div>
  )
}
