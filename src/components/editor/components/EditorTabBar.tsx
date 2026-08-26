import React from 'react'
import { X, Settings, Compass, Columns2 } from 'lucide-react'
import { useIDEStore, FileNode } from '@/store/useIDEStore'
import { renderFileOrFolderIcon } from '@/utils/fileIcons'
import { formatShortcut } from '@/utils/platform'

interface EditorTabBarProps {
  paneId: 1 | 2
  files: FileNode[]
  activeFile: FileNode | null
  onTabDragStart: (e: React.DragEvent, file: FileNode, index: number) => void
  onTabDragEnd: () => void
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({
  paneId,
  files,
  activeFile,
  onTabDragStart,
  onTabDragEnd,
  onContextMenu,
}) => {
  const {
    setActiveFileInPane,
    requestCloseFile,
    splitEditorOpen,
    toggleSplitEditor,
  } = useIDEStore()

  return (
    <div className="flex bg-[#181818] h-[35px] border-b border-ide-border overflow-x-auto no-scrollbar select-none justify-between items-center pr-2 shrink-0">
      <div className="flex flex-1 overflow-x-auto no-scrollbar h-full">
        {files.length === 0 ? (
          <div className="flex items-center px-4 text-xs text-ide-muted italic">
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
                draggable={true}
                onDragStart={(e) => onTabDragStart(e, file, idx)}
                onDragEnd={onTabDragEnd}
                onClick={() => setActiveFileInPane(file, paneId)}
                onContextMenu={(e) => onContextMenu(e, file)}
                className={`flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-ide-border text-[13px] cursor-pointer group transition-colors ${
                  isActive
                    ? 'bg-ide-bg border-t-2 border-t-ide-accent text-white font-medium'
                    : 'bg-[#181818] border-t-2 border-t-transparent text-ide-muted hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                {isSettingsTab ? (
                  <Settings size={13} className="text-[#4fc1ff] shrink-0" />
                ) : isWelcomeTab ? (
                  <Compass size={13} className="text-purple-400 shrink-0" />
                ) : (
                  renderFileOrFolderIcon(file.name, false, false)
                )}
                <span className="truncate flex-1">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    requestCloseFile(file.path, paneId)
                  }}
                  className={`p-0.5 rounded hover:bg-white/15 cursor-pointer ${
                    isActive
                      ? 'opacity-100 text-white'
                      : file.isDirty
                      ? 'opacity-100 text-white'
                      : 'opacity-0 group-hover:opacity-100 text-ide-muted hover:text-white'
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
          className={`p-1.5 rounded transition-colors cursor-pointer text-[#888] hover:text-white hover:bg-white/10 ${
            splitEditorOpen ? 'text-ide-accent bg-ide-accent/20' : ''
          }`}
          title={splitEditorOpen ? 'Close Split Editor' : `Split Editor Right (${formatShortcut('Cmd+\\')})`}
        >
          <Columns2 size={15} />
        </button>
      )}
    </div>
  )
}
