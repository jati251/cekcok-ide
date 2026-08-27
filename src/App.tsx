import React, { Suspense, useEffect } from 'react'
import { useIDEStore } from './store/useIDEStore'
import { UpdateModal } from './components/UpdateModal'
import { AppSkeleton } from './components/skeletons/AppSkeleton'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalSettingsModal } from './components/GlobalSettingsModal'
import { BranchSwitcherModal } from './components/BranchSwitcherModal'
import { applyGlobalTheme } from './utils/themes'
import './index.css'

// Lazy-load all heavy workspace apps for faster initial render
const SuperHome = React.lazy(() => import('./apps/home/SuperHome').then(m => ({ default: m.SuperHome })))
const CodeWorkspace = React.lazy(() => import('./apps/code/CodeWorkspace').then(m => ({ default: m.CodeWorkspace })))
const SpreadsheetWorkspace = React.lazy(() => import('./apps/spreadsheet/SpreadsheetWorkspace').then(m => ({ default: m.SpreadsheetWorkspace })))
const DocumentWorkspace = React.lazy(() => import('./apps/document/DocumentWorkspace').then(m => ({ default: m.DocumentWorkspace })))
const WhiteboardWorkspace = React.lazy(() => import('./apps/whiteboard/WhiteboardWorkspace').then(m => ({ default: m.WhiteboardWorkspace })))

export const App: React.FC = () => {
  const { activeApp, settings, branchSwitcherOpen, setBranchSwitcherOpen } = useIDEStore()

  // Apply theme variables globally to root document
  useEffect(() => {
    applyGlobalTheme(settings.theme)
  }, [settings.theme])

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
    <div
      style={{
        fontFamily: settings.ideFontFamily,
        backgroundColor: 'var(--color-ide-bg)',
        color: 'var(--color-ide-text)',
      }}
      className="w-full h-full"
    >
      <ErrorBoundary>
        {activeApp === 'home' && (
          <Suspense fallback={<AppSkeleton type="home" />}>
            <SuperHome />
          </Suspense>
        )}
        {activeApp === 'code' && (
          <Suspense fallback={<AppSkeleton type="code" />}>
            <CodeWorkspace />
          </Suspense>
        )}
        {activeApp === 'spreadsheet' && (
          <Suspense fallback={<AppSkeleton type="spreadsheet" />}>
            <SpreadsheetWorkspace />
          </Suspense>
        )}
        {activeApp === 'document' && (
          <Suspense fallback={<AppSkeleton type="document" />}>
            <DocumentWorkspace />
          </Suspense>
        )}
        {activeApp === 'whiteboard' && (
          <Suspense fallback={<AppSkeleton type="whiteboard" />}>
            <WhiteboardWorkspace />
          </Suspense>
        )}
      </ErrorBoundary>
      
      {/* Global Settings & Preferences Modal */}
      <GlobalSettingsModal />

      {/* Git Branch Switcher Modal */}
      <BranchSwitcherModal
        isOpen={branchSwitcherOpen}
        onClose={() => setBranchSwitcherOpen(false)}
      />

      {/* In-app Auto Updater Modal */}
      <UpdateModal />

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
