import React from 'react'
import { X, Settings, Compass, Columns2, SaveAll } from 'lucide-react'
import { useIDEStore, FileNode } from '@/store/useIDEStore'
import { renderFileOrFolderIcon } from '@/utils/fileIcons'
import { formatShortcut } from '@/utils/platform'

interface EditorTabBarProps {
  paneId: 1 | 2
  files: FileNode[]
  activeFile: FileNode | null
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({
  paneId,
  files,
  activeFile,
  onContextMenu,
}) => {
  const {
    setActiveFileInPane,
    requestCloseFile,
    splitEditorOpen,
    toggleSplitEditor,
    saveAllFiles,
    closeAllTabsInPane,
    currentDir,
    openFileInPane,
  } = useIDEStore()

  const hasDirtyFiles = files.some(f => f.isDirty)

  const handleDoubleClickEmpty = () => {
    if (currentDir) {
      useIDEStore.getState().setActiveSidebarTab('explorer')
      useIDEStore.getState().setSidebarOpen(true)
      window.dispatchEvent(new CustomEvent('trigger-new-file'))
    } else {
      openFileInPane({ name: 'Untitled-1', path: 'untitled://Untitled-1', is_dir: false, content: '' }, paneId)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-ide-tab-inactive, var(--color-ide-sidebar))',
        borderColor: 'var(--color-ide-border)',
        color: 'var(--color-ide-text)',
      }}
      className="flex h-[35px] border-b overflow-x-auto no-scrollbar select-none justify-between items-center pr-2 shrink-0"
    >
      <div 
        className="flex flex-1 overflow-x-auto no-scrollbar h-full"
        onDoubleClick={(e) => {
          if (e.target === e.currentTarget) {
            handleDoubleClickEmpty()
          }
        }}
      >
        {files.length === 0 ? (
          <div className="flex items-center px-4 text-xs opacity-60 italic">
            Pane {paneId} (Empty)
          </div>
        ) : (
          files.map((file, idx) => {
            const isActive = activeFile?.path === file.path
            const isSettingsTab = file.path === 'settings://preferences'
            const isWelcomeTab = file.path === 'welcome://get-started'

            return (
              <div
                key={file.path}
                onMouseDown={(e) => {
                  // Middle click (wheel click) closes tab instantly
                  if (e.button === 1) {
                    e.preventDefault()
                    e.stopPropagation()
                    requestCloseFile(file.path, paneId)
                  }
                }}
                onPointerDown={(e) => {
                  if (e.button !== 0) return
                  useIDEStore.getState().setPendingDragPayload({
                    type: 'tab',
                    file,
                    fromPane: paneId,
                    fromIndex: idx,
                  })
                  useIDEStore.getState().setDragStartCoords({ x: e.clientX, y: e.clientY })
                }}
                onClick={() => setActiveFileInPane(file, paneId)}
                onContextMenu={(e) => onContextMenu(e, file)}
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-ide-tab-active, var(--color-ide-bg))'
                    : 'var(--color-ide-tab-inactive, var(--color-ide-sidebar))',
                  borderColor: 'var(--color-ide-border)',
                  color: isActive ? 'var(--color-ide-text)' : 'var(--color-ide-muted)',
                }}
                className={`flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r text-[13px] cursor-pointer group transition-colors ${
                  isActive
                    ? 'border-t-2 border-t-ide-accent font-medium'
                    : 'border-t-2 border-t-transparent hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                title={file.path}
              >
                {isSettingsTab ? (
                  <Settings size={13} className="text-ide-accent shrink-0" />
                ) : isWelcomeTab ? (
                  <Compass size={13} className="text-purple-500 shrink-0" />
                ) : (
                  renderFileOrFolderIcon(file.name, false, false)
                )}
                <span className="truncate flex-1">{file.name}</span>

                {/* Close Button with Dirty Dot Morph */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    requestCloseFile(file.path, paneId)
                  }}
                  className={`group/close p-1 rounded hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer relative flex items-center justify-center ${
                    isActive || file.isDirty
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title={file.isDirty ? "Unsaved changes (Click to close)" : "Close (Cmd+W)"}
                >
                  {file.isDirty ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-white group-hover/close:hidden" />
                      <X size={12} className="hidden group-hover/close:block text-white" />
                    </>
                  ) : (
                    <X size={12} className="opacity-70 hover:opacity-100" />
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Action Toolbar on Top Right of Tab Bar */}
      <div className="flex items-center gap-1 shrink-0 pl-1">
        {hasDirtyFiles && (
          <button
            onClick={() => saveAllFiles()}
            className="p-1 rounded transition-colors cursor-pointer text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
            title={`Save All Files (${formatShortcut('Cmd+Alt+S')})`}
          >
            <SaveAll size={14} />
          </button>
        )}

        {paneId === 1 && (
          <button
            onClick={toggleSplitEditor}
            className={`p-1.5 rounded transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 ${
              splitEditorOpen ? 'text-ide-accent bg-ide-accent/20 opacity-100' : ''
            }`}
            title={splitEditorOpen ? 'Close Split Editor' : `Split Editor Right (${formatShortcut('Cmd+\\')})`}
          >
            <Columns2 size={14} />
          </button>
        )}

        {files.length > 0 && (
          <button
            onClick={() => closeAllTabsInPane(paneId)}
            className="p-1.5 rounded transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-xs"
            title="Close All Tabs in Pane"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
