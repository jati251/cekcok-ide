import { useEffect, useRef } from 'react'
import { X, Columns2, MoreHorizontal, Copy, FolderSearch, RotateCcw, CheckCheck, Save } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { formatShortcut } from '../utils/platform'
import { safeInvoke } from '../utils/tauriBridge'
import { toast } from 'react-hot-toast'

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
    closeSavedTabsInPane,
    closeAllTabsInPane,
    openFileInPane,
    setSplitEditorOpen,
    reopenLastClosedTab,
    saveFile,
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

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path)
    toast.success('Path copied')
    onClose()
  }

  const handleReveal = async () => {
    try {
      await safeInvoke('reveal_in_file_manager', { path: file.path })
    } catch {
      toast.error('Could not reveal file')
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed z-50 min-w-[200px] bg-[#252526] border border-ide-border rounded shadow-2xl py-1 text-xs select-none text-[#cccccc]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => handleAction(() => requestCloseFile(file.path, pane))}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <span>Close</span>
        <span className="text-[10px] opacity-70 font-mono">{formatShortcut('Cmd+W')}</span>
      </button>

      {file.isDirty && (
        <button
          onClick={() => handleAction(() => saveFile(file.path))}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Save size={13} className="text-emerald-400" />
            <span>Save</span>
          </div>
          <span className="text-[10px] opacity-70 font-mono">{formatShortcut('Cmd+S')}</span>
        </button>
      )}

      <div className="h-[1px] bg-ide-border/50 my-1" />

      <button
        onClick={() => handleAction(() => closeOtherTabsInPane(file.path, pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <MoreHorizontal size={13} />
        <span>Close Others</span>
      </button>

      <button
        onClick={() => handleAction(() => closeTabsToRightInPane(file.path, pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <span>Close to the Right</span>
      </button>

      <button
        onClick={() => handleAction(() => closeSavedTabsInPane(pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <CheckCheck size={13} />
        <span>Close Saved</span>
      </button>

      <button
        onClick={() => handleAction(() => closeAllTabsInPane(pane))}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <X size={13} />
        <span>Close All</span>
      </button>

      <button
        onClick={() => handleAction(() => reopenLastClosedTab())}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <RotateCcw size={13} />
          <span>Reopen Closed Tab</span>
        </div>
        <span className="text-[10px] opacity-70 font-mono">{formatShortcut('Cmd+Shift+T')}</span>
      </button>

      <div className="h-[1px] bg-ide-border/50 my-1" />

      <button
        onClick={() => handleAction(() => {
          openFileInPane(file, 2)
          setSplitEditorOpen(true)
        })}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <Columns2 size={13} />
        <span>Split Right</span>
      </button>

      <div className="h-[1px] bg-ide-border/50 my-1" />

      <button
        onClick={handleCopyPath}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
      >
        <Copy size={13} />
        <span>Copy Path</span>
      </button>

      {!file.path.startsWith('settings://') && !file.path.startsWith('welcome://') && (
        <button
          onClick={handleReveal}
          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
        >
          <FolderSearch size={13} />
          <span>Reveal in File Manager</span>
        </button>
      )}
    </div>
  )
}
