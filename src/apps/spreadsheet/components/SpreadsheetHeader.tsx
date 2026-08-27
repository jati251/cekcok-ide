import React from 'react'
import {
  ArrowLeft,
  Save,
  FileSpreadsheet,
  Download,
  Upload,
  FilePlus,
  Sigma,
  CheckCircle2,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react'
import { useIDEStore } from '../../../store/useIDEStore'
import { AppSwitcher } from '../../../components/AppSwitcher'
import { useWindowDrag } from '../../../hooks/useWindowDrag'

interface SpreadsheetHeaderProps {
  docTitle: string
  setDocTitle: (title: string) => void
  isSaved: boolean
  onManualSave: () => void
  onNewSpreadsheet: () => void
  onOpenTemplates: () => void
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
  onNewSpreadsheet,
  onOpenTemplates,
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
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-36 sm:w-48 font-medium truncate"
            title="Rename spreadsheet"
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
          title="Save Workbook (Ctrl+S / Cmd+S)"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>

      <div data-tauri-drag-region className="flex items-center gap-1">
        <button
          onClick={onOpenTemplates}
          title="Spreadsheet Templates"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline text-[11px]">Templates</span>
        </button>

        <button
          onClick={onNewSpreadsheet}
          title="New Blank Workbook"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">New</span>
        </button>

        <button
          onClick={onUploadClick}
          title="Import Excel (.xlsx) or CSV"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline text-[11px]">Import</span>
        </button>

        <div className="h-3.5 w-[1px] bg-ide-border mx-0.5" />

        <button
          onClick={onExportXLSX}
          title="Export as Microsoft Excel (.xlsx)"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline text-[11px]">Excel</span>
        </button>

        <button
          onClick={onExportCSV}
          title="Export Active Sheet to CSV"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline text-[11px]">CSV</span>
        </button>

        <div className="h-3.5 w-[1px] bg-ide-border mx-0.5" />

        <button
          onClick={onToggleFormulaHelper}
          title="Formulas Reference Guide"
          className="p-1 hover:bg-[#2a2d2e] rounded text-[#cccccc] hover:text-white transition-colors flex items-center gap-1"
        >
          <Sigma className="w-3.5 h-3.5 text-indigo-400" />
          <HelpCircle className="w-3 h-3 text-gray-400 hidden sm:inline" />
        </button>

        <div className="h-3.5 w-[1px] bg-ide-border mx-1" />

        <AppSwitcher />
      </div>
    </header>
  )
}
