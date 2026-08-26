import React, { useState, useRef, useEffect } from 'react'
import {
  Layout,
  PanelLeft,
  PanelRight,
  PanelBottom,
  Columns2,
  Rows2,
  Check,
} from 'lucide-react'
import { useIDEStore, SidebarPosition, PanelPosition, SplitDirection } from '../store/useIDEStore'

export const LayoutCustomizer: React.FC = () => {
  const {
    settings,
    setSidebarPosition,
    setPanelPosition,
    setSplitDirection,
    toggleSidebar,
    toggleTerminal,
    toggleSplitEditor,
    splitEditorOpen,
  } = useIDEStore()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleOutside)
    }
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-white/15 rounded text-[#999] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        title="Customize Layout & Views"
      >
        <Layout size={14} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-64 bg-[#252526] border border-ide-border rounded-lg shadow-2xl p-2.5 z-50 text-xs text-[#cccccc] space-y-3 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-ide-muted">
            Customize Layout
          </div>

          {/* Primary Sidebar Position */}
          <div className="space-y-1.5">
            <span className="text-white/80 font-medium text-[11px]">Primary Sidebar</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSidebarPosition('left' as SidebarPosition)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border cursor-pointer transition-all ${
                  settings.sidebarPosition === 'left'
                    ? 'border-ide-accent bg-ide-accent/20 text-white font-medium'
                    : 'border-ide-border bg-[#1e1e1e] hover:bg-white/5 text-[#888]'
                }`}
              >
                <PanelLeft size={13} />
                <span>Left</span>
                {settings.sidebarPosition === 'left' && <Check size={11} className="text-ide-accent" />}
              </button>
              <button
                onClick={() => setSidebarPosition('right' as SidebarPosition)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border cursor-pointer transition-all ${
                  settings.sidebarPosition === 'right'
                    ? 'border-ide-accent bg-ide-accent/20 text-white font-medium'
                    : 'border-ide-border bg-[#1e1e1e] hover:bg-white/5 text-[#888]'
                }`}
              >
                <PanelRight size={13} />
                <span>Right</span>
                {settings.sidebarPosition === 'right' && <Check size={11} className="text-ide-accent" />}
              </button>
            </div>
          </div>

          {/* Panel / Terminal Position */}
          <div className="space-y-1.5">
            <span className="text-white/80 font-medium text-[11px]">Panel (Terminal)</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setPanelPosition('bottom' as PanelPosition)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border cursor-pointer transition-all ${
                  settings.panelPosition === 'bottom'
                    ? 'border-ide-accent bg-ide-accent/20 text-white font-medium'
                    : 'border-ide-border bg-[#1e1e1e] hover:bg-white/5 text-[#888]'
                }`}
              >
                <PanelBottom size={13} />
                <span>Bottom</span>
                {settings.panelPosition === 'bottom' && <Check size={11} className="text-ide-accent" />}
              </button>
              <button
                onClick={() => setPanelPosition('right' as PanelPosition)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border cursor-pointer transition-all ${
                  settings.panelPosition === 'right'
                    ? 'border-ide-accent bg-ide-accent/20 text-white font-medium'
                    : 'border-ide-border bg-[#1e1e1e] hover:bg-white/5 text-[#888]'
                }`}
              >
                <PanelRight size={13} />
                <span>Right</span>
                {settings.panelPosition === 'right' && <Check size={11} className="text-ide-accent" />}
              </button>
            </div>
          </div>

          {/* Split Direction */}
          <div className="space-y-1.5">
            <span className="text-white/80 font-medium text-[11px]">Split Editor Direction</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSplitDirection('vertical' as SplitDirection)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border cursor-pointer transition-all ${
                  settings.splitDirection === 'vertical'
                    ? 'border-ide-accent bg-ide-accent/20 text-white font-medium'
                    : 'border-ide-border bg-[#1e1e1e] hover:bg-white/5 text-[#888]'
                }`}
              >
                <Columns2 size={13} />
                <span>Columns</span>
              </button>
              <button
                onClick={() => setSplitDirection('horizontal' as SplitDirection)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border cursor-pointer transition-all ${
                  settings.splitDirection === 'horizontal'
                    ? 'border-ide-accent bg-ide-accent/20 text-white font-medium'
                    : 'border-ide-border bg-[#1e1e1e] hover:bg-white/5 text-[#888]'
                }`}
              >
                <Rows2 size={13} />
                <span>Rows</span>
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-ide-border my-1" />

          {/* Quick Toggles */}
          <div className="space-y-1">
            <button
              onClick={() => {
                toggleSidebar()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/10 rounded cursor-pointer text-left"
            >
              <span>Toggle Primary Sidebar</span>
              <kbd className="font-mono text-[10px] text-ide-muted">Cmd+B</kbd>
            </button>
            <button
              onClick={() => {
                toggleTerminal()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/10 rounded cursor-pointer text-left"
            >
              <span>Toggle Terminal Panel</span>
              <kbd className="font-mono text-[10px] text-ide-muted">Cmd+`</kbd>
            </button>
            <button
              onClick={() => {
                toggleSplitEditor()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/10 rounded cursor-pointer text-left"
            >
              <span>{splitEditorOpen ? 'Close Split Editor' : 'Open Split Editor'}</span>
              <kbd className="font-mono text-[10px] text-ide-muted">Cmd+\</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
