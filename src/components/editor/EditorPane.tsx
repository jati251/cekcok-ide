import React, { useRef, useState, useEffect } from 'react'
import { useIDEStore } from '@/store/useIDEStore'
import { SinglePane } from './components/SinglePane'

export const EditorPane: React.FC = () => {
  const {
    splitEditorOpen,
    splitRatio,
    setSplitRatio,
    activePane,
    pane1Files,
    pane1ActiveFile,
    pane2Files,
    pane2ActiveFile,
    settings,
  } = useIDEStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isHorizontal = isMobile || settings.splitDirection === 'horizontal'

  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = isHorizontal
        ? (moveEvent.clientY - rect.top) / rect.height
        : (moveEvent.clientX - rect.left) / rect.width
      setSplitRatio(newRatio)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <main
      ref={containerRef}
      className={`flex-1 flex bg-ide-bg overflow-hidden min-w-0 min-h-0 relative ${
        isHorizontal ? 'flex-col' : 'flex-row'
      }`}
    >
      <div
        style={{
          width: isHorizontal ? '100%' : splitEditorOpen ? `${splitRatio * 100}%` : '100%',
          height: isHorizontal ? (splitEditorOpen ? `${splitRatio * 100}%` : '100%') : '100%',
        }}
        className="flex flex-col min-w-0 min-h-0 overflow-hidden"
      >
        <SinglePane
          paneId={1}
          files={pane1Files}
          activeFile={pane1ActiveFile}
          isActivePane={activePane === 1}
        />
      </div>

      {splitEditorOpen && (
        <>
          {/* Draggable Split Divider */}
          <div
            onMouseDown={handleSplitMouseDown}
            className={`bg-ide-border hover:bg-ide-accent z-20 transition-all shrink-0 select-none ${
              isHorizontal
                ? 'h-1 hover:h-1.5 w-full cursor-row-resize'
                : 'w-1 hover:w-1.5 h-full cursor-col-resize'
            }`}
            title="Drag to resize split panes"
          />

          <div
            style={{
              width: isHorizontal ? '100%' : `${(1 - splitRatio) * 100}%`,
              height: isHorizontal ? `${(1 - splitRatio) * 100}%` : '100%',
            }}
            className="flex flex-col min-w-0 min-h-0 overflow-hidden"
          >
            <SinglePane
              paneId={2}
              files={pane2Files}
              activeFile={pane2ActiveFile}
              isActivePane={activePane === 2}
            />
          </div>
        </>
      )}
    </main>
  )
}
