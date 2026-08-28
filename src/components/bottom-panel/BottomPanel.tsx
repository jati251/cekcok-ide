import React, { useState, useRef, useEffect } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  X,
  PanelLeft,
  EyeOff,
  PanelRight,
  PanelBottom,
} from 'lucide-react'
import { useIDEStore, ToolId } from '../../store/useIDEStore'
import { formatShortcut } from '../../utils/platform'
import { TOOLS } from '../ToolRegistry'

export const BottomPanel: React.FC = () => {
  const {
    terminalOpen,
    terminalHeight,
    terminalWidth,
    setTerminalHeight,
    setTerminalWidth,
    toggleTerminal,
    activeBottomTab,
    setActiveBottomTab,
    toolLayout,
    setToolLayout,
    settings,
    setPanelPosition,
  } = useIDEStore()

  const [isMaximized, setIsMaximized] = useState(false)
  const previousSizeRef = useRef({ height: terminalHeight, width: terminalWidth })
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number; toolId: ToolId } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const isPanelRight = settings.panelPosition === 'right'

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setTabContextMenu(null)
      }
    }
    if (tabContextMenu) {
      window.addEventListener('mousedown', handleOutside)
    }
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [tabContextMenu])

  const handleToggleMaximize = () => {
    if (isMaximized) {
      if (isPanelRight) {
        setTerminalWidth(previousSizeRef.current.width)
      } else {
        setTerminalHeight(previousSizeRef.current.height)
      }
      setIsMaximized(false)
    } else {
      previousSizeRef.current = { height: terminalHeight, width: terminalWidth }
      if (isPanelRight) {
        setTerminalWidth(window.innerWidth * 0.5)
      } else {
        setTerminalHeight(window.innerHeight * 0.75)
      }
      setIsMaximized(true)
    }
  }

  const bottomTools = Object.values(TOOLS).filter((t) => toolLayout[t.id] === 'bottom')

  // Find the active tool if it's currently on the bottom panel
  const activeTool = TOOLS[activeBottomTab as ToolId]
  const isToolOnBottom = activeTool && toolLayout[activeTool.id] === 'bottom'

  return (
    <div
      style={{
        height: isPanelRight ? '100%' : terminalHeight,
        width: isPanelRight ? terminalWidth : '100%',
        minWidth: isPanelRight ? 240 : undefined,
        maxWidth: isPanelRight ? '50vw' : undefined,
        display: terminalOpen ? 'flex' : 'none',
        backgroundColor: 'var(--color-ide-bg)',
        borderColor: 'var(--color-ide-border)',
        color: 'var(--color-ide-text)',
      }}
      className={`${isPanelRight ? 'border-l' : 'border-t'} flex-col z-10 select-none shrink-0 overflow-hidden relative`}
      data-drop-zone="bottom-tools"
    >
      {/* Bottom Panel Navigation Header Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
        }}
        className="flex justify-between items-center px-2 border-b shrink-0 select-none"
        data-drop-zone="bottom-tools"
      >
        {/* Left Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar relative" data-drop-zone="bottom-tools">
          <LayoutGroup>
            {bottomTools.map((tab) => {
              const isActive = activeBottomTab === tab.id
              const Icon = tab.icon

              // Use full IDE state for badge evaluation
              const state = useIDEStore.getState()
              const badgeValue = tab.getBadge ? tab.getBadge(state) : undefined

              return (
                <motion.button
                  layout
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveBottomTab(tab.id as any)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setTabContextMenu({ x: e.clientX, y: e.clientY, toolId: tab.id })
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
                    backgroundColor: isActive ? 'var(--color-ide-bg)' : 'transparent',
                    color: isActive ? 'var(--color-ide-text)' : 'var(--color-ide-muted)',
                  }}
                  className={`relative flex items-center gap-1.5 ${isPanelRight ? 'px-2 py-1.5' : 'px-3 py-1.5'} text-xs font-semibold uppercase transition-colors cursor-pointer ${
                    isActive
                      ? 'font-bold'
                      : 'hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={`${tab.label} (Drag or Right-Click to move)`}
                >
                  <Icon size={14} className={isActive ? 'text-ide-accent' : 'opacity-60'} />
                  {!isPanelRight && <span>{tab.label}</span>}
                  {badgeValue}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-ide-accent"
                    />
                  )}
                </motion.button>
              )
            })}
          </LayoutGroup>
        </div>

        {/* Right Window Controls */}
        <div className="flex items-center gap-1 pr-2">
          <button
            onClick={handleToggleMaximize}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isMaximized ? 'Restore Panel' : 'Maximize Panel'}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={`Close Panel (${formatShortcut('Cmd+`')} / ${formatShortcut('Cmd+J')})`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative" data-drop-zone="bottom-tools">
        {isToolOnBottom && <activeTool.component />}
      </div>

      {/* Tab Context Menu */}
      {tabContextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: `${tabContextMenu.y}px`, left: `${tabContextMenu.x}px` }}
          className="fixed z-50 w-52 bg-[#252526] border border-ide-border rounded-md shadow-2xl py-1 text-xs text-[#cccccc] select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setToolLayout(tabContextMenu.toolId, 'left')
              setTabContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            <PanelLeft size={13} />
            <span>Move to Primary Sidebar</span>
          </button>

          <button
            onClick={() => {
              setPanelPosition(isPanelRight ? 'bottom' : 'right')
              setTabContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer transition-colors text-left"
          >
            {isPanelRight ? <PanelBottom size={13} /> : <PanelRight size={13} />}
            <span>Move Panel to {isPanelRight ? 'Bottom' : 'Right'}</span>
          </button>

          <div className="h-[1px] bg-ide-border my-1" />

          <button
            onClick={() => {
              setToolLayout(tabContextMenu.toolId, 'hidden')
              setTabContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-pointer transition-colors text-left text-red-400"
          >
            <EyeOff size={13} />
            <span>Hide from Panel</span>
          </button>
        </div>
      )}
    </div>
  )
}
