import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useIDEStore } from '../../store/useIDEStore'
import { formatInstallCommand } from '../../utils/nodeParser'

interface InstallPackageModalProps {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_PACKAGES = [
  { name: 'axios', desc: 'Promise based HTTP client', isDev: false },
  { name: 'zod', desc: 'TypeScript-first schema validation', isDev: false },
  { name: 'date-fns', desc: 'Modern JavaScript date utility library', isDev: false },
  { name: 'zustand', desc: 'Bearbones state management', isDev: false },
  { name: 'clsx', desc: 'Utility for constructing className strings', isDev: false },
  { name: 'tailwind-merge', desc: 'Merge Tailwind CSS classes without style conflicts', isDev: false },
  { name: 'lucide-react', desc: 'Beautiful & consistent icon toolkit', isDev: false },
  { name: 'framer-motion', desc: 'Production-ready motion library for React', isDev: false },
  { name: '@types/node', desc: 'TypeScript definitions for Node.js', isDev: true },
  { name: 'vitest', desc: 'Next generation testing framework', isDev: true },
  { name: 'prettier', desc: 'Opinionated code formatter', isDev: true },
  { name: 'tsx', desc: 'TypeScript Execute CLI', isDev: true },
]

export const InstallPackageModal: React.FC<InstallPackageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { packageManager, runTerminalCommand } = useIDEStore()
  const [packageName, setPackageName] = useState('')
  const [isDev, setIsDev] = useState(false)

  const handleInstall = (pkgToInstall?: string, devFlag?: boolean) => {
    const target = pkgToInstall || packageName.trim()
    const dev = devFlag !== undefined ? devFlag : isDev

    if (!target) {
      toast.error('Please enter a package name.')
      return
    }

    const cmd = formatInstallCommand(packageManager, target, dev)
    runTerminalCommand(cmd)
    toast.success(`Executing: ${cmd}`)
    onClose()
    setPackageName('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#202020] border border-ide-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden text-ide-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-ide-border bg-[#1a1a1a]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Package size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Install NPM Package</h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    {packageManager}
                  </span>
                </div>
                <p className="text-[11px] text-[#888888]">
                  Add dependency to your current project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-[#888888] hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#aaaaaa]">
                Package Name or Specifier
              </label>
              <input
                autoFocus
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInstall()
                  if (e.key === 'Escape') onClose()
                }}
                placeholder="e.g. lodash, axios@latest, tailwindcss..."
                className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Checkbox Save Dev */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#cccccc]">
              <input
                type="checkbox"
                checked={isDev}
                onChange={(e) => setIsDev(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0 bg-[#282828] border-ide-border"
              />
              <span>Save as Developer Dependency (<code>-D</code> / <code>--save-dev</code>)</span>
            </label>

            {/* Popular Presets */}
            <div className="space-y-2 pt-2 border-t border-ide-border">
              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                Quick Install Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {POPULAR_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.name}
                    onClick={() => handleInstall(pkg.name, pkg.isDev)}
                    className="p-2 rounded-lg border border-ide-border bg-[#252525] hover:border-emerald-500 hover:bg-[#2a2a2a] cursor-pointer transition-all flex items-center justify-between gap-1 group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-medium text-white truncate group-hover:text-emerald-400">
                        {pkg.name}
                      </div>
                      <div className="text-[10px] text-[#777777] truncate">{pkg.desc}</div>
                    </div>
                    <Download size={12} className="text-[#888888] group-hover:text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-ide-border bg-[#1a1a1a]">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs text-[#cccccc] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleInstall()}
              disabled={!packageName.trim()}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
