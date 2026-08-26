import React, { useState, useRef, useEffect } from 'react'

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
    setCommandPaletteOpen,
    setQuickOpenOpen,
    openSettingsTab,
    openWelcomeTab,
    toggleSidebar,
    toggleTerminal,
    toggleSplitEditor,
    saveActiveFile,
    setZoomLevel,
  } = useIDEStore()

  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)

  // Close top menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    if (activeMenu) {
      window.addEventListener('mousedown', handleOutsideClick)
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [activeMenu])



  const projectName = currentDir.split(/[/\\]/).filter(Boolean).pop() || 'Cekcok IDE'
  const displayTitle = activeFile
    ? `${activeFile.name} — ${projectName}`
    : `${projectName} — Cekcok IDE`

  return (
    <header
      data-tauri-drag-region
      className="h-[32px] bg-[#181818] border-b border-ide-border flex items-center justify-between px-2 select-none z-40 text-xs text-[#cccccc] font-sans shrink-0"
    >
      {/* Left Section: OS Window Controls & Menus */}
      <div className="flex items-center gap-2" ref={menuContainerRef}>
        {/* Mac OS Native Traffic Lights Placeholder */}
        <div className="w-[70px] shrink-0" />

        {/* Top Dropdown Menu Bar */}
        <div className="flex items-center relative text-[12px]">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              onMouseEnter={() => activeMenu && setActiveMenu('file')}
              className={`px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                activeMenu === 'file' ? 'bg-white/15 text-white' : ''
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#252526] border border-ide-border rounded shadow-2xl py-1 z-50 text-[11px]">
                <button
                  onClick={() => {
                    saveActiveFile()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Save</span>
                  <kbd className="font-mono opacity-70">Cmd+S</kbd>
                </button>
                <div className="h-[1px] bg-ide-border my-1" />
                <button
                  onClick={() => {
                    openSettingsTab()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Preferences: Settings</span>
                  <kbd className="font-mono opacity-70">Cmd+,</kbd>
                </button>
                <button
                  onClick={() => {
                    openWelcomeTab()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              onMouseEnter={() => activeMenu && setActiveMenu('edit')}
              className={`px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                activeMenu === 'edit' ? 'bg-white/15 text-white' : ''
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#252526] border border-ide-border rounded shadow-2xl py-1 z-50 text-[11px]">
                <button
                  onClick={() => {
                    setCommandPaletteOpen(true)
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Command Palette...</span>
                  <kbd className="font-mono opacity-70">Cmd+Shift+P</kbd>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              onMouseEnter={() => activeMenu && setActiveMenu('view')}
              className={`px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                activeMenu === 'view' ? 'bg-white/15 text-white' : ''
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#252526] border border-ide-border rounded shadow-2xl py-1 z-50 text-[11px]">
                <button
                  onClick={() => {
                    toggleSidebar()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Toggle Primary Sidebar</span>
                  <kbd className="font-mono opacity-70">Cmd+B</kbd>
                </button>
                <button
                  onClick={() => {
                    toggleTerminal()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Toggle Terminal Panel</span>
                  <kbd className="font-mono opacity-70">Cmd+`</kbd>
                </button>
                <button
                  onClick={() => {
                    toggleSplitEditor()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Toggle Split Editor</span>
                  <kbd className="font-mono opacity-70">Cmd+\</kbd>
                </button>
                <div className="h-[1px] bg-ide-border my-1" />
                <button
                  onClick={() => {
                    setZoomLevel((z) => z + 0.1)
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Zoom In</span>
                  <kbd className="font-mono opacity-70">Cmd+=</kbd>
                </button>
                <button
                  onClick={() => {
                    setZoomLevel((z) => z - 0.1)
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Zoom Out</span>
                  <kbd className="font-mono opacity-70">Cmd+-</kbd>
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1.0)
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>Reset Zoom</span>
                  <kbd className="font-mono opacity-70">Cmd+0</kbd>
                </button>
              </div>
            )}
          </div>

          {/* Terminal Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'terminal' ? null : 'terminal')}
              onMouseEnter={() => activeMenu && setActiveMenu('terminal')}
              className={`px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                activeMenu === 'terminal' ? 'bg-white/15 text-white' : ''
              }`}
            >
              Terminal
            </button>
            {activeMenu === 'terminal' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#252526] border border-ide-border rounded shadow-2xl py-1 z-50 text-[11px]">
                <button
                  onClick={() => {
                    toggleTerminal()
                    setActiveMenu(null)
                  }}
                  className="w-full flex justify-between px-3 py-1.5 hover:bg-ide-accent hover:text-white cursor-pointer text-left"
                >
                  <span>New Terminal / Toggle</span>
                  <kbd className="font-mono opacity-70">Cmd+`</kbd>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Section: Quick Search Pill & Title */}
      <div
        data-tauri-drag-region
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
