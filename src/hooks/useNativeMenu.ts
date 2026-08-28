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
        case 'zoom_in':
          useIDEStore.getState().setZoomLevel((z) => Math.min(z + 0.1, 2.0))
          break
        case 'zoom_out':
          useIDEStore.getState().setZoomLevel((z) => Math.max(z - 0.1, 0.5))
          break
        case 'zoom_reset':
          useIDEStore.getState().setZoomLevel(1.0)
          break
        case 'search_everywhere':
          useIDEStore.getState().setSearchEverywhereOpen(true)
          break
        case 'toggle_word_wrap': {
          const currentWrap = useIDEStore.getState().settings.wordWrap
          useIDEStore.getState().updateSettings({ wordWrap: currentWrap === 'on' ? 'off' : 'on' })
          break
        }
        // For new_file, new_folder, format, we could emit a custom window event or dispatch a specific store payload
        // Since we don't have direct access to the DOM here for formatting, we can just log or show a toast
        case 'new_file': {
          useIDEStore.getState().setActiveSidebarTab('explorer')
          useIDEStore.getState().setSidebarOpen(true)
          window.dispatchEvent(new CustomEvent('trigger-new-file'))
          break
        }
        case 'new_folder': {
          useIDEStore.getState().setActiveSidebarTab('explorer')
          useIDEStore.getState().setSidebarOpen(true)
          window.dispatchEvent(new CustomEvent('trigger-new-folder'))
          break
        }
        case 'format_document':
          alert('Format document is available in the breadcrumbs bar.')
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
