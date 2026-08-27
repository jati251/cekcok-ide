import { useEffect } from 'react'
import { useIDEStore, FileNode } from '@/store/useIDEStore'
import { DropZonePosition } from '../types'

export const usePaneDragDrop = (
  paneId: 1 | 2
) => {
  const {
    isDraggingFile,
    updateSettings,
    setSplitEditorOpen,
    openFileInPane,
    moveTabBetweenPanes,
  } = useIDEStore()

  useEffect(() => {
    const handleCekcokDrop = (e: Event) => {
      const customEvent = e as CustomEvent<{ dropZone: DropZonePosition, paneId: number }>
      if (customEvent.detail.paneId !== paneId) return

      const dropZone = customEvent.detail.dropZone
      let targetFile: FileNode | null = null
      const dropData = useIDEStore.getState().dragPayload

      if (dropData && dropData.file) {
        targetFile = dropData.file
      }

      if (!targetFile) return

      if (dropZone === 'right') {
        updateSettings({ splitDirection: 'vertical' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 2)
      } else if (dropZone === 'left') {
        updateSettings({ splitDirection: 'vertical' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 1)
      } else if (dropZone === 'bottom') {
        updateSettings({ splitDirection: 'horizontal' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 2)
      } else if (dropZone === 'top') {
        updateSettings({ splitDirection: 'horizontal' })
        setSplitEditorOpen(true)
        openFileInPane(targetFile, 1)
      } else {
        if (dropData?.type === 'tab' && dropData.fromPane !== paneId) {
          moveTabBetweenPanes(dropData.file.path, dropData.fromPane, paneId)
        } else {
          openFileInPane(targetFile, paneId)
        }
      }
    }

    window.addEventListener('cekcok-drop', handleCekcokDrop)
    return () => window.removeEventListener('cekcok-drop', handleCekcokDrop)
  }, [
    moveTabBetweenPanes,
    openFileInPane,
    paneId,
    setSplitEditorOpen,
    updateSettings,
  ])

  return {
    isDraggingFile,
  }
}
