import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import { addRecentItem } from '../../utils/recentItems'
import {
  DOC_STORAGE_KEY,
  DOC_TITLE_KEY,
  DOC_THEME_KEY,
  getInitialDocContent,
  getDocTemplate,
} from './templates'
import {
  exportDocumentMarkdown,
  exportDocumentHTML,
  printDocument,
  validateDocumentExtension,
  parseDocumentContent,
} from './utils/docExport'
import { isTauri, safeInvoke } from '../../utils/tauriBridge'
import { DocumentHeader } from './components/DocumentHeader'
import { DocumentRibbon } from './components/DocumentRibbon'
import { DocumentTemplatesModal } from './components/DocumentTemplatesModal'

export const DocumentWorkspace: React.FC = () => {
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem(DOC_TITLE_KEY) || 'Welcome Notes & Roadmap.md'
  })
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(DOC_THEME_KEY) === 'dark'
  })
  const [isSaved, setIsSaved] = useState<boolean>(true)
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false)
  const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: 1 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useCreateBlockNote({
    initialContent: getInitialDocContent(),
  })

  const updateStatsAndSave = useCallback(() => {
    if (!editor) return
    try {
      const blocks = editor.document
      localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(blocks))
      localStorage.setItem(DOC_TITLE_KEY, docTitle)
      addRecentItem({
        title: docTitle,
        app: 'document',
        description: 'Rich Word Document',
      })
      setIsSaved(true)

      let fullText = ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractText = (items: any[]) => {
        for (const item of items) {
          if (Array.isArray(item.content)) {
            for (const c of item.content) {
              if (c.text) fullText += ' ' + c.text
            }
          }
          if (Array.isArray(item.children)) {
            extractText(item.children)
          }
        }
      }
      extractText(blocks)

      const trimmed = fullText.trim()
      const words = trimmed ? trimmed.split(/\s+/).length : 0
      const chars = trimmed.length
      const readingTime = Math.max(1, Math.ceil(words / 200))
      setStats({ words, chars, readingTime })
    } catch (e) {
      console.error(e)
    }
  }, [editor, docTitle])

  useEffect(() => {
    if (!editor) return
    let timer: NodeJS.Timeout | null = null
    const unsubscribe = editor.onChange(() => {
      setIsSaved(false)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        updateStatsAndSave()
      }, 500)
    })
    return () => {
      if (timer) clearTimeout(timer)
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [editor, updateStatsAndSave])

  const toggleTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    localStorage.setItem(DOC_THEME_KEY, next ? 'dark' : 'light')
  }

  const handleManualSave = useCallback(() => {
    if (!editor) return
    try {
      localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(editor.document))
      localStorage.setItem(DOC_TITLE_KEY, docTitle)
      addRecentItem({
        title: docTitle,
        app: 'document',
        description: 'Rich Word Document',
      })
      setIsSaved(true)
      toast.success('Document saved to local storage!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save document.')
    }
  }, [editor, docTitle])

  useEffect(() => {
    const handleSaveEvent = () => {
      handleManualSave()
    }
    window.addEventListener('workspace-save', handleSaveEvent)
    return () => window.removeEventListener('workspace-save', handleSaveEvent)
  }, [handleManualSave])

  const handleNewDocument = () => {
    if (confirm('Create a new blank document? Current document will be replaced.')) {
      if (editor) {
        editor.replaceBlocks(editor.document, [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '', styles: {} }],
          },
        ])
        setDocTitle('Untitled Document.md')
        setIsSaved(true)
        toast.success('Created new document')
      }
    }
  }

  const handleSelectTemplate = (type: 'rfc' | 'minutes' | 'notes') => {
    if (!editor) return
    const template = getDocTemplate(type)
    editor.replaceBlocks(editor.document, template.blocks)
    setDocTitle(template.title)
    setShowTemplates(false)
    setIsSaved(false)
    toast.success(`Loaded template "${template.title}"`)
  }

  const processDocFile = async (contentOrBuffer: string | ArrayBuffer, fileName: string) => {
    if (!editor) return
    const validation = validateDocumentExtension(fileName)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      return
    }

    try {
      const blocks = await parseDocumentContent(editor, contentOrBuffer, fileName)
      if (blocks && Array.isArray(blocks) && blocks.length > 0) {
        try {
          editor.replaceBlocks(editor.document, blocks)
        } catch (replaceErr) {
          console.warn('Direct replaceBlocks failed, attempting safe insert fallback:', replaceErr)
          editor.insertBlocks(blocks, editor.document[editor.document.length - 1], 'after')
          if (editor.document.length > blocks.length) {
            editor.removeBlocks([editor.document[0]])
          }
        }
        setDocTitle(fileName)
        setIsSaved(true)
        toast.success(`Berhasil mengimpor "${fileName}"`)
      } else {
        toast.error('Tidak ada konten yang dapat dibaca dari file.')
      }
    } catch (err) {
      console.error('File parsing error:', err)
      toast.error(`Gagal membaca isi dokumen: ${(err as Error).message || err}`)
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
              name: 'Documents (*.docx, *.md, *.txt, *.html, *.json)',
              extensions: ['docx', 'md', 'markdown', 'mdown', 'mkdn', 'txt', 'text', 'log', 'html', 'htm', 'json'],
            },
          ],
          title: 'Import Document File',
        })

        if (!selected || typeof selected !== 'string') return

        const fileName = selected.split(/[/\\]/).pop() || selected

        if (fileName.toLowerCase().endsWith('.docx')) {
          const bytes = await safeInvoke<number[]>('read_file_bytes', { path: selected })
          if (bytes && Array.isArray(bytes) && bytes.length > 0) {
            const arrayBuffer = new Uint8Array(bytes).buffer
            await processDocFile(arrayBuffer, fileName)
          } else {
            toast.error('File .docx kosong atau tidak dapat diakses.')
          }
        } else {
          const content = await safeInvoke<string>('read_file', { path: selected })
          if (content !== undefined && content !== null) {
            await processDocFile(content, fileName)
          } else {
            toast.error('File kosong atau tidak dapat diakses.')
          }
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
    if (!file || !editor) return

    const validation = validateDocumentExtension(file.name)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      e.target.value = ''
      return
    }

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer()
        await processDocFile(arrayBuffer, file.name)
      } else {
        const text = await file.text()
        await processDocFile(text, file.name)
      }
    } catch (err) {
      console.error('HTML File import error:', err)
      toast.error(`Gagal membaca file: ${(err as Error).message || err}`)
    }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const validation = validateDocumentExtension(file.name)
    if (!validation.valid) {
      toast.error(validation.error || 'Format file tidak didukung.')
      return
    }

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer()
        await processDocFile(arrayBuffer, file.name)
      } else {
        const text = await file.text()
        await processDocFile(text, file.name)
      }
    } catch (err) {
      console.error('Drop error:', err)
      toast.error(`Gagal memproses file yang di-drop: ${(err as Error).message || err}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full flex flex-col transition-colors select-none overflow-hidden relative ${
        isDarkMode ? 'bg-[#18181a] text-white' : 'bg-[#f4f4f5] text-gray-900'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleHTMLFileInputChange}
        accept=".docx,.md,.markdown,.mdown,.mkdn,.txt,.text,.log,.json,.html,.htm"
        className="hidden"
      />

      <DocumentHeader
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        isSaved={isSaved}
        isDarkMode={isDarkMode}
        stats={stats}
        toggleTheme={toggleTheme}
        onManualSave={handleManualSave}
        onNewDocument={handleNewDocument}
        onOpenTemplates={() => setShowTemplates(true)}
        onExportMarkdown={() => exportDocumentMarkdown(editor, docTitle)}
        onExportHTML={() => exportDocumentHTML(editor, docTitle)}
        onPrint={printDocument}
        onUploadClick={handleImportFile}
      />

      <DocumentRibbon editor={editor} isDarkMode={isDarkMode} />

      <DocumentTemplatesModal
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
            className="absolute inset-0 z-50 bg-blue-950/80 backdrop-blur-xs border-2 border-dashed border-blue-400 flex flex-col items-center justify-center gap-3 pointer-events-none"
          >
            <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
              <UploadCloud size={48} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Drop Document Here</h3>
            <p className="text-xs text-blue-200 font-medium">Supports Word (.docx), Markdown (.md), Text (.txt), HTML, JSON</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative flex justify-center py-6 px-4">
        <div
          className={`w-full max-w-4xl min-h-full rounded-xl shadow-lg border p-6 sm:p-12 transition-all overflow-x-hidden break-words ${
            isDarkMode
              ? 'bg-[#1e1e20] border-[#2e2e32] text-gray-100'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <BlockNoteView
            editor={editor}
            theme={isDarkMode ? 'dark' : 'light'}
            className="w-full"
          />
        </div>
      </main>
    </motion.div>
  )
}
