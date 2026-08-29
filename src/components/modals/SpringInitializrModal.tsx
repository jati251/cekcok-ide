import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Coffee,
  Check,
  Search,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Layers,
  Code2,
} from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import { toast } from 'react-hot-toast'
import { useIDEStore } from '../../store/useIDEStore'
import {
  SPRING_DEPENDENCY_PRESETS,
  scaffoldSpringBootProject,
} from '../../utils/springInitializr'
import { SpringInitializrOptions } from '../../types/java'

interface SpringInitializrModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SpringInitializrModal: React.FC<SpringInitializrModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setCurrentDir } = useIDEStore()

  // Form State
  const [projectType, setProjectType] = useState<'maven-project' | 'gradle-project'>('maven-project')
  const [language, setLanguage] = useState<'java' | 'kotlin'>('java')
  const [bootVersion, setBootVersion] = useState<string>('3.4.3')
  const [groupId, setGroupId] = useState<string>('com.example')
  const [artifactId, setArtifactId] = useState<string>('demo')
  const [name, setName] = useState<string>('demo')
  const [description, setDescription] = useState<string>('Demo project for Spring Boot')
  const [packageName, setPackageName] = useState<string>('com.example.demo')
  const [packaging, setPackaging] = useState<'jar' | 'war'>('jar')
  const [javaVersion, setJavaVersion] = useState<'17' | '21' | '23'>('21')
  const [selectedDeps, setSelectedDeps] = useState<string[]>([
    'web',
    'devtools',
    'lombok',
  ])

  const [depSearch, setDepSearch] = useState('')
  const [targetFolder, setTargetFolder] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'dependencies'>('config')

  // Auto-sync package name when group or artifact changes
  const handleGroupIdChange = (val: string) => {
    setGroupId(val)
    setPackageName(`${val}.${artifactId}`.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase())
  }

  const handleArtifactIdChange = (val: string) => {
    setArtifactId(val)
    setName(val)
    setPackageName(`${groupId}.${val}`.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase())
  }

  const toggleDependency = (id: string) => {
    setSelectedDeps((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

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

    const fullProjectPath = `${targetFolder}/${artifactId}`
    const options: SpringInitializrOptions = {
      projectType,
      language,
      bootVersion,
      groupId,
      artifactId,
      name,
      description,
      packageName,
      packaging,
      javaVersion,
      dependencies: selectedDeps,
    }

    setIsGenerating(true)
    try {
      await scaffoldSpringBootProject(fullProjectPath, options)
      toast.success(`Spring Boot project '${name}' created successfully! 🎉`)
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

  const filteredDeps = SPRING_DEPENDENCY_PRESETS.filter(
    (d) =>
      d.name.toLowerCase().includes(depSearch.toLowerCase()) ||
      d.category.toLowerCase().includes(depSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(depSearch.toLowerCase())
  )

  const categories = Array.from(new Set(SPRING_DEPENDENCY_PRESETS.map((d) => d.category)))

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
          className="bg-[#202020] border border-ide-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-ide-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border bg-[#1b1b1b]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md">
                <Coffee size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Spring Initializr — New Spring Boot Project
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Java &amp; JVM
                  </span>
                </div>
                <p className="text-xs text-[#888888]">
                  Bootstrap modern Spring Boot 3+ applications with production dependencies
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-ide-border bg-[#252525] px-6">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'config'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              <Code2 size={14} />
              <span>1. Project Metadata &amp; Runtime</span>
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'dependencies'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>2. Dependencies</span>
              {selectedDeps.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                  {selectedDeps.length}
                </span>
              )}
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'config' ? (
              <div className="space-y-6">
                {/* Project Type & Language & Boot Version */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Build Tool */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#aaaaaa]">Build Tool</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProjectType('maven-project')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                          projectType === 'maven-project'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-[#2a2a2a] border-ide-border text-[#cccccc] hover:border-[#555]'
                        }`}
                      >
                        Maven
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectType('gradle-project')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                          projectType === 'gradle-project'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-[#2a2a2a] border-ide-border text-[#cccccc] hover:border-[#555]'
                        }`}
                      >
                        Gradle
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#aaaaaa]">Language</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLanguage('java')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                          language === 'java'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-[#2a2a2a] border-ide-border text-[#cccccc] hover:border-[#555]'
                        }`}
                      >
                        Java
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('kotlin')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                          language === 'kotlin'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-[#2a2a2a] border-ide-border text-[#cccccc] hover:border-[#555]'
                        }`}
                      >
                        Kotlin
                      </button>
                    </div>
                  </div>

                  {/* Spring Boot Version */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#aaaaaa]">Spring Boot Version</label>
                    <select
                      value={bootVersion}
                      onChange={(e) => setBootVersion(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#2a2a2a] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="3.4.3">3.4.3 (Current GA)</option>
                      <option value="3.3.9">3.3.9 (Maintenance)</option>
                      <option value="3.2.12">3.2.12</option>
                    </select>
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="bg-[#1b1b1b] p-4 rounded-xl border border-ide-border space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                    Project Metadata
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#aaaaaa]">Group ID</label>
                      <input
                        type="text"
                        value={groupId}
                        onChange={(e) => handleGroupIdChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500 font-mono"
                        placeholder="com.example"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#aaaaaa]">Artifact ID</label>
                      <input
                        type="text"
                        value={artifactId}
                        onChange={(e) => handleArtifactIdChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500 font-mono"
                        placeholder="demo"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#aaaaaa]">Project Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
                        placeholder="demo"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#aaaaaa]">Package Name</label>
                      <input
                        type="text"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500 font-mono"
                        placeholder="com.example.demo"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#aaaaaa]">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
                      placeholder="Demo project for Spring Boot"
                    />
                  </div>
                </div>

                {/* Java Version & Packaging */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#aaaaaa]">Java Version</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['17', '21', '23'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setJavaVersion(v)}
                          className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                            javaVersion === v
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-[#2a2a2a] border-ide-border text-[#cccccc] hover:border-[#555]'
                          }`}
                        >
                          Java {v} {v === '21' ? '(LTS)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#aaaaaa]">Packaging</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['jar', 'war'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPackaging(p)}
                          className={`p-2.5 rounded-lg border text-xs font-medium text-center uppercase transition-colors cursor-pointer ${
                            packaging === p
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-[#2a2a2a] border-ide-border text-[#cccccc] hover:border-[#555]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Destination Folder */}
                <div className="bg-[#1b1b1b] p-4 rounded-xl border border-ide-border space-y-2">
                  <label className="text-xs font-semibold text-[#aaaaaa]">
                    Destination Directory
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={targetFolder ? `${targetFolder}/${artifactId}` : ''}
                      placeholder="Select parent folder on your machine..."
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
            ) : (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
                  />
                  <input
                    type="text"
                    value={depSearch}
                    onChange={(e) => setDepSearch(e.target.value)}
                    placeholder="Search dependencies (e.g. Web, JPA, Security, Lombok, MySQL, Kafka)..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Selected Dependencies Pills */}
                {selectedDeps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-[#1b1b1b] rounded-xl border border-ide-border">
                    <span className="text-[11px] font-semibold text-[#888888] self-center mr-1">
                      Selected ({selectedDeps.length}):
                    </span>
                    {selectedDeps.map((id) => {
                      const dep = SPRING_DEPENDENCY_PRESETS.find((d) => d.id === id)
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30"
                        >
                          <Check size={11} />
                          <span>{dep?.name || id}</span>
                          <button
                            onClick={() => toggleDependency(id)}
                            className="hover:text-white cursor-pointer ml-1"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Dependencies by Category */}
                <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
                  {categories.map((category) => {
                    const depsInCat = filteredDeps.filter((d) => d.category === category)
                    if (depsInCat.length === 0) return null

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {depsInCat.map((dep) => {
                            const isSelected = selectedDeps.includes(dep.id)
                            return (
                              <div
                                key={dep.id}
                                onClick={() => toggleDependency(dep.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-emerald-500/15 border-emerald-500 shadow-xs'
                                    : 'bg-[#252525] border-ide-border hover:border-[#555]'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-semibold ${
                                          isSelected ? 'text-emerald-400' : 'text-white'
                                        }`}
                                      >
                                        {dep.name}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#888888] line-clamp-2">
                                      {dep.description}
                                    </p>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                      isSelected
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-[#555] bg-transparent'
                                    }`}
                                  >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-ide-border bg-[#1b1b1b]">
            <div className="text-xs text-[#888888]">
              {selectedDeps.length} dependencies selected &bull; Spring Boot {bootVersion} &bull; Java {javaVersion}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg hover:bg-white/10 text-xs font-medium text-[#cccccc] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {activeTab === 'config' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('dependencies')}
                  className="px-5 py-2 bg-white/15 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Dependencies</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isGenerating || !targetFolder}
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{isGenerating ? 'Generating...' : 'Generate & Open Project'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
