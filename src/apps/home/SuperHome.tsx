import React, { useState, useEffect, useMemo } from 'react'
import {
  Code2,
  FileText,
  Table,
  PenTool,
  Sparkles,
  RefreshCw,
  Clock,
  Trash2,
  Search,
  ChevronRight,
  Folder,
  Settings,
} from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { checkForAppUpdates, updaterEventEmitter, UpdateInfo } from '../../utils/updater'
import {
  getRecentItems,
  removeRecentItem,
  formatTimeAgo,
  RecentItem,
} from '../../utils/recentItems'
import { AppType } from '../../types/ide'
import { useWindowDrag } from '../../hooks/useWindowDrag'
import { AppSwitcher } from '../../components/AppSwitcher'
import { APP_VERSION } from '../../constants/app'

export const SuperHome: React.FC = () => {
  const { setActiveApp, setCurrentDir, setSettingsModalOpen } = useIDEStore()
  const { handleWindowDrag } = useWindowDrag()
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null)
  const [recentList, setRecentList] = useState<RecentItem[]>(() => getRecentItems())
  const [recentFilter, setRecentFilter] = useState<'all' | AppType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const custom = e as CustomEvent
      if (custom.detail?.stage === 'available' && custom.detail?.info) {
        setAvailableUpdate(custom.detail.info)
      } else if (custom.detail?.stage === 'idle') {
        setAvailableUpdate(null)
      }
    }
    updaterEventEmitter.addEventListener('update-status', handleStatus)
    return () => {
      updaterEventEmitter.removeEventListener('update-status', handleStatus)
    }
  }, [])

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true)
    try {
      const info = await checkForAppUpdates(false)
      setAvailableUpdate(info)
    } finally {
      setIsCheckingUpdate(false)
    }
  }

  const handleOpenRecent = (item: RecentItem) => {
    if (item.app === 'code' && item.path) {
      setCurrentDir(item.path)
    }
    setActiveApp(item.app)
  }

  const handleDeleteRecent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeRecentItem(id)
    setRecentList(getRecentItems())
  }

  const apps = [
    {
      id: 'code' as const,
      title: 'Code IDE',
      subtitle: 'Code Editor',
      desc: 'Monaco editor, multi-tab split, native terminal, git & diagnostics',
      icon: Code2,
      color: 'text-blue-500 dark:text-blue-400',
      tag: 'Developer Suite',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
      bg: 'from-blue-600/10 via-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-400',
    },
    {
      id: 'spreadsheet' as const,
      title: 'Spreadsheet',
      subtitle: 'MS Excel Bootleg',
      desc: 'Excel & CSV workbooks, calculation formulas, data formatting & analysis',
      icon: Table,
      color: 'text-green-600 dark:text-green-400',
      tag: 'Data & Analytics',
      badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/30',
      bg: 'from-green-600/10 via-green-500/5 to-transparent border-green-500/20 hover:border-green-400',
    },
    {
      id: 'document' as const,
      title: 'Document',
      subtitle: 'MS Word Bootleg',
      desc: 'Rich-text word processor, Markdown, PDF export, dark mode & statistics',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      tag: 'Word Processor',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
      bg: 'from-purple-600/10 via-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-400',
    },
    {
      id: 'whiteboard' as const,
      title: 'Sketch & Whiteboard',
      subtitle: 'Vector Drawing',
      desc: 'Infinite vector canvas, architecture diagrams, shapes & PNG/SVG exports',
      icon: PenTool,
      color: 'text-amber-600 dark:text-amber-400',
      tag: 'Canvas & Design',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
      bg: 'from-amber-600/10 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-400',
    },
  ]

  const filteredRecents = useMemo(() => {
    return recentList.filter((item) => {
      const matchesType = recentFilter === 'all' || item.app === recentFilter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesType && matchesSearch
    })
  }, [recentList, recentFilter, searchQuery])

  const getAppBadge = (appType: AppType) => {
    switch (appType) {
      case 'code':
        return { label: 'Code', icon: Code2, color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' }
      case 'spreadsheet':
        return { label: 'Excel', icon: Table, color: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20' }
      case 'document':
        return { label: 'Word', icon: FileText, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20' }
      case 'whiteboard':
        return { label: 'Sketch', icon: PenTool, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' }
      default:
        return { label: 'App', icon: Folder, color: 'text-gray-500 dark:text-gray-400 bg-gray-500/10 border-gray-500/20' }
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-ide-bg)',
        color: 'var(--color-ide-text)',
      }}
      className="w-full h-full flex flex-col select-none overflow-hidden"
    >
      {/* Top Header */}
      <header
        data-tauri-drag-region
        onMouseDown={handleWindowDrag}
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
        }}
        className="h-[38px] border-b text-xs font-sans shrink-0 flex items-center justify-between px-2 cursor-default z-30 w-full select-none"
      >
        <div data-tauri-drag-region className="flex items-center gap-2 min-w-0">
          {/* Mac OS Window Controls Offset */}
          <div data-tauri-drag-region className="hidden sm:block w-[72px] shrink-0" />
          <div className="flex items-center gap-1.5 opacity-80">
            <img src="/favicon.png" alt="Cekcok" className="w-3.5 h-3.5 rounded-xs shrink-0" />
            <span className="font-bold tracking-wider text-[11px] font-mono">CEKCOK</span>
          </div>
        </div>
        <div data-tauri-drag-region className="flex items-center gap-1.5">
          <button
            data-no-drag
            onClick={() => setSettingsModalOpen(true)}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 rounded-md transition-all cursor-pointer"
            title="Global Preferences & Themes (⌘,)"
          >
            <Settings size={14} />
          </button>
          <AppSwitcher />
        </div>
      </header>

      <main className="flex-1 w-full overflow-y-auto flex flex-col items-center py-6 px-4 sm:px-8">
        <div className="max-w-5xl w-full flex flex-col gap-6">
          {/* Clean Welcome & Workspace Header */}
          <div
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="Cekcok Logo"
                className="w-9 h-9 rounded-lg border shadow-xs shrink-0"
                style={{ borderColor: 'var(--color-ide-border)' }}
              />
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Workspaces &amp; Documents
                </h1>
                <p className="text-xs opacity-70">
                  Quickly launch workspaces or jump into recent projects
                </p>
              </div>
            </div>

            {/* Update Available Badge */}
            {availableUpdate && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('check-for-updates'))}
                className="px-3 py-1.5 bg-ide-accent/15 border border-ide-accent/30 rounded-lg flex items-center gap-2 text-xs font-semibold text-ide-accent hover:bg-ide-accent/25 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Sparkles size={13} className="animate-pulse" />
                <span>Update Available (v{availableUpdate.version})</span>
              </button>
            )}
          </div>

          {/* 4 Workspace Cards */}
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Workspaces</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setActiveApp(app.id)}
                  style={{
                    backgroundColor: 'var(--color-ide-sidebar)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className={`border rounded-xl p-3.5 cursor-pointer hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150 shadow-xs flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        style={{
                          backgroundColor: 'var(--color-ide-bg)',
                          borderColor: 'var(--color-ide-border)',
                        }}
                        className="p-2 rounded-lg border group-hover:scale-105 transition-transform"
                      >
                        <app.icon className={`w-4 h-4 ${app.color}`} />
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${app.badgeColor}`}>
                        {app.tag}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold transition-colors group-hover:text-ide-accent">
                      {app.title}
                    </h2>
                    <p className="text-[11px] opacity-70 leading-relaxed mt-1 line-clamp-2">
                      {app.desc}
                    </p>
                  </div>

                  <div
                    style={{ borderColor: 'var(--color-ide-border)' }}
                    className="mt-3.5 pt-2.5 border-t flex items-center justify-between text-[11px] opacity-70 group-hover:opacity-100 transition-colors"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform text-ide-accent" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workspaces / Documents Section */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-sidebar)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="border rounded-xl p-4 shadow-sm"
          >
            <div
              style={{ borderColor: 'var(--color-ide-border)' }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-2.5 border-b"
            >
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-ide-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Recent Documents &amp; Projects</h3>
                <span
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="text-[10px] border px-1.5 py-0.2 rounded-full font-mono opacity-80"
                >
                  {filteredRecents.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'code', 'spreadsheet', 'document', 'whiteboard'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRecentFilter(tab)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                      recentFilter === tab
                        ? 'bg-ide-accent text-white font-semibold shadow-xs'
                        : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab === 'code' ? 'Code' : tab === 'spreadsheet' ? 'Excel' : tab === 'document' ? 'Word' : 'Sketch'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar inside recents */}
            <div className="relative mb-2.5">
              <Search size={13} className="absolute left-3 top-2.5 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recent files or projects..."
                style={{
                  backgroundColor: 'var(--color-ide-bg)',
                  borderColor: 'var(--color-ide-border)',
                  color: 'var(--color-ide-text)',
                }}
                className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder-gray-400 focus:border-ide-accent focus:outline-hidden transition-colors"
              />
            </div>

            {/* Recents List */}
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {filteredRecents.length === 0 ? (
                <div className="py-6 text-center text-xs opacity-60">
                  No recent items found.
                </div>
              ) : (
                filteredRecents.map((item) => {
                  const badge = getAppBadge(item.app)
                  const Icon = badge.icon
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenRecent(item)}
                      style={{
                        backgroundColor: 'var(--color-ide-bg)',
                        borderColor: 'var(--color-ide-border)',
                      }}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg border hover:border-ide-accent/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-md border shrink-0 ${badge.color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold truncate group-hover:text-ide-accent transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] opacity-60 truncate">
                            {item.path || item.description || 'Workspace Document'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span className="text-[10px] opacity-50 font-mono">
                          {formatTimeAgo(item.lastModified)}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRecent(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 opacity-60 hover:opacity-100 hover:text-red-500 rounded transition-opacity cursor-pointer"
                          title="Remove from recents"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Clean Footer */}
          <div
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="flex items-center justify-between border-t pt-3 text-xs opacity-70"
          >
            <span className="font-semibold">Cekcok IDE v{APP_VERSION}</span>

            <button
              onClick={handleCheckUpdate}
              disabled={isCheckingUpdate}
              className="hover:text-ide-accent opacity-80 hover:opacity-100 flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isCheckingUpdate ? 'animate-spin text-ide-accent' : ''} />
              <span>{isCheckingUpdate ? 'Checking...' : 'Check for Updates'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
