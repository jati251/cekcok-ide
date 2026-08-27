import React from 'react'
import { Search, Menu } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { LayoutCustomizer } from './LayoutCustomizer'
import { AppSwitcher } from './AppSwitcher'
import { formatShortcut } from '../utils/platform'
import { useWindowDrag } from '../hooks/useWindowDrag'

export const TitleBar: React.FC = () => {
  const {
    currentDir,
    activeFile,
    setQuickOpenOpen,
    toggleSidebar,
  } = useIDEStore()
  const { handleWindowDrag } = useWindowDrag()

  const projectName = currentDir.split(/[/\\]/).filter(Boolean).pop() || 'Cekcok IDE'
  const displayTitle = activeFile
    ? `${activeFile.name} — ${projectName}`
    : `${projectName} — Cekcok IDE`

  return (
    <header 
      data-tauri-drag-region
      onMouseDown={handleWindowDrag}
      style={{
        backgroundColor: 'var(--color-ide-sidebar)',
        borderColor: 'var(--color-ide-border)',
        color: 'var(--color-ide-text)',
      }}
      className="h-[38px] border-b text-xs font-sans shrink-0 flex items-center justify-between px-2 select-none cursor-default relative z-[9999]"
    >
      {/* Left Section: OS Window Controls or Mobile Hamburger */}
      <div data-tauri-drag-region className="flex items-center gap-1.5">
        {/* Mac OS Native Traffic Lights Placeholder on desktop */}
        <div data-tauri-drag-region className="hidden sm:block w-[72px] shrink-0" />
        
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          data-no-drag
          onClick={toggleSidebar}
          className="sm:hidden p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 cursor-pointer transition-colors"
          title="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Center Section: Quick Search Pill & Title */}
      <div data-tauri-drag-region className="flex-1 flex items-center justify-center px-2 sm:px-4 max-w-[420px]">
        <button
          data-no-drag
          onClick={() => setQuickOpenOpen(true)}
          style={{
            backgroundColor: 'var(--color-ide-bg)',
            borderColor: 'var(--color-ide-border)',
            color: 'var(--color-ide-text)',
          }}
          className="flex items-center gap-2 border hover:border-ide-accent px-2.5 sm:px-3 py-1 rounded-md text-[11px] opacity-80 hover:opacity-100 transition-all w-full justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search size={12} className="opacity-60 shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px]">{displayTitle}</span>
          </div>
          <kbd
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="hidden sm:inline-block font-mono text-[9px] border bg-black/5 dark:bg-white/10 px-1 py-0.2 rounded opacity-70 shrink-0"
          >
            {formatShortcut('Cmd+P')}
          </kbd>
        </button>
      </div>

      {/* Right Section: Layout Controls, App Switcher & Branding */}
      <div data-tauri-drag-region className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div data-no-drag className="hidden xs:block">
          <LayoutCustomizer />
        </div>
        
        {/* Workspace Switcher dropdown */}
        <AppSwitcher />

        <div
          style={{ borderColor: 'var(--color-ide-border)' }}
          data-tauri-drag-region
          className="flex items-center gap-1 sm:gap-1.5 text-[10px] opacity-80 font-mono pl-1.5 border-l hidden sm:flex"
        >
          <img src="/favicon.png" alt="Cekcok" className="w-4 h-4 rounded-xs shrink-0" />
          <span className="font-bold tracking-wider">CEKCOK</span>
        </div>
      </div>
    </header>
  )
}
