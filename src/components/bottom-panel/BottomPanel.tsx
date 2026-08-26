import React, { useState, useRef } from 'react'
import {
  TerminalSquare,
  AlertCircle,
  FileText,
  Terminal as BugIcon,
  Globe,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { useIDEStore, BottomPanelTab } from '../../store/useIDEStore'
import { MultiTerminalView } from './MultiTerminalView'
import { ProblemsView } from './ProblemsView'
import { OutputView } from './OutputView'
import { DebugConsoleView } from './DebugConsoleView'
import { PortsView } from './PortsView'

import { formatShortcut } from '../../utils/platform'

export const BottomPanel: React.FC = () => {
  const {
    terminalOpen,
    terminalHeight,
    setTerminalHeight,
    toggleTerminal,
    activeBottomTab,
    setActiveBottomTab,
    diagnostics,
    ports,
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

  const errorsCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningsCount = diagnostics.filter((d) => d.severity === 'warning').length
  const totalProblems = errorsCount + warningsCount

  const tabs: Array<{ id: BottomPanelTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }> = [
    {
      id: 'problems',
      label: 'Problems',
      icon: <AlertCircle size={13} className={errorsCount > 0 ? 'text-red-400' : 'text-ide-muted'} />,
      badge:
        totalProblems > 0 ? (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              errorsCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {totalProblems}
          </span>
        ) : null,
    },
    {
      id: 'output',
      label: 'Output',
      icon: <FileText size={13} className="text-ide-muted" />,
    },
    {
      id: 'debug',
      label: 'Debug Console',
      icon: <BugIcon size={13} className="text-orange-400" />,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <TerminalSquare size={13} className="text-green-400" />,
    },
    {
      id: 'ports',
      label: 'Ports',
      icon: <Globe size={13} className="text-cyan-400" />,
      badge: (
        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-white/80 font-mono">
          {ports.length}
        </span>
      ),
    },
  ]

  return (
    <div
      style={{
        height: terminalHeight,
        display: terminalOpen ? 'flex' : 'none',
      }}
      className="bg-[#181818] border-t border-ide-border flex-col z-10 select-none shrink-0"
    >
      {/* Bottom Panel Navigation Header Bar */}
      <div className="flex justify-between items-center px-2 bg-[#1f1f1f] border-b border-ide-border shrink-0 select-none">
        {/* Left Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeBottomTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-white border-ide-accent bg-[#181818]'
                    : 'text-ide-muted border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge}
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

      {/* Tab Canvas Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeBottomTab === 'problems' && <ProblemsView />}
        {activeBottomTab === 'output' && <OutputView />}
        {activeBottomTab === 'debug' && <DebugConsoleView />}
        {activeBottomTab === 'terminal' && <MultiTerminalView />}
        {activeBottomTab === 'ports' && <PortsView />}
      </div>
    </div>
  )
}
