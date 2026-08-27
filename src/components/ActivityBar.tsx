import { Command } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { SidebarTab } from '../types/ide'
import { formatShortcut } from '../utils/platform'
import { TOOLS } from './ToolRegistry'

export const ActivityBar = () => {
  const { 
    activeSidebarTab, 
    sidebarOpen, 
    setActiveSidebarTab, 
    setCommandPaletteOpen,
    toolLayout
  } = useIDEStore()

  // Filter tools that are configured to be on the left panel
  const leftTools = Object.values(TOOLS).filter(t => toolLayout[t.id] === 'left')

  return (
    <aside
      style={{
        backgroundColor: 'var(--color-ide-activity-bar)',
        borderColor: 'var(--color-ide-border)',
      }}
      className="w-12 border-r flex flex-col justify-between items-center py-2 select-none z-20 shrink-0"
      data-drop-zone="left-tools"
    >
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {leftTools.map((tab) => {
          const Icon = tab.icon
          const isActive = sidebarOpen && activeSidebarTab === tab.id
          
          // Use full IDE state for badge evaluation
          const state = useIDEStore.getState()
          const badgeValue = tab.getBadge ? tab.getBadge(state) : undefined

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSidebarTab(tab.id as SidebarTab)}
              onPointerDown={(e) => {
                if (e.button !== 0) return
                useIDEStore.getState().setPendingDragPayload({
                  type: 'tool',
                  toolId: tab.id,
                })
                useIDEStore.getState().setDragStartCoords({ x: e.clientX, y: e.clientY })
              }}
              style={{
                color: isActive ? 'var(--color-ide-accent)' : 'var(--color-ide-text)',
              }}
              className={`relative w-full h-11 flex items-center justify-center transition-colors cursor-pointer group ${
                isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={tab.label}
            >
              {/* Active Left Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-ide-accent" />
              )}
              
              <Icon size={20} strokeWidth={1.75} />

              {/* Dynamic Badge */}
              {badgeValue !== undefined && (
                <span className="absolute top-1.5 right-1 bg-ide-accent text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1">
                  {badgeValue}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Icons (Fixed System Icons) */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          style={{ color: 'var(--color-ide-text)' }}
          className="w-full h-11 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={`Command Palette (${formatShortcut('Cmd+Shift+P')} / ${formatShortcut('Cmd+P')})`}
        >
          <Command size={18} strokeWidth={1.75} />
        </button>
        
        {/* Render Settings dynamically if it's placed on the left */}
        {(() => {
          const settingsTool = TOOLS.settings
          if (toolLayout.settings !== 'left') return null
          const SettingsIcon = settingsTool.icon
          return (
            <button
              key={settingsTool.id}
              onClick={() => setActiveSidebarTab('settings')}
              onPointerDown={(e) => {
                if (e.button !== 0) return
                useIDEStore.getState().setPendingDragPayload({ type: 'tool', toolId: settingsTool.id })
                useIDEStore.getState().setDragStartCoords({ x: e.clientX, y: e.clientY })
              }}
              style={{ color: 'var(--color-ide-text)' }}
              className="w-full h-11 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title={`Settings (${formatShortcut('Cmd+,')})`}
            >
              <SettingsIcon size={19} strokeWidth={1.75} />
            </button>
          )
        })()}
      </div>
    </aside>
  )
}
