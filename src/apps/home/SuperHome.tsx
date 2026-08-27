import React, { useState, useEffect, useMemo } from 'react'
import {
  Code2,
  FileText,
  Table,
  PenTool,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  ChevronRight,
  Folder,
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

export const SuperHome: React.FC = () => {
  const { setActiveApp, setCurrentDir } = useIDEStore()
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
      color: 'text-blue-400',
      tag: 'Developer Suite',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      bg: 'from-blue-600/10 via-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-400',
    },
    {
      id: 'spreadsheet' as const,
      title: 'Spreadsheet',
      subtitle: 'MS Excel Bootleg',
      desc: 'Excel & CSV workbooks, calculation formulas, data formatting & analysis',
      icon: Table,
      color: 'text-green-400',
      tag: 'Data & Analytics',
      badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
      bg: 'from-green-600/10 via-green-500/5 to-transparent border-green-500/20 hover:border-green-400',
    },
    {
      id: 'document' as const,
      title: 'Document',
      subtitle: 'MS Word Bootleg',
      desc: 'Rich-text word processor, Markdown, PDF export, dark mode & statistics',
      icon: FileText,
      color: 'text-purple-400',
      tag: 'Word Processor',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      bg: 'from-purple-600/10 via-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-400',
    },
    {
      id: 'whiteboard' as const,
      title: 'Sketch & Whiteboard',
      subtitle: 'Vector Drawing',
      desc: 'Infinite vector canvas, architecture diagrams, shapes & PNG/SVG exports',
      icon: PenTool,
      color: 'text-amber-400',
      tag: 'Canvas & Design',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
        return { label: 'Code', icon: Code2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
      case 'spreadsheet':
        return { label: 'Excel', icon: Table, color: 'text-green-400 bg-green-500/10 border-green-500/20' }
      case 'document':
        return { label: 'Word', icon: FileText, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
      case 'whiteboard':
        return { label: 'Sketch', icon: PenTool, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
      default:
        return { label: 'App', icon: Folder, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#18181a] text-white select-none overflow-hidden">
      {/* Top Header matching native IDE TitleBar exactly */}
      <header
        data-tauri-drag-region
        onMouseDown={handleWindowDrag}
        className="h-[38px] bg-[#181818] border-b border-ide-border text-xs text-[#cccccc] font-sans shrink-0 flex items-center justify-between px-2 cursor-default z-30 w-full select-none"
      >
        <div data-tauri-drag-region className="flex items-center gap-1.5 min-w-0">
          {/* Mac OS Window Controls Offset */}
          <div data-tauri-drag-region className="hidden sm:block w-[72px] shrink-0" />
          <span className="font-semibold text-white tracking-wide text-xs">Cekcok Super Workspace</span>
        </div>
        <div data-tauri-drag-region className="flex items-center gap-2">
          <AppSwitcher />
        </div>
      </header>

      <main className="flex-1 w-full overflow-y-auto flex flex-col items-center py-8 px-4 sm:px-8">
        <div className="max-w-5xl w-full flex flex-col gap-8">
          {/* Top Header Hero */}
          <div className="text-center flex flex-col items-center pt-2">
            <div className="relative mb-3 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
              <img
                src="/icon.png"
                alt="Cekcok Logo"
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-400 bg-clip-text text-transparent mb-1.5">
              Cekcok Super Workspace
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm max-w-lg">
              High-performance developer desktop suite with native Code IDE, Excel Spreadsheets, Word Processor &amp; Vector Sketch
            </p>

            {/* Update Available Banner */}
            {availableUpdate && (
              <div
                onClick={() => window.dispatchEvent(new CustomEvent('check-for-updates'))}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 rounded-full flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/40 transition-colors cursor-pointer shadow-lg"
              >
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <span>Update Ready (v{availableUpdate.version}) — Click to Install</span>
              </div>
            )}
          </div>

          {/* 4 Workspace Cards */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Launch Workspaces</span>
              <span className="text-[11px] text-cyan-400 font-medium">All 4 Apps Integrated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setActiveApp(app.id)}
                  className={`bg-[#202022] bg-gradient-to-b ${app.bg} border rounded-2xl p-4 cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 shadow-xl flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-[#28282c] border border-white/5 group-hover:scale-105 transition-transform">
                        <app.icon className={`w-5 h-5 ${app.color}`} />
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${app.badgeColor}`}>
                        {app.tag}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {app.title}
                    </h2>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-1 line-clamp-2">
                      {app.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-white transition-colors">
                    <span>Open Workspace</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-cyan-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workspaces / Documents Section */}
          <div className="bg-[#202022] border border-[#38383c] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Recent Documents &amp; Projects</h3>
                <span className="text-[11px] bg-white/10 text-gray-300 px-2 py-0.2 rounded-full font-mono">
                  {filteredRecents.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'code', 'spreadsheet', 'document', 'whiteboard'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRecentFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                      recentFilter === tab
                        ? 'bg-cyan-500 text-black font-semibold shadow-xs'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab === 'code' ? 'Code' : tab === 'spreadsheet' ? 'Excel' : tab === 'document' ? 'Word' : 'Sketch'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar inside recents */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recent files, workbooks, or projects..."
                className="w-full bg-[#18181a] border border-[#38383c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Recents List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {filteredRecents.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No recent files found in this category.
                </div>
              ) : (
                filteredRecents.map((item) => {
                  const badge = getAppBadge(item.app)
                  const Icon = badge.icon
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenRecent(item)}
                      className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#18181a] hover:bg-[#28282c] border border-transparent hover:border-white/10 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg border shrink-0 ${badge.color}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 truncate">
                            {item.path || item.description || 'Workspace Document'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {formatTimeAgo(item.lastModified)}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRecent(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 rounded transition-opacity cursor-pointer"
                          title="Remove from recents"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        {/* Footer info & Updater Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#2e2e32] pt-4 text-xs text-gray-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Cekcok IDE v0.2.0</span>
            <span>•</span>
            <span>Desktop Native Runtime (Tauri v2)</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-green-400 font-medium">
              <CheckCircle2 size={12} /> System Online
            </span>
          </div>

          <button
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate}
            className="hover:text-cyan-400 text-gray-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isCheckingUpdate ? 'animate-spin text-cyan-400' : ''} />
            <span>{isCheckingUpdate ? 'Checking...' : 'Check for Updates'}</span>
          </button>
        </div>
        </div>
      </main>
    </div>
  )
}
