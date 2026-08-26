import { useEffect } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { ResizeHandle } from './components/ResizeHandle'
import { EditorPane } from './components/EditorPane'
import { TerminalPane } from './components/TerminalPane'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette'
import { UnsavedConfirmModal } from './components/UnsavedConfirmModal'
import { useIDEStore } from './store/useIDEStore'
import { THEMES } from './utils/themes'
import './index.css'

function App() {
  const {
    setCommandPaletteOpen,
    setQuickOpenOpen,
    toggleSidebar,
    toggleTerminal,
    refreshGitStatus,
    refreshPackageJson,
    sidebarOpen,
    terminalOpen,
    settings,
    activePane,
    pane1ActiveFile,
    pane2ActiveFile,
    requestCloseFile,
    saveActiveFile,
    toggleSplitEditor,
    setActivePane
  } = useIDEStore()

  useEffect(() => {
    refreshGitStatus()
    refreshPackageJson()

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      // Cmd+Shift+P: Command Palette
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      // Cmd+P: Quick Open file
      else if (isCmdOrCtrl && !e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        setQuickOpenOpen(true)
      }
      // Cmd+W: Close active tab with dirty check
      else if (isCmdOrCtrl && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault()
        const activeFile = activePane === 1 ? pane1ActiveFile : pane2ActiveFile
        if (activeFile) {
          requestCloseFile(activeFile.path, activePane)
        }
      }
      // Cmd+S: Save active file
      else if (isCmdOrCtrl && !e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        saveActiveFile()
      }
      // Cmd+\: Toggle Split Editor
      else if (isCmdOrCtrl && e.key === '\\') {
        e.preventDefault()
        toggleSplitEditor()
      }
      // Cmd+1: Switch to Pane 1
      else if (isCmdOrCtrl && e.key === '1') {
        e.preventDefault()
        setActivePane(1)
      }
      // Cmd+2: Switch to Pane 2
      else if (isCmdOrCtrl && e.key === '2') {
        e.preventDefault()
        setActivePane(2)
      }
      // Cmd+B: Toggle Sidebar
      else if (isCmdOrCtrl && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault()
        toggleSidebar()
      }
      // Cmd+J: Toggle Terminal
      else if (isCmdOrCtrl && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault()
        toggleTerminal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    setCommandPaletteOpen, 
    setQuickOpenOpen, 
    toggleSidebar, 
    toggleTerminal, 
    refreshGitStatus, 
    refreshPackageJson,
    activePane,
    pane1ActiveFile,
    pane2ActiveFile,
    requestCloseFile,
    saveActiveFile,
    toggleSplitEditor,
    setActivePane
  ])

  const activeTheme = THEMES[settings.theme] || THEMES['vs-dark']

  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none"
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
      {/* Main Workspace Layout */}
      <div className="flex flex-1 h-[calc(100vh-26px)] overflow-hidden">
        <ActivityBar />
        <Sidebar />
        {sidebarOpen && <ResizeHandle direction="vertical" />}
        
        <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: activeTheme.colors.bg }}>
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
