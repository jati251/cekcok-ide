import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, FolderOpen, Check, Layers } from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import { toast } from 'react-hot-toast'
import { useIDEStore } from '../../store/useIDEStore'
import { PackageManager } from '../../types/node'
import { NODE_TEMPLATES, scaffoldNodeProject } from '../../utils/nodeInitializr'

interface NodeInitializrModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NodeInitializrModal: React.FC<NodeInitializrModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setCurrentDir } = useIDEStore()

  const [selectedTemplate, setSelectedTemplate] = useState<string>('vite-react-ts')
  const [projectName, setProjectName] = useState<string>('my-node-app')
  const [packageManager, setPackageManager] = useState<PackageManager>('npm')
  const [targetFolder, setTargetFolder] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Destination Folder for New Project',
      })
      if (selected && typeof selected === 'string') {
        setTargetFolder(selected)
      }
    } catch (err) {
      console.error('Failed to select directory:', err)
    }
  }

  const handleGenerate = async () => {
    if (!targetFolder) {
      toast.error('Please select a destination folder.')
      return
    }

    const fullProjectPath = `${targetFolder}/${projectName}`
    setIsGenerating(true)
    try {
      await scaffoldNodeProject(fullProjectPath, {
        template: selectedTemplate as any,
        name: projectName,
        packageManager,
      })
      toast.success(`Node.js project '${projectName}' created successfully! ⚡`)
      setCurrentDir(fullProjectPath)
      onClose()
    } catch (err) {
      console.error('Generation failed:', err)
      toast.error(`Failed to generate project: ${err}`)
    } finally {
      setIsGenerating(false)
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
          className="bg-[#202020] border border-ide-border rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden text-ide-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border bg-[#1b1b1b]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <Layers size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Node.js &amp; Fullstack Project Generator
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Vite &bull; Next.js &bull; Express &bull; NestJS
                  </span>
                </div>
                <p className="text-xs text-[#888888]">
                  Bootstrap modern TypeScript applications with high-velocity stacks
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#888888] hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Template Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#aaaaaa]">Select Starter Template</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {NODE_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-xs'
                          : 'bg-[#252525] border-ide-border hover:border-[#555]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{tmpl.iconBadge}</span>
                          <span className="text-xs font-bold text-white">{tmpl.title}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#888888] mb-2">{tmpl.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {tmpl.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#aaaaaa] font-mono border border-white/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Project Name & Package Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#aaaaaa]">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  placeholder="e.g. my-awesome-app"
                  className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#aaaaaa]">Package Manager</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPackageManager(pm)}
                      className={`p-2 rounded-lg border text-xs font-bold uppercase transition-colors cursor-pointer ${
                        packageManager === pm
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-[#282828] border-ide-border text-[#888888] hover:text-white'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Destination Directory */}
            <div className="bg-[#1b1b1b] p-4 rounded-xl border border-ide-border space-y-2">
              <label className="text-xs font-semibold text-[#aaaaaa]">
                Destination Directory
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={targetFolder ? `${targetFolder}/${projectName}` : ''}
                  placeholder="Select folder on your machine..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white font-mono opacity-90"
                />
                <button
                  type="button"
                  onClick={handleSelectFolder}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <FolderOpen size={14} />
                  <span>Browse...</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-ide-border bg-[#1b1b1b]">
            <div className="text-xs text-[#888888]">
              Package manager: <strong className="text-emerald-400 uppercase">{packageManager}</strong>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg hover:bg-white/10 text-xs font-medium text-[#cccccc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating || !targetFolder || !projectName}
                onClick={handleGenerate}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{isGenerating ? 'Generating...' : 'Create & Open Project'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
