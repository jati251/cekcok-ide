import React from 'react'
import { X, Settings, Compass, Columns2 } from 'lucide-react'
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
  } = useIDEStore()

  return (
    <div
      style={{
        backgroundColor: 'var(--color-ide-tab-inactive, var(--color-ide-sidebar))',
        borderColor: 'var(--color-ide-border)',
        color: 'var(--color-ide-text)',
      }}
      className="flex h-[35px] border-b overflow-x-auto no-scrollbar select-none justify-between items-center pr-2 shrink-0"
    >
      <div className="flex flex-1 overflow-x-auto no-scrollbar h-full">
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
              >
                {isSettingsTab ? (
                  <Settings size={13} className="text-ide-accent shrink-0" />
                ) : isWelcomeTab ? (
                  <Compass size={13} className="text-purple-500 shrink-0" />
                ) : (
                  renderFileOrFolderIcon(file.name, false, false)
                )}
                <span className="truncate flex-1">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    requestCloseFile(file.path, paneId)
                  }}
                  className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer ${
                    isActive || file.isDirty
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Close (Cmd+W)"
                >
                  {file.isDirty ? (
                    <div className="w-2 h-2 rounded-full bg-ide-accent" />
                  ) : (
                    <X size={12} />
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>

      {paneId === 1 && (
        <button
          onClick={toggleSplitEditor}
          className={`p-1.5 rounded transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 ${
            splitEditorOpen ? 'text-ide-accent bg-ide-accent/20 opacity-100' : ''
          }`}
          title={splitEditorOpen ? 'Close Split Editor' : `Split Editor Right (${formatShortcut('Cmd+\\')})`}
        >
          <Columns2 size={15} />
        </button>
      )}
    </div>
  )
}
