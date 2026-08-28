import { useState, useRef, useEffect } from 'react'
import { Command, PanelBottom, EyeOff, PanelRight, PanelLeft } from 'lucide-react'
import { useIDEStore, ToolId } from '../store/useIDEStore'
import { SidebarTab } from '../types/ide'
import { formatShortcut } from '../utils/platform'
import { TOOLS } from './ToolRegistry'

export const ActivityBar = () => {
  const { 
    activeSidebarTab, 
    sidebarOpen, 
    setActiveSidebarTab, 
    setCommandPaletteOpen,
    toolLayout,
    setToolLayout,
    settings,
    setSidebarPosition,
  } = useIDEStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; toolId: ToolId } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isSidebarRight = settings.sidebarPosition === 'right'

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    if (contextMenu) {
      window.addEventListener('mousedown', handleOutside)
    }
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [contextMenu])

  // Filter tools that are configured to be on the left panel
  const leftTools = Object.values(TOOLS).filter(t => toolLayout[t.id] === 'left')

  return (
    <aside
      style={{
        backgroundColor: 'var(--color-ide-activity-bar)',
        borderColor: 'var(--color-ide-border)',
      }}
      className={`w-12 ${isSidebarRight ? 'border-l' : 'border-r'} flex flex-col justify-between items-center py-2 select-none z-20 shrink-0`}
      data-drop-zone="left-tools"
    >
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-1 w-full" data-drop-zone="left-tools">
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
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setContextMenu({ x: e.clientX, y: e.clientY, toolId: tab.id })
              }}
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
              title={`${tab.label} (Drag or Right-Click to move)`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className={`absolute ${isSidebarRight ? 'right-0' : 'left-0'} top-1 bottom-1 w-[2px] bg-ide-accent`} />
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
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setContextMenu({ x: e.clientX, y: e.clientY, toolId: settingsTool.id })
              }}
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

      {/* Activity Bar Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-52 bg-[#252526] border border-ide-border rounded-md shadow-2xl py-1 text-xs text-[#cccccc] select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setToolLayout(contextMenu.toolId, 'bottom')
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            <PanelBottom size={13} />
            <span>Move to Panel</span>
          </button>

          <button
            onClick={() => {
              setSidebarPosition(isSidebarRight ? 'left' : 'right')
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            {isSidebarRight ? <PanelLeft size={13} /> : <PanelRight size={13} />}
            <span>Move Primary Sidebar to {isSidebarRight ? 'Left' : 'Right'}</span>
          </button>

          <div className="h-[1px] bg-ide-border my-1" />

          <button
            onClick={() => {
              setToolLayout(contextMenu.toolId, 'hidden')
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-pointer transition-colors text-left text-red-400"
          >
            <EyeOff size={13} />
            <span>Hide from Activity Bar</span>
          </button>
        </div>
      )}
    </aside>
  )
}
