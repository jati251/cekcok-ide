import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FilePlus, 
  FolderPlus, 
  RefreshCw, 
  Search as SearchIcon,
  Play,
  Package,
  Plus,
  Minus,
  RotateCcw,
  Check,
  ArrowUp,
  ArrowDown,
  ChevronsDownUp
} from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { FileTreeItem } from './FileTreeItem'

interface SearchResultItem {
  file_path: string
  file_name: string
  line_number: number
  line_text: string
}

export const Sidebar = () => {
  const { 
    sidebarOpen, 
    sidebarWidth,
    activeSidebarTab,
    fileTree, 
    currentDir,
    setFileTree, 
    setCurrentDir,
    openFile,
    gitStatus,
    isGitLoading,
    refreshGitStatus,
    packageJson,
    refreshPackageJson,
    runTerminalCommand,
    collapseAllFolders
  } = useIDEStore()

  // Explorer State
  const loadDirectory = async (path: string) => {
    try {
      const result = await invoke<FileNode[]>("read_dir", { path })
      setFileTree(result)
      setCurrentDir(path)
    } catch (error) {
      console.error("Failed to load directory:", error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadDirectory(".")
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpenFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
      })
      if (selectedPath && typeof selectedPath === 'string') {
        loadDirectory(selectedPath)
      }
    } catch (error) {
      console.error("Failed to open folder dialog:", error)
    }
  }

  const handleCreateNode = async (isDir: boolean) => {
    const name = prompt(`Enter new ${isDir ? 'folder' : 'file'} name:`)
    if (!name) return

    const separator = currentDir.endsWith('/') || currentDir.endsWith('\\') ? '' : '/'
    const newPath = `${currentDir}${separator}${name}`
    
    try {
      if (isDir) {
        await invoke("create_dir", { path: newPath })
      } else {
        await invoke("create_file", { path: newPath })
      }
      loadDirectory(currentDir)
      refreshGitStatus()
    } catch (err) {
      alert(`Failed to create: ${err}`)
    }
  }

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await invoke<SearchResultItem[]>('search_files', {
        cwd: currentDir,
        query: searchQuery,
        caseSensitive
      })
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Git State
  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)

  const handleStageFile = async (filePath: string) => {
    try {
      await invoke('git_stage', { cwd: currentDir, files: [filePath] })
      refreshGitStatus()
    } catch (err) {
      alert(`Failed to stage: ${err}`)
    }
  }

  const handleStageAll = async () => {
    try {
      await invoke('git_stage', { cwd: currentDir, files: ['.'] })
      refreshGitStatus()
    } catch (err) {
      alert(`Failed to stage all: ${err}`)
    }
  }

  const handleUnstageFile = async (filePath: string) => {
    try {
      await invoke('git_unstage', { cwd: currentDir, files: [filePath] })
      refreshGitStatus()
    } catch (err) {
      alert(`Failed to unstage: ${err}`)
    }
  }

  const handleUnstageAll = async () => {
    try {
      await invoke('git_unstage', { cwd: currentDir, files: ['.'] })
      refreshGitStatus()
    } catch (err) {
      alert(`Failed to unstage all: ${err}`)
    }
  }

  const handleDiscardFile = async (filePath: string) => {
    if (!confirm(`Discard changes in ${filePath}?`)) return
    try {
      await invoke('git_discard', { cwd: currentDir, files: [filePath] })
      refreshGitStatus()
    } catch (err) {
      alert(`Failed to discard: ${err}`)
    }
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) return
    setIsCommitting(true)
    try {
      await invoke('git_commit', { cwd: currentDir, message: commitMessage })
      setCommitMessage('')
      refreshGitStatus()
    } catch (err) {
      alert(`Commit error: ${err}`)
    } finally {
      setIsCommitting(false)
    }
  }

  const handlePush = async () => {
    try {
      await invoke('git_push', { cwd: currentDir })
      refreshGitStatus()
      alert('Pushed to remote successfully!')
    } catch (err) {
      alert(`Push error: ${err}`)
    }
  }

  const handlePull = async () => {
    try {
      await invoke('git_pull', { cwd: currentDir })
      refreshGitStatus()
      loadDirectory(currentDir)
      alert('Pulled from remote successfully!')
    } catch (err) {
      alert(`Pull error: ${err}`)
    }
  }

  // Node.js Actions
  const handleRunNpmScript = (scriptName: string) => {
    runTerminalCommand(`npm run ${scriptName}`)
  }

  const handleInstallNpm = () => {
    runTerminalCommand('npm install')
  }

  const handleAddDependency = () => {
    const pkg = prompt('Enter package name to install (e.g. lodash, axios, zod):')
    if (pkg) {
      runTerminalCommand(`npm install ${pkg}`)
    }
  }

  const rootFolderName = currentDir === '.' ? 'PROJECT ROOT' : currentDir.split(/[/\\]/).pop() || currentDir

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ width: sidebarWidth }}
          className="flex flex-col bg-ide-sidebar border-r border-ide-border overflow-hidden whitespace-nowrap select-none h-full z-10 shrink-0"
        >
          {/* VIEW: EXPLORER */}
          {activeSidebarTab === 'explorer' && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
                <span className="truncate max-w-[120px] text-white/90 font-mono text-[11px]" title={currentDir}>{rootFolderName}</span>
                <div className="flex gap-1 items-center">
                  <button 
                    onClick={() => handleCreateNode(false)}
                    className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
                    title="New File"
                  >
                    <FilePlus size={14} />
                  </button>
                  <button 
                    onClick={() => handleCreateNode(true)}
                    className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
                    title="New Folder"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button 
                    onClick={collapseAllFolders}
                    className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
                    title="Collapse All Folders"
                  >
                    <ChevronsDownUp size={13} />
                  </button>
                  <button 
                    onClick={() => loadDirectory(currentDir)}
                    className="hover:text-white text-[#999] transition-colors p-1 hover:bg-white/10 rounded cursor-pointer"
                    title="Refresh Explorer"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button 
                    onClick={handleOpenFolder}
                    className="text-[10px] hover:text-white text-[#bbb] bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors ml-1 font-mono cursor-pointer"
                    title="Open Folder"
                  >
                    OPEN
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {fileTree.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#888] italic">No files in directory</div>
                ) : (
                  fileTree.map((file) => (
                    <FileTreeItem key={file.path} node={file} depth={0} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: SEARCH */}
          {activeSidebarTab === 'search' && (
            <div className="flex flex-col h-full p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-ide-muted mb-2">
                Search
              </div>

              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in files..."
                    className="w-full bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-ide-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCaseSensitive(!caseSensitive)}
                    className={`absolute right-1 px-1.5 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                      caseSensitive ? 'bg-ide-accent text-white' : 'text-[#888] hover:text-white'
                    }`}
                    title="Match Case"
                  >
                    Aa
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-ide-accent hover:bg-ide-accent-hover text-white text-xs py-1 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5 font-medium"
                >
                  <SearchIcon size={12} />
                  {isSearching ? 'Searching...' : 'Find'}
                </button>
              </form>

              <div className="flex-1 overflow-y-auto mt-3 border-t border-ide-border pt-2 space-y-1">
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-xs text-[#888] text-center py-4">No results found</div>
                )}
                {searchResults.map((res, i) => (
                  <div
                    key={`${res.file_path}-${res.line_number}-${i}`}
                    onClick={() => {
                      openFile({ name: res.file_name, path: res.file_path, is_dir: false })
                    }}
                    className="p-1.5 hover:bg-white/5 rounded cursor-pointer text-xs group"
                  >
                    <div className="flex items-center justify-between text-ide-muted text-[11px]">
                      <span className="truncate text-[#9cdcfe]">{res.file_name}</span>
                      <span className="text-[#888]">:{res.line_number}</span>
                    </div>
                    <div className="text-white/80 truncate font-mono text-[11px] mt-0.5">
                      {res.line_text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SOURCE CONTROL (GIT) */}
          {activeSidebarTab === 'git' && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
                <span>Source Control</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={refreshGitStatus}
                    className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                    title="Refresh Git Status"
                  >
                    <RefreshCw size={13} className={isGitLoading ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={handlePull}
                    className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                    title="Pull Changes"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={handlePush}
                    className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                    title="Push Changes"
                  >
                    <ArrowUp size={13} />
                  </button>
                </div>
              </div>

              {!gitStatus.is_repo ? (
                <div className="p-4 text-center text-xs text-[#888] space-y-2">
                  <p>Not a Git repository.</p>
                  <button
                    onClick={() => runTerminalCommand('git init')}
                    className="bg-ide-accent hover:bg-ide-accent-hover text-white px-3 py-1 rounded text-xs cursor-pointer"
                  >
                    Initialize Repository
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Branch & Sync Bar */}
                  <div className="flex items-center justify-between text-xs bg-[#2b2b2b] px-2.5 py-1.5 rounded">
                    <span className="font-mono text-white/90 font-medium truncate">⎇ {gitStatus.branch}</span>
                    <span className="text-[10px] text-ide-muted">
                      ↑{gitStatus.ahead} ↓{gitStatus.behind}
                    </span>
                  </div>

                  {/* Commit Box */}
                  <div className="space-y-1.5">
                    <textarea
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Message (Cmd+Enter to commit)"
                      rows={2}
                      className="w-full bg-[#3c3c3c] text-white text-xs p-2 rounded border border-transparent focus:border-ide-accent focus:outline-none resize-none"
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          handleCommit()
                        }
                      }}
                    />
                    <button
                      onClick={handleCommit}
                      disabled={isCommitting || !commitMessage.trim()}
                      className="w-full bg-ide-accent hover:bg-ide-accent-hover disabled:opacity-50 text-white text-xs py-1.5 rounded font-medium cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Check size={14} />
                      Commit
                    </button>
                  </div>

                  {/* Staged Changes */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1">
                      <span>Staged Changes ({gitStatus.staged.length})</span>
                      {gitStatus.staged.length > 0 && (
                        <button
                          onClick={handleUnstageAll}
                          className="hover:text-white text-[#888] cursor-pointer p-0.5"
                          title="Unstage All"
                        >
                          <Minus size={13} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {gitStatus.staged.map((f) => (
                        <div
                          key={`staged-${f.path}`}
                          className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded text-xs group cursor-pointer"
                          onClick={() => openFile({ name: f.path.split(/[/\\]/).pop() || f.path, path: f.path, is_dir: false })}
                        >
                          <span className="truncate text-white/90">{f.path}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-green-400 font-mono">{f.status}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUnstageFile(f.path)
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-white text-[#888] cursor-pointer"
                              title="Unstage"
                            >
                              <Minus size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Changes (Unstaged) */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1">
                      <span>Changes ({gitStatus.unstaged.length})</span>
                      {gitStatus.unstaged.length > 0 && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleStageAll}
                            className="hover:text-white text-[#888] cursor-pointer p-0.5"
                            title="Stage All"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {gitStatus.unstaged.map((f) => (
                        <div
                          key={`unstaged-${f.path}`}
                          className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded text-xs group cursor-pointer"
                          onClick={() => openFile({ name: f.path.split(/[/\\]/).pop() || f.path, path: f.path, is_dir: false })}
                        >
                          <span className="truncate text-white/90">{f.path}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-amber-400 font-mono">{f.status}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStageFile(f.path)
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-white text-[#888] cursor-pointer"
                              title="Stage File"
                            >
                              <Plus size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDiscardFile(f.path)
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-[#888] cursor-pointer"
                              title="Discard Changes"
                            >
                              <RotateCcw size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: NODE.JS & NPM */}
          {activeSidebarTab === 'node' && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
                <span>Node.js Suite</span>
                <button
                  onClick={refreshPackageJson}
                  className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Reload package.json"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {!packageJson ? (
                <div className="p-4 text-center text-xs text-[#888] space-y-3">
                  <Package size={28} className="mx-auto text-ide-muted opacity-50" />
                  <p>No `package.json` found in this directory.</p>
                  <button
                    onClick={() => runTerminalCommand('npm init -y')}
                    className="bg-ide-accent hover:bg-ide-accent-hover text-white px-3 py-1.5 rounded text-xs cursor-pointer font-medium"
                  >
                    npm init -y
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {/* Project Info Header */}
                  <div className="bg-[#2b2b2b] p-2.5 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate">{packageJson.name || 'node-project'}</span>
                      <span className="text-[10px] bg-ide-accent/30 text-[#4fc1ff] px-1.5 py-0.5 rounded font-mono">
                        v{packageJson.version || '1.0.0'}
                      </span>
                    </div>
                    {packageJson.description && (
                      <p className="text-[11px] text-ide-muted line-clamp-2">{packageJson.description}</p>
                    )}
                  </div>

                  {/* NPM Scripts Section */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1.5">
                      <span>NPM Scripts</span>
                      <button
                        onClick={handleInstallNpm}
                        className="hover:text-white text-[10px] text-[#4fc1ff] bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                        title="npm install"
                      >
                        npm i
                      </button>
                    </div>

                    <div className="space-y-1">
                      {packageJson.scripts && Object.entries(packageJson.scripts).map(([name, cmd]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between bg-[#252526] hover:bg-[#2d2d2d] border border-ide-border px-2.5 py-1.5 rounded cursor-pointer group transition-colors"
                          onClick={() => handleRunNpmScript(name)}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-mono text-xs text-white font-medium truncate">{name}</span>
                            <span className="text-[10px] text-[#888] font-mono truncate">{cmd}</span>
                          </div>
                          <button
                            className="bg-green-600/20 text-green-400 group-hover:bg-green-600 group-hover:text-white p-1 rounded transition-colors cursor-pointer shrink-0"
                            title={`Run: npm run ${name}`}
                          >
                            <Play size={12} fill="currentColor" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dependencies List */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1.5">
                      <span>Dependencies ({Object.keys(packageJson.dependencies || {}).length})</span>
                      <button
                        onClick={handleAddDependency}
                        className="hover:text-white text-[#888] cursor-pointer p-0.5"
                        title="Add Dependency"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {packageJson.dependencies && Object.entries(packageJson.dependencies).map(([pkg, ver]) => (
                        <div key={pkg} className="flex items-center justify-between text-xs px-2 py-1 hover:bg-white/5 rounded">
                          <span className="truncate text-white/90">{pkg}</span>
                          <span className="text-[10px] font-mono text-ide-muted">{ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dev Dependencies List */}
                  <div>
                    <div className="text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1.5">
                      Dev Dependencies ({Object.keys(packageJson.devDependencies || {}).length})
                    </div>
                    <div className="space-y-0.5">
                      {packageJson.devDependencies && Object.entries(packageJson.devDependencies).map(([pkg, ver]) => (
                        <div key={pkg} className="flex items-center justify-between text-xs px-2 py-1 hover:bg-white/5 rounded">
                          <span className="truncate text-white/80">{pkg}</span>
                          <span className="text-[10px] font-mono text-ide-muted">{ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
