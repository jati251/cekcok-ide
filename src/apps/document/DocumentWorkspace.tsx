import React from 'react'
import { BlockNoteEditor } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { ArrowLeft, Save } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export const DocumentWorkspace: React.FC = () => {
  const { setActiveApp } = useIDEStore()
  const editor: BlockNoteEditor = useCreateBlockNote()

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col bg-white"
    >
      <div className="h-12 bg-[#252526] text-white flex items-center justify-between px-4 border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveApp('home')}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-semibold text-sm">Document Workspace</span>
        </div>
        <button 
          onClick={() => toast.success('Document saved!')}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#4fc1ff]/20 text-[#4fc1ff] hover:bg-[#4fc1ff]/30 rounded text-xs font-medium transition-colors"
        >
          <Save size={14} />
          Save
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-12 px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 ml-12">Untitled Document</h1>
          <BlockNoteView editor={editor} theme="light" />
        </div>
      </div>
    </motion.div>
  )
}
