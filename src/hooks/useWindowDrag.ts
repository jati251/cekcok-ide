import React, { useCallback } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { isTauri } from '../utils/tauriBridge'

/**
 * Reusable hook for handling desktop window dragging and double-click maximize in custom titlebars.
 */
export function useWindowDrag() {
  const handleWindowDrag = useCallback((e: React.MouseEvent) => {
    if (!isTauri()) return

    // Prevent dragging if clicked on interactive elements
    if ((e.target as HTMLElement).closest('button, input, select, textarea, [data-no-drag]')) {
      return
    }

    if (e.detail === 2) {
      getCurrentWindow().toggleMaximize()
    } else if (e.button === 0 || e.buttons === 1) {
      getCurrentWindow().startDragging()
    }
  }, [])

  return { handleWindowDrag }
}
