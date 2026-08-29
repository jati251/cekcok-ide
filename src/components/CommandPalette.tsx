import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, GitBranch, Layout, Terminal, Sparkles, FilePlus, FolderPlus } from 'lucide-react'
import { useIDEStore, FileNode, SidebarTab } from '../store/useIDEStore'
import { renderFileOrFolderIcon } from '../utils/fileIcons'
import { safeInvoke } from '../utils/tauriBridge'

interface PaletteAction {
  id: string
  title: string
  category: string
  icon: typeof Search
  run: () => void
}

interface WorkspaceFileMatch {
  name: string
  path: string
  relative_path: string
}

export const CommandPalette = () => {
  const {
    commandPaletteOpen,
    quickOpenOpen,
    setCommandPaletteOpen,
    setQuickOpenOpen,
    currentDir,
    openFile,
    toggleTerminal,
    toggleSidebar,
    setActiveSidebarTab,
    runTerminalCommand,
    packageJson,
    refreshGitStatus,
    openSettingsTab,
  } = useIDEStore()

  const isOpen = commandPaletteOpen || quickOpenOpen
  const isQuickOpen = quickOpenOpen && !commandPaletteOpen

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFileMatch[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // Search workspace files dynamically
  useEffect(() => {
    if (!isOpen || !isQuickOpen || !currentDir) return

    let isMounted = true
    setIsLoadingFiles(true)

    // Clean query from line numbers e.g. "App.tsx:40" -> "App.tsx"
    const fileQuery = query.includes(':') ? query.split(':')[0] : query

    safeInvoke<WorkspaceFileMatch[]>('find_workspace_files', {
      cwd: currentDir,
      query: fileQuery,
      limit: 100,
    })
      .then((files) => {
        if (isMounted) {
          setWorkspaceFiles(files || [])
          setIsLoadingFiles(false)
        }
      })
      .catch((err) => {
        console.error('Failed to search workspace files:', err)
        if (isMounted) setIsLoadingFiles(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, isQuickOpen, currentDir, query])

  // Build command palette actions
  const actions: PaletteAction[] = [
    {
      id: 'file-quick-open',
      title: 'Go to File... (Quick Open)',
      category: 'Navigation',
      icon: Search,
      run: () => setQuickOpenOpen(true),
    },
    {
      id: 'file-new-file',
      title: 'File: New File',
      category: 'File',
      icon: FilePlus,
      run: () => {
        setActiveSidebarTab('explorer' as SidebarTab)
        useIDEStore.getState().setSidebarOpen(true)
        window.dispatchEvent(new CustomEvent('trigger-new-file'))
      },
    },
    {
      id: 'file-new-folder',
      title: 'File: New Folder',
      category: 'File',
      icon: FolderPlus,
      run: () => {
        setActiveSidebarTab('explorer' as SidebarTab)
        useIDEStore.getState().setSidebarOpen(true)
        window.dispatchEvent(new CustomEvent('trigger-new-folder'))
      },
    },
    {
      id: 'app-check-updates',
      title: 'Application: Check for Updates',
      category: 'Application',
      icon: Sparkles,
      run: () => window.dispatchEvent(new CustomEvent('check-for-updates')),
    },
    {
      id: 'preferences-settings',
      title: 'Preferences: Open User Settings',
      category: 'Preferences',
      icon: Layout,
      run: () => openSettingsTab(),
    },
    {
      id: 'toggle-terminal',
      title: 'View: Toggle Terminal',
      category: 'View',
      icon: Terminal,
      run: () => toggleTerminal(),
    },
    {
      id: 'toggle-sidebar',
      title: 'View: Toggle Primary Sidebar',
      category: 'View',
      icon: Layout,
      run: () => toggleSidebar(),
    },
    {
      id: 'view-explorer',
      title: 'View: Show Explorer',
      category: 'View',
      icon: Layout,
      run: () => setActiveSidebarTab('explorer' as SidebarTab),
    },
    {
      id: 'view-git',
      title: 'View: Show Source Control (Git)',
      category: 'View',
      icon: GitBranch,
      run: () => {
        setActiveSidebarTab('git' as SidebarTab)
        refreshGitStatus()
      },
    },
    {
      id: 'view-node',
      title: 'View: Show Node.js & NPM Suite',
      category: 'View',
      icon: Play,
      run: () => setActiveSidebarTab('node' as SidebarTab),
    },
    {
      id: 'git-pull',
      title: 'Git: Pull from Remote',
      category: 'Git',
      icon: GitBranch,
      run: () => runTerminalCommand('git pull'),
    },
    {
      id: 'git-push',
      title: 'Git: Push to Remote',
      category: 'Git',
      icon: GitBranch,
      run: () => runTerminalCommand('git push'),
    },
    {
      id: 'spring-initializr',
      title: 'Spring Boot: Create New Project (Spring Initializr)',
      category: 'Spring Boot',
      icon: Play,
      run: () => window.dispatchEvent(new CustomEvent('trigger-spring-initializr')),
    },
    {
      id: 'spring-endpoints',
      title: 'Spring Boot: Scan & View REST Endpoints',
      category: 'Spring Boot',
      icon: Play,
      run: () => {
        setActiveSidebarTab('node' as SidebarTab)
        useIDEStore.getState().setSidebarOpen(true)
        useIDEStore.getState().refreshSpringEndpoints()
      },
    },
    {
      id: 'java-new-file',
      title: 'Java: New Java Class / Spring Component...',
      category: 'Java',
      icon: FilePlus,
      run: () => {
        window.dispatchEvent(new CustomEvent('trigger-new-java-file', { detail: { targetDir: currentDir } }))
      },
    },
    {
      id: 'node-initializr',
      title: 'Node.js: Create New Project (Vite / Next.js / Express / NestJS)',
      category: 'Node.js',
      icon: Play,
      run: () => window.dispatchEvent(new CustomEvent('trigger-node-initializr')),
    },
    {
      id: 'node-install-pkg',
      title: 'Node.js: Install New Package (Add Dependency)...',
      category: 'Node.js',
      icon: Play,
      run: () => window.dispatchEvent(new CustomEvent('trigger-install-package')),
    },
    {
      id: 'node-endpoints',
      title: 'Node.js: Scan & View REST API Routes',
      category: 'Node.js',
      icon: Play,
      run: () => {
        setActiveSidebarTab('node' as SidebarTab)
        useIDEStore.getState().setSidebarOpen(true)
        useIDEStore.getState().refreshNodeEndpoints()
      },
    },
    {
      id: 'node-new-file',
      title: 'Node.js: New TypeScript / React Component...',
      category: 'Node.js',
      icon: FilePlus,
      run: () => {
        window.dispatchEvent(new CustomEvent('trigger-new-node-file', { detail: { targetDir: currentDir } }))
      },
    },
    {
      id: 'npm-install',
      title: 'NPM: Install Dependencies',
      category: 'Node.js',
      icon: Play,
      run: () => runTerminalCommand('npm install'),
    },
    // Dynamic NPM scripts
    ...(packageJson?.scripts
      ? Object.keys(packageJson.scripts).map((script) => ({
          id: `npm-run-${script}`,
          title: `NPM: Run ${script}`,
          category: 'Node.js',
          icon: Play,
          run: () => runTerminalCommand(`npm run ${script}`),
        }))
      : []),
  ]

  const filteredActions = !isQuickOpen
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const totalItems = isQuickOpen ? workspaceFiles.length : filteredActions.length

  const handleSelect = (index: number) => {
    if (isQuickOpen) {
      const file = workspaceFiles[index]
      if (file) {
        openFile({
          name: file.name,
          path: file.path,
          is_dir: false,
        } as FileNode)
      }
    } else {
      const action = filteredActions[index]
      if (action) {
        action.run()
      }
    }
    setCommandPaletteOpen(false)
    setQuickOpenOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(selectedIndex)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCommandPaletteOpen(false)
      setQuickOpenOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex justify-center pt-16 z-50 select-none"
        onClick={() => {
          setCommandPaletteOpen(false)
          setQuickOpenOpen(false)
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-[95vw] sm:w-[620px] max-h-[80vh] sm:max-h-[460px] bg-[#252526] border border-ide-border rounded-lg shadow-2xl flex flex-col overflow-hidden mx-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Box */}
          <div className="p-3 border-b border-ide-border flex items-center gap-2.5 bg-[#1e1e1e]">
            <Search size={16} className="text-[#858585] shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isQuickOpen
                  ? 'Type filename to search workspace (e.g. App.tsx)...'
                  : 'Type a command or search...'
              }
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#757575]"
            />
            {isQuickOpen && (
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#888888] shrink-0">
                Quick Open
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-[380px]">
            {isQuickOpen ? (
              isLoadingFiles && workspaceFiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#888]">Searching workspace...</div>
              ) : workspaceFiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#888]">No matching files found in workspace</div>
              ) : (
                workspaceFiles.map((file, idx) => {
                  const isSelected = idx === selectedIndex
                  return (
                    <div
                      key={file.path}
                      onClick={() => handleSelect(idx)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                        isSelected ? 'bg-ide-accent text-white' : 'hover:bg-white/5 text-[#cccccc]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 flex items-center">
                          {renderFileOrFolderIcon(file.name, false, false)}
                        </span>
                        <span className="font-medium truncate">{file.name}</span>
                      </div>
                      <span
                        className={`text-[11px] truncate ml-3 font-mono shrink-0 max-w-[280px] text-right ${
                          isSelected ? 'text-white/80' : 'text-[#777777]'
                        }`}
                      >
                        {file.relative_path}
                      </span>
                    </div>
                  )
                })
              )
            ) : filteredActions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#888]">No matching commands</div>
            ) : (
              filteredActions.map((action, idx) => {
                const isSelected = idx === selectedIndex
                const Icon = action.icon
                return (
                  <div
                    key={action.id}
                    onClick={() => handleSelect(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-ide-accent text-white' : 'hover:bg-white/5 text-[#cccccc]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 ${isSelected ? 'text-white' : 'text-[#4fc1ff]'}`}
                      />
                      <span className="font-medium truncate">{action.title}</span>
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-wider font-semibold shrink-0 ml-2 ${
                        isSelected ? 'text-white/80' : 'text-[#888]'
                      }`}
                    >
                      {action.category}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
