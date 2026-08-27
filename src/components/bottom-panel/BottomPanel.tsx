import React, { useState, useRef } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { formatShortcut } from '../../utils/platform'
import { TOOLS } from '../ToolRegistry'

export const BottomPanel: React.FC = () => {
  const {
    terminalOpen,
    terminalHeight,
    setTerminalHeight,
    toggleTerminal,
    activeBottomTab,
    setActiveBottomTab,
    toolLayout
  } = useIDEStore()

  const [isMaximized, setIsMaximized] = useState(false)
  const previousHeightRef = useRef(terminalHeight)

  const handleToggleMaximize = () => {
    if (isMaximized) {
      setTerminalHeight(previousHeightRef.current)
      setIsMaximized(false)
    } else {
      previousHeightRef.current = terminalHeight
      setTerminalHeight(window.innerHeight * 0.75)
      setIsMaximized(true)
    }
  }

  const bottomTools = Object.values(TOOLS).filter(t => toolLayout[t.id] === 'bottom')
  
  // Find the active tool if it's currently on the bottom panel
  const activeTool = TOOLS[activeBottomTab]
  const isToolOnBottom = activeTool && toolLayout[activeTool.id] === 'bottom'

  return (
    <div
      style={{
        height: terminalHeight,
        display: terminalOpen ? 'flex' : 'none',
        backgroundColor: 'var(--color-ide-bg)',
        borderColor: 'var(--color-ide-border)',
        color: 'var(--color-ide-text)',
      }}
      className="border-t flex-col z-10 select-none shrink-0"
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
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar relative">
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
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase transition-colors cursor-pointer ${
                  isActive
                    ? 'font-bold'
                    : 'hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-ide-accent' : 'opacity-60'} />
                <span>{tab.label}</span>
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
      <div className="flex-1 overflow-hidden relative">
        {isToolOnBottom && <activeTool.component />}
      </div>
    </div>
  )
}
