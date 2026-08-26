import React, { useState } from 'react'
import { useIDEStore } from '../store/useIDEStore'

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical'
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction }) => {
  const { setSidebarWidth, setTerminalHeight } = useIDEStore()
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (direction === 'vertical') {
        // Vertical resizer (resizes sidebar width)
        const newWidth = moveEvent.clientX - 48 // 48px is ActivityBar width
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
        title="Drag to resize sidebar"
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
