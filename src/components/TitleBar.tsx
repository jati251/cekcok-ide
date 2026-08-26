import React from 'react'

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
    <header className="relative h-[32px] bg-[#181818] border-b border-ide-border text-xs text-[#cccccc] font-sans shrink-0 overflow-hidden select-none">
      {/* 
        FOOLPROOF DRAG REGION
        This layer covers the entire header and serves ONLY to catch drag events.
        It sits at the bottom (z-0).
      */}
      <div 
        data-tauri-drag-region 
        className="absolute inset-0 z-0 [-webkit-app-region:drag]" 
      />

      {/* 
        CONTENT LAYER
        This sits on top (z-10). It uses pointer-events-none so all drag clicks 
        fall through to the drag region, except for buttons which use pointer-events-auto.
      */}
      <div className="relative z-10 w-full h-full flex items-center justify-between px-2 pointer-events-none">
        
        {/* Left Section: OS Window Controls */}
        <div className="flex items-center gap-2">
          {/* Mac OS Native Traffic Lights Placeholder */}
          <div className="w-[70px] shrink-0" />
        </div>

        {/* Center Section: Quick Search Pill & Title */}
        <div className="flex-1 flex items-center justify-center px-4">
          <button
            onClick={() => setQuickOpenOpen(true)}
            className="pointer-events-auto flex items-center gap-2 bg-[#252526] hover:bg-[#323233] border border-white/10 hover:border-ide-accent/50 px-3 py-0.5 rounded-md text-[11px] text-[#999] hover:text-white transition-all w-72 justify-between cursor-pointer [-webkit-app-region:no-drag]"
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
          <div className="pointer-events-auto [-webkit-app-region:no-drag]">
            <LayoutCustomizer />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-ide-muted font-mono opacity-80 pl-1 border-l border-white/10">
            <Code2 size={12} className="text-ide-accent" />
            <span>Cekcok</span>
          </div>
        </div>

      </div>
    </header>
  )
}
