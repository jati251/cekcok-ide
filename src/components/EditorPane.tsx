import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import {
  X,
  Circle,
  ChevronRight,
  FileCode2,
  Save,
  Columns2,
  Settings,
  Compass,
  Plus,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp
} from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { registerMonacoThemes } from '../utils/themes'
import { getLanguageFromFilename } from '../utils/languages'
import { useAutoSave } from '../hooks/useAutoSave'
import { TabContextMenu } from './TabContextMenu'
import { SettingsView } from './SettingsView'
import { WelcomeView } from './WelcomeView'
import { formatShortcut } from '../utils/platform'
import { safeInvoke } from '../utils/tauriBridge'

type DropZonePosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | null

const Breadcrumbs: React.FC<{ path: string; currentDir: string }> = ({ path, currentDir }) => {
  if (!path || path.startsWith('settings://') || path.startsWith('welcome://')) return null

  const relPath = path.replace(currentDir, '').replace(/^[/\\]/, '')
  const segments = relPath.split(/[/\\]/).filter(Boolean)

  if (segments.length === 0) return null

  return (
    <div className="flex items-center px-4 py-1.5 bg-[#1e1e1e] border-b border-ide-border text-[11px] text-[#888] font-mono overflow-x-auto whitespace-nowrap hide-scrollbar select-none">
      {segments.map((seg, i) => (
        <React.Fragment key={i}>
          <span className={i === segments.length - 1 ? 'text-[#cccccc]' : 'text-[#888] hover:text-[#cccccc] cursor-pointer transition-colors'}>
            {seg}
          </span>
          {i < segments.length - 1 && <span className="mx-2 text-[#555]">{'>'}</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

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
    currentDir,
    setActiveFileInPane,
    requestCloseFile,
    setFileDirty,
    setFileContent,
    setActivePane,
    saveFile,
    settings,
    updateSettings,
    toggleSplitEditor,
    setSplitEditorOpen,
    splitEditorOpen,
    moveTabBetweenPanes,
    openFileInPane,
    setDiagnostics,
    isDraggingFile,
    setIsDraggingFile,
  } = useIDEStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(
    null
  )
  const [activeDropZone, setActiveDropZone] = useState<DropZonePosition>(null)
  const paneContainerRef = useRef<HTMLDivElement>(null)

  const { triggerAutoSave } = useAutoSave()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewStateMapRef = useRef<Map<string, any>>(new Map())
  const previousFilePathRef = useRef<string | null>(null)

  // Fetch file content when active file changes if not already in store
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

  // Save and restore Monaco ViewState across tab switches
  useEffect(() => {
    if (!editorInstanceRef.current) return
    const editor = editorInstanceRef.current

    if (previousFilePathRef.current) {
      const state = editor.saveViewState()
      if (state) {
        viewStateMapRef.current.set(previousFilePathRef.current, state)
      }
    }

    if (activeFile) {
      const savedState = viewStateMapRef.current.get(activeFile.path)
      if (savedState) {
        editor.restoreViewState(savedState)
      }
      editor.focus()
    }

    previousFilePathRef.current = activeFile?.path || null
  }, [activeFile])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = (editor: any, monaco: any) => {
    editorInstanceRef.current = editor
    registerMonacoThemes(monaco)

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        saveFile(activeFile.path)
      }
    })

    monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = markers.map((m: any, idx: number) => ({
        id: `${m.resource.toString()}-${m.startLineNumber}-${m.startColumn}-${idx}`,
        file: m.resource.path.replace(/^\//, ''),
        line: m.startLineNumber,
        col: m.startColumn,
        message: m.message,
        severity: m.severity === 8 ? 'error' : m.severity === 4 ? 'warning' : 'info',
        source: m.source || 'Syntax/Type',
      }))
      setDiagnostics(items)
    })
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
        fileNode: file
      })
    )
    e.dataTransfer.effectAllowed = 'move'
    setIsDraggingFile(true)
  }

  const handleTabDragEnd = () => {
    setIsDraggingFile(false)
  }

  // Interactive Drag Over on Pane
  const handlePaneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'

    if (!paneContainerRef.current) return
    const rect = paneContainerRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height

    if (relX > 0.75) {
      setActiveDropZone('right')
    } else if (relX < 0.25) {
      setActiveDropZone('left')
    } else if (relY > 0.75) {
      setActiveDropZone('bottom')
    } else if (relY < 0.25) {
      setActiveDropZone('top')
    } else {
      setActiveDropZone('center')
    }
  }

  const handlePaneDragLeave = (e: React.DragEvent) => {
    // Only reset if left the pane container entirely
    if (!paneContainerRef.current?.contains(e.relatedTarget as Node)) {
      setActiveDropZone(null)
    }
  }

  // Direct Pane Drop with Split Trigger
  const handlePaneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)
    const dropZone = activeDropZone
    setActiveDropZone(null)

    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      const targetFile: FileNode = data.fileNode || (data.name && data.path ? data : null)
      if (!targetFile && data.path) {
        // Build file node
        const fileName = data.path.split(/[/\\]/).pop() || data.path
        openFileInPane({ name: fileName, path: data.path, is_dir: false }, paneId)
        return
      }
      if (!targetFile) return

      if (dropZone === 'right') {
        updateSettings({ splitDirection: 'vertical' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 2)
      } else if (dropZone === 'left') {
        updateSettings({ splitDirection: 'vertical' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 1)
      } else if (dropZone === 'bottom') {
        updateSettings({ splitDirection: 'horizontal' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 2)
      } else if (dropZone === 'top') {
        updateSettings({ splitDirection: 'horizontal' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 1)
      } else {
        // Center / default tab add
        if (data.type === 'tab' && data.pane !== paneId) {
          moveTabBetweenPanes(data.path, data.pane, paneId)
        } else {
          openFileInPane(targetFile, paneId)
        }
      }
    } catch {
      // ignore
    }
  }

  const pathSegments = activeFile ? activeFile.path.split(/[/\\]/).filter(Boolean) : []
  const editorValue = activeFile?.content ?? ''

  return (
    <div
      ref={paneContainerRef}
      onDragOver={handlePaneDragOver}
      onDragLeave={handlePaneDragLeave}
      onDrop={handlePaneDrop}
      className={`flex-1 flex flex-col min-w-0 min-h-0 h-full border-r border-ide-border last:border-r-0 relative overflow-hidden ${
        isActivePane ? 'ring-1 ring-ide-accent/40' : ''
      }`}
      onClick={() => setActivePane(paneId)}
    >
      {/* Visual Drop Zone Previews */}
      {activeDropZone && (
        <div className="absolute inset-0 z-50 pointer-events-none transition-all duration-150">
          {activeDropZone === 'right' && (
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-500/25 border-2 border-dashed border-blue-400 backdrop-blur-[2px] rounded-lg m-1 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowRight size={28} className="text-blue-300 mb-1" />
              <span>Split Editor Right</span>
            </div>
          )}
          {activeDropZone === 'left' && (
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/25 border-2 border-dashed border-blue-400 backdrop-blur-[2px] rounded-lg m-1 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowLeft size={28} className="text-blue-300 mb-1" />
              <span>Split Editor Left</span>
            </div>
          )}
          {activeDropZone === 'bottom' && (
            <div className="absolute left-0 right-0 bottom-0 h-1/2 bg-emerald-500/25 border-2 border-dashed border-emerald-400 backdrop-blur-[2px] rounded-lg m-1 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowDown size={28} className="text-emerald-300 mb-1" />
              <span>Split Editor Down</span>
            </div>
          )}
          {activeDropZone === 'top' && (
            <div className="absolute left-0 right-0 top-0 h-1/2 bg-emerald-500/25 border-2 border-dashed border-emerald-400 backdrop-blur-[2px] rounded-lg m-1 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowUp size={28} className="text-emerald-300 mb-1" />
              <span>Split Editor Up</span>
            </div>
          )}
          {activeDropZone === 'center' && (
            <div className="absolute inset-0 bg-ide-accent/20 border-2 border-dashed border-ide-accent backdrop-blur-[2px] rounded-lg m-1 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <Plus size={28} className="text-white mb-1" />
              <span>Open in Pane {paneId}</span>
            </div>
          )}
        </div>
      )}

      {/* Transparent overlay that captures all mouse movements over the Monaco Editor when dragging */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-40" />
      )}

      {/* Tab Bar Header */}
      <div
        className="flex bg-[#181818] h-[35px] border-b border-ide-border overflow-x-auto no-scrollbar select-none justify-between items-center pr-2 shrink-0"
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
                  onDragEnd={handleTabDragEnd}
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
                    title={file.isDirty ? 'Unsaved changes' : `Close Tab (${formatShortcut('Cmd+W')})`}
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
            title={splitEditorOpen ? 'Close Split Editor' : `Split Editor Right (${formatShortcut('Cmd+\\')})`}
          >
            <Columns2 size={15} />
          </button>
        )}
      </div>

      {/* Breadcrumb Path Bar */}
      {activeFile && (
        <div className="h-6 bg-ide-bg border-b border-ide-border/50 px-3 flex items-center text-[11px] text-ide-muted select-none shrink-0">
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
                  title={`Save file (${formatShortcut('Cmd+S')})`}
                >
                  <Save size={11} /> Save
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Editor Breadcrumbs */}
      {activeFile && (
        <Breadcrumbs path={activeFile.path} currentDir={currentDir} />
      )}

      {/* Canvas Area: Settings, Welcome, or Monaco Editor */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeFile ? (
          activeFile.path === 'settings://preferences' ? (
            <SettingsView />
          ) : activeFile.path === 'welcome://get-started' ? (
            <WelcomeView />
          ) : (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
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
          <div className="h-full flex flex-col items-center justify-center text-ide-muted select-none p-6 text-center animate-in fade-in duration-300">
            <img src="/logo.png" alt="Cekcok IDE" className="w-16 h-16 rounded-xl opacity-20 grayscale mb-6 pointer-events-none" />
            <div className="space-y-4 max-w-[300px]">
              <div className="flex justify-between items-center text-xs">
                <span>Show All Commands</span>
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">{formatShortcut('Cmd+Shift+P')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Go to File</span>
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">{formatShortcut('Cmd+P')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Find in Files</span>
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">{formatShortcut('Cmd+Shift+F')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Toggle Terminal</span>
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">{formatShortcut('Cmd+`')}</span>
              </div>
            </div>
            <div className="mt-8 text-[11px] text-[#555] max-w-[220px]">
              Drag a file from the explorer onto the edge to split, or center to open here
            </div>
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
    settings,
  } = useIDEStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // On mobile, default to horizontal stack if split is opened
  const isHorizontal = isMobile || settings.splitDirection === 'horizontal'

  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = isHorizontal
        ? (moveEvent.clientY - rect.top) / rect.height
        : (moveEvent.clientX - rect.left) / rect.width
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
    <main
      ref={containerRef}
      className={`flex-1 flex bg-ide-bg overflow-hidden min-w-0 min-h-0 relative ${
        isHorizontal ? 'flex-col' : 'flex-row'
      }`}
    >
      <div
        style={{
          width: isHorizontal ? '100%' : splitEditorOpen ? `${splitRatio * 100}%` : '100%',
          height: isHorizontal ? (splitEditorOpen ? `${splitRatio * 100}%` : '100%') : '100%',
        }}
        className="flex flex-col min-w-0 min-h-0 overflow-hidden"
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
            className={`bg-ide-border hover:bg-ide-accent z-20 transition-all shrink-0 select-none ${
              isHorizontal
                ? 'h-1 hover:h-1.5 w-full cursor-row-resize'
                : 'w-1 hover:w-1.5 h-full cursor-col-resize'
            }`}
            title="Drag to resize split panes"
          />

          <div
            style={{
              width: isHorizontal ? '100%' : `${(1 - splitRatio) * 100}%`,
              height: isHorizontal ? `${(1 - splitRatio) * 100}%` : '100%',
            }}
            className="flex flex-col min-w-0 min-h-0 overflow-hidden"
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
