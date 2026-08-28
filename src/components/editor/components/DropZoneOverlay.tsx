import { useState } from 'react'
import { ArrowRight, ArrowLeft, ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { useIDEStore } from '@/store/useIDEStore'
import { DropZonePosition } from '../types'

interface DropZoneOverlayProps {
  isDraggingFile: boolean
  paneId: 1 | 2
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({
  isDraggingFile,
  paneId,
}) => {
  const { dragPayload } = useIDEStore()
  const [activeZone, setActiveZone] = useState<DropZonePosition>(null)

  // Only show editor split drop zones when dragging an editor file or tab
  if (!isDraggingFile || !dragPayload || dragPayload.type === 'tool') return null

  const createZoneProps = (zone: DropZonePosition) => ({
    'data-drop-zone': zone,
    'data-pane-id': paneId,
    onPointerEnter: () => setActiveZone(zone),
    onPointerLeave: () => setActiveZone(null),
  })

  return (
    <div className="absolute inset-0 z-50">
      {/* 5-Zone Transparent Grid Net */}
      <div className="absolute top-0 left-0 right-0 h-[30%] z-10 bg-[rgba(0,0,0,0.01)]" {...createZoneProps('top')} />
      <div className="absolute bottom-0 left-0 right-0 h-[30%] z-10 bg-[rgba(0,0,0,0.01)]" {...createZoneProps('bottom')} />
      <div className="absolute top-[30%] bottom-[30%] left-0 w-[30%] z-10 bg-[rgba(0,0,0,0.01)]" {...createZoneProps('left')} />
      <div className="absolute top-[30%] bottom-[30%] right-0 w-[30%] z-10 bg-[rgba(0,0,0,0.01)]" {...createZoneProps('right')} />
      <div className="absolute top-[30%] bottom-[30%] left-[30%] right-[30%] z-10 bg-[rgba(0,0,0,0.01)]" {...createZoneProps('center')} />

      {/* Visual Previews (pointer-events-none so they don't block the invisible net) */}
      <div className="absolute inset-0 pointer-events-none">
        {activeZone === 'right' && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-500/30 border-2 border-dashed border-blue-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            <ArrowRight size={32} className="text-blue-300 mb-1 animate-pulse" />
            <span className="font-semibold tracking-wide shadow-sm">Split Editor Right</span>
          </div>
        )}
        {activeZone === 'left' && (
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/30 border-2 border-dashed border-blue-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            <ArrowLeft size={32} className="text-blue-300 mb-1 animate-pulse" />
            <span className="font-semibold tracking-wide shadow-sm">Split Editor Left</span>
          </div>
        )}
        {activeZone === 'bottom' && (
          <div className="absolute left-0 right-0 bottom-0 h-1/2 bg-emerald-500/30 border-2 border-dashed border-emerald-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            <ArrowDown size={32} className="text-emerald-300 mb-1 animate-pulse" />
            <span className="font-semibold tracking-wide shadow-sm">Split Editor Down</span>
          </div>
        )}
        {activeZone === 'top' && (
          <div className="absolute left-0 right-0 top-0 h-1/2 bg-emerald-500/30 border-2 border-dashed border-emerald-400 backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            <ArrowUp size={32} className="text-emerald-300 mb-1 animate-pulse" />
            <span className="font-semibold tracking-wide shadow-sm">Split Editor Up</span>
          </div>
        )}
        {activeZone === 'center' && (
          <div className="absolute inset-0 bg-ide-accent/25 border-2 border-dashed border-ide-accent backdrop-blur-[2px] rounded-lg m-1.5 flex flex-col items-center justify-center text-white font-medium text-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            <Plus size={32} className="text-white mb-1 animate-pulse" />
            <span className="font-semibold tracking-wide shadow-sm">Open in Pane {paneId}</span>
          </div>
        )}
      </div>
    </div>
  )
}
