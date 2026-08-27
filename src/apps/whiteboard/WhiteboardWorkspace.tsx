import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Tldraw, Editor, exportAs } from 'tldraw'
import 'tldraw/tldraw.css'
import {
  ArrowLeft,
  Save,
  PenTool,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { AppSwitcher } from '../../components/AppSwitcher'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useWindowDrag } from '../../hooks/useWindowDrag'
import { addRecentItem } from '../../utils/recentItems'
import { ErrorBoundary } from '../../components/ErrorBoundary'

const WB_TITLE_KEY = 'cekcok_whiteboard_title_v1'
const WB_THEME_KEY = 'cekcok_whiteboard_theme_v1'
const WB_STORE_KEY = 'cekcok_whiteboard_store_v1'

export const WhiteboardWorkspace: React.FC = () => {
  const { setActiveApp, settings } = useIDEStore()
  const { handleWindowDrag } = useWindowDrag()
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem(WB_TITLE_KEY) || 'System Architecture Diagram.tldr'
  })
  const isDarkMode = settings.theme !== 'vs-light'
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isSaved, setIsSaved] = useState<boolean>(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const unlistenRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (editor) {
      try {
        editor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light' })
      } catch (err) {
        console.warn('Failed to sync global theme to whiteboard:', err)
      }
    }
  }, [isDarkMode, editor])

  useEffect(() => {
    localStorage.setItem(WB_TITLE_KEY, docTitle)
    addRecentItem({
      title: docTitle,
      app: 'whiteboard',
      description: 'Vector Whiteboard Diagram',
    })
  }, [docTitle])

  // Cleanup store listener on unmount
  useEffect(() => {
    return () => {
      if (unlistenRef.current) {
        unlistenRef.current()
        unlistenRef.current = null
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'vs-light' : 'vs-dark'
    useIDEStore.getState().updateSettings({ theme: nextTheme })
  }

  const handleMount = useCallback((ed: Editor) => {
    setEditor(ed)
    try {
      ed.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light' })
    } catch (err) {
      console.warn('Failed to apply initial theme preference:', err)
    }

    // Clean up previous listener if any
    if (unlistenRef.current) {
      unlistenRef.current()
      unlistenRef.current = null
    }

    // Only mark modified if the change source is from the user
    // This avoids high-frequency re-renders and re-render loops on pointer move / camera updates
    const unlisten = ed.store.listen((entry) => {
      if (entry.source === 'user') {
        setIsSaved(false)
      }
    })
    unlistenRef.current = unlisten
  }, [isDarkMode])

  const handleManualSave = useCallback(() => {
    if (!editor) return
    try {
      addRecentItem({
        title: docTitle,
        app: 'whiteboard',
        description: 'Vector Whiteboard Diagram',
      })
      setIsSaved(true)
      toast.success('Sketch saved!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save sketch.')
    }
  }, [editor, docTitle])

  useEffect(() => {
    const handleSaveEvent = () => {
      handleManualSave()
    }
    window.addEventListener('workspace-save', handleSaveEvent)
    return () => window.removeEventListener('workspace-save', handleSaveEvent)
  }, [handleManualSave])

  const handleExportJSON = () => {
    if (!editor) return
    try {
      const snapshot = editor.getSnapshot()
      const json = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const name = docTitle.replace(/\.(tldr|json|png|svg)$/i, '') + '.tldr'
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${name}`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to export drawing file.')
    }
  }

  const handleExportPNG = async () => {
    if (!editor) return
    try {
      const shapeIds = Array.from(editor.getCurrentPageShapeIds())
      if (shapeIds.length === 0) {
        toast.error('Canvas is empty. Draw something first!')
        return
      }

      await exportAs(editor, shapeIds, {
        format: 'png',
        name: docTitle.replace(/\.(tldr|json|png|svg)$/i, ''),
      })
      toast.success('Exported PNG image')
    } catch (e) {
      console.error('PNG Export error:', e)
      toast.error('Failed to export image.')
    }
  }

  const handleExportSVG = async () => {
    if (!editor) return
    try {
      const shapeIds = Array.from(editor.getCurrentPageShapeIds())
      if (shapeIds.length === 0) {
        toast.error('Canvas is empty.')
        return
      }

      await exportAs(editor, shapeIds, {
        format: 'svg',
        name: docTitle.replace(/\.(tldr|json|png|svg)$/i, ''),
      })
      toast.success('Exported SVG')
    } catch (e) {
      console.error(e)
      toast.error('Failed to export SVG.')
    }
  }

  const handleClearCanvas = () => {
    if (!editor) return
    if (confirm('Clear all drawings and shapes on the canvas?')) {
      try {
        const shapeIds = Array.from(editor.getCurrentPageShapeIds())
        if (shapeIds.length > 0) {
          editor.deleteShapes(shapeIds)
          setIsSaved(true)
          toast.success('Canvas cleared')
        }
      } catch (err) {
        console.error('Clear canvas error:', err)
        toast.error('Failed to clear canvas.')
      }
    }
  }

  const handleZoomFit = () => {
    if (!editor) return
    try {
      const shapeIds = Array.from(editor.getCurrentPageShapeIds())
      if (shapeIds.length > 0) {
        editor.zoomToFit()
      } else {
        editor.resetZoom()
      }
    } catch (err) {
      console.warn('Zoom to fit error:', err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        if (json) {
          const snapshot = JSON.parse(json)
          editor.loadSnapshot(snapshot)
          setDocTitle(file.name)
          setIsSaved(true)
          toast.success(`Imported "${file.name}"`)
        }
      } catch (err) {
        console.error('Import error:', err)
        toast.error('Failed to parse .tldr file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleResetStorage = () => {
    try {
      indexedDB.deleteDatabase(WB_STORE_KEY)
      localStorage.removeItem(WB_TITLE_KEY)
      localStorage.removeItem(WB_THEME_KEY)
      toast.success('Whiteboard storage reset. Reloading...')
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (e) {
      console.error(e)
      window.location.reload()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundColor: 'var(--color-ide-bg)', color: 'var(--color-ide-text)' }}
      className="w-full h-full flex flex-col select-none relative overflow-hidden"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".tldr,.json"
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
              onChange={(e) => {
                setDocTitle(e.target.value)
                setIsSaved(false)
              }}
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
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Open .tldr JSON file"
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
              title="Export as .tldr project file"
            >
              <Download size={12} />
              <span>.tldr</span>
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

          {/* Zoom to fit */}
          {editor && (
            <button
              data-no-drag
              onClick={handleZoomFit}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100 rounded-md transition-colors cursor-pointer hidden xs:flex items-center gap-1 text-[11px]"
              title="Zoom to fit all drawings"
            >
              <RotateCcw size={12} />
              <span>Fit</span>
            </button>
          )}

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

      {/* Full absolute viewport for Tldraw with ErrorBoundary */}
      <div className="absolute inset-0 top-[38px] w-full h-[calc(100%-38px)]">
        <ErrorBoundary
          fallbackTitle="Whiteboard Error"
          fallbackMessage="Unable to initialize canvas. You can try reloading or resetting the whiteboard cache."
          onReset={handleResetStorage}
        >
          <Tldraw
            persistenceKey={WB_STORE_KEY}
            onMount={handleMount}
          />
        </ErrorBoundary>
      </div>
    </motion.div>
  )
}
