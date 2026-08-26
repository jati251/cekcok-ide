import React, { useEffect } from 'react'
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
      {/* Main Workspace Layout (Flex-1 ensures zero blank gaps or overflow) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ActivityBar />
        <Sidebar />
        {sidebarOpen && <ResizeHandle direction="vertical" />}

        <div
          className="flex-1 flex flex-col min-w-0 min-h-0"
          style={{ backgroundColor: activeTheme.colors.bg }}
        >
          <EditorPane />
          {terminalOpen && <ResizeHandle direction="horizontal" />}
          <TerminalPane />
        </div>
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
