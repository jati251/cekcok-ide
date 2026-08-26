import React from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

import {
  Search,
  Code2,
} from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { LayoutCustomizer } from './LayoutCustomizer'

export const TitleBar: React.FC = () => {
  const {
    currentDir,
    activeFile,
    setQuickOpenOpen,
  } = useIDEStore()

  const projectName = currentDir.split(/[/\\]/).filter(Boolean).pop() || 'Cekcok IDE'
  const displayTitle = activeFile
    ? `${activeFile.name} — ${projectName}`
    : `${projectName} — Cekcok IDE`

  return (
    <header
      data-tauri-drag-region
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          getCurrentWindow().startDragging()
        }
      }}
      className="h-[32px] bg-[#181818] border-b border-ide-border flex items-center justify-between px-2 select-none z-40 text-xs text-[#cccccc] font-sans shrink-0"
    >
      {/* Left Section: OS Window Controls & Menus */}
      <div className="flex items-center gap-2">
        {/* Mac OS Native Traffic Lights Placeholder */}
        <div className="w-[70px] shrink-0" />

        {/* Removed redundant HTML menu bar (macOS has native global menu) */}
      </div>

      {/* Center Section: Quick Search Pill & Title */}
      <div
        data-tauri-drag-region
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            getCurrentWindow().startDragging()
          }
        }}
        className="flex-1 flex items-center justify-center px-4 overflow-hidden"
      >
        <button
          onClick={() => setQuickOpenOpen(true)}
          className="flex items-center gap-2 bg-[#252526] hover:bg-[#323233] border border-white/10 hover:border-ide-accent/50 px-3 py-0.5 rounded-md text-[11px] text-[#999] hover:text-white transition-all w-72 justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search size={12} className="text-[#777]" />
            <span className="truncate">{displayTitle}</span>
          </div>
          <kbd className="font-mono text-[9px] bg-white/10 px-1 py-0.2 rounded text-[#bbb]">
            Cmd+P
          </kbd>
        </button>
      </div>

      {/* Right Section: Layout Controls & Branding */}
      <div className="flex items-center gap-2">
        <LayoutCustomizer />
        <div className="flex items-center gap-1 text-[10px] text-ide-muted font-mono opacity-80 pl-1 border-l border-white/10">
          <Code2 size={12} className="text-ide-accent" />
          <span>Cekcok</span>
        </div>
      </div>
    </header>
  )
}
