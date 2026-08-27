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

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Global drag reset handlers for OS files
    const handleWindowDragEnd = () => {
      useIDEStore.getState().setIsDraggingFile(false)
    }
    const handleWindowDrop = () => {
      useIDEStore.getState().setIsDraggingFile(false)
    }
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault()
    }
    const handleWindowDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        useIDEStore.getState().setIsDraggingFile(true)
      }
    }
    const handleWindowDragLeave = (e: DragEvent) => {
      if (useIDEStore.getState().dragPayload) return
      if (!e.relatedTarget || e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        useIDEStore.getState().setIsDraggingFile(false)
      }
    }

    // Global Pointer Drag and Drop handler (Bypasses all HTML5 DND bugs)
    const handlePointerMove = (e: PointerEvent) => {
      const state = useIDEStore.getState()
      if (state.pendingDragPayload && state.dragStartCoords && !state.isDraggingFile) {
        const dx = e.clientX - state.dragStartCoords.x
        const dy = e.clientY - state.dragStartCoords.y
        if (Math.sqrt(dx * dx + dy * dy) > 3) {
          state.setDragPayload(state.pendingDragPayload)
          state.setIsDraggingFile(true)
        }
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      const state = useIDEStore.getState()
      if (state.isDraggingFile && state.dragPayload) {
        // We look for any drop zone in the element or its closest parent
        const targetEl: HTMLElement | null = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
        // Find closest element with data-drop-zone to support nested elements like text inside rows
        const dropZoneEl = targetEl?.closest('[data-drop-zone]') as HTMLElement | null
        
        const dropZone = dropZoneEl?.getAttribute('data-drop-zone')
        
        if (dropZone === 'sidebar') {
          const dropPath = dropZoneEl?.getAttribute('data-path')
          if (dropPath && state.dragPayload.type === 'file' && state.dragPayload.file) {
            // Find the node in the fileTree or folderChildren to check if it's a dir
            let targetNode = state.fileTree.find(n => n.path === dropPath)
            if (!targetNode) {
              // Search in folder children
              for (const children of Object.values(state.folderChildren)) {
                const found = children.find(n => n.path === dropPath)
                if (found) { targetNode = found; break; }
              }
            }
            if (targetNode) {
              state.movePathItem(state.dragPayload.file.path, targetNode)
            }
          }
        } else if (dropZone === 'left-tools' || dropZone === 'bottom-tools') {
          if (state.dragPayload.type === 'tool' && state.dragPayload.toolId) {
            const position = dropZone === 'left-tools' ? 'left' : 'bottom'
            state.setToolLayout(state.dragPayload.toolId, position)
          }
        } else if (dropZone) {
          const paneId = dropZoneEl?.getAttribute('data-pane-id')
          if (paneId) {
            window.dispatchEvent(new CustomEvent('cekcok-drop', { 
              detail: { dropZone, paneId: parseInt(paneId, 10) } 
            }))
          }
        }
      }
      
      // Cleanup drag state always
      state.setDragPayload(null)
      state.setPendingDragPayload(null)
      state.setDragStartCoords(null)
      state.setIsDraggingFile(false)
    }

    window.addEventListener('dragend', handleWindowDragEnd)
    window.addEventListener('drop', handleWindowDrop)
    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('dragenter', handleWindowDragEnter)
    window.addEventListener('dragleave', handleWindowDragLeave)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('dragend', handleWindowDragEnd)
      window.removeEventListener('drop', handleWindowDrop)
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('dragenter', handleWindowDragEnter)
      window.removeEventListener('dragleave', handleWindowDragLeave)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
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
