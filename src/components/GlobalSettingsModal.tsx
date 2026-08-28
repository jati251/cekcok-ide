import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Palette,
  Type,
  Sliders,
  Sparkles,
  RefreshCw,
  Check,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { THEMES } from '../utils/themes'
import { checkForAppUpdates, useAppUpdateInfo } from '../utils/updater'
import { APP_VERSION } from '../constants/app'
import { useClickOutside } from '../hooks/useClickOutside'

const FONT_FAMILIES = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Fira Code', value: "'Fira Code', monospace" },
  { label: 'Menlo / Monaco', value: "Menlo, Monaco, 'Courier New', monospace" },
  { label: 'Consolas', value: "Consolas, 'Courier New', monospace" },
  { label: 'Inter (UI Default)', value: "Inter, -apple-system, sans-serif" },
]

export const GlobalSettingsModal: React.FC = () => {
  const { settingsModalOpen, setSettingsModalOpen, settings, updateSettings } = useIDEStore()
  const [activeTab, setActiveTab] = useState<'theme' | 'typography' | 'editor' | 'updates'>('theme')
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const availableUpdate = useAppUpdateInfo()
  const modalRef = useClickOutside<HTMLDivElement>(() => setSettingsModalOpen(false), settingsModalOpen)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setSettingsModalOpen(!settingsModalOpen)
      } else if (e.key === 'Escape' && settingsModalOpen) {
        setSettingsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settingsModalOpen, setSettingsModalOpen])

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true)
    try {
      await checkForAppUpdates(false)
    } finally {
      setIsCheckingUpdate(false)
    }
  }

  if (!settingsModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={() => setSettingsModalOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          style={{
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
            color: 'var(--color-ide-text)',
          }}
          className="relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-ide-accent/20 text-ide-accent rounded-lg">
                <Sliders size={16} />
              </div>
              <h2 className="text-sm font-bold tracking-wide">Global IDE Preferences</h2>
            </div>
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 rounded-lg transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-bg)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="flex items-center px-4 border-b shrink-0 gap-1 overflow-x-auto no-scrollbar"
          >
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'theme'
                  ? 'border-ide-accent text-ide-accent'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Palette size={13} />
              <span>Theme &amp; Mode</span>
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'typography'
                  ? 'border-ide-accent text-ide-accent'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Type size={13} />
              <span>Typography</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'editor'
                  ? 'border-ide-accent text-ide-accent'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Sliders size={13} />
              <span>Editor Behavior</span>
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'updates'
                  ? 'border-ide-accent text-ide-accent'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Sparkles size={13} />
              <span>About &amp; Updates</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
            {/* Tab: Theme & Mode */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                {/* Instant Mode Selector */}
                <div>
                  <h3 className="font-semibold text-xs mb-1.5">Workspace Mode</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateSettings({ theme: 'vs-dark' })}
                      style={{ borderColor: settings.theme !== 'vs-light' ? 'var(--color-ide-accent)' : 'var(--color-ide-border)' }}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                        settings.theme !== 'vs-light'
                          ? 'bg-ide-accent/20 text-ide-accent ring-1 ring-ide-accent/50'
                          : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Moon size={15} />
                      <span>Dark Mode</span>
                    </button>

                    <button
                      onClick={() => updateSettings({ theme: 'vs-light' })}
                      style={{ borderColor: settings.theme === 'vs-light' ? 'var(--color-ide-accent)' : 'var(--color-ide-border)' }}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                        settings.theme === 'vs-light'
                          ? 'bg-ide-accent/20 text-ide-accent ring-1 ring-ide-accent/50'
                          : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Sun size={15} />
                      <span>Light Mode</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{ borderColor: 'var(--color-ide-border)' }}
                  className="pt-2 border-t"
                >
                  <h3 className="font-semibold text-xs mb-1">Color Theme Preset</h3>
                  <p className="text-[11px] opacity-70 mb-2.5">
                    Select a curated color palette for the editor and application UI.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(THEMES).map((theme) => {
                    const isSelected = settings.theme === theme.id
                    const isLight = theme.monacoBase === 'vs'
                    return (
                      <div
                        key={theme.id}
                        onClick={() => updateSettings({ theme: theme.id })}
                        style={{
                          backgroundColor: 'var(--color-ide-bg)',
                          borderColor: isSelected ? 'var(--color-ide-accent)' : 'var(--color-ide-border)',
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-ide-accent/15 shadow-sm ring-1 ring-ide-accent/50'
                            : 'hover:border-ide-accent/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0"
                            style={{ backgroundColor: theme.colors.bg }}
                          >
                            {isLight ? (
                              <Sun size={10} className="text-amber-500" />
                            ) : (
                              <Moon size={10} className="text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs">{theme.name}</div>
                            <div className="text-[10px] opacity-60">
                              {isLight ? 'Light workspace' : 'Dark workspace'}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-ide-accent text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tab: Typography */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-xs mb-1">Editor Font Family</h3>
                  <p className="text-[11px] opacity-70">
                    Choose the monospace font family used across code and terminals.
                  </p>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                    style={{
                      backgroundColor: 'var(--color-ide-bg)',
                      borderColor: 'var(--color-ide-border)',
                      color: 'var(--color-ide-text)',
                    }}
                    className="mt-2 w-full border rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-ide-accent"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{ borderColor: 'var(--color-ide-border)' }}
                  className="pt-3 border-t"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-xs">Editor Font Size</h3>
                    <span className="text-ide-accent font-mono text-xs">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={24}
                    step={1}
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
                    className="w-full accent-ide-accent"
                  />
                </div>

                {/* Live Preview Box */}
                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="p-3 border rounded-xl space-y-1"
                >
                  <div className="text-[10px] opacity-50 uppercase font-bold tracking-wider">
                    Typography Live Preview
                  </div>
                  <div
                    style={{
                      fontFamily: settings.fontFamily,
                      fontSize: `${settings.fontSize}px`,
                    }}
                    className="text-ide-accent font-mono pt-1"
                  >
                    const cekcok = async () =&gt; &#123; return &quot;fast native code&quot; &#125;;
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Editor Behavior */}
            {activeTab === 'editor' && (
              <div className="space-y-4">
                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-xs">Auto Save</div>
                    <div className="text-[10px] opacity-60">Save dirty files automatically</div>
                  </div>
                  <select
                    value={settings.autoSave}
                    onChange={(e) =>
                      updateSettings({ autoSave: e.target.value as 'off' | 'afterDelay' | 'onFocusChange' })
                    }
                    style={{
                      backgroundColor: 'var(--color-ide-sidebar)',
                      borderColor: 'var(--color-ide-border)',
                      color: 'var(--color-ide-text)',
                    }}
                    className="border rounded-lg px-2.5 py-1 text-xs"
                  >
                    <option value="off">Off (Manual Save)</option>
                    <option value="afterDelay">After Delay (1s)</option>
                    <option value="onFocusChange">On Focus Change</option>
                  </select>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-xs">Tab Indent Size</div>
                    <div className="text-[10px] opacity-60">Number of spaces per tab</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[2, 4].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ tabSize: size })}
                        style={{
                          backgroundColor: settings.tabSize === size ? 'var(--color-ide-accent)' : 'var(--color-ide-sidebar)',
                          borderColor: 'var(--color-ide-border)',
                          color: settings.tabSize === size ? '#ffffff' : 'var(--color-ide-text)',
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                      >
                        {size} Spaces
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-xs">Word Wrap</div>
                    <div className="text-[10px] opacity-60">Wrap long lines in editor</div>
                  </div>
                  <button
                    onClick={() => updateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })}
                    style={{
                      backgroundColor: settings.wordWrap === 'on' ? 'var(--color-ide-accent)' : 'var(--color-ide-sidebar)',
                      borderColor: 'var(--color-ide-border)',
                      color: settings.wordWrap === 'on' ? '#ffffff' : 'var(--color-ide-text)',
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                  >
                    {settings.wordWrap === 'on' ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-xs">Editor Minimap</div>
                    <div className="text-[10px] opacity-60">Show right code overview minimap</div>
                  </div>
                  <button
                    onClick={() => updateSettings({ minimapEnabled: !settings.minimapEnabled })}
                    style={{
                      backgroundColor: settings.minimapEnabled ? 'var(--color-ide-accent)' : 'var(--color-ide-sidebar)',
                      borderColor: 'var(--color-ide-border)',
                      color: settings.minimapEnabled ? '#ffffff' : 'var(--color-ide-text)',
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                  >
                    {settings.minimapEnabled ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-xs">Format On Save</div>
                    <div className="text-[10px] opacity-60">Automatically format document on save</div>
                  </div>
                  <button
                    onClick={() => updateSettings({ formatOnSave: !settings.formatOnSave })}
                    style={{
                      backgroundColor: settings.formatOnSave ? 'var(--color-ide-accent)' : 'var(--color-ide-sidebar)',
                      borderColor: 'var(--color-ide-border)',
                      color: settings.formatOnSave ? '#ffffff' : 'var(--color-ide-text)',
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                  >
                    {settings.formatOnSave ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: About & Updates */}
            {activeTab === 'updates' && (
              <div className="space-y-4">
                <div
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="p-4 border rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="Cekcok Logo" className="w-10 h-10 rounded-lg shadow-sm" />
                    <div>
                      <h4 className="font-bold text-xs">Cekcok IDE</h4>
                      <p className="text-[11px] text-ide-accent font-mono">v{APP_VERSION}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckUpdate}
                    disabled={isCheckingUpdate}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-ide-accent text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isCheckingUpdate ? 'animate-spin' : ''} />
                    <span>{isCheckingUpdate ? 'Checking...' : 'Check for Updates'}</span>
                  </button>
                </div>

                {availableUpdate ? (
                  <div className="p-3.5 bg-ide-accent/15 border border-ide-accent/40 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-ide-accent text-xs">
                        New Version Available (v{availableUpdate.version})
                      </div>
                      <div className="text-[11px] opacity-80">Ready to download and install.</div>
                    </div>
                    <button
                      onClick={() => {
                        setSettingsModalOpen(false)
                        window.dispatchEvent(new CustomEvent('check-for-updates'))
                      }}
                      className="px-3 py-1.5 bg-ide-accent hover:opacity-90 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer"
                    >
                      Update Now
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: 'var(--color-ide-bg)',
                      borderColor: 'var(--color-ide-border)',
                    }}
                    className="p-3 border rounded-xl text-[11px] opacity-70 flex items-center gap-2"
                  >
                    <Laptop size={14} />
                    <span>You are running the latest version of Cekcok IDE.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-bg)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="flex items-center justify-between px-5 py-3 border-t text-[11px] opacity-70 shrink-0"
          >
            <span>Press <kbd className="border px-1 py-0.5 rounded font-mono">Esc</kbd> to exit</span>
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="px-3.5 py-1.5 bg-ide-accent text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
