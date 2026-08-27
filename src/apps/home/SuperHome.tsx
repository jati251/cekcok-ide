import React from 'react'
import { motion } from 'framer-motion'
import { Code2, FileText, Table, PenTool } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'

export const SuperHome: React.FC = () => {
  const { setActiveApp } = useIDEStore()

  const apps = [
    { id: 'code', title: 'Code IDE', icon: Code2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'spreadsheet', title: 'Spreadsheet', icon: Table, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'document', title: 'Document', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'whiteboard', title: 'Whiteboard', icon: PenTool, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ] as const

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-white">
      <div className="max-w-4xl w-full p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <img
            src="/icon.png"
            alt="Cekcok Logo"
            className="w-20 h-20 rounded-2xl shadow-xl border border-white/10 mb-4 hover:scale-105 transition-transform"
          />
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent mb-2">
            Cekcok Super App
          </h1>
          <p className="text-[#a0a0a0] text-sm">Professional all-in-one developer workspace suite</p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {apps.map((app) => (
            <motion.div
              key={app.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveApp(app.id)}
              className="bg-[#252526] border border-[#3c3c3c] hover:border-[#4fc1ff] rounded-xl p-6 cursor-pointer transition-colors shadow-lg flex flex-col items-center justify-center gap-4 group"
            >
              <div className={`p-4 rounded-full ${app.bg} transition-transform group-hover:scale-110`}>
                <app.icon className={`w-8 h-8 ${app.color}`} />
              </div>
              <h2 className="text-xl font-semibold">{app.title}</h2>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer info & Updater Trigger */}
        <div className="mt-12 flex items-center justify-between border-t border-[#333] pt-4 text-xs text-ide-muted">
          <span>v0.1.0 • Tauri v2 Native Core</span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('check-for-updates'))}
            className="hover:text-cyan-400 text-[#a0a0a0] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Check for Updates</span>
          </button>
        </div>
      </div>
    </div>
  )
}
