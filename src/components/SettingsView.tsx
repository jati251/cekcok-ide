import { useState } from 'react'
import { Search, Palette, Type, Sliders, Check } from 'lucide-react'
import { useIDEStore, UserSettings } from '../store/useIDEStore'
import { THEMES } from '../utils/themes'
import { formatShortcut } from '../utils/platform'

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useIDEStore()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'editor' | 'theme' | 'files'>('all')

  const categories = [
    { id: 'all', label: 'Commonly Used', icon: Sliders },
    { id: 'theme', label: 'Workbench: Color Theme', icon: Palette },
    { id: 'editor', label: 'Text Editor', icon: Type },
  ]

  const matchesSearch = (text: string) => {
    return text.toLowerCase().includes(search.toLowerCase())
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] select-none">
      {/* Header Search Bar */}
      <div className="p-3 border-b border-ide-border bg-[#252526] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Settings</span>
          <span className="text-[10px] text-ide-muted font-mono">User Settings</span>
        </div>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settings..."
            className="w-full bg-[#3c3c3c] text-white text-xs pl-8 pr-2.5 py-1.5 rounded border border-transparent focus:border-ide-accent focus:outline-none placeholder-[#777]"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Category Sidebar */}
        <div className="w-44 border-r border-ide-border bg-[#212121] p-2 space-y-0.5 shrink-0 overflow-y-auto">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as 'all' | 'editor' | 'theme' | 'files')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                  isActive ? 'bg-ide-accent text-white font-medium' : 'hover:bg-white/5 text-[#999]'
                }`}
              >
                <Icon size={14} />
                <span className="truncate">{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* THEME SECTION */}
          {(activeCategory === 'all' || activeCategory === 'theme') && matchesSearch('Color Theme') && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Workbench: Color Theme</h3>
                <p className="text-xs text-ide-muted">Specifies the color theme used in the workbench and editor.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(THEMES).map((th) => {
                  const isSelected = settings.theme === th.id
                  return (
                    <div
                      key={th.id}
                      onClick={() => updateSettings({ theme: th.id as UserSettings['theme'] })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-ide-accent bg-white/5 ring-1 ring-ide-accent' 
                          : 'border-ide-border hover:border-white/20 bg-[#252526]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-white">{th.name}</span>
                        {isSelected && <Check size={14} className="text-ide-accent" />}
                      </div>
                      
                      {/* Theme Mini Color Palette Preview */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: th.colors.bg }} title="Editor BG" />
                        <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: th.colors.sidebar }} title="Sidebar" />
                        <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: th.colors.accent }} title="Accent" />
                        <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: th.colors.statusBar }} title="Status Bar" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* EDITOR FONT & SIZING */}
          {(activeCategory === 'all' || activeCategory === 'editor') && (
            <>
              {matchesSearch('Font Size') && (
                <div className="space-y-1.5 pb-4 border-b border-ide-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Editor: Font Size</h4>
                      <p className="text-[11px] text-ide-muted">Controls the font size in pixels.</p>
                    </div>
                    <span className="text-xs font-mono text-ide-accent">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="28"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full accent-ide-accent cursor-pointer"
                  />
                </div>
              )}

              {matchesSearch('Tab Size') && (
                <div className="space-y-1.5 pb-4 border-b border-ide-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Editor: Tab Size</h4>
                    <p className="text-[11px] text-ide-muted">The number of spaces a tab is equal to.</p>
                  </div>
                  <select
                    value={settings.tabSize}
                    onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
                    className="bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 rounded border border-ide-border focus:outline-none cursor-pointer"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                    <option value={8}>8 Spaces</option>
                  </select>
                </div>
              )}

              {matchesSearch('Word Wrap') && (
                <div className="space-y-1.5 pb-4 border-b border-ide-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Editor: Word Wrap</h4>
                    <p className="text-[11px] text-ide-muted">Controls how lines should wrap.</p>
                  </div>
                  <select
                    value={settings.wordWrap}
                    onChange={(e) => updateSettings({ wordWrap: e.target.value as 'on' | 'off' })}
                    className="bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 rounded border border-ide-border focus:outline-none cursor-pointer"
                  >
                    <option value="on">on (Lines will wrap at viewport width)</option>
                    <option value="off">off (Lines will not wrap)</option>
                  </select>
                </div>
              )}

              {matchesSearch('Minimap') && (
                <div className="flex items-center justify-between pb-4 border-b border-ide-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Editor: Minimap</h4>
                    <p className="text-[11px] text-ide-muted">Controls whether the minimap is shown.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.minimapEnabled}
                    onChange={(e) => updateSettings({ minimapEnabled: e.target.checked })}
                    className="w-4 h-4 accent-ide-accent cursor-pointer"
                  />
                </div>
              )}

              {matchesSearch('Auto Save') && (
                <div className="space-y-1.5 pb-4 border-b border-ide-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Files: Auto Save</h4>
                    <p className="text-[11px] text-ide-muted">Controls auto save of dirty editors.</p>
                  </div>
                  <select
                    value={settings.autoSave}
                    onChange={(e) => updateSettings({ autoSave: e.target.value as UserSettings['autoSave'] })}
                    className="bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 rounded border border-ide-border focus:outline-none cursor-pointer"
                  >
                    <option value="afterDelay">afterDelay (Auto-saves changes in RAM)</option>
                    <option value="onFocusChange">onFocusChange (Save when switching tabs)</option>
                    <option value="off">off (Manual {formatShortcut('Cmd+S')} only)</option>
                  </select>
                </div>
              )}

              {matchesSearch('Startup Behavior') && (
                <div className="space-y-1.5 pb-4 border-b border-ide-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Workbench: Startup Behavior</h4>
                    <p className="text-[11px] text-ide-muted">Controls how the IDE restores workspaces upon launch.</p>
                  </div>
                  <select
                    value={settings.startupBehavior}
                    onChange={(e) => updateSettings({ startupBehavior: e.target.value as UserSettings['startupBehavior'] })}
                    className="bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 rounded border border-ide-border focus:outline-none cursor-pointer"
                  >
                    <option value="restoreLastProject">restoreLastProject (Open previous project automatically)</option>
                    <option value="welcomePage">welcomePage (Open Get Started screen)</option>
                    <option value="empty">empty (Open empty workspace)</option>
                  </select>
                </div>
              )}

              {matchesSearch('Hidden Files') && (
                <div className="flex items-center justify-between pb-4 border-b border-ide-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Files: Show Hidden Files</h4>
                    <p className="text-[11px] text-ide-muted">Controls whether dotfiles (e.g. .env, .gitignore) are shown.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showHiddenFiles}
                    onChange={(e) => updateSettings({ showHiddenFiles: e.target.checked })}
                    className="w-4 h-4 accent-ide-accent cursor-pointer"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
