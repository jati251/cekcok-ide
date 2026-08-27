import React, { useState, useEffect } from 'react'
import { GitBranch, PanelLeft, Terminal, Command, PackageCheck, RefreshCw, Sparkles } from 'lucide-react'
import { useIDEStore, SidebarTab } from '../store/useIDEStore'
import { getLanguageLabel } from '../utils/languages'
import { LayoutCustomizer } from './LayoutCustomizer'
import { formatShortcut } from '../utils/platform'
import { updaterEventEmitter, UpdateInfo } from '../utils/updater'

export const StatusBar: React.FC = () => {
  const {
    activeFile,
    toggleSidebar,
    toggleTerminal,
    gitStatus,
    setActiveSidebarTab,
    packageJson,
    setCommandPaletteOpen,
    refreshGitStatus,
    isGitLoading,
    zoomLevel,
    setZoomLevel,
    diagnostics,
    ports,
    setActiveBottomTab,
  } = useIDEStore()

  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null)

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const custom = e as CustomEvent
      if (custom.detail?.stage === 'available' && custom.detail?.info) {
        setAvailableUpdate(custom.detail.info)
      } else if (custom.detail?.stage === 'idle') {
        setAvailableUpdate(null)
      }
    }
    updaterEventEmitter.addEventListener('update-status', handleStatus)
    return () => {
      updaterEventEmitter.removeEventListener('update-status', handleStatus)
    }
  }, [])

  return (
    <footer className="h-[26px] bg-ide-accent text-white flex items-center justify-between px-2 sm:px-3 text-[10px] sm:text-[11px] select-none z-30 font-sans shrink-0 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle UI Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={toggleSidebar}
            className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer"
            title="Toggle Primary Sidebar"
          >
            <PanelLeft size={13} />
          </button>
          <button
            onClick={toggleTerminal}
            className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer"
            title="Toggle Terminal Panel"
          >
            <Terminal size={13} />
          </button>
        </div>

        {/* Git Branch & Sync */}
        {gitStatus.is_repo && (
          <div
            onClick={() => setActiveSidebarTab('git' as SidebarTab)}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title={`Git branch: ${gitStatus.branch} (${gitStatus.ahead} ahead, ${gitStatus.behind} behind)`}
          >
            <GitBranch size={13} />
            <span className="font-mono">{gitStatus.branch}</span>
            {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
              <span className="text-[9px] sm:text-[10px] opacity-90 hidden xs:inline">
                ↑{gitStatus.ahead} ↓{gitStatus.behind}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                refreshGitStatus()
              }}
              className="hover:bg-white/30 p-0.5 rounded ml-0.5 cursor-pointer"
              title="Sync Git"
            >
              <RefreshCw size={10} className={isGitLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        {/* Node.js Project Indicator */}
        {packageJson && (
          <div
            onClick={() => setActiveSidebarTab('node' as SidebarTab)}
            className="hidden sm:flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title={`Node.js: ${packageJson.name || 'Project'} (v${packageJson.version || '1.0.0'})`}
          >
            <PackageCheck size={12} />
            <span className="truncate max-w-[100px]">{packageJson.name || 'node-app'}</span>
          </div>
        )}

        {/* Problems Diagnostics Badge */}
        <div
          onClick={() => setActiveBottomTab('problems')}
          className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Problems / Diagnostics (Click to view)"
        >
          <span className="flex items-center gap-0.5">
            <span className="font-bold">⊗</span> {diagnostics.filter((d) => d.severity === 'error').length}
          </span>
          <span className="flex items-center gap-0.5">
            <span className="font-bold">⚠</span> {diagnostics.filter((d) => d.severity === 'warning').length}
          </span>
        </div>

        {/* Ports Badge */}
        <div
          onClick={() => setActiveBottomTab('ports')}
          className="hidden md:flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Forwarded Ports (Click to view active services)"
        >
          <span className="text-[10px]">🌐</span>
          <span>{ports.length} Ports</span>
        </div>

        {/* In-App Update Badge if available */}
        {availableUpdate && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('check-for-updates'))}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-400 text-black font-semibold rounded cursor-pointer animate-pulse hover:bg-cyan-300 transition-colors shadow-xs"
            title={`Click to install update v${availableUpdate.version}`}
          >
            <Sparkles size={11} />
            <span>Update v{availableUpdate.version}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {activeFile && (
          <>
            <div className="hidden md:block hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              Ln 1, Col 1
            </div>
            <div className="hidden sm:block hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              UTF-8
            </div>
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              {getLanguageLabel(activeFile.name)}
            </div>
          </>
        )}
        <button
          onClick={() => setZoomLevel(1.0)}
          className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-mono text-[9px] sm:text-[10px]"
          title={`Zoom Level (Click to reset to 100%, ${formatShortcut('Cmd+=')} to zoom in, ${formatShortcut('Cmd+-')} to zoom out)`}
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <div className="hidden xs:block">
          <LayoutCustomizer />
        </div>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer flex items-center gap-1"
          title={`Command Palette (${formatShortcut('Cmd+P')} / ${formatShortcut('Cmd+Shift+P')})`}
        >
          <Command size={12} />
        </button>
      </div>
    </footer>
  )
}
