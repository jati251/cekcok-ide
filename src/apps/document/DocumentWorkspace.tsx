import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
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
} from './utils/docExport'
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
    const unsubscribe = editor.onChange(() => {
      setIsSaved(false)
      updateStatsAndSave()
    })
    return () => {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        if (text) {
          if (file.name.endsWith('.json')) {
            const blocks = JSON.parse(text)
            if (Array.isArray(blocks)) {
              editor.replaceBlocks(editor.document, blocks)
            }
          } else {
            const blocks = await editor.tryParseMarkdownToBlocks(text)
            editor.replaceBlocks(editor.document, blocks)
          }
          setDocTitle(file.name)
          setIsSaved(true)
          toast.success(`Imported "${file.name}"`)
        }
      } catch (err) {
        console.error('File import error:', err)
        toast.error('Failed to parse file content.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full flex flex-col transition-colors select-none overflow-hidden ${
        isDarkMode ? 'bg-[#18181a] text-white' : 'bg-[#f4f4f5] text-gray-900'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".md,.txt,.json,.html"
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
        onUploadClick={() => fileInputRef.current?.click()}
      />

      <DocumentRibbon editor={editor} isDarkMode={isDarkMode} />

      <DocumentTemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Editor Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative flex justify-center py-6 px-4">
        <div
          className={`w-full max-w-4xl min-h-full rounded-xl shadow-lg border p-6 sm:p-12 transition-all ${
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
