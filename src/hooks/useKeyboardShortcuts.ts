import { useEffect, useRef } from 'react'
import { useIDEStore } from '../store/useIDEStore'

export const useKeyboardShortcuts = () => {
  const lastShiftTime = useRef<number>(0)
  const isCmdKPressed = useRef<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      // Detect Double-Shift
      if (e.key === 'Shift') {
        const now = Date.now()
        if (now - lastShiftTime.current < 300) {
          e.preventDefault()
          useIDEStore.getState().setSearchEverywhereOpen(true)
          lastShiftTime.current = 0
        } else {
          lastShiftTime.current = now
        }
      } else {
        // Reset if another key is pressed
        if (e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Alt') {
          lastShiftTime.current = 0
        }
      }

      // Handle Cmd+K chords
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        isCmdKPressed.current = true
        // Reset the Cmd+K state after a short delay if no second key is pressed
        setTimeout(() => {
          isCmdKPressed.current = false
        }, 1500)
        return
      }

      if (isCmdKPressed.current) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          useIDEStore.getState().toggleZenMode()
          isCmdKPressed.current = false
        }
        return // Ignore other keys while in Cmd+K chord mode
      }

      // Zoom In: Cmd + = / Cmd + +
      if (isCmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        useIDEStore.getState().setZoomLevel((prev) => prev + 0.1)
      }
      // Zoom Out: Cmd + - / Cmd + _
      else if (isCmdOrCtrl && (e.key === '-' || e.key === '_')) {
        e.preventDefault()
        useIDEStore.getState().setZoomLevel((prev) => prev - 0.1)
      }
      // Zoom Reset: Cmd + 0
      else if (isCmdOrCtrl && e.key === '0') {
        e.preventDefault()
        useIDEStore.getState().setZoomLevel(1.0)
      }
      // Cmd+Shift+P: Command Palette
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        useIDEStore.getState().setCommandPaletteOpen(true)
      }
      // Cmd+P: Quick Open file
      else if (isCmdOrCtrl && !e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        useIDEStore.getState().setQuickOpenOpen(true)
      }
      // Cmd+,: Open Settings
      else if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault()
        useIDEStore.getState().openSettingsTab()
      }
      // Cmd+W: Close active tab with dirty check
      else if (isCmdOrCtrl && !e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault()
        const state = useIDEStore.getState()
        const activeFile = state.activePane === 1 ? state.pane1ActiveFile : state.pane2ActiveFile
        if (activeFile) {
          state.requestCloseFile(activeFile.path, state.activePane)
        }
      }
      // Cmd+Shift+T: Reopen Last Closed Tab
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault()
        useIDEStore.getState().reopenLastClosedTab()
      }
      // Cmd+S: Save active file / workspace
      else if (isCmdOrCtrl && !e.shiftKey && !e.altKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('workspace-save'))
        useIDEStore.getState().saveActiveFile()
      }
      // Cmd+Shift+S: Save As active file
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        useIDEStore.getState().saveAsActiveFile()
      }
      // Cmd+Alt+S: Save All files
      else if (isCmdOrCtrl && e.altKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        useIDEStore.getState().saveAllFiles()
      }
      // Cmd+\: Toggle Split Editor
      else if (isCmdOrCtrl && e.key === '\\') {
        e.preventDefault()
        useIDEStore.getState().toggleSplitEditor()
      }
      // Cmd+1: Switch to Pane 1
      else if (isCmdOrCtrl && e.key === '1') {
        e.preventDefault()
        useIDEStore.getState().setActivePane(1)
      }
      // Cmd+2: Switch to Pane 2
      else if (isCmdOrCtrl && e.key === '2') {
        e.preventDefault()
        useIDEStore.getState().setActivePane(2)
      }
      // Cmd+B: Toggle Sidebar
      else if (isCmdOrCtrl && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault()
        useIDEStore.getState().toggleSidebar()
      }
      // Cmd+` or Cmd+J: Toggle Terminal
      else if (isCmdOrCtrl && (e.key === '`' || e.key === '~' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault()
        useIDEStore.getState().toggleTerminal()
      }
      // Cmd+Shift+F: Focus Search
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault()
        useIDEStore.getState().setActiveSidebarTab('search')
        useIDEStore.getState().setSidebarOpen(true)
      }
      // Cmd+Shift+E: Focus Explorer
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault()
        useIDEStore.getState().setActiveSidebarTab('explorer')
        useIDEStore.getState().setSidebarOpen(true)
      }
      // Cmd+Shift+G: Focus Git
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault()
        useIDEStore.getState().setActiveSidebarTab('git')
        useIDEStore.getState().setSidebarOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
