import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, FileSpreadsheet, Calculator } from 'lucide-react'

interface SpreadsheetTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (type: 'budget' | 'invoice' | 'grades') => void
}

export const SpreadsheetTemplatesModal: React.FC<SpreadsheetTemplatesModalProps> = ({
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
        <h3 className="text-base font-semibold text-white mb-2">Choose a Spreadsheet Template</h3>
        <p className="text-xs text-gray-400 mb-4">
          Select a pre-built spreadsheet model to quickly start analysis.
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => onSelectTemplate('budget')}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-[#3f3f46] text-left transition-all group"
          >
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Monthly Budget &amp; Variance</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Expense tracking with planned budget, actual amounts, and automatic variance calculation formulas.
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectTemplate('invoice')}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-[#3f3f46] text-left transition-all group"
          >
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Client Billing Invoice</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Service billing statement with hours, hourly rate, tax rate, and calculated grand totals.
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectTemplate('grades')}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-[#3f3f46] text-left transition-all group"
          >
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Academic Gradebook &amp; Average</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Student grading roster with assignment averages and automatic performance ratings.
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
