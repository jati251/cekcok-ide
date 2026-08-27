import React from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, BookOpen, CheckCircle2 } from 'lucide-react'

interface DocumentTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (type: 'rfc' | 'minutes' | 'notes') => void
}

export const DocumentTemplatesModal: React.FC<DocumentTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#202022] border border-[#333] rounded-xl p-5 max-w-lg w-full shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-white mb-2">Choose a Document Template</h3>
        <p className="text-xs text-gray-400 mb-4">
          Replace current editor contents with a structured starting template.
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => onSelectTemplate('rfc')}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-[#3f3f46] text-left transition-all group"
          >
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Engineering RFC Design</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Technical design document template with goals, architecture diagrams & security.
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectTemplate('minutes')}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-[#3f3f46] text-left transition-all group"
          >
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Team Meeting Minutes</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Weekly sync notes with agendas, attendees, and interactive task checkboxes.
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectTemplate('notes')}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-[#3f3f46] text-left transition-all group"
          >
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Product Release Specs</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Feature launch overview, changelog details, and key highlight bullet points.
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium text-gray-300 hover:bg-[#2e2e32] transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}
