import React, { useState, useEffect } from 'react'
import {
  GitBranch,
  PanelLeft,
  Terminal,
  Command,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Coffee,
  AlertCircle,
  AlertTriangle,
  Globe,
} from 'lucide-react'
import { useIDEStore, SidebarTab } from '../store/useIDEStore'
import { getLanguageLabel } from '../utils/languages'
import { formatShortcut } from '../utils/platform'
import { useAppUpdateInfo } from '../utils/updater'

export const StatusBar: React.FC = () => {
  const {
    activeFile,
    toggleSidebar,
    toggleTerminal,
    gitStatus,
    setActiveSidebarTab,
    packageJson,
    packageManager,
    javaDetails,
    setCommandPaletteOpen,
    refreshGitStatus,
    isGitLoading,
    zoomLevel,
    setZoomLevel,
    diagnostics,
    ports,
    setActiveBottomTab,
    setBranchSwitcherOpen,
  } = useIDEStore()

  const availableUpdate = useAppUpdateInfo()

  const [cursorInfo, setCursorInfo] = useState<{ line: number; col: number; selectedCount: number }>({
    line: 1,
    col: 1,
    selectedCount: 0,
  })

  useEffect(() => {
    const handleCursorChange = (e: Event) => {
      const custom = e as CustomEvent<{ line: number; col: number; selectedCount: number }>
      if (custom.detail) {
        setCursorInfo(custom.detail)
      }
    }
    window.addEventListener('editor-cursor-change', handleCursorChange)
    return () => window.removeEventListener('editor-cursor-change', handleCursorChange)
  }, [])

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-ide-status-bar, var(--color-ide-sidebar))',
        color: 'var(--color-ide-status-bar-text, var(--color-ide-text))',
        borderColor: 'var(--color-ide-border)',
      }}
      className="h-[25px] border-t flex items-center justify-between px-2 sm:px-3 text-[10px] sm:text-[11px] select-none z-30 font-sans shrink-0 overflow-x-auto no-scrollbar transition-colors"
    >
      {/* Left Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle UI Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleSidebar}
            className="hover:bg-white/15 dark:hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
            title="Toggle Primary Sidebar"
          >
            <PanelLeft size={12} />
          </button>
          <button
            onClick={toggleTerminal}
            className="hover:bg-white/15 dark:hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
            title="Toggle Terminal Panel"
          >
            <Terminal size={12} />
          </button>
        </div>

        {/* Git Branch & Sync */}
        {gitStatus.is_repo && (
          <div
            onClick={() => setBranchSwitcherOpen(true)}
            className="flex items-center gap-1 hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title={`Git branch: ${gitStatus.branch} (Click to switch branch)`}
          >
            <GitBranch size={12} className="opacity-80" />
            <span className="font-mono font-medium">{gitStatus.branch}</span>
            {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
              <span className="text-[9px] opacity-80 hidden xs:inline font-mono">
                ↑{gitStatus.ahead} ↓{gitStatus.behind}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                refreshGitStatus()
              }}
              className="hover:bg-white/25 p-0.5 rounded ml-0.5 cursor-pointer"
              title="Sync Git"
            >
              <RefreshCw size={9} className={isGitLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        {/* Node.js Project Indicator */}
        {packageJson && (
          <div
            onClick={() => setActiveSidebarTab('node' as SidebarTab)}
            className="hidden sm:flex items-center gap-1 hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium"
            title={`Node.js: ${packageJson.name || 'Project'} (v${packageJson.version || '1.0.0'}, PM: ${packageManager.toUpperCase()})`}
          >
            <PackageCheck size={12} className="text-emerald-300" />
            <span className="truncate max-w-[130px]">
              {packageManager}: {packageJson.name || 'node-app'}
            </span>
          </div>
        )}

        {/* Java / Spring Boot Project Indicator */}
        {javaDetails && (
          <div
            onClick={() => setActiveSidebarTab('node' as SidebarTab)}
            className="hidden sm:flex items-center gap-1 hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium"
            title={`Java Project: ${javaDetails.name || 'Spring App'} (Java ${javaDetails.javaVersion || '17'}${javaDetails.springBootVersion ? `, Spring Boot ${javaDetails.springBootVersion}` : ''})`}
          >
            <Coffee size={12} className="text-amber-300" />
            <span className="truncate max-w-[130px]">
              {javaDetails.isSpringBoot ? `Spring Boot ${javaDetails.springBootVersion || ''}` : `Java (${javaDetails.buildTool})`}
            </span>
          </div>
        )}

        {/* Problems Diagnostics Badge */}
        <div
          onClick={() => setActiveBottomTab('problems')}
          className="flex items-center gap-2 hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Problems / Diagnostics (Click to view)"
        >
          <span className="flex items-center gap-1">
            <AlertCircle size={11} className={errorCount > 0 ? 'text-red-400' : 'opacity-60'} />
            <span>{errorCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle size={11} className={warningCount > 0 ? 'text-yellow-400' : 'opacity-60'} />
            <span>{warningCount}</span>
          </span>
        </div>

        {/* Ports Badge */}
        {ports.length > 0 && (
          <div
            onClick={() => setActiveBottomTab('ports')}
            className="hidden md:flex items-center gap-1 hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title="Forwarded Ports (Click to view active services)"
          >
            <Globe size={11} className="opacity-80" />
            <span>{ports.length} {ports.length === 1 ? 'Port' : 'Ports'}</span>
          </div>
        )}

        {/* In-App Update Badge if available */}
        {availableUpdate && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('check-for-updates'))}
            className="flex items-center gap-1 px-2 py-0.5 bg-ide-accent text-white font-semibold rounded cursor-pointer hover:opacity-90 transition-all shadow-xs"
            title={`Click to install update v${availableUpdate.version}`}
          >
            <Sparkles size={11} className="animate-pulse" />
            <span>Update v{availableUpdate.version}</span>
          </button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {activeFile && (
          <>
            <div
              className="hidden md:flex items-center gap-1 hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-mono"
              title="Cursor Position: Line, Column"
            >
              <span>
                Ln {cursorInfo.line}, Col {cursorInfo.col}
              </span>
              {cursorInfo.selectedCount > 0 && (
                <span className="opacity-80 font-sans">
                  ({cursorInfo.selectedCount} sel)
                </span>
              )}
            </div>
            <div className="hidden sm:block hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors opacity-80">
              UTF-8
            </div>
            <div className="hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium">
              {getLanguageLabel(activeFile.name)}
            </div>
          </>
        )}

        <button
          onClick={() => setZoomLevel(1.0)}
          className="hover:bg-white/15 dark:hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-mono text-[9px] sm:text-[10px]"
          title={`Zoom Level (Click to reset to 100%, ${formatShortcut('Cmd+=')} to zoom in, ${formatShortcut('Cmd+-')} to zoom out)`}
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hover:bg-white/15 dark:hover:bg-white/10 p-1 rounded transition-colors cursor-pointer flex items-center gap-1"
          title={`Command Palette (${formatShortcut('Cmd+P')} / ${formatShortcut('Cmd+Shift+P')})`}
        >
          <Command size={12} />
        </button>
      </div>
    </footer>
  )
}
