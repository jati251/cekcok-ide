import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Excalidraw,
  exportToBlob,
  exportToSvg,
  serializeAsJSON,
  restoreElements,
} from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import {
  ArrowLeft,
  Save,
  PenTool,
  Download,
  Upload,
  Sun,
  Moon,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { AppSwitcher } from '../../components/AppSwitcher'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useWindowDrag } from '../../hooks/useWindowDrag'
import { addRecentItem } from '../../utils/recentItems'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { isTauri, safeInvoke } from '../../utils/tauriBridge'

const WB_TITLE_KEY = 'cekcok_whiteboard_title_v2'
const WB_STORE_KEY = 'cekcok_whiteboard_store_v2'
const SUPPORTED_EXTENSIONS = ['.excalidraw', '.json', '.tldr'] as const

function validateSketchExtension(filename: string): { valid: boolean; ext: string; error?: string } {
  if (!filename) {
    return { valid: false, ext: '', error: 'Nama file tidak boleh kosong.' }
  }
  const dotIdx = filename.lastIndexOf('.')
  if (dotIdx === -1) {
    return {
      valid: false,
      ext: '',
      error: 'File tidak memiliki ekstensi. Format yang didukung: .excalidraw dan .json.',
    }
  }
  const ext = filename.substring(dotIdx).toLowerCase()
  const isSupported = (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)
  if (!isSupported) {
    return {
      valid: false,
      ext,
      error: `Format file "${ext}" tidak didukung. Hanya mendukung file diagram .excalidraw atau .json.`,
    }
  }
  return { valid: true, ext }
}

export const WhiteboardWorkspace: React.FC = () => {
  const { setActiveApp, settings } = useIDEStore()
  const { handleWindowDrag } = useWindowDrag()

  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem(WB_TITLE_KEY) || 'System Architecture Diagram.excalidraw'
  })

  const isDarkMode = settings.theme !== 'vs-light'
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [isSaved, setIsSaved] = useState<boolean>(true)
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false)
  const [initialData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(WB_STORE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return null
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDocTitleChange = (newTitle: string) => {
    setDocTitle(newTitle)
    setIsSaved(false)
    localStorage.setItem(WB_TITLE_KEY, newTitle)
  }

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'vs-light' : 'vs-dark'
    useIDEStore.getState().updateSettings({ theme: nextTheme })
  }

  const handleManualSave = useCallback(() => {
    if (!excalidrawAPI) return
    try {
      const elements = excalidrawAPI.getSceneElements()
      const appState = excalidrawAPI.getAppState()
      const files = excalidrawAPI.getFiles()

      const json = serializeAsJSON(elements, appState, files, 'local')
      localStorage.setItem(WB_STORE_KEY, json)

      addRecentItem({
        title: docTitle,
        app: 'whiteboard',
        description: 'Excalidraw Diagram',
      })
      setIsSaved(true)
      toast.success('Sketch saved!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save sketch.')
    }
  }, [excalidrawAPI, docTitle])

  // Workspace-save global shortcut
  useEffect(() => {
    const handleSaveEvent = () => {
      handleManualSave()
    }
    window.addEventListener('workspace-save', handleSaveEvent)
    return () => window.removeEventListener('workspace-save', handleSaveEvent)
  }, [handleManualSave])

  const handleExportJSON = async () => {
    if (!excalidrawAPI) return
    try {
      const elements = excalidrawAPI.getSceneElements()
      const appState = excalidrawAPI.getAppState()
      const files = excalidrawAPI.getFiles()

      const json = serializeAsJSON(elements, appState, files, 'local')
      const defaultName = docTitle.replace(/\.(excalidraw|json|png|svg|tldr)$/i, '') + '.excalidraw'

      if (isTauri()) {
        try {
          const { save } = await import('@tauri-apps/plugin-dialog')
          const filePath = await save({
            defaultPath: defaultName,
            filters: [{ name: 'Excalidraw Diagram', extensions: ['excalidraw', 'json'] }],
            title: 'Save Whiteboard Drawing As',
          })

          if (filePath && typeof filePath === 'string') {
            await safeInvoke('write_file', { path: filePath, content: json })
            toast.success(`Saved drawing to ${filePath.split(/[/\\]/).pop()}`)
            return
          }
        } catch (err) {
          console.warn('Native drawing save failed or cancelled:', err)
        }
      }

      // Web download fallback
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = defaultName
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${defaultName}`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to export drawing file.')
    }
  }

  const handleExportPNG = async () => {
    if (!excalidrawAPI) return
    try {
      const elements = excalidrawAPI.getSceneElements()
      if (!elements || elements.length === 0) {
        toast.error('Canvas is empty. Draw something first!')
        return
      }

      const blob = await exportToBlob({
        elements,
        appState: {
          ...excalidrawAPI.getAppState(),
          exportWithDarkMode: isDarkMode,
          exportBackground: true,
        },
        files: excalidrawAPI.getFiles(),
        mimeType: 'image/png',
      })

      const fileName = docTitle.replace(/\.(excalidraw|json|png|svg|tldr)$/i, '') + '.png'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported PNG image')
    } catch (e) {
      console.error('PNG Export error:', e)
      toast.error('Failed to export image.')
    }
  }

  const handleExportSVG = async () => {
    if (!excalidrawAPI) return
    try {
      const elements = excalidrawAPI.getSceneElements()
      if (!elements || elements.length === 0) {
        toast.error('Canvas is empty.')
        return
      }

      const svg = await exportToSvg({
        elements,
        appState: {
          ...excalidrawAPI.getAppState(),
          exportWithDarkMode: isDarkMode,
          exportBackground: true,
        },
        files: excalidrawAPI.getFiles(),
      })

      const svgString = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = docTitle.replace(/\.(excalidraw|json|png|svg|tldr)$/i, '') + '.svg'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported SVG')
    } catch (e) {
      console.error('SVG Export error:', e)
      toast.error('Failed to export SVG.')
    }
  }

  const handleClearCanvas = () => {
    if (!excalidrawAPI) return
    if (confirm('Clear all drawings and shapes on the canvas?')) {
      excalidrawAPI.resetScene()
      localStorage.removeItem(WB_STORE_KEY)
      setIsSaved(true)
      toast.success('Canvas cleared')
    }
  }

  const processSketchJson = (jsonString: string, fileName: string) => {
    if (!excalidrawAPI) return
    try {
      const parsed = JSON.parse(jsonString)
      if (parsed.elements) {
        excalidrawAPI.updateScene({
          elements: restoreElements(parsed.elements, null),
          appState: parsed.appState || {},
        })
        setDocTitle(fileName)
        setIsSaved(true)
        toast.success(`Imported "${fileName}"`)
      } else {
        toast.error('Format file diagram tidak sesuai.')
      }
    } catch (err) {
      console.error('Import error:', err)
      toast.error('Format file .excalidraw / .json tidak valid.')
    }
  }

  const handleImportFile = async () => {
    if (isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const selected = await open({
          multiple: false,
          filters: [{ name: 'Excalidraw Diagram (.excalidraw, .json)', extensions: ['excalidraw', 'json'] }],
          title: 'Import Excalidraw Sketch',
        })

        if (!selected || typeof selected !== 'string') return

        const fileName = selected.split(/[/\\]/).pop() || selected
        const validation = validateSketchExtension(fileName)
        if (!validation.valid) {
          toast.error(validation.error || 'Format file tidak didukung.')
          return
        }

        const content = await safeInvoke<string>('read_file', { path: selected })
        if (content) {
          processSketchJson(content, fileName)
        } else {
          toast.error('File kosong atau tidak dapat diakses.')
        }
        return
      } catch (err) {
        console.warn('Native open dialog failed, falling back to HTML input:', err)
      }
    }

    fileInputRef.current?.click()
  }

  const handleHTMLFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateSketchExtension(file.name)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const json = event.target?.result as string
      if (json) {
        processSketchJson(json, file.name)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDraggingOver) setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const validation = validateSketchExtension(file.name)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const json = event.target?.result as string
      if (json) {
        processSketchJson(json, file.name)
      }
    }
    reader.readAsText(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundColor: 'var(--color-ide-bg)', color: 'var(--color-ide-text)' }}
      className="w-full h-full flex flex-col select-none relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleHTMLFileInputChange}
        accept=".excalidraw,.json"
        className="hidden"
      />

      {/* Top Header matching IDE TitleBar */}
      <header
        data-tauri-drag-region
        onMouseDown={handleWindowDrag}
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
          color: 'var(--color-ide-text)',
        }}
        className="h-[38px] border-b text-xs font-sans shrink-0 flex items-center justify-between px-2 cursor-default relative z-[9999]"
      >
        <div data-tauri-drag-region className="flex items-center gap-1.5 min-w-0">
          {/* Mac OS Window Controls Offset */}
          <div data-tauri-drag-region className="hidden sm:block w-[72px] shrink-0" />

          <button
            data-no-drag
            onClick={() => setActiveApp('home')}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100 rounded-md transition-colors cursor-pointer shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>

          <div data-no-drag className="flex items-center gap-1.5 min-w-0">
            <div className="p-1 bg-amber-500/20 text-amber-500 rounded shrink-0">
              <PenTool size={13} />
            </div>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => handleDocTitleChange(e.target.value)}
              style={{
                color: 'var(--color-ide-text)',
              }}
              className="bg-transparent hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-transparent focus:border-ide-accent outline-hidden max-w-[130px] sm:max-w-[200px] truncate transition-colors"
              title="Click to rename sketch"
            />
          </div>

          <div
            style={{ backgroundColor: 'var(--color-ide-border)' }}
            data-tauri-drag-region
            className="h-4 w-px mx-1 hidden sm:block"
          />

          {/* Quick Actions */}
          <div data-no-drag className="hidden md:flex items-center gap-0.5 text-[11px]">
            <button
              onClick={handleImportFile}
              className="flex items-center gap-1 px-2 py-1 opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Import .excalidraw or .json sketch file"
            >
              <Upload size={12} />
              <span>Open</span>
            </button>
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1 px-2 py-1 opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Export as PNG image"
            >
              <ImageIcon size={12} />
              <span>PNG</span>
            </button>
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1 px-2 py-1 opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Export as SVG"
            >
              <Download size={12} />
              <span>SVG</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2 py-1 opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Export as .excalidraw project file"
            >
              <Download size={12} />
              <span>.excalidraw</span>
            </button>
            <button
              onClick={handleClearCanvas}
              className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
              title="Clear all shapes from canvas"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div data-tauri-drag-region className="flex items-center gap-1.5 shrink-0">
          {/* Theme Toggle */}
          <button
            data-no-drag
            onClick={toggleTheme}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 text-amber-500 rounded-md transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light canvas' : 'Switch to Dark canvas'}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <div data-tauri-drag-region className="flex items-center gap-1 text-[10px] opacity-70 mr-1 hidden xs:flex">
            <CheckCircle2 size={11} className={isSaved ? 'text-green-500' : 'text-amber-500'} />
            <span>{isSaved ? 'Saved' : 'Modified'}</span>
          </div>

          <button
            data-no-drag
            onClick={handleManualSave}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-[11px] font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Save size={12} />
            <span>Save</span>
          </button>

          <div
            style={{ backgroundColor: 'var(--color-ide-border)' }}
            data-tauri-drag-region
            className="h-4 w-px mx-0.5"
          />

          {/* App Switcher Dropdown */}
          <AppSwitcher />
        </div>
      </header>

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-amber-950/80 backdrop-blur-xs border-2 border-dashed border-amber-400 flex flex-col items-center justify-center gap-3 pointer-events-none"
          >
            <div className="p-4 rounded-full bg-amber-500/20 text-amber-400">
              <UploadCloud size={48} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Drop Sketch File Here</h3>
            <p className="text-xs text-amber-200 font-medium">Supports .excalidraw, .json</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full absolute viewport for Excalidraw with ErrorBoundary */}
      <div className="flex-1 w-full h-[calc(100%-38px)] relative">
        <ErrorBoundary
          fallbackTitle="Whiteboard Error"
          fallbackMessage="Unable to initialize canvas."
        >
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            theme={isDarkMode ? 'dark' : 'light'}
            initialData={initialData}
            onChange={() => {
              setIsSaved(false)
            }}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
              },
            }}
          />
        </ErrorBoundary>
      </div>
    </motion.div>
  )
}
