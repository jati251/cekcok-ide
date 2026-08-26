import { useState, useEffect, useRef, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import Editor from '@monaco-editor/react'
import { X, Circle, ChevronRight, FileCode2, Save, Columns2 } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { registerMonacoThemes } from '../utils/themes'
import { TabContextMenu } from './TabContextMenu'

const getLanguageFromFilename = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'rs': return 'rust'
    case 'ts': case 'tsx': return 'typescript'
    case 'js': case 'jsx': case 'mjs': case 'cjs': return 'javascript'
    case 'json': return 'json'
    case 'md': return 'markdown'
    case 'css': return 'css'
    case 'html': return 'html'
    default: return 'plaintext'
  }
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
  isActivePane
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
    splitEditorOpen
  } = useIDEStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save debounced handler
  const triggerAutoSave = useCallback((path: string) => {
    if (settings.autoSave === 'afterDelay') {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = setTimeout(() => {
        saveFile(path)
      }, 1000)
    }
  }, [settings.autoSave, saveFile])

  // Fetch file content when active file changes if not already in store
  useEffect(() => {
    if (!activeFile) return
    if (activeFile.content !== undefined) return

    let isMounted = true
    const fetchContent = async () => {
      try {
        const content = await invoke<string>("read_file", { path: activeFile.path })
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
      file
    })
  }

  const pathSegments = activeFile ? activeFile.path.split(/[/\\]/).filter(Boolean) : []
  const editorValue = activeFile?.content ?? ""

  return (
    <div 
      className={`flex-1 flex flex-col min-w-0 h-full border-r border-ide-border last:border-r-0 relative ${
        isActivePane ? 'ring-1 ring-ide-accent/40' : ''
      }`}
      onClick={() => setActivePane(paneId)}
    >
      {/* Tab Bar Header */}
      <div className="flex bg-[#181818] h-[35px] border-b border-ide-border overflow-x-auto no-scrollbar select-none justify-between items-center pr-2">
        <div className="flex flex-1 overflow-x-auto no-scrollbar h-full">
          {files.length === 0 ? (
            <div className="flex items-center px-4 text-xs text-ide-muted italic">
              Pane {paneId} (Empty)
            </div>
          ) : (
            files.map((file) => {
              const isActive = activeFile?.path === file.path
              return (
                <div 
                  key={file.path}
                  onClick={() => setActiveFileInPane(file, paneId)}
                  onContextMenu={(e) => handleTabContextMenu(e, file)}
                  className={`flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-ide-border text-[13px] cursor-pointer group transition-colors ${
                    isActive 
                      ? 'bg-ide-bg border-t-2 border-t-ide-accent text-white font-medium' 
                      : 'bg-[#181818] border-t-2 border-t-transparent text-ide-muted hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  <span className="truncate flex-1">{file.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      requestCloseFile(file.path, paneId)
                    }}
                    className={`p-0.5 rounded hover:bg-white/15 cursor-pointer ${
                      isActive ? 'opacity-100 text-white' : (file.isDirty ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-ide-muted')
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
            title={splitEditorOpen ? "Close Split Editor" : "Split Editor Right (Cmd+\\)"}
          >
            <Columns2 size={15} />
          </button>
        )}
      </div>

      {/* Breadcrumb Path Bar */}
      {activeFile && (
        <div className="h-6 bg-ide-bg border-b border-ide-border/50 px-3 flex items-center text-[11px] text-ide-muted select-none">
          <FileCode2 size={12} className="mr-1.5 text-[#80a4c2] shrink-0" />
          <div className="flex items-center gap-1 truncate">
            {pathSegments.map((segment, idx) => (
              <div key={idx} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight size={10} className="text-ide-muted/60" />}
                <span className={idx === pathSegments.length - 1 ? 'text-white/90 font-medium' : 'hover:text-white cursor-pointer'}>
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
        </div>
      )}

      {/* Monaco Editor Canvas */}
      <div className="flex-1 relative">
        {activeFile ? (
          <Editor
            height="100%"
            theme={settings.theme}
            path={`${paneId}-${activeFile.path}`}
            language={getLanguageFromFilename(activeFile.name)}
            value={editorValue}
            onChange={(val) => {
              const newContent = val || ""
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
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              suggestOnTriggerCharacters: true,
              quickSuggestions: { other: true, comments: false, strings: true },
              formatOnPaste: true,
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-ide-muted space-y-3 select-none">
            <div className="text-lg font-semibold text-white/30">Cekcok Editor (Pane {paneId})</div>
            <div className="text-xs text-[#888]">Select a file from the explorer to open in this pane</div>
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

export const EditorPane = () => {
  const { 
    splitEditorOpen,
    activePane,
    pane1Files,
    pane1ActiveFile,
    pane2Files,
    pane2ActiveFile
  } = useIDEStore()

  return (
    <main className="flex-1 flex flex-row bg-ide-bg overflow-hidden min-w-0">
      <SinglePane
        paneId={1}
        files={pane1Files}
        activeFile={pane1ActiveFile}
        isActivePane={activePane === 1}
      />

      {splitEditorOpen && (
        <SinglePane
          paneId={2}
          files={pane2Files}
          activeFile={pane2ActiveFile}
          isActivePane={activePane === 2}
        />
      )}
    </main>
  )
}
