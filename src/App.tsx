import React, { useEffect } from 'react'
import { TitleBar } from './components/TitleBar'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { ResizeHandle } from './components/ResizeHandle'
import { EditorPane } from './components/EditorPane'
import { TerminalPane } from './components/TerminalPane'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette'
import { UnsavedConfirmModal } from './components/UnsavedConfirmModal'
import { useIDEStore } from './store/useIDEStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getSavedLastProject } from './utils/storage'
import { THEMES } from './utils/themes'
import './index.css'

export const App: React.FC = () => {
  const {
    refreshGitStatus,
    refreshPackageJson,
    sidebarOpen,
    terminalOpen,
    settings,
    zoomLevel,
    setCurrentDir,
  } = useIDEStore()

  // Register all global keybindings
  useKeyboardShortcuts()

  // Handle Zoom at documentElement level so layout dynamically stretches to fill window 100%
  useEffect(() => {
    document.documentElement.style.zoom = `${zoomLevel}`
  }, [zoomLevel])

  useEffect(() => {
    // Startup Restore Handling
    if (settings.startupBehavior === 'restoreLastProject') {
      const lastProject = getSavedLastProject()
      if (lastProject) {
        setCurrentDir(lastProject)
      }
    }

    refreshGitStatus()
    refreshPackageJson()
  }, [refreshGitStatus, refreshPackageJson, setCurrentDir, settings.startupBehavior])

  const activeTheme = THEMES[settings.theme] || THEMES['vs-dark']
  const isSidebarRight = settings.sidebarPosition === 'right'
  const isPanelRight = settings.panelPosition === 'right'

  const sidebarGroup = (
    <>
      {isSidebarRight && sidebarOpen && <ResizeHandle direction="vertical" />}
      <Sidebar />
      {!isSidebarRight && sidebarOpen && <ResizeHandle direction="vertical" />}
      <ActivityBar />
    </>
  )

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden font-sans select-none"
      style={{
        backgroundColor: activeTheme.colors.bg,
        color: activeTheme.colors.text,
        // @ts-expect-error custom CSS variable mapping for themes
        '--color-ide-bg': activeTheme.colors.bg,
        '--color-ide-sidebar': activeTheme.colors.sidebar,
        '--color-ide-border': activeTheme.colors.border,
        '--color-ide-accent': activeTheme.colors.accent,
        '--color-ide-accent-hover': activeTheme.colors.accentHover,
      }}
    >
      {/* Top Native OS TitleBar & Menus */}
      <TitleBar />

      {/* Main Workspace Layout with Dynamic Sidebar Position */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left-Aligned Sidebar & Activity Bar */}
        {!isSidebarRight && (
          <>
            <ActivityBar />
            <Sidebar />
            {sidebarOpen && <ResizeHandle direction="vertical" />}
          </>
        )}

        {/* Central Editor & Terminal Area (Dynamic Bottom / Right Panel Position) */}
        <div
          className={`flex-1 flex min-w-0 min-h-0 ${isPanelRight ? 'flex-row' : 'flex-col'}`}
          style={{ backgroundColor: activeTheme.colors.bg }}
        >
          <EditorPane />
          {terminalOpen && (
            <ResizeHandle direction={isPanelRight ? 'vertical' : 'horizontal'} />
          )}
          <TerminalPane />
        </div>

        {/* Right-Aligned Sidebar & Activity Bar */}
        {isSidebarRight && sidebarGroup}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Global Command Palette / Quick Open Modal */}
      <CommandPalette />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedConfirmModal />
    </div>
  )
}

export default App
