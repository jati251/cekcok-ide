import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Command, PanelBottom, EyeOff, PanelRight, PanelLeft } from 'lucide-react'
import { useIDEStore, ToolId } from '../store/useIDEStore'
import { SidebarTab } from '../types/ide'
import { formatShortcut } from '../utils/platform'
import { TOOLS, ToolDefinition } from './ToolRegistry'

interface ActivityBarItemProps {
  tab: ToolDefinition
  isActive: boolean
  isSidebarRight: boolean
  onContextMenu: (e: React.MouseEvent, toolId: ToolId) => void
  onSelect: (toolId: ToolId) => void
}

const ActivityBarItem: React.FC<ActivityBarItemProps> = React.memo(({
  tab,
  isActive,
  isSidebarRight,
  onContextMenu,
  onSelect,
}) => {
  const Icon = tab.icon
  const badgeValue = useIDEStore((state) => (tab.getBadge ? tab.getBadge(state) : undefined))

  return (
    <button
      onClick={() => onSelect(tab.id)}
      onContextMenu={(e) => onContextMenu(e, tab.id)}
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
      {/* Sleek rounded glowing indicator bar */}
      {isActive && (
        <div
          className={`absolute ${
            isSidebarRight ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'
          } top-2 bottom-2 w-[3px] bg-ide-accent shadow-[0_0_8px_var(--color-ide-accent)]`}
        />
      )}

      <Icon size={20} strokeWidth={1.75} />

      {/* Dynamic Reactive Badge */}
      {badgeValue !== undefined && (
        <span className="absolute top-1.5 right-1 bg-ide-accent text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 shadow-xs">
          {badgeValue}
        </span>
      )}
    </button>
  )
})

export const ActivityBar: React.FC = () => {
  const activeSidebarTab = useIDEStore((s) => s.activeSidebarTab)
  const sidebarOpen = useIDEStore((s) => s.sidebarOpen)
  const setActiveSidebarTab = useIDEStore((s) => s.setActiveSidebarTab)
  const setCommandPaletteOpen = useIDEStore((s) => s.setCommandPaletteOpen)
  const toolLayout = useIDEStore((s) => s.toolLayout)
  const setToolLayout = useIDEStore((s) => s.setToolLayout)
  const sidebarPosition = useIDEStore((s) => s.settings.sidebarPosition)
  const setSidebarPosition = useIDEStore((s) => s.setSidebarPosition)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; toolId: ToolId } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isSidebarRight = sidebarPosition === 'right'

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

  const handleContextMenu = useCallback((e: React.MouseEvent, toolId: ToolId) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, toolId })
  }, [])

  const handleSelect = useCallback((toolId: ToolId) => {
    setActiveSidebarTab(toolId as SidebarTab)
  }, [setActiveSidebarTab])

  // Filter tools that are configured to be on the left panel
  const leftTools = Object.values(TOOLS).filter((t) => toolLayout[t.id] === 'left')

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
          const isActive = sidebarOpen && activeSidebarTab === tab.id
          return (
            <ActivityBarItem
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isSidebarRight={isSidebarRight}
              onContextMenu={handleContextMenu}
              onSelect={handleSelect}
            />
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
        {toolLayout.settings === 'left' && (() => {
          const settingsTool = TOOLS.settings
          const SettingsIcon = settingsTool.icon
          return (
            <button
              key={settingsTool.id}
              onClick={() => setActiveSidebarTab('settings')}
              onContextMenu={(e) => handleContextMenu(e, settingsTool.id)}
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
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
            color: 'var(--color-ide-text)',
          }}
          className="fixed z-50 w-56 border rounded-xl shadow-2xl py-1.5 text-xs select-none backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setToolLayout(contextMenu.toolId, 'bottom')
              setContextMenu(null)
            }}
            className="w-[calc(100%-8px)] mx-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            <PanelBottom size={13} />
            <span>Move to Panel</span>
          </button>

          <button
            onClick={() => {
              setSidebarPosition(isSidebarRight ? 'left' : 'right')
              setContextMenu(null)
            }}
            className="w-[calc(100%-8px)] mx-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            {isSidebarRight ? <PanelLeft size={13} /> : <PanelRight size={13} />}
            <span>Move Primary Sidebar to {isSidebarRight ? 'Left' : 'Right'}</span>
          </button>

          <div
            style={{ backgroundColor: 'var(--color-ide-border)' }}
            className="h-[1px] my-1"
          />

          <button
            onClick={() => {
              setToolLayout(contextMenu.toolId, 'hidden')
              setContextMenu(null)
            }}
            className="w-[calc(100%-8px)] mx-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer transition-colors text-left text-red-400"
          >
            <EyeOff size={13} />
            <span>Hide from Activity Bar</span>
          </button>
        </div>
      )}
    </aside>
  )
}
