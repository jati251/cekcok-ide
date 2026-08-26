import React from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Search, Menu } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { LayoutCustomizer } from './LayoutCustomizer'
import { formatShortcut } from '../utils/platform'
import { isTauri } from '../utils/tauriBridge'

export const TitleBar: React.FC = () => {
  const {
    currentDir,
    activeFile,
    setQuickOpenOpen,
    toggleSidebar,
  } = useIDEStore()

  const projectName = currentDir.split(/[/\\]/).filter(Boolean).pop() || 'Cekcok IDE'
  const displayTitle = activeFile
    ? `${activeFile.name} — ${projectName}`
    : `${projectName} — Cekcok IDE`

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTauri()) return
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
      className="h-[36px] sm:h-[32px] bg-[#181818] border-b border-ide-border text-xs text-[#cccccc] font-sans shrink-0 flex items-center justify-between px-2 select-none cursor-default"
    >
      {/* Left Section: OS Window Controls or Mobile Hamburger */}
      <div data-tauri-drag-region className="flex items-center gap-1.5">
        {/* Mac OS Native Traffic Lights Placeholder on desktop */}
        <div data-tauri-drag-region className="hidden sm:block w-[70px] shrink-0" />
        
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          data-no-drag
          onClick={toggleSidebar}
          className="sm:hidden p-1.5 rounded hover:bg-white/10 text-ide-muted hover:text-white cursor-pointer transition-colors"
          title="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Center Section: Quick Search Pill & Title */}
      <div data-tauri-drag-region className="flex-1 flex items-center justify-center px-2 sm:px-4 max-w-[400px]">
        <button
          data-no-drag
          onClick={() => setQuickOpenOpen(true)}
          className="flex items-center gap-2 bg-[#252526] hover:bg-[#323233] border border-white/10 hover:border-ide-accent/50 px-2 sm:px-3 py-1 sm:py-0.5 rounded-md text-[11px] text-[#999] hover:text-white transition-all w-full justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search size={12} className="text-[#777] shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px]">{displayTitle}</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[9px] bg-white/10 px-1 py-0.2 rounded text-[#bbb] shrink-0">
            {formatShortcut('Cmd+P')}
          </kbd>
        </button>
      </div>

      {/* Right Section: Layout Controls & Branding */}
      <div data-tauri-drag-region className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div data-no-drag className="hidden xs:block">
          <LayoutCustomizer />
        </div>
        <div data-tauri-drag-region className="flex items-center gap-1 sm:gap-1.5 text-[10px] text-ide-muted font-mono opacity-90 pl-1.5 border-l border-white/10">
          <img src="/favicon.png" alt="Cekcok" className="w-4 h-4 rounded-sm shrink-0" />
          <span className="font-bold text-white tracking-wider hidden sm:inline">CEKCOK</span>
        </div>
      </div>
    </header>
  )
}
