import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useIDEStore, FileNode } from '@/store/useIDEStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { getLanguageFromFilename } from '@/utils/languages'
import { safeInvoke } from '@/utils/tauriBridge'
import { TabContextMenu } from '@/components/TabContextMenu'
import { SettingsView } from '@/components/SettingsView'
import { WelcomeView } from '@/components/WelcomeView'
import { SinglePaneProps, TabContextMenuState } from '../types'
import { useMonacoSetup } from '../hooks/useMonacoSetup'
import { useMonacoViewState } from '../hooks/useMonacoViewState'
import { usePaneDragDrop } from '../hooks/usePaneDragDrop'
import { DropZoneOverlay } from './DropZoneOverlay'
import { EmptyEditorWatermark } from './EmptyEditorWatermark'
import { EditorBreadcrumbs } from './EditorBreadcrumbs'
import { EditorTabBar } from './EditorTabBar'

export const SinglePane: React.FC<SinglePaneProps> = ({
  paneId,
  files,
  activeFile,
  isActivePane,
}) => {
  const {
    currentDir,
    setActivePane,
    setFileContent,
    setFileDirty,
    splitEditorOpen,
    settings,
  } = useIDEStore()

  const { triggerAutoSave } = useAutoSave()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorInstanceRef = useRef<any>(null)
  const paneContainerRef = useRef<HTMLDivElement>(null)

  const [contextMenu, setContextMenu] = useState<TabContextMenuState | null>(null)

  // Custom Hooks for separation of concerns
  const { handleEditorMount } = useMonacoSetup(activeFile, editorInstanceRef)
  useMonacoViewState(activeFile, editorInstanceRef)
  const {
    isDraggingFile,
  } = usePaneDragDrop(paneId)

  // Fetch file content when active file changes if not already loaded in store
  useEffect(() => {
    if (!activeFile) return
    if (activeFile.path.startsWith('settings://') || activeFile.path.startsWith('welcome://')) return
    if (activeFile.content !== undefined) return

    let isMounted = true
    const fetchContent = async () => {
      try {
        const content = await safeInvoke<string>('read_file', { path: activeFile.path })
        if (isMounted) {
          setFileContent(activeFile.path, content)
          setFileDirty(activeFile.path, false)
        }
      } catch (error) {
        if (isMounted) {
          setFileContent(activeFile.path, `// Error loading file:\n${error}`)
        }
      }
    }
    fetchContent()

    return () => {
      isMounted = false
    }
  }, [activeFile, setFileContent, setFileDirty])

  const handleTabContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file,
    })
  }

  const handleFormat = () => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.getAction('editor.action.formatDocument')?.run()
    }
  }

  const editorValue = activeFile?.content ?? ''

  return (
    <div
      ref={paneContainerRef}
      className={`flex-1 flex flex-col min-w-0 min-h-0 h-full border-r border-ide-border last:border-r-0 relative overflow-hidden ${
        isActivePane ? 'ring-1 ring-ide-accent/40' : ''
      }`}
      onClick={() => setActivePane(paneId)}
    >
      {/* Tab Bar Header */}
      <EditorTabBar
        paneId={paneId}
        files={files}
        activeFile={activeFile}
        onContextMenu={handleTabContextMenu}
      />

      {/* Editor Breadcrumbs */}
      {activeFile && (
        <EditorBreadcrumbs 
          path={activeFile.path} 
          currentDir={currentDir} 
          onFormat={handleFormat}
        />
      )}

      {/* Main Canvas Area: Settings, Welcome, or Monaco Editor */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeFile ? (
          activeFile.path === 'settings://preferences' ? (
            <SettingsView />
          ) : activeFile.path === 'welcome://get-started' ? (
            <WelcomeView />
          ) : (
            <div className={`absolute inset-0 w-full h-full overflow-hidden ${isDraggingFile ? 'pointer-events-none' : ''}`}>
              <Editor
                height="100%"
                width="100%"
                theme={settings.theme}
                path={`${paneId}-${activeFile.path}`}
                language={getLanguageFromFilename(activeFile.name)}
                value={editorValue}
                onChange={(val) => {
                  const newContent = val || ''
                  setFileContent(activeFile.path, newContent)
                  if (!activeFile.isDirty) {
                    setFileDirty(activeFile.path, true)
                  }
                  triggerAutoSave(activeFile.path)
                }}
                onMount={handleEditorMount}
                options={{
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  minimap: { enabled: settings.minimapEnabled, scale: 0.75 },
                  fontSize: settings.fontSize,
                  tabSize: settings.tabSize,
                  wordWrap: settings.wordWrap,
                  padding: { top: 8, bottom: 12 },
                  fontFamily: settings.fontFamily,
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true, indentation: true },
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: { other: true, comments: false, strings: true },
                  formatOnPaste: true,
                  formatOnType: true,
                  fixedOverflowWidgets: true,
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    useShadows: false,
                  },
                }}
              />
            </div>
          )
        ) : paneId === 1 && !splitEditorOpen ? (
          <WelcomeView />
        ) : (
          <EmptyEditorWatermark />
        )}
      </div>

      {/* Tab Context Menu */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          pane={paneId}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Drop Zone Previews & Monaco Drag Interception Overlay */}
      <DropZoneOverlay
        isDraggingFile={isDraggingFile}
        paneId={paneId}
      />
    </div>
  )
}
