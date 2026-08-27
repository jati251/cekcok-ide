import React from 'react'
import {
  FileText,
  Save,
  Printer,
  Upload,
  FilePlus,
  Sun,
  Moon,
  ArrowLeft,
  CheckCircle2,
  LayoutGrid,
  FileCode,
  Globe,
} from 'lucide-react'
import { useIDEStore } from '../../../store/useIDEStore'
import { useWindowDrag } from '../../../hooks/useWindowDrag'
import { AppSwitcher } from '../../../components/AppSwitcher'

interface DocumentHeaderProps {
  docTitle: string
  setDocTitle: (title: string) => void
  isSaved: boolean
  isDarkMode: boolean
  stats: {
    words: number
    chars: number
    readingTime: number
  }
  toggleTheme: () => void
  onManualSave: () => void
  onOpenTemplates: () => void
  onNewDocument: () => void
  onExportMarkdown: () => void
  onExportHTML: () => void
  onPrint: () => void
  onUploadClick: () => void
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  docTitle,
  setDocTitle,
  isSaved,
  isDarkMode,
  stats,
  toggleTheme,
  onManualSave,
  onOpenTemplates,
  onNewDocument,
  onExportMarkdown,
  onExportHTML,
  onPrint,
  onUploadClick,
}) => {
  const { setActiveApp } = useIDEStore()
  const { handleWindowDrag } = useWindowDrag()

  return (
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
          onClick={() => setActiveApp('home')}
          title="Back to Dashboard"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 font-medium opacity-80 hover:opacity-100 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Dashboard</span>
        </button>

        <div
          style={{ backgroundColor: 'var(--color-ide-border)' }}
          className="h-3.5 w-[1px] mx-0.5"
        />

        <div
          style={{
            backgroundColor: 'var(--color-ide-bg)',
            borderColor: 'var(--color-ide-border)',
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded border"
        >
          <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            style={{ color: 'var(--color-ide-text)' }}
            className="bg-transparent text-xs focus:outline-hidden w-36 sm:w-48 font-medium truncate"
            title="Rename document"
          />
          {isSaved ? (
            <span title="All changes saved" className="flex items-center gap-1 text-[10px] text-emerald-500 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline font-semibold">Saved</span>
            </span>
          ) : (
            <span title="Unsaved changes" className="text-[10px] text-amber-500 font-semibold shrink-0">
              ● Editing
            </span>
          )}
        </div>

        <button
          onClick={onManualSave}
          title="Save Document"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>

      <div data-tauri-drag-region className="flex items-center gap-1">
        <button
          onClick={onOpenTemplates}
          title="Document Templates"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-purple-500" />
          <span className="hidden lg:inline text-[11px]">Templates</span>
        </button>

        <button
          onClick={onNewDocument}
          title="New Document"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">New</span>
        </button>

        <button
          onClick={onUploadClick}
          title="Import Markdown / Plain Text"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden lg:inline text-[11px]">Import</span>
        </button>

        <div
          style={{ backgroundColor: 'var(--color-ide-border)' }}
          className="h-3.5 w-[1px] mx-0.5"
        />

        <button
          onClick={onExportMarkdown}
          title="Export as Markdown (.md)"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <FileCode className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden xl:inline text-[11px]">Markdown</span>
        </button>

        <button
          onClick={onExportHTML}
          title="Export as HTML (.html)"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden xl:inline text-[11px]">HTML</span>
        </button>

        <button
          onClick={onPrint}
          title="Print to PDF"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-500" />
        </button>

        <div
          style={{ backgroundColor: 'var(--color-ide-border)' }}
          className="h-3.5 w-[1px] mx-0.5"
        />

        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Workspace' : 'Switch to Dark Workspace'}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors opacity-80 hover:opacity-100 cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
        </button>

        <div className="hidden xl:flex items-center gap-2 pl-2 text-[10px] opacity-60 font-mono">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.readingTime}m read</span>
        </div>

        <div
          style={{ backgroundColor: 'var(--color-ide-border)' }}
          className="h-3.5 w-[1px] mx-1"
        />

        <AppSwitcher />
      </div>
    </header>
  )
}
