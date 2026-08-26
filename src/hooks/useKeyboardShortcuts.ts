import { useEffect } from 'react'
import { useIDEStore } from '../store/useIDEStore'

export const useKeyboardShortcuts = () => {
  const {
    setCommandPaletteOpen,
    setQuickOpenOpen,
    toggleSidebar,
    toggleTerminal,
    activePane,
    pane1ActiveFile,
    pane2ActiveFile,
    requestCloseFile,
    saveActiveFile,
    toggleSplitEditor,
    setActivePane,
    openSettingsTab,
    setZoomLevel,
  } = useIDEStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      // Zoom In: Cmd + = / Cmd + +
      if (isCmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        setZoomLevel((prev) => prev + 0.1)
      }
      // Zoom Out: Cmd + - / Cmd + _
      else if (isCmdOrCtrl && (e.key === '-' || e.key === '_')) {
        e.preventDefault()
        setZoomLevel((prev) => prev - 0.1)
      }
      // Zoom Reset: Cmd + 0
      else if (isCmdOrCtrl && e.key === '0') {
        e.preventDefault()
        setZoomLevel(1.0)
      }
      // Cmd+Shift+P: Command Palette
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      // Cmd+P: Quick Open file
      else if (isCmdOrCtrl && !e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        setQuickOpenOpen(true)
      }
      // Cmd+,: Open Settings
      else if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault()
        openSettingsTab()
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
    activePane,
    pane1ActiveFile,
    pane2ActiveFile,
    requestCloseFile,
    saveActiveFile,
    toggleSplitEditor,
    setActivePane,
    openSettingsTab,
    setZoomLevel,
  ])
}
