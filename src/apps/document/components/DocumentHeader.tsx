import React from 'react'
import {
  ArrowLeft,
  Save,
  FileText,
  Upload,
  FilePlus,
  Moon,
  Sun,
  Printer,
  FileCode,
  Globe,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react'
import { useIDEStore } from '../../../store/useIDEStore'
import { AppSwitcher } from '../../../components/AppSwitcher'
import { useWindowDrag } from '../../../hooks/useWindowDrag'

interface DocumentHeaderProps {
  docTitle: string
  setDocTitle: (title: string) => void
  isSaved: boolean
  isDarkMode: boolean
  stats: { words: number; chars: number; readingTime: number }
  toggleTheme: () => void
  onManualSave: () => void
  onNewDocument: () => void
  onOpenTemplates: () => void
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
  onNewDocument,
  onOpenTemplates,
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
      className="h-[38px] bg-[#181818] border-b border-ide-border text-xs text-[#cccccc] font-sans shrink-0 flex items-center justify-between px-2 cursor-default z-30"
    >
      <div data-tauri-drag-region className="flex items-center gap-1.5 min-w-0">
        {/* Mac OS Window Controls Offset */}
        <div data-tauri-drag-region className="hidden sm:block w-[72px] shrink-0" />

        <button
          onClick={() => setActiveApp('home')}
          title="Back to Home"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Home</span>
        </button>

        <div className="h-3.5 w-[1px] bg-ide-border mx-0.5" />

        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#252526] border border-[#333]">
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-36 sm:w-48 font-medium truncate"
            title="Rename document"
          />
          {isSaved ? (
            <span title="All changes saved" className="flex items-center gap-1 text-[10px] text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline">Saved</span>
            </span>
          ) : (
            <span title="Unsaved changes" className="text-[10px] text-amber-400 shrink-0">
              ● Editing
            </span>
          )}
        </div>

        <button
          onClick={onManualSave}
          title="Save Document"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>

      <div data-tauri-drag-region className="flex items-center gap-1">
        <button
          onClick={onOpenTemplates}
          title="Document Templates"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline text-[11px]">Templates</span>
        </button>

        <button
          onClick={onNewDocument}
          title="New Document"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">New</span>
        </button>

        <button
          onClick={onUploadClick}
          title="Import Markdown / Plain Text"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline text-[11px]">Import</span>
        </button>

        <div className="h-3.5 w-[1px] bg-ide-border mx-0.5" />

        <button
          onClick={onExportMarkdown}
          title="Export as Markdown (.md)"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline text-[11px]">Markdown</span>
        </button>

        <button
          onClick={onExportHTML}
          title="Export as HTML (.html)"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline text-[11px]">HTML</span>
        </button>

        <button
          onClick={onPrint}
          title="Print to PDF"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        <div className="h-3.5 w-[1px] bg-ide-border mx-0.5" />

        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Workspace' : 'Switch to Dark Workspace'}
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
        </button>

        <div className="hidden xl:flex items-center gap-2 pl-2 text-[10px] text-gray-400 font-mono">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.readingTime}m read</span>
        </div>

        <div className="h-3.5 w-[1px] bg-ide-border mx-1" />

        <AppSwitcher />
      </div>
    </header>
  )
}
