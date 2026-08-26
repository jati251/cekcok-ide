import React, { useState, useEffect } from 'react'
import { PlusCircle, Columns2, Rows2, SplitSquareVertical } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'

export const DragDropOverlay: React.FC = () => {
  const {
    openFileInPane,
    splitEditorOpen,
    setSplitEditorOpen,
    setSplitDirection,
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

  const getPayloadNode = (e: React.DragEvent): FileNode | null => {
    if (dragPayload?.file) return dragPayload.file
    const raw = e.dataTransfer.getData('application/json')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        return data.file || (data.name && data.path ? data : null)
      } catch {
        return null
      }
    }
    const textPath = e.dataTransfer.getData('text/plain')
    if (textPath) {
      const filename = textPath.split(/[/\\]/).filter(Boolean).pop() || textPath
      return { name: filename, path: textPath, is_dir: false }
    }
    return null
  }

  const handleDropOnPane = (e: React.DragEvent, pane: 1 | 2) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const node = getPayloadNode(e)
    if (node) {
      openFileInPane(node, pane)
    }
    setDragPayload(null)
  }

  const handleDropToSplitSide = (e: React.DragEvent, direction: 'horizontal' | 'vertical') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setSplitDirection(direction)
    setSplitEditorOpen(true)

    const node = getPayloadNode(e)
    if (node) {
      openFileInPane(node, 2)
    }
    setDragPayload(null)
  }

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex flex-col gap-2 p-3 bg-black/60 backdrop-blur-[3px] transition-all">
      {/* Top Banner */}
      <div className="flex items-center justify-center text-xs text-white/80 font-medium py-1">
        <SplitSquareVertical size={14} className="mr-1.5 text-ide-accent" />
        <span>Drop file into any drop zone to open or create a split pane</span>
      </div>

      <div className="flex-1 flex gap-2 min-h-0">
        {/* Pane 1 (Left / Primary) */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={(e) => handleDropOnPane(e, 1)}
          className="flex-1 pointer-events-auto border-2 border-dashed border-ide-accent/80 bg-ide-accent/15 rounded-xl flex flex-col items-center justify-center gap-2 text-white transition-all hover:bg-ide-accent/30 hover:border-ide-accent hover:scale-[0.99] cursor-pointer"
        >
          <PlusCircle size={28} className="text-ide-accent animate-pulse" />
          <span className="text-sm font-semibold">Open in Pane 1</span>
          <span className="text-[11px] text-white/60">Primary Editor Window</span>
        </div>

        {/* Pane 2 / Split Right Target */}
        {splitEditorOpen ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={(e) => handleDropOnPane(e, 2)}
            className="flex-1 pointer-events-auto border-2 border-dashed border-ide-accent/80 bg-ide-accent/15 rounded-xl flex flex-col items-center justify-center gap-2 text-white transition-all hover:bg-ide-accent/30 hover:border-ide-accent hover:scale-[0.99] cursor-pointer"
          >
            <PlusCircle size={28} className="text-ide-accent animate-pulse" />
            <span className="text-sm font-semibold">Open in Pane 2</span>
            <span className="text-[11px] text-white/60">Secondary Editor Window</span>
          </div>
        ) : (
          <div className="w-64 flex flex-col gap-2 pointer-events-auto">
            {/* Split Right */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => handleDropToSplitSide(e, 'vertical')}
              className="flex-1 border-2 border-dashed border-purple-500/80 bg-purple-500/15 rounded-xl flex flex-col items-center justify-center gap-1.5 text-white transition-all hover:bg-purple-500/30 hover:border-purple-400 hover:scale-[0.99] cursor-pointer p-2"
            >
              <Columns2 size={24} className="text-purple-400" />
              <span className="text-xs font-semibold text-center">Split Right (Pane 2)</span>
              <span className="text-[10px] text-purple-200/60">Side-by-side Layout</span>
            </div>

            {/* Split Down */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => handleDropToSplitSide(e, 'horizontal')}
              className="flex-1 border-2 border-dashed border-emerald-500/80 bg-emerald-500/15 rounded-xl flex flex-col items-center justify-center gap-1.5 text-white transition-all hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-[0.99] cursor-pointer p-2"
            >
              <Rows2 size={24} className="text-emerald-400" />
              <span className="text-xs font-semibold text-center">Split Down (Pane 2)</span>
              <span className="text-[10px] text-emerald-200/60">Stacked Layout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
