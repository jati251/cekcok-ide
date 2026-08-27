import React, { useState, useRef } from 'react'
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
      }}
      className="bg-[#181818] border-t border-ide-border flex-col z-10 select-none shrink-0"
    >
      {/* Bottom Panel Navigation Header Bar */}
      <div className="flex justify-between items-center px-2 bg-[#1f1f1f] border-b border-ide-border shrink-0 select-none" data-drop-zone="bottom-tools">
        {/* Left Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {bottomTools.map((tab) => {
            const isActive = activeBottomTab === tab.id
            const Icon = tab.icon
            
            // Use full IDE state for badge evaluation
            const state = useIDEStore.getState()
            const badgeValue = tab.getBadge ? tab.getBadge(state) : undefined

            return (
              <button
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-white border-ide-accent bg-[#181818]'
                    : 'text-ide-muted border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-ide-accent' : 'text-ide-muted'} />
                <span>{tab.label}</span>
                {badgeValue}
              </button>
            )
          })}
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
