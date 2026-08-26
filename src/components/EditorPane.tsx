import React, { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import Editor from '@monaco-editor/react'
import { X, Circle, ChevronRight, FileCode2, Save, Columns2, Settings, Compass } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { registerMonacoThemes } from '../utils/themes'
import { getLanguageFromFilename } from '../utils/languages'
import { useAutoSave } from '../hooks/useAutoSave'
import { TabContextMenu } from './TabContextMenu'
import { SettingsView } from './SettingsView'
import { WelcomeView } from './WelcomeView'

interface SinglePaneProps {
  paneId: 1 | 2
  files: FileNode[]
  activeFile: FileNode | null
  isActivePane: boolean
}

const SinglePane: React.FC<SinglePaneProps> = ({
  paneId,
  files,
  activeFile,
  isActivePane,
}) => {
  const {
    setActiveFileInPane,
    requestCloseFile,
    setFileDirty,
    setFileContent,
    setActivePane,
    saveFile,
    settings,
    toggleSplitEditor,
    splitEditorOpen,
    reorderTabsInPane,
    moveTabBetweenPanes,
    openFileInPane,
  } = useIDEStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(
    null
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const { triggerAutoSave } = useAutoSave()

  // Fetch file content when active file changes if not already in store
  useEffect(() => {
    if (!activeFile) return
    if (activeFile.path.startsWith('settings://') || activeFile.path.startsWith('welcome://')) return
    if (activeFile.content !== undefined) return

    let isMounted = true
    const fetchContent = async () => {
      try {
        const content = await invoke<string>('read_file', { path: activeFile.path })
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = (editor: any, monaco: any) => {
    registerMonacoThemes(monaco)

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        saveFile(activeFile.path)
      }
    })

    if (monaco.languages?.typescript?.typescriptDefaults) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTextExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
      })
    }
  }

  const handleTabContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file,
    })
  }

  // Tab Drag and Drop handling
  const handleTabDragStart = (e: React.DragEvent, file: FileNode, index: number) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'tab',
        path: file.path,
        pane: paneId,
        index,
      })
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTabDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.type === 'tab') {
        if (data.pane === paneId) {
          reorderTabsInPane(paneId, data.index, targetIndex)
        } else {
          moveTabBetweenPanes(data.path, data.pane, paneId, targetIndex)
        }
      } else if (data.name && data.path) {
        openFileInPane(data, paneId)
      }
    } catch {
      // ignore
    }
  }

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.type === 'tab') {
        if (data.pane !== paneId) {
          moveTabBetweenPanes(data.path, data.pane, paneId)
        }
      } else if (data.name && data.path) {
        openFileInPane(data, paneId)
      }
    } catch {
      // ignore
    }
  }

  const pathSegments = activeFile ? activeFile.path.split(/[/\\]/).filter(Boolean) : []
  const editorValue = activeFile?.content ?? ''

  return (
    <div
      className={`flex-1 flex flex-col min-w-0 h-full border-r border-ide-border last:border-r-0 relative ${
        isActivePane ? 'ring-1 ring-ide-accent/40' : ''
      } ${isDragOver ? 'bg-ide-accent/5' : ''}`}
      onClick={() => setActivePane(paneId)}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleContainerDrop}
    >
      {/* Tab Bar Header */}
      <div
        className="flex bg-[#181818] h-[35px] border-b border-ide-border overflow-x-auto no-scrollbar select-none justify-between items-center pr-2"
        onDragOver={(e) => e.preventDefault()}
      >
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
                  onDragStart={(e) => handleTabDragStart(e, file, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleTabDrop(e, idx)}
                  onClick={() => setActiveFileInPane(file, paneId)}
                  onContextMenu={(e) => handleTabContextMenu(e, file)}
                  className={`flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-ide-border text-[13px] cursor-pointer group transition-colors ${
                    isActive
                      ? 'bg-ide-bg border-t-2 border-t-ide-accent text-white font-medium'
                      : 'bg-[#181818] border-t-2 border-t-transparent text-ide-muted hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  {isSettingsTab && <Settings size={13} className="text-[#4fc1ff] shrink-0" />}
                  {isWelcomeTab && <Compass size={13} className="text-purple-400 shrink-0" />}
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
                        : 'opacity-0 group-hover:opacity-100 text-ide-muted'
                    }`}
                    title={file.isDirty ? 'Unsaved changes' : 'Close Tab (Cmd+W)'}
                  >
                    {file.isDirty ? <Circle size={9} fill="currentColor" /> : <X size={13} />}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Split Editor Toggle Action */}
        {paneId === 1 && (
          <button
            onClick={toggleSplitEditor}
            className={`p-1.5 rounded transition-colors cursor-pointer text-[#888] hover:text-white hover:bg-white/10 ${
              splitEditorOpen ? 'text-ide-accent bg-ide-accent/20' : ''
            }`}
            title={splitEditorOpen ? 'Close Split Editor' : 'Split Editor Right (Cmd+\\)'}
          >
            <Columns2 size={15} />
          </button>
        )}
      </div>

      {/* Breadcrumb Path Bar */}
      {activeFile && (
        <div className="h-6 bg-ide-bg border-b border-ide-border/50 px-3 flex items-center text-[11px] text-ide-muted select-none">
          {activeFile.path === 'settings://preferences' ? (
            <div className="flex items-center gap-1">
              <Settings size={12} className="mr-1 text-[#4fc1ff] shrink-0" />
              <span>Preferences</span>
              <ChevronRight size={10} className="text-ide-muted/60" />
              <span className="text-white/90 font-medium">Settings</span>
            </div>
          ) : activeFile.path === 'welcome://get-started' ? (
            <div className="flex items-center gap-1">
              <Compass size={12} className="mr-1 text-purple-400 shrink-0" />
              <span>Cekcok</span>
              <ChevronRight size={10} className="text-ide-muted/60" />
              <span className="text-white/90 font-medium">Get Started</span>
            </div>
          ) : (
            <>
              <FileCode2 size={12} className="mr-1.5 text-[#80a4c2] shrink-0" />
              <div className="flex items-center gap-1 truncate">
                {pathSegments.map((segment, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight size={10} className="text-ide-muted/60" />}
                    <span
                      className={
                        idx === pathSegments.length - 1
                          ? 'text-white/90 font-medium'
                          : 'hover:text-white cursor-pointer'
                      }
                    >
                      {segment}
                    </span>
                  </div>
                ))}
              </div>
              {activeFile.isDirty && (
                <button
                  onClick={() => saveFile(activeFile.path)}
                  className="ml-auto text-[10px] text-ide-accent hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                  title="Save file (Cmd+S)"
                >
                  <Save size={11} /> Save
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Canvas Area: Settings, Welcome, or Monaco Editor */}
      <div className="flex-1 relative overflow-hidden">
        {activeFile ? (
          activeFile.path === 'settings://preferences' ? (
            <SettingsView />
          ) : activeFile.path === 'welcome://get-started' ? (
            <WelcomeView />
          ) : (
            <Editor
              height="100%"
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
                minimap: { enabled: settings.minimapEnabled, scale: 0.75 },
                fontSize: settings.fontSize,
                tabSize: settings.tabSize,
                wordWrap: settings.wordWrap,
                padding: { top: 12 },
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
              }}
            />
          )
        ) : paneId === 1 && !splitEditorOpen ? (
          <WelcomeView />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-ide-muted space-y-3 select-none">
            <div className="text-lg font-semibold text-white/30">Cekcok Editor (Pane {paneId})</div>
            <div className="text-xs text-[#888]">Select a file from the explorer or drag one here</div>
          </div>
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
    </div>
  )
}

export const EditorPane: React.FC = () => {
  const {
    splitEditorOpen,
    splitRatio,
    setSplitRatio,
    activePane,
    pane1Files,
    pane1ActiveFile,
    pane2Files,
    pane2ActiveFile,
  } = useIDEStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = (moveEvent.clientX - rect.left) / rect.width
      setSplitRatio(newRatio)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <main ref={containerRef} className="flex-1 flex flex-row bg-ide-bg overflow-hidden min-w-0 relative">
      <div
        style={{ width: splitEditorOpen ? `${splitRatio * 100}%` : '100%' }}
        className="h-full flex flex-col min-w-0"
      >
        <SinglePane
          paneId={1}
          files={pane1Files}
          activeFile={pane1ActiveFile}
          isActivePane={activePane === 1}
        />
      </div>

      {splitEditorOpen && (
        <>
          {/* Draggable Split Divider */}
          <div
            onMouseDown={handleSplitMouseDown}
            className="w-1 hover:w-1.5 bg-ide-border hover:bg-ide-accent cursor-col-resize z-20 transition-all shrink-0 h-full select-none"
            title="Drag to resize split panes"
          />

          <div
            style={{ width: `${(1 - splitRatio) * 100}%` }}
            className="h-full flex flex-col min-w-0"
          >
            <SinglePane
              paneId={2}
              files={pane2Files}
              activeFile={pane2ActiveFile}
              isActivePane={activePane === 2}
            />
          </div>
        </>
      )}
    </main>
  )
}
