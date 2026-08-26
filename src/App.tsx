import React, { useEffect, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { ResizeHandle } from './components/ResizeHandle'
import { EditorPane } from './components/EditorPane'
import { BottomPanel } from './components/bottom-panel/BottomPanel'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette'
import { SearchEverywhereModal } from './components/SearchEverywhereModal'
import { UnsavedConfirmModal } from './components/UnsavedConfirmModal'
import { useIDEStore } from './store/useIDEStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useNativeMenu } from './hooks/useNativeMenu'
import { useAutoSave } from './hooks/useAutoSave'
import { getSavedLastProject } from './utils/storage'
import { THEMES } from './utils/themes'
import './index.css'

export const App: React.FC = () => {
  const {
    refreshGitStatus,
    refreshPackageJson,
    sidebarOpen,
    toggleSidebar,
    terminalOpen,
    settings,
    zoomLevel,
    setCurrentDir,
    zenMode,
  } = useIDEStore()

  const [isMobile, setIsMobile] = useState(false)

  // Register all global keybindings
  useKeyboardShortcuts()
  useNativeMenu()
  useAutoSave()

  // Track responsive screen size and global drag state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Global drag listener to intercept OS file drags and show Editor overlays (avoiding Monaco swallowing events)
    let dragCounter = 0
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter++
      if (dragCounter === 1) {
        useIDEStore.getState().setIsDraggingFile(true)
      }
    }
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter--
      if (dragCounter === 0) {
        useIDEStore.getState().setIsDraggingFile(false)
      }
    }
    const handleDrop = () => {
      dragCounter = 0
      useIDEStore.getState().setIsDraggingFile(false)
    }
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)
    window.addEventListener('dragover', handleDragOver)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
      window.removeEventListener('dragover', handleDragOver)
    }
  }, [])

  // Handle Zoom at documentElement level
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
  const isPanelRight = !isMobile && settings.panelPosition === 'right'

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
      {!zenMode && <TitleBar />}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left-Aligned Sidebar & Activity Bar (Desktop) */}
        {!isSidebarRight && !isMobile && (
          <>
            {!zenMode && <ActivityBar />}
            {!zenMode && <Sidebar />}
            {sidebarOpen && !zenMode && <ResizeHandle direction="vertical" />}
          </>
        )}

        {/* Mobile Slide-Out Drawer Sidebar with Backdrop */}
        {isMobile && !zenMode && (
          <>
            <ActivityBar />
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-200"
                  onClick={toggleSidebar}
                />
                <div className="fixed left-12 top-0 bottom-6 z-50 shadow-2xl animate-in slide-in-from-left duration-200">
                  <Sidebar />
                </div>
              </>
            )}
          </>
        )}

        {/* Central Editor & Terminal Area */}
        <div
          className={`flex-1 flex min-w-0 min-h-0 ${isPanelRight ? 'flex-row' : 'flex-col'}`}
          style={{ backgroundColor: activeTheme.colors.bg }}
        >
          <EditorPane />
          {terminalOpen && !zenMode && (
            <ResizeHandle direction={isPanelRight ? 'vertical' : 'horizontal'} />
          )}
          {!zenMode && <BottomPanel />}
        </div>

        {/* Right-Aligned Sidebar & Activity Bar (Desktop) */}
        {isSidebarRight && !isMobile && (
          <>
            {sidebarOpen && !zenMode && <ResizeHandle direction="vertical" />}
            {!zenMode && <Sidebar />}
            {!zenMode && <ActivityBar />}
          </>
        )}
      </div>

      {/* Bottom Status Bar */}
      {!zenMode && <StatusBar />}

      {/* Global Modals */}
      <CommandPalette />
      <SearchEverywhereModal />
      <UnsavedConfirmModal />
    </div>
  )
}

export default App
