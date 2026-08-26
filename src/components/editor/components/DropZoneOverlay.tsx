import React from 'react'
import { ArrowRight, ArrowLeft, ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { DropZonePosition } from '../types'

interface DropZoneOverlayProps {
  activeDropZone: DropZonePosition
  isDraggingFile: boolean
  paneId: 1 | 2
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({
  activeDropZone,
  isDraggingFile,
  paneId,
  onDragOver,
  onDrop,
}) => {
  return (
    <>
      {/* Visual Drop Zone Previews - Rendered at root z-50 level */}
      {activeDropZone && (
        <div className="absolute inset-0 z-50 pointer-events-none transition-all duration-150">
          {activeDropZone === 'right' && (
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-500/30 border-2 border-dashed border-blue-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowRight size={32} className="text-blue-300 mb-1 animate-pulse" />
              <span className="font-semibold tracking-wide shadow-sm">Split Editor Right</span>
            </div>
          )}
          {activeDropZone === 'left' && (
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/30 border-2 border-dashed border-blue-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowLeft size={32} className="text-blue-300 mb-1 animate-pulse" />
              <span className="font-semibold tracking-wide shadow-sm">Split Editor Left</span>
            </div>
          )}
          {activeDropZone === 'bottom' && (
            <div className="absolute left-0 right-0 bottom-0 h-1/2 bg-emerald-500/30 border-2 border-dashed border-emerald-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowDown size={32} className="text-emerald-300 mb-1 animate-pulse" />
              <span className="font-semibold tracking-wide shadow-sm">Split Editor Down</span>
            </div>
          )}
          {activeDropZone === 'top' && (
            <div className="absolute left-0 right-0 top-0 h-1/2 bg-emerald-500/30 border-2 border-dashed border-emerald-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <ArrowUp size={32} className="text-emerald-300 mb-1 animate-pulse" />
              <span className="font-semibold tracking-wide shadow-sm">Split Editor Up</span>
            </div>
          )}
          {activeDropZone === 'center' && (
            <div className="absolute inset-0 bg-ide-accent/25 border-2 border-dashed border-ide-accent backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <Plus size={32} className="text-white mb-1 animate-pulse" />
              <span className="font-semibold tracking-wide shadow-sm">Open in Pane {paneId}</span>
            </div>
          )}
        </div>
      )}

      {/* Global Transparent Overlay capturing all drag/drop events over Monaco */}
      {isDraggingFile && (
        <div
          className="absolute inset-0 z-40 bg-transparent cursor-copy"
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      )}
    </>
  )
}
