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

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, [data-no-drag]')) {
      return
    }
    if (e.detail === 2) {
      getCurrentWindow().toggleMaximize()
    } else if (e.button === 0 || e.buttons === 1) {
      getCurrentWindow().startDragging()
    }
  }

  return (
    <header 
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      className="h-[32px] bg-[#181818] border-b border-ide-border text-xs text-[#cccccc] font-sans shrink-0 flex items-center justify-between px-2 select-none cursor-default"
    >
      {/* Left Section: OS Window Controls */}
      <div data-tauri-drag-region className="flex items-center gap-2">
        {/* Mac OS Native Traffic Lights Placeholder */}
        <div data-tauri-drag-region className="w-[70px] shrink-0" />
      </div>

      {/* Center Section: Quick Search Pill & Title */}
      <div data-tauri-drag-region className="flex-1 flex items-center justify-center px-4">
        <button
          data-no-drag
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
      <div data-tauri-drag-region className="flex items-center gap-2">
        <div data-no-drag>
          <LayoutCustomizer />
        </div>
        <div data-tauri-drag-region className="flex items-center gap-1 text-[10px] text-ide-muted font-mono opacity-80 pl-1 border-l border-white/10">
          <Code2 size={12} className="text-ide-accent" />
          <span>Cekcok</span>
        </div>
      </div>
    </header>
  )
}
