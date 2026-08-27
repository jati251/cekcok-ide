import React, { useState } from 'react'
import { Workbook } from '@fortune-sheet/react'
import '@fortune-sheet/react/dist/index.css'
import { ArrowLeft, Save } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export const SpreadsheetWorkspace: React.FC = () => {
  const { setActiveApp } = useIDEStore()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([
    {
      name: 'Sheet1',
      celldata: [{ r: 0, c: 0, v: { v: 'Cekcok Spreadsheet!' } }]
    }
  ])

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
          <span className="font-semibold text-sm">Spreadsheet Workspace</span>
        </div>
        <button 
          onClick={() => toast.success('Spreadsheet saved!')}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#4fc1ff]/20 text-[#4fc1ff] hover:bg-[#4fc1ff]/30 rounded text-xs font-medium transition-colors"
        >
          <Save size={14} />
          Save
        </button>
      </div>
      <div className="flex-1 relative">
        <Workbook 
          data={data}

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(d: any) => setData(d)}
          lang="en"
        />
      </div>
    </motion.div>
  )
}
