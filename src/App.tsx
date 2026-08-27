import React, { useEffect } from 'react'
import { useIDEStore } from './store/useIDEStore'
import { CodeWorkspace } from './apps/code/CodeWorkspace'
import { SpreadsheetWorkspace } from './apps/spreadsheet/SpreadsheetWorkspace'
import { DocumentWorkspace } from './apps/document/DocumentWorkspace'
import { WhiteboardWorkspace } from './apps/whiteboard/WhiteboardWorkspace'
import { SuperHome } from './apps/home/SuperHome'
import { Toaster } from 'react-hot-toast'
import './index.css'

export const App: React.FC = () => {
  const { activeApp, settings } = useIDEStore()

  // Prevent default drag and drop behavior globally
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault()
    const handleDrop = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)
    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  return (
    <div style={{ fontFamily: settings.ideFontFamily }} className="w-full h-full">
      {activeApp === 'home' && <SuperHome />}
      {activeApp === 'code' && <CodeWorkspace />}
      {activeApp === 'spreadsheet' && <SpreadsheetWorkspace />}
      {activeApp === 'document' && <DocumentWorkspace />}
      {activeApp === 'whiteboard' && <WhiteboardWorkspace />}
      
      {/* Global Toast for notifications across all apps */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#252526',
            color: '#fff',
            border: '1px solid #3c3c3c',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#4fc1ff', secondary: '#252526' } },
          error: { iconTheme: { primary: '#f48771', secondary: '#252526' } },
        }}
      />
    </div>
  )
}
