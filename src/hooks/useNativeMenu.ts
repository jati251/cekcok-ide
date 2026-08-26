import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { useIDEStore } from '../store/useIDEStore'

export const useNativeMenu = () => {
  const {
    saveActiveFile,
    openSettingsTab,
    openWelcomeTab,
    setCommandPaletteOpen,
    toggleSidebar,
    toggleTerminal,
    toggleSplitEditor,
  } = useIDEStore()

  useEffect(() => {
    const unlisten = listen<string>('menu-action', (event) => {
      const action = event.payload
      switch (action) {
        case 'save':
          saveActiveFile()
          break
        case 'settings':
          openSettingsTab()
          break
        case 'welcome':
          openWelcomeTab()
          break
        case 'command_palette':
          setCommandPaletteOpen(true)
          break
        case 'toggle_sidebar':
          toggleSidebar()
          break
        case 'toggle_terminal':
          toggleTerminal()
          break
        case 'toggle_split':
          toggleSplitEditor()
          break
      }
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [
    saveActiveFile,
    openSettingsTab,
    openWelcomeTab,
    setCommandPaletteOpen,
    toggleSidebar,
    toggleTerminal,
    toggleSplitEditor,
  ])
}
