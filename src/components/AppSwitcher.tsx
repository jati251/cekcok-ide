import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2,
  FileText,
  Table,
  PenTool,
  Home,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { AppType } from '../types/ide'

interface AppSwitcherProps {
  className?: string
}

export const AppSwitcher: React.FC<AppSwitcherProps> = ({ className = '' }) => {
  const { activeApp, setActiveApp } = useIDEStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const apps = [
    {
      id: 'home' as AppType,
      label: 'Home Workspace',
      shortLabel: 'Home',
      icon: Home,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      id: 'code' as AppType,
      label: 'Code IDE',
      shortLabel: 'Code',
      icon: Code2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'spreadsheet' as AppType,
      label: 'Spreadsheet (Excel)',
      shortLabel: 'Excel',
      icon: Table,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      id: 'document' as AppType,
      label: 'Document (Word)',
      shortLabel: 'Word',
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      id: 'whiteboard' as AppType,
      label: 'Sketch & Whiteboard',
      shortLabel: 'Sketch',
      icon: PenTool,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  const currentApp = apps.find((a) => a.id === activeApp) || apps[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} data-no-drag className={`relative inline-block ${className}`}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252526] hover:bg-[#323233] border border-white/10 hover:border-white/20 text-white text-[11px] font-medium transition-all shadow-xs cursor-pointer select-none"
        title="Switch Workspace Apps"
      >
        <currentApp.icon size={13} className={currentApp.color} />
        <span className="truncate max-w-[80px] sm:max-w-[110px]">{currentApp.shortLabel}</span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-52 bg-[#202022] border border-[#38383c] rounded-xl shadow-2xl p-1.5 z-50 select-none overflow-hidden"
          >
            <div className="px-2 py-1 mb-1 border-b border-white/5 flex items-center justify-between text-[10px] uppercase font-semibold tracking-wider text-gray-400">
              <span>Switch Workspace</span>
              <Sparkles size={11} className="text-cyan-400" />
            </div>

            <div className="space-y-0.5">
              {apps.map((app) => {
                const isCurrent = app.id === activeApp
                const Icon = app.icon
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setActiveApp(app.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-1 rounded-md ${app.bg}`}>
                      <Icon size={14} className={app.color} />
                    </div>
                    <span className="flex-1 truncate">{app.label}</span>
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
