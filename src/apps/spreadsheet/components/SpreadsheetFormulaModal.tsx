import React from 'react'
import { motion } from 'framer-motion'

interface SpreadsheetFormulaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SpreadsheetFormulaModal: React.FC<SpreadsheetFormulaModalProps> = ({
  isOpen,
  onClose,
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
        <h3 className="text-base font-semibold text-white mb-2">Supported Spreadsheet Formulas</h3>
        <p className="text-xs text-gray-400 mb-4">
          All standard Excel calculations and mathematical operations are supported:
        </p>

        <div className="space-y-2 text-xs font-mono max-h-64 overflow-y-auto pr-1">
          <div className="p-2 rounded bg-[#27272a] border border-[#333]">
            <span className="text-emerald-400 font-bold">=SUM(A1:A10)</span>
            <div className="text-gray-300 font-sans text-[11px] mt-0.5">
              Calculates sum of all numbers in the specified cell range.
            </div>
          </div>
          <div className="p-2 rounded bg-[#27272a] border border-[#333]">
            <span className="text-emerald-400 font-bold">=AVERAGE(B2:D2)</span>
            <div className="text-gray-300 font-sans text-[11px] mt-0.5">
              Computes arithmetic mean of cell values.
            </div>
          </div>
          <div className="p-2 rounded bg-[#27272a] border border-[#333]">
            <span className="text-emerald-400 font-bold">=IF(C1&gt;100, &quot;High&quot;, &quot;Low&quot;)</span>
            <div className="text-gray-300 font-sans text-[11px] mt-0.5">
              Logical conditional value selection based on expressions.
            </div>
          </div>
          <div className="p-2 rounded bg-[#27272a] border border-[#333]">
            <span className="text-emerald-400 font-bold">=VLOOKUP(target, table, col, false)</span>
            <div className="text-gray-300 font-sans text-[11px] mt-0.5">
              Searches for a value in the first column and returns value in matching column.
            </div>
          </div>
          <div className="p-2 rounded bg-[#27272a] border border-[#333]">
            <span className="text-emerald-400 font-bold">=COUNT(A1:A20), =MAX(A:A), =MIN(A:A)</span>
            <div className="text-gray-300 font-sans text-[11px] mt-0.5">
              Statistical aggregation functions.
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  )
}
