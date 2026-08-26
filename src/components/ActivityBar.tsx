import { Files, Search, GitBranch, Package, Settings, Command } from 'lucide-react'
import { useIDEStore, SidebarTab } from '../store/useIDEStore'

export const ActivityBar = () => {
  const { 
    activeSidebarTab, 
    sidebarOpen, 
    setActiveSidebarTab, 
    gitStatus, 
    setCommandPaletteOpen 
  } = useIDEStore()

  const totalChanges = gitStatus.staged.length + gitStatus.unstaged.length

  const tabs: Array<{ id: SidebarTab; label: string; icon: typeof Files; badge?: number }> = [
    { id: 'explorer', label: 'Explorer', icon: Files },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'git', label: 'Source Control', icon: GitBranch, badge: totalChanges },
    { id: 'node', label: 'Node.js & NPM', icon: Package },
  ]

  return (
    <aside className="w-12 bg-[#181818] border-r border-ide-border flex flex-col justify-between items-center py-2 select-none z-20">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = sidebarOpen && activeSidebarTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSidebarTab(tab.id)}
              className={`relative w-full h-11 flex items-center justify-center transition-colors cursor-pointer group ${
                isActive ? 'text-white' : 'text-[#858585] hover:text-[#d7d7d7]'
              }`}
              title={tab.label}
            >
              {/* Active Left Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-ide-accent" />
              )}
              
              <Icon size={20} strokeWidth={1.75} />

              {/* Git Changes Badge */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-ide-accent text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-11 flex items-center justify-center text-[#858585] hover:text-[#d7d7d7] transition-colors cursor-pointer"
          title="Command Palette (Cmd+Shift+P / Cmd+P)"
        >
          <Command size={18} strokeWidth={1.75} />
        </button>
        <button
          onClick={() => setActiveSidebarTab('settings')}
          className={`relative w-full h-11 flex items-center justify-center transition-colors cursor-pointer ${
            sidebarOpen && activeSidebarTab === 'settings' ? 'text-white' : 'text-[#858585] hover:text-[#d7d7d7]'
          }`}
          title="Settings"
        >
          {sidebarOpen && activeSidebarTab === 'settings' && (
            <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-ide-accent" />
          )}
          <Settings size={19} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  )
}
