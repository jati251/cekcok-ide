import { FolderOpen, FilePlus, GitBranch, Settings, Command, Search, Columns2, Terminal, ZoomIn } from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import { useIDEStore } from '../store/useIDEStore'
import { formatShortcut } from '../utils/platform'

export const WelcomeView = () => {
  const { 
    setCurrentDir, 
    recentProjects, 
    openSettingsTab, 
    runTerminalCommand,
    currentDir,
    openFile
  } = useIDEStore()

  const handleOpenFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
      })
      if (selectedPath && typeof selectedPath === 'string') {
        setCurrentDir(selectedPath)
      }
    } catch (error) {
      console.error("Failed to open folder dialog:", error)
    }
  }

  const handleCloneRepo = () => {
    const url = prompt('Enter Git repository URL to clone (e.g. https://github.com/user/repo.git):')
    if (url) {
      runTerminalCommand(`git clone ${url}`)
    }
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-ide-bg text-ide-text p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Hero Header with Quirky Mascot */}
        <div className="flex items-center gap-6 border-b border-ide-border/50 pb-6">
          <img
            src="/logo.png"
            alt="Cekcok IDE Mascot"
            className="w-24 h-24 rounded-2xl shadow-xl ring-2 ring-ide-accent/40 shadow-cyan-500/10 shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight">Cekcok IDE</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-ide-accent/20 text-ide-accent px-2 py-0.5 rounded-full border border-ide-accent/30">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-sm text-[#aaa]">
              The high-velocity, cross-platform code editor for coders who argue over every semi-colon.
            </p>
            <p className="text-xs text-ide-muted font-mono">
              Powered by Tauri v2 + Rust + React 19 + Monaco Engine.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Start & Recent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Start Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">Start</h2>
            
            <div className="space-y-2">
              <button
                onClick={handleOpenFolder}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#252526] hover:bg-[#2d2d2d] border border-ide-border hover:border-ide-accent/50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-ide-accent/10 text-ide-accent group-hover:bg-ide-accent group-hover:text-white transition-colors">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Open Folder...</div>
                  <div className="text-[11px] text-ide-muted">Open an existing workspace on your computer</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (!currentDir) {
                    alert('Please open a folder first to create a file.')
                    return
                  }
                  const filename = prompt('Enter filename to create (e.g. index.ts):')
                  if (filename) {
                    const sep = currentDir.endsWith('/') || currentDir.endsWith('\\') ? '' : '/'
                    const path = `${currentDir}${sep}${filename}`
                    openFile({ name: filename, path, is_dir: false, content: '' })
                  }
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg bg-[#252526] hover:bg-[#2d2d2d] border border-ide-border hover:border-ide-accent/50 transition-all text-left group ${!currentDir ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FilePlus size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">New File...</div>
                  <div className="text-[11px] text-ide-muted">Create a new empty document</div>
                </div>
              </button>

              <button
                onClick={handleCloneRepo}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#252526] hover:bg-[#2d2d2d] border border-ide-border hover:border-ide-accent/50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-green-500/10 text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <GitBranch size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Clone Git Repository...</div>
                  <div className="text-[11px] text-ide-muted">Clone a project from GitHub or GitLab</div>
                </div>
              </button>

              <button
                onClick={openSettingsTab}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#252526] hover:bg-[#2d2d2d] border border-ide-border hover:border-ide-accent/50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Settings size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Customize Settings & Themes</div>
                  <div className="text-[11px] text-ide-muted">Configure editor fonts, themes (Dracula, One Dark), tab sizes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Workspaces */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">Recent Projects</h2>

            {recentProjects.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#252526] border border-ide-border text-center text-xs text-ide-muted">
                No recent projects yet. Open a folder to start coding!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {recentProjects.map((path) => {
                  const folderName = path.split(/[/\\]/).pop() || path
                  const isCurrent = currentDir === path
                  return (
                    <div
                      key={path}
                      onClick={() => setCurrentDir(path)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isCurrent 
                          ? 'border-ide-accent bg-ide-accent/15 text-white' 
                          : 'bg-[#252526] hover:bg-[#2d2d2d] border-ide-border text-[#cccccc]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen size={15} className={isCurrent ? 'text-ide-accent' : 'text-yellow-400'} />
                        <span className="text-xs font-semibold truncate">{folderName}</span>
                      </div>
                      <span className="text-[10px] text-ide-muted truncate font-mono ml-2">{path}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcut Cheat Sheet */}
        <div className="space-y-3 pt-4 border-t border-ide-border/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">Useful Keyboard Shortcuts</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-[#252526] border border-ide-border">
              <div className="flex items-center gap-2">
                <Search size={13} className="text-[#4fc1ff]" />
                <span>Quick Open</span>
              </div>
              <kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                {formatShortcut('Cmd+P')}
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#252526] border border-ide-border">
              <div className="flex items-center gap-2">
                <Command size={13} className="text-[#4fc1ff]" />
                <span>Command Palette</span>
              </div>
              <kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                {formatShortcut('Cmd+Shift+P')}
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#252526] border border-ide-border">
              <div className="flex items-center gap-2">
                <Settings size={13} className="text-[#4fc1ff]" />
                <span>Settings</span>
              </div>
              <kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                {formatShortcut('Cmd+,')}
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#252526] border border-ide-border">
              <div className="flex items-center gap-2">
                <Columns2 size={13} className="text-[#4fc1ff]" />
                <span>Split Editor Right</span>
              </div>
              <kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                {formatShortcut('Cmd+\\')}
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#252526] border border-ide-border">
              <div className="flex items-center gap-2">
                <Terminal size={13} className="text-[#4fc1ff]" />
                <span>Toggle Terminal</span>
              </div>
              <kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                {formatShortcut('Cmd+`')}
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#252526] border border-ide-border">
              <div className="flex items-center gap-2">
                <ZoomIn size={13} className="text-[#4fc1ff]" />
                <span>Zoom In / Out</span>
              </div>
              <kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                {formatShortcut('Cmd+= / Cmd+-')}
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
