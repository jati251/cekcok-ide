import { useEffect } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { Sidebar } from './components/Sidebar'
import { EditorPane } from './components/EditorPane'
import { TerminalPane } from './components/TerminalPane'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette'
import { useIDEStore } from './store/useIDEStore'
import './index.css'

function App() {
  const {
    setCommandPaletteOpen,
    setQuickOpenOpen,
    toggleSidebar,
    toggleTerminal,
    refreshGitStatus,
    refreshPackageJson
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

  return (
    <div className="h-screen w-screen flex flex-col bg-ide-bg text-ide-text overflow-hidden font-sans select-none">
      {/* Main Workspace Layout */}
      <div className="flex flex-1 h-[calc(100vh-26px)] overflow-hidden">
        <ActivityBar />
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          <EditorPane />
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
