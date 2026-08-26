import { useEffect } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { ResizeHandle } from './components/ResizeHandle'
import { EditorPane } from './components/EditorPane'
import { TerminalPane } from './components/TerminalPane'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette'
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
    settings
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
  }, [setCommandPaletteOpen, setQuickOpenOpen, toggleSidebar, toggleTerminal, refreshGitStatus, refreshPackageJson])

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
    </div>
  )
}

export default App
