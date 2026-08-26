import { useState, useCallback } from 'react'
import { useIDEStore, FileNode } from '@/store/useIDEStore'
import { DropZonePosition } from '../types'

export const usePaneDragDrop = (
  paneId: 1 | 2,
  paneContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const {
    isDraggingFile,
    setIsDraggingFile,
    updateSettings,
    setSplitEditorOpen,
    openFileInPane,
    moveTabBetweenPanes,
  } = useIDEStore()

  const [activeDropZone, setActiveDropZone] = useState<DropZonePosition>(null)

  const handlePaneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'

    if (!paneContainerRef.current) return
    const rect = paneContainerRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height

    if (relX > 0.7) {
      setActiveDropZone('right')
    } else if (relX < 0.3) {
      setActiveDropZone('left')
    } else if (relY > 0.7) {
      setActiveDropZone('bottom')
    } else if (relY < 0.3) {
      setActiveDropZone('top')
    } else {
      setActiveDropZone('center')
    }
  }, [paneContainerRef])

  const handlePaneDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.relatedTarget || !paneContainerRef.current?.contains(e.relatedTarget as Node)) {
      setActiveDropZone(null)
    }
  }, [paneContainerRef])

  const handlePaneDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingFile(false)

      let dropZone = activeDropZone
      if (!dropZone && paneContainerRef.current) {
        const rect = paneContainerRef.current.getBoundingClientRect()
        const relX = (e.clientX - rect.left) / rect.width
        const relY = (e.clientY - rect.top) / rect.height
        if (relX > 0.7) dropZone = 'right'
        else if (relX < 0.3) dropZone = 'left'
        else if (relY > 0.7) dropZone = 'bottom'
        else if (relY < 0.3) dropZone = 'top'
        else dropZone = 'center'
      }
      setActiveDropZone(null)

      let targetFile: FileNode | null = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dropData: any = null

      const raw = e.dataTransfer.getData('application/json')
      if (raw) {
        try {
          dropData = JSON.parse(raw)
          targetFile = dropData.fileNode || dropData.file || (dropData.name && dropData.path ? dropData : null)
          if (!targetFile && dropData.path) {
            targetFile = {
              name: dropData.path.split(/[/\\]/).pop() || dropData.path,
              path: dropData.path,
              is_dir: false,
            }
          }
        } catch {
          // ignore parse errors
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const path = (file as any).path || file.name
        if (path) {
          targetFile = { name: file.name, path, is_dir: false }
        }
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
        if (dropData?.type === 'tab' && dropData.pane !== paneId) {
          moveTabBetweenPanes(dropData.path, dropData.pane, paneId)
        } else {
          openFileInPane(targetFile, paneId)
        }
      }
    },
    [
      activeDropZone,
      moveTabBetweenPanes,
      openFileInPane,
      paneContainerRef,
      paneId,
      setIsDraggingFile,
      setSplitEditorOpen,
      updateSettings,
    ]
  )

  const handleTabDragStart = useCallback(
    (e: React.DragEvent, file: FileNode, index: number) => {
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          type: 'tab',
          path: file.path,
          pane: paneId,
          index,
          fileNode: file,
        })
      )
      e.dataTransfer.effectAllowed = 'move'
      setIsDraggingFile(true)
    },
    [paneId, setIsDraggingFile]
  )

  const handleTabDragEnd = useCallback(() => {
    setIsDraggingFile(false)
  }, [setIsDraggingFile])

  return {
    isDraggingFile,
    activeDropZone,
    handlePaneDragOver,
    handlePaneDragLeave,
    handlePaneDrop,
    handleTabDragStart,
    handleTabDragEnd,
  }
}
