import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import Editor from '@monaco-editor/react'
import { X, Circle } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'

const getLanguageFromFilename = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'rs': return 'rust'
    case 'ts': case 'tsx': return 'typescript'
    case 'js': case 'jsx': return 'javascript'
    case 'json': return 'json'
    case 'md': return 'markdown'
    case 'css': return 'css'
    case 'html': return 'html'
    default: return 'plaintext'
  }
}

export const EditorPane = () => {
  const { openFiles, activeFile, setActiveFile, closeFile, setFileDirty } = useIDEStore()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const currentCodeRef = useRef(code)
  
  useEffect(() => {
    currentCodeRef.current = code
  }, [code])

  // Fetch file content when active file changes
  useEffect(() => {
    const fetchContent = async () => {
      if (!activeFile) {
        setCode("")
        return
      }
      setIsLoading(true)
      try {
        const content = await invoke<string>("read_file", { path: activeFile.path })
        setCode(content)
        setFileDirty(activeFile.path, false)
      } catch (error) {
        setCode(`// Error loading file:\n${error}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [activeFile, setFileDirty])

  const handleSave = async (file: FileNode, content: string) => {
    try {
      await invoke("write_file", { path: file.path, content })
      setFileDirty(file.path, false)
    } catch (err) {
      console.error("Failed to save file", err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        handleSave(activeFile, currentCodeRef.current)
      }
    })
  }

  return (
    <main className="flex-1 flex flex-col bg-ide-bg overflow-hidden min-w-0">
      {/* Tabs */}
      <div className="flex bg-[#2d2d2d] h-[35px] overflow-x-auto no-scrollbar">
        {openFiles.length === 0 ? (
          <div className="flex items-center px-4 text-[13px] text-ide-muted italic">
            No files open
          </div>
        ) : (
          openFiles.map((file) => {
            const isActive = activeFile?.path === file.path
            return (
              <div 
                key={file.path}
                onClick={() => setActiveFile(file)}
                className={`flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-ide-border text-[13px] cursor-pointer group ${
                  isActive 
                    ? 'bg-ide-bg border-t-2 border-t-ide-accent text-white' 
                    : 'bg-transparent border-t-2 border-t-transparent text-ide-muted hover:bg-ide-bg/50'
                }`}
              >
                <span className="truncate flex-1">{file.name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    closeFile(file.path)
                  }}
                  className={`p-0.5 rounded-sm hover:bg-white/10 ${
                    isActive ? 'opacity-100' : (file.isDirty ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')
                  }`}
                >
                  {file.isDirty ? <Circle size={10} fill="currentColor" /> : <X size={14} />}
                </button>
              </div>
            )
          })
        )}
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 relative">
        {activeFile ? (
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile.path}
            language={getLanguageFromFilename(activeFile.name)}
            value={isLoading ? "Loading..." : code}
            onChange={(val) => {
              setCode(val || "")
              if (!activeFile.isDirty && !isLoading) {
                setFileDirty(activeFile.path, true)
              }
            }}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: true, scale: 0.75 },
              fontSize: 14,
              wordWrap: "on",
              padding: { top: 16 },
              fontFamily: "'Consolas', 'Courier New', monospace",
              renderLineHighlight: "all"
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-ide-muted text-lg">
            Cekcok IDE - Select a file to edit
          </div>
        )}
      </div>
    </main>
  )
}
