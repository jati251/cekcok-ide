import React, { Suspense, useEffect, useState } from 'react'
import { useIDEStore } from './store/useIDEStore'
import { UpdateModal } from './components/UpdateModal'
import { AppSkeleton } from './components/skeletons/AppSkeleton'
import { Toaster, toast } from 'react-hot-toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalSettingsModal } from './components/GlobalSettingsModal'
import { BranchSwitcherModal } from './components/BranchSwitcherModal'
import { SpringInitializrModal } from './components/modals/SpringInitializrModal'
import { NewJavaFileModal } from './components/modals/NewJavaFileModal'
import { NodeInitializrModal } from './components/modals/NodeInitializrModal'
import { InstallPackageModal } from './components/modals/InstallPackageModal'
import { NewNodeFileModal } from './components/modals/NewNodeFileModal'
import { applyGlobalTheme } from './utils/themes'
import { safeInvoke } from './utils/tauriBridge'
import './index.css'

// Lazy-load all heavy workspace apps for faster initial render
const SuperHome = React.lazy(() => import('./apps/home/SuperHome').then(m => ({ default: m.SuperHome })))
const CodeWorkspace = React.lazy(() => import('./apps/code/CodeWorkspace').then(m => ({ default: m.CodeWorkspace })))
const SpreadsheetWorkspace = React.lazy(() => import('./apps/spreadsheet/SpreadsheetWorkspace').then(m => ({ default: m.SpreadsheetWorkspace })))
const DocumentWorkspace = React.lazy(() => import('./apps/document/DocumentWorkspace').then(m => ({ default: m.DocumentWorkspace })))
const WhiteboardWorkspace = React.lazy(() => import('./apps/whiteboard/WhiteboardWorkspace').then(m => ({ default: m.WhiteboardWorkspace })))

export const App: React.FC = () => {
  const { activeApp, settings, branchSwitcherOpen, setBranchSwitcherOpen, zoomLevel } = useIDEStore()

  const [springInitializrOpen, setSpringInitializrOpen] = useState(false)
  const [newJavaModalState, setNewJavaModalState] = useState<{ isOpen: boolean; targetDir: string }>({
    isOpen: false,
    targetDir: '',
  })

  const [nodeInitializrOpen, setNodeInitializrOpen] = useState(false)
  const [installPackageOpen, setInstallPackageOpen] = useState(false)
  const [newNodeModalState, setNewNodeModalState] = useState<{ isOpen: boolean; targetDir: string }>({
    isOpen: false,
    targetDir: '',
  })

  // Global listeners for Spring Initializr, Node Initializr, and Scaffolding modals
  useEffect(() => {
    const handleTriggerInitializr = () => setSpringInitializrOpen(true)
    const handleTriggerNewJavaFile = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetDir?: string }>
      setNewJavaModalState({
        isOpen: true,
        targetDir: customEvent.detail?.targetDir || '',
      })
    }

    const handleTriggerNodeInitializr = () => setNodeInitializrOpen(true)
    const handleTriggerInstallPackage = () => setInstallPackageOpen(true)
    const handleTriggerNewNodeFile = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetDir?: string }>
      setNewNodeModalState({
        isOpen: true,
        targetDir: customEvent.detail?.targetDir || '',
      })
    }

    window.addEventListener('trigger-spring-initializr', handleTriggerInitializr)
    window.addEventListener('trigger-new-java-file', handleTriggerNewJavaFile)
    window.addEventListener('trigger-node-initializr', handleTriggerNodeInitializr)
    window.addEventListener('trigger-install-package', handleTriggerInstallPackage)
    window.addEventListener('trigger-new-node-file', handleTriggerNewNodeFile)

    return () => {
      window.removeEventListener('trigger-spring-initializr', handleTriggerInitializr)
      window.removeEventListener('trigger-new-java-file', handleTriggerNewJavaFile)
      window.removeEventListener('trigger-node-initializr', handleTriggerNodeInitializr)
      window.removeEventListener('trigger-install-package', handleTriggerInstallPackage)
      window.removeEventListener('trigger-new-node-file', handleTriggerNewNodeFile)
    }
  }, [])

  // Apply theme variables globally to root document
  useEffect(() => {
    applyGlobalTheme(settings.theme)
  }, [settings.theme])

  // Prevent default drag and drop behavior globally & setup Tauri drop listener
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault()
    const handleDrop = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    let unlistenDrop: (() => void) | undefined
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<{ paths: string[] }>('tauri://drop', async (event) => {
        const { currentDir, refreshDirectory } = useIDEStore.getState()
        if (!currentDir) return

        const paths = event.payload.paths
        if (!paths || paths.length === 0) return

        try {
          for (const sourcePath of paths) {
            const fileName = sourcePath.split(/[/\\]/).pop() || ''
            const targetPath = `${currentDir}/${fileName}`
            
            // We use copy_path for drops to avoid moving original files by accident
            await safeInvoke('copy_path', { sourcePath, targetPath })
          }
          await refreshDirectory(currentDir)
          toast.success(`Dropped ${paths.length} file(s)`)
        } catch (err) {
          console.error('Drop error:', err)
          toast.error(`Failed to process dropped files: ${err}`)
        }
      }).then(unlisten => {
        unlistenDrop = unlisten
      })
    })

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
      if (unlistenDrop) unlistenDrop()
    }
  }, [])

  return (
    <div
      style={{
        fontFamily: settings.ideFontFamily,
        backgroundColor: 'var(--color-ide-bg)',
        color: 'var(--color-ide-text)',
        zoom: zoomLevel,
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

      {/* Spring Boot Initializr Modal */}
      <SpringInitializrModal
        isOpen={springInitializrOpen}
        onClose={() => setSpringInitializrOpen(false)}
      />

      {/* New Java / Spring File Modal */}
      <NewJavaFileModal
        isOpen={newJavaModalState.isOpen}
        targetDir={newJavaModalState.targetDir}
        onClose={() => setNewJavaModalState({ isOpen: false, targetDir: '' })}
      />

      {/* Node.js & Fullstack Initializr Modal */}
      <NodeInitializrModal
        isOpen={nodeInitializrOpen}
        onClose={() => setNodeInitializrOpen(false)}
      />

      {/* Install NPM Package Modal */}
      <InstallPackageModal
        isOpen={installPackageOpen}
        onClose={() => setInstallPackageOpen(false)}
      />

      {/* New TypeScript / React / Node File Modal */}
      <NewNodeFileModal
        isOpen={newNodeModalState.isOpen}
        targetDir={newNodeModalState.targetDir}
        onClose={() => setNewNodeModalState({ isOpen: false, targetDir: '' })}
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
