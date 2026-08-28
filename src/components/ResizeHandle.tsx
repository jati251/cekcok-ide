import React, { useState } from 'react'
import { useIDEStore } from '../store/useIDEStore'

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical'
  target?: 'sidebar' | 'terminal'
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, target = 'sidebar' }) => {
  const { setSidebarWidth, setTerminalHeight, setTerminalWidth, settings } = useIDEStore()
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (target === 'terminal' && direction === 'vertical') {
        // Vertical resizer for right-docked terminal panel
        const newWidth = window.innerWidth - moveEvent.clientX
        setTerminalWidth(newWidth)
      } else if (direction === 'vertical') {
        // Vertical resizer (resizes sidebar width)
        const isSidebarRight = settings.sidebarPosition === 'right'
        const newWidth = isSidebarRight
          ? window.innerWidth - moveEvent.clientX - 48
          : moveEvent.clientX - 48
        setSidebarWidth(newWidth)
      } else {
        // Horizontal resizer (resizes terminal height)
        const newHeight = window.innerHeight - 26 - moveEvent.clientY // 26px is StatusBar height
        setTerminalHeight(newHeight)
      }
    }

    const onPointerUp = () => {
      setIsDragging(false)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }

  if (direction === 'vertical') {
    return (
      <div
        onPointerDown={handlePointerDown}
        className={`w-1 -ml-0.5 hover:w-1.5 z-30 cursor-col-resize select-none transition-colors ${
          isDragging ? 'bg-ide-accent w-1.5' : 'bg-transparent hover:bg-ide-accent/60'
        }`}
        title={`Drag to resize ${target}`}
      />
    )
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`h-1 -mt-0.5 hover:h-1.5 z-30 cursor-row-resize select-none transition-colors w-full ${
        isDragging ? 'bg-ide-accent h-1.5' : 'bg-transparent hover:bg-ide-accent/60'
      }`}
      title="Drag to resize terminal panel"
    />
  )
}
