import React, { useState, useEffect, useRef } from 'react'
import { Workbook } from '@fortune-sheet/react'
import '@fortune-sheet/react/dist/index.css'
import './spreadsheet.css'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import { addRecentItem } from '../../utils/recentItems'
import {
  FortuneSheetData,
  createDefaultSpreadsheetData,
  downloadWorkbookAsXLSX,
  downloadActiveSheetAsCSV,
  xlsxToFortune,
  validateSpreadsheetExtension,
} from '../../utils/spreadsheetHelper'
import { isTauri, safeInvoke } from '../../utils/tauriBridge'
import { getSpreadsheetTemplate } from './templates'
import { SpreadsheetHeader } from './components/SpreadsheetHeader'
import { SpreadsheetFormulaModal } from './components/SpreadsheetFormulaModal'
import { SpreadsheetTemplatesModal } from './components/SpreadsheetTemplatesModal'

const STORAGE_KEY = 'cekcok_spreadsheet_data_v1'
const TITLE_STORAGE_KEY = 'cekcok_spreadsheet_title_v1'

export const SpreadsheetWorkspace: React.FC = () => {
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem(TITLE_STORAGE_KEY) || 'Financial Model & Budget.xlsx'
  })
  const [data, setData] = useState<FortuneSheetData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {
        console.error('Failed to parse cached spreadsheet:', e)
      }
    }
    return createDefaultSpreadsheetData()
  })

  const [isSaved, setIsSaved] = useState<boolean>(true)
  const [showFormulaHelper, setShowFormulaHelper] = useState<boolean>(false)
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const [workbookKey, setWorkbookKey] = useState<number>(() => Date.now())
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounced auto-persist to storage to prevent main-thread lag during heavy edits
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        localStorage.setItem(TITLE_STORAGE_KEY, docTitle)
      } catch (e) {
        console.warn('Local storage quota warning for spreadsheet:', e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [data, docTitle])

  const handleDataChange = (newData: FortuneSheetData[]) => {
    setData(newData)
    setIsSaved(false)
  }

  const handleManualSave = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(TITLE_STORAGE_KEY, docTitle)
      addRecentItem({
        title: docTitle,
        app: 'spreadsheet',
        description: 'Excel Spreadsheet Workbook',
      })
      setIsSaved(true)
      toast.success('Spreadsheet saved successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save spreadsheet to storage.')
    }
  }, [data, docTitle])

  useEffect(() => {
    const handleSaveEvent = () => {
      handleManualSave()
    }
    window.addEventListener('workspace-save', handleSaveEvent)
    return () => window.removeEventListener('workspace-save', handleSaveEvent)
  }, [handleManualSave])

  const handleExportXLSX = () => {
    try {
      downloadWorkbookAsXLSX(data, docTitle.endsWith('.xlsx') ? docTitle : `${docTitle}.xlsx`)
      toast.success('Exported to Excel (.xlsx)')
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export to Excel.')
    }
  }

  const handleExportCSV = () => {
    try {
      downloadActiveSheetAsCSV(data, docTitle.replace(/\.xlsx$/i, '') + '.csv')
      toast.success('Exported active sheet to CSV')
    } catch (err) {
      console.error('CSV Export error:', err)
      toast.error('Failed to export CSV.')
    }
  }

  const handleNewSpreadsheet = () => {
    if (confirm('Create a new blank spreadsheet? Unsaved changes in the current sheet will be replaced.')) {
      const fresh = createDefaultSpreadsheetData()
      setData(fresh)
      setDocTitle('New Spreadsheet.xlsx')
      setWorkbookKey(Date.now())
      setIsSaved(true)
      toast.success('Created new spreadsheet')
    }
  }

  const handleSelectTemplate = (type: 'budget' | 'invoice' | 'grades') => {
    const template = getSpreadsheetTemplate(type)
    setData(template.data)
    setDocTitle(template.name)
    setWorkbookKey(Date.now())
    setShowTemplates(false)
    setIsSaved(false)
    toast.success(`Loaded "${template.name}"`)
  }

  const processSpreadsheetBuffer = async (
    bufferOrString: ArrayBuffer | Uint8Array | string,
    fileName: string
  ) => {
    const validation = validateSpreadsheetExtension(fileName)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      return
    }

    try {
      const sheets = xlsxToFortune(bufferOrString)
      if (sheets && sheets.length > 0) {
        setData(sheets)
        setDocTitle(fileName)
        setWorkbookKey(Date.now())
        setIsSaved(true)
        toast.success(`Berhasil mengimpor "${fileName}"`)
      } else {
        toast.error('Tidak ada data sheet yang ditemukan.')
      }
    } catch (err) {
      console.error('File parsing error:', err)
      toast.error(`Gagal membaca file: ${(err as Error).message || err}`)
    }
  }

  const handleImportFile = async () => {
    if (isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: 'Spreadsheets (Excel, CSV, TSV)',
              extensions: ['xlsx', 'xls', 'csv', 'tsv'],
            },
          ],
          title: 'Import Spreadsheet File',
        })

        if (!selected || typeof selected !== 'string') return

        const fileName = selected.split(/[/\\]/).pop() || selected
        const bytes = await safeInvoke<number[]>('read_file_bytes', { path: selected })
        if (bytes && bytes.length > 0) {
          const uint8 = new Uint8Array(bytes)
          await processSpreadsheetBuffer(uint8, fileName)
        } else {
          toast.error('File kosong atau tidak dapat diakses.')
        }
        return
      } catch (err) {
        console.warn('Native open dialog failed, falling back to HTML file input:', err)
      }
    }

    // Web fallback
    fileInputRef.current?.click()
  }

  const handleHTMLFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateSpreadsheetExtension(file.name)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      e.target.value = ''
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      await processSpreadsheetBuffer(buffer, file.name)
    } catch (err) {
      console.error('HTML File input error:', err)
      toast.error('Gagal membaca file.')
    } finally {
      e.target.value = ''
    }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const validation = validateSpreadsheetExtension(file.name)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      await processSpreadsheetBuffer(buffer, file.name)
    } catch (err) {
      console.error('Drop error:', err)
      toast.error('Gagal memproses file yang di-drop.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col bg-[#1e1e1e] text-white select-none overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleHTMLFileInputChange}
        accept=".xlsx,.xls,.csv,.tsv"
        className="hidden"
      />

      <SpreadsheetHeader
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        isSaved={isSaved}
        onManualSave={handleManualSave}
        onNewSpreadsheet={handleNewSpreadsheet}
        onOpenTemplates={() => setShowTemplates(true)}
        onToggleFormulaHelper={() => setShowFormulaHelper(!showFormulaHelper)}
        onExportXLSX={handleExportXLSX}
        onExportCSV={handleExportCSV}
        onUploadClick={handleImportFile}
      />

      <SpreadsheetFormulaModal
        isOpen={showFormulaHelper}
        onClose={() => setShowFormulaHelper(false)}
      />

      <SpreadsheetTemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-950/80 backdrop-blur-xs border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center gap-3 pointer-events-none"
          >
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400">
              <UploadCloud size={48} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Drop Excel or CSV File Here</h3>
            <p className="text-xs text-emerald-200 font-medium">Supports .xlsx, .xls, .csv, .tsv</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FortuneSheet Workbook Container */}
      <main className="flex-1 min-h-0 w-full overflow-hidden bg-white text-gray-900 fortune-wrapper relative">
        <Workbook
          key={workbookKey}
          data={data}
          onChange={handleDataChange}
          showToolbar={true}
          showFormulaBar={true}
          showSheetTabs={true}
          allowEdit={true}
        />
      </main>
    </motion.div>
  )
}
