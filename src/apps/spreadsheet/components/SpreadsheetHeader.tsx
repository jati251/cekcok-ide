import React from 'react'
import {
  FileSpreadsheet,
  Download,
  Upload,
  FilePlus,
  ArrowLeft,
  CheckCircle2,
  LayoutGrid,
  Sigma,
  HelpCircle,
  Save,
} from 'lucide-react'
import { useIDEStore } from '../../../store/useIDEStore'
import { useWindowDrag } from '../../../hooks/useWindowDrag'
import { AppSwitcher } from '../../../components/AppSwitcher'

interface SpreadsheetHeaderProps {
  docTitle: string
  setDocTitle: (title: string) => void
  isSaved: boolean
  onManualSave: () => void
  onOpenTemplates: () => void
  onNewSpreadsheet: () => void
  onToggleFormulaHelper: () => void
  onExportXLSX: () => void
  onExportCSV: () => void
  onUploadClick: () => void
}

export const SpreadsheetHeader: React.FC<SpreadsheetHeaderProps> = ({
  docTitle,
  setDocTitle,
  isSaved,
  onManualSave,
  onOpenTemplates,
  onNewSpreadsheet,
  onToggleFormulaHelper,
  onExportXLSX,
  onExportCSV,
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
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            style={{ color: 'var(--color-ide-text)' }}
            className="bg-transparent text-xs focus:outline-hidden w-36 sm:w-48 font-medium truncate"
            title="Rename spreadsheet"
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
          title="Save Workbook (Ctrl+S / Cmd+S)"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>

      <div data-tauri-drag-region className="flex items-center gap-1">
        <button
          onClick={onOpenTemplates}
          title="Spreadsheet Templates"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-purple-500" />
          <span className="hidden lg:inline text-[11px]">Templates</span>
        </button>

        <button
          onClick={onNewSpreadsheet}
          title="New Blank Workbook"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">New</span>
        </button>

        <button
          onClick={onUploadClick}
          title="Import Excel (.xlsx) or CSV"
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
          onClick={onExportXLSX}
          title="Export as Microsoft Excel (.xlsx)"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden xl:inline text-[11px]">Excel</span>
        </button>

        <button
          onClick={onExportCSV}
          title="Export Active Sheet to CSV"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden xl:inline text-[11px]">CSV</span>
        </button>

        <div
          style={{ backgroundColor: 'var(--color-ide-border)' }}
          className="h-3.5 w-[1px] mx-0.5"
        />

        <button
          onClick={onToggleFormulaHelper}
          title="Formulas Reference Guide"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Sigma className="w-3.5 h-3.5 text-indigo-500" />
          <HelpCircle className="w-3 h-3 opacity-60 hidden sm:inline" />
        </button>

        <div
          style={{ backgroundColor: 'var(--color-ide-border)' }}
          className="h-3.5 w-[1px] mx-1"
        />

        <AppSwitcher />
      </div>
    </header>
  )
}
