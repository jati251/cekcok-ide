import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coffee, FileCode, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import {
  JavaFileType,
  calculateJavaPackage,
  createJavaFile,
} from '../../utils/javaScaffolder'

interface NewJavaFileModalProps {
  isOpen: boolean
  targetDir: string
  onClose: () => void
}

const JAVA_FILE_OPTIONS: Array<{
  type: JavaFileType
  label: string
  desc: string
  badge: string
  color: string
}> = [
  {
    type: 'controller',
    label: 'Spring REST Controller',
    desc: '@RestController with CRUD endpoints & @RequestMapping',
    badge: 'SPRING',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    type: 'service',
    label: 'Spring Service',
    desc: '@Service component with SLF4J logger',
    badge: 'SPRING',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    type: 'repository',
    label: 'Spring Data Repository',
    desc: '@Repository interface extending JpaRepository',
    badge: 'SPRING',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    type: 'entity',
    label: 'JPA Entity',
    desc: '@Entity with @Id @GeneratedValue & audit timestamps',
    badge: 'JPA',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    type: 'record',
    label: 'Java Record / DTO',
    desc: 'Immutable data carrier (record Dto(...))',
    badge: 'JAVA',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    type: 'class',
    label: 'Java Class',
    desc: 'Standard Java class with constructor & main method',
    badge: 'JAVA',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    type: 'interface',
    label: 'Java Interface',
    desc: 'Contract interface definition',
    badge: 'JAVA',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    type: 'enum',
    label: 'Java Enum',
    desc: 'Enumeration types',
    badge: 'JAVA',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    type: 'config',
    label: 'Spring Configuration',
    desc: '@Configuration class with @Bean templates',
    badge: 'SPRING',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
]

export const NewJavaFileModal: React.FC<NewJavaFileModalProps> = ({
  isOpen,
  targetDir,
  onClose,
}) => {
  const { currentDir, refreshDirectory, openFile } = useIDEStore()

  const [selectedType, setSelectedType] = useState<JavaFileType>('controller')
  const [fileName, setFileName] = useState('')
  const [packageName, setPackageName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectiveDir = targetDir || currentDir || ''

  useEffect(() => {
    if (isOpen && effectiveDir) {
      const detectedPkg = calculateJavaPackage(effectiveDir)
      setPackageName(detectedPkg)
      setFileName('')
    }
  }, [isOpen, effectiveDir])

  const handleCreate = async () => {
    const trimmed = fileName.trim().replace(/\.java$/, '')
    if (!trimmed) {
      toast.error('Please enter a valid class name.')
      return
    }

    setIsSubmitting(true)
    try {
      const createdPath = await createJavaFile({
        name: trimmed,
        fileType: selectedType,
        targetDir: effectiveDir,
        customPackage: packageName || undefined,
      })

      toast.success(`Created ${trimmed}.java`)
      await refreshDirectory(effectiveDir)

      // Open the newly created file in the editor
      openFile({
        name: `${trimmed}.java`,
        path: createdPath,
        is_dir: false,
      } as FileNode)

      onClose()
    } catch (err) {
      console.error('Failed to create Java file:', err)
      toast.error(`Error creating Java file: ${err}`)
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
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <Coffee size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">New Java &amp; Spring File</h3>
                <p className="text-[11px] text-[#888888]">
                  Generate component with auto-resolved package &amp; annotations
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
            {/* Component Type Selector Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#aaaaaa]">Select Type</label>
              <div className="grid grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1">
                {JAVA_FILE_OPTIONS.map((opt) => {
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

            {/* Class / File Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#aaaaaa]">
                Class / Component Name
              </label>
              <div className="relative">
                <FileCode
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
                />
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
                    selectedType === 'controller'
                      ? 'e.g. UserController'
                      : selectedType === 'service'
                      ? 'e.g. UserService'
                      : selectedType === 'repository'
                      ? 'e.g. UserRepository'
                      : selectedType === 'entity'
                      ? 'e.g. User'
                      : 'e.g. MyClass'
                  }
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-ide-accent font-mono"
                />
              </div>
            </div>

            {/* Package Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#aaaaaa]">
                Package Declaration (Auto-detected)
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. com.example.demo.controller"
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
