import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileCode2, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import { NodeFileType, createNodeFile } from '../../utils/nodeScaffolder'

interface NewNodeFileModalProps {
  isOpen: boolean
  targetDir: string
  onClose: () => void
}

const NODE_FILE_OPTIONS: Array<{
  type: NodeFileType
  label: string
  desc: string
  badge: string
  color: string
}> = [
  {
    type: 'react-component',
    label: 'React Functional Component',
    desc: 'Typed React 19 component with props interface (.tsx)',
    badge: 'REACT',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    type: 'react-hook',
    label: 'React Custom Hook',
    desc: 'Custom hook template with state & side-effects (.ts)',
    badge: 'REACT',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    type: 'express-route',
    label: 'Express Router',
    desc: 'Router with CRUD handlers and Typed Request/Response (.ts)',
    badge: 'EXPRESS',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    type: 'nestjs-controller',
    label: 'NestJS Controller',
    desc: '@Controller with REST CRUD endpoints (.ts)',
    badge: 'NESTJS',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    type: 'nestjs-service',
    label: 'NestJS Service',
    desc: '@Injectable service class (.ts)',
    badge: 'NESTJS',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    type: 'next-route',
    label: 'Next.js Route Handler',
    desc: 'App router route.ts with GET & POST handlers',
    badge: 'NEXT.JS',
    color: 'bg-white/10 text-white border-white/20',
  },
  {
    type: 'next-page',
    label: 'Next.js App Page',
    desc: 'App router page.tsx component',
    badge: 'NEXT.JS',
    color: 'bg-white/10 text-white border-white/20',
  },
  {
    type: 'ts-interface',
    label: 'TypeScript Types / Interface',
    desc: 'TypeScript interface & type definitions (.ts)',
    badge: 'TS',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    type: 'unit-test',
    label: 'Vitest / Jest Test File',
    desc: 'Unit test suite with describe & it blocks (.test.ts)',
    badge: 'TEST',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
]

export const NewNodeFileModal: React.FC<NewNodeFileModalProps> = ({
  isOpen,
  targetDir,
  onClose,
}) => {
  const { currentDir, refreshDirectory, openFile } = useIDEStore()

  const [selectedType, setSelectedType] = useState<NodeFileType>('react-component')
  const [fileName, setFileName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectiveDir = targetDir || currentDir || ''

  useEffect(() => {
    if (isOpen) {
      setFileName('')
    }
  }, [isOpen])

  const handleCreate = async () => {
    const trimmed = fileName.trim()
    if (!trimmed) {
      toast.error('Please enter a component or file name.')
      return
    }

    setIsSubmitting(true)
    try {
      const createdPath = await createNodeFile({
        name: trimmed,
        fileType: selectedType,
        targetDir: effectiveDir,
      })

      const baseName = createdPath.split(/[/\\]/).pop() || trimmed
      toast.success(`Created ${baseName}`)
      await refreshDirectory(effectiveDir)

      openFile({
        name: baseName,
        path: createdPath,
        is_dir: false,
      } as FileNode)

      onClose()
    } catch (err) {
      console.error('Failed to create file:', err)
      toast.error(`Error creating file: ${err}`)
    } finally {
      setIsSubmitting(false)
    }
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
          className="bg-[#202020] border border-ide-border rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden text-ide-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-ide-border bg-[#1a1a1a]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <FileCode2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">New TypeScript &amp; React File</h3>
                <p className="text-[11px] text-[#888888]">
                  Scaffold components, routes, hooks, or tests with modern boilerplate
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
            {/* Type Selector Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#aaaaaa]">Select Component Type</label>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {NODE_FILE_OPTIONS.map((opt) => {
                  const isSelected = selectedType === opt.type
                  return (
                    <div
                      key={opt.type}
                      onClick={() => setSelectedType(opt.type)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-ide-accent/20 border-ide-accent shadow-xs'
                          : 'bg-[#282828] border-ide-border hover:border-[#555]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-white truncate">
                          {opt.label}
                        </span>
                        {isSelected && <Check size={12} className="text-ide-accent shrink-0" />}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${opt.color}`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#aaaaaa]">
                Name
              </label>
              <input
                autoFocus
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') onClose()
                }}
                placeholder={
                  selectedType === 'react-component'
                    ? 'e.g. Header, UserProfile'
                    : selectedType === 'react-hook'
                    ? 'e.g. useAuth, useDebounce'
                    : selectedType === 'express-route'
                    ? 'e.g. products, auth'
                    : selectedType === 'nestjs-controller'
                    ? 'e.g. ProductsController'
                    : 'e.g. user'
                }
                className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-ide-accent font-mono"
              />
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
              onClick={handleCreate}
              disabled={isSubmitting || !fileName.trim()}
              className="px-4 py-1.5 bg-ide-accent hover:bg-ide-accent-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create File'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
