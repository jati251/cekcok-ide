import React, { useState, useEffect, useRef } from 'react'
import { Workbook } from '@fortune-sheet/react'
import '@fortune-sheet/react/dist/index.css'
import './spreadsheet.css'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { addRecentItem } from '../../utils/recentItems'
import {
  FortuneSheetData,
  createDefaultSpreadsheetData,
  downloadWorkbookAsXLSX,
  downloadActiveSheetAsCSV,
  xlsxToFortune,
} from '../../utils/spreadsheetHelper'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save to local storage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(TITLE_STORAGE_KEY, docTitle)
      addRecentItem({
        title: docTitle,
        app: 'spreadsheet',
        description: 'Excel Spreadsheet Workbook',
      })
    } catch (e) {
      console.warn('Local storage quota warning for spreadsheet:', e)
    }
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
      setIsSaved(true)
      toast.success('Created new spreadsheet')
    }
  }

  const handleSelectTemplate = (type: 'budget' | 'invoice' | 'grades') => {
    const template = getSpreadsheetTemplate(type)
    setData(template.data)
    setDocTitle(template.name)
    setShowTemplates(false)
    setIsSaved(false)
    toast.success(`Loaded "${template.name}"`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const sheets = await xlsxToFortune(buffer)
      if (sheets && sheets.length > 0) {
        setData(sheets)
        setDocTitle(file.name)
        setIsSaved(true)
        toast.success(`Imported "${file.name}"`)
      } else {
        toast.error('No sheets found in file.')
      }
    } catch (err) {
      console.error('File import error:', err)
      toast.error('Failed to import Excel/CSV file.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col bg-[#1e1e1e] text-white select-none overflow-hidden"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.csv"
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
        onUploadClick={() => fileInputRef.current?.click()}
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

      {/* Main FortuneSheet Workbook Container */}
      <main className="flex-1 w-full h-full overflow-hidden bg-white text-gray-900 fortune-container">
        <Workbook
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
