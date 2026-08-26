import React, { useState, useEffect } from 'react'
import { PlusCircle, Columns2 } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'

export const DragDropOverlay: React.FC = () => {
  const {
    openFileInPane,
    splitEditorOpen,
    setSplitEditorOpen,
    dragPayload,
    setDragPayload,
  } = useIDEStore()

  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    let dragCount = 0

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCount++
      if (dragCount === 1) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCount--
      if (dragCount <= 0) {
        setIsDragging(false)
        dragCount = 0
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = () => {
      setIsDragging(false)
      setDragPayload(null)
      dragCount = 0
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [setDragPayload])

  if (!isDragging && !dragPayload) return null

  const handleDropOnPane = (e: React.DragEvent, pane: 1 | 2) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (dragPayload) {
      openFileInPane(dragPayload.file, pane)
      setDragPayload(null)
      return
    }

    const raw = e.dataTransfer.getData('application/json')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        const fileNode: FileNode = data.file || data
        if (fileNode.name && fileNode.path) {
          openFileInPane(fileNode, pane)
        }
      } catch {
        // ignore
      }
    }
  }

  const handleDropToSplit = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setSplitEditorOpen(true)

    if (dragPayload) {
      openFileInPane(dragPayload.file, 2)
      setDragPayload(null)
      return
    }

    const raw = e.dataTransfer.getData('application/json')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        const fileNode: FileNode = data.file || data
        if (fileNode.name && fileNode.path) {
          openFileInPane(fileNode, 2)
        }
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex gap-2 p-3 bg-black/40 backdrop-blur-[2px] transition-all">
      {/* Pane 1 Drop Target */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
        }}
        onDrop={(e) => handleDropOnPane(e, 1)}
        className="flex-1 pointer-events-auto border-2 border-dashed border-ide-accent bg-ide-accent/15 rounded-xl flex flex-col items-center justify-center gap-2 text-white transition-all hover:bg-ide-accent/25 hover:scale-[0.99] cursor-pointer"
      >
        <PlusCircle size={28} className="text-ide-accent animate-pulse" />
        <span className="text-sm font-semibold">Drop to Open in Editor (Pane 1)</span>
      </div>

      {/* Pane 2 / Split Drop Target */}
      {splitEditorOpen ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={(e) => handleDropOnPane(e, 2)}
          className="flex-1 pointer-events-auto border-2 border-dashed border-ide-accent bg-ide-accent/15 rounded-xl flex flex-col items-center justify-center gap-2 text-white transition-all hover:bg-ide-accent/25 hover:scale-[0.99] cursor-pointer"
        >
          <PlusCircle size={28} className="text-ide-accent animate-pulse" />
          <span className="text-sm font-semibold">Drop to Open in Editor (Pane 2)</span>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={handleDropToSplit}
          className="w-48 pointer-events-auto border-2 border-dashed border-purple-500 bg-purple-500/15 rounded-xl flex flex-col items-center justify-center gap-2 text-white transition-all hover:bg-purple-500/25 hover:scale-[0.99] cursor-pointer"
        >
          <Columns2 size={24} className="text-purple-400" />
          <span className="text-xs font-semibold text-center px-2">Drop to Split Editor Right</span>
        </div>
      )}
    </div>
  )
}
