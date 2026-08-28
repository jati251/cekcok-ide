import { FolderOpen, FilePlus, GitBranch, Settings, Command, Search, Columns2, Terminal, ZoomIn } from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import { useIDEStore } from '../store/useIDEStore'
import { formatShortcut } from '../utils/platform'
import { APP_VERSION } from '../constants/app'

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
    <div
      style={{
        backgroundColor: 'var(--color-ide-bg)',
        color: 'var(--color-ide-text)',
      }}
      className="flex-1 h-full overflow-y-auto p-8 select-none"
    >
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Hero Header with Quirky Mascot */}
        <div
          style={{ borderColor: 'var(--color-ide-border)' }}
          className="flex items-center gap-6 border-b pb-6"
        >
          <img
            src="/logo.png"
            alt="Cekcok IDE Mascot"
            className="w-24 h-24 rounded-2xl shadow-xl ring-2 ring-ide-accent/40 shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">Cekcok IDE</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-ide-accent/20 text-ide-accent px-2 py-0.5 rounded-full border border-ide-accent/30">
                v{APP_VERSION}
              </span>
            </div>
            <p className="text-sm opacity-80">
              The high-velocity, cross-platform code editor for coders who argue over every semi-colon.
            </p>
            <p className="text-xs opacity-60 font-mono">
              Powered by Tauri v2 + Rust + React 19 + Monaco Engine.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Start & Recent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Start Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider opacity-70">Start</h2>
            
            <div className="space-y-2">
              <button
                onClick={handleOpenFolder}
                style={{
                  backgroundColor: 'var(--color-ide-sidebar)',
                  borderColor: 'var(--color-ide-border)',
                  color: 'var(--color-ide-text)',
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-ide-accent/50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-ide-accent/15 text-ide-accent group-hover:bg-ide-accent group-hover:text-white transition-colors">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold">Open Folder...</div>
                  <div className="text-[11px] opacity-60">Open an existing workspace on your computer</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (currentDir) {
                    useIDEStore.getState().setActiveSidebarTab('explorer')
                    useIDEStore.getState().setSidebarOpen(true)
                    window.dispatchEvent(new CustomEvent('trigger-new-file'))
                  } else {
                    openFile({ name: 'Untitled-1', path: 'untitled://Untitled-1', is_dir: false, content: '' })
                  }
                }}
                style={{
                  backgroundColor: 'var(--color-ide-sidebar)',
                  borderColor: 'var(--color-ide-border)',
                  color: 'var(--color-ide-text)',
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-ide-accent/50 transition-all text-left group cursor-pointer"
              >
                <div className="p-2 rounded bg-blue-500/15 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FilePlus size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold">New File</div>
                  <div className="text-[11px] opacity-60">Create a new document or scratchpad</div>
                </div>
              </button>

              <button
                onClick={handleCloneRepo}
                style={{
                  backgroundColor: 'var(--color-ide-sidebar)',
                  borderColor: 'var(--color-ide-border)',
                  color: 'var(--color-ide-text)',
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-ide-accent/50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-green-500/15 text-green-500 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <GitBranch size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold">Clone Git Repository...</div>
                  <div className="text-[11px] opacity-60">Clone a project from GitHub or GitLab</div>
                </div>
              </button>

              <button
                onClick={openSettingsTab}
                style={{
                  backgroundColor: 'var(--color-ide-sidebar)',
                  borderColor: 'var(--color-ide-border)',
                  color: 'var(--color-ide-text)',
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-ide-accent/50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-purple-500/15 text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Settings size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold">Customize Settings & Themes</div>
                  <div className="text-[11px] opacity-60">Configure editor fonts, themes, tab sizes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Workspaces */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider opacity-70">Recent Projects</h2>

            {recentProjects.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-ide-sidebar)',
                  borderColor: 'var(--color-ide-border)',
                }}
                className="p-4 rounded-lg border text-center text-xs opacity-60"
              >
                No recent projects yet. Open a folder to start coding!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {recentProjects.map((path) => {
                  const folderName = path.split(/[/\\]/).pop() || path
                  const isCurrent = currentDir === path
                  return (
                    <div
                      key={path}
                      onClick={() => setCurrentDir(path)}
                      style={{
                        backgroundColor: isCurrent ? 'var(--color-ide-bg)' : 'var(--color-ide-sidebar)',
                        borderColor: isCurrent ? 'var(--color-ide-accent)' : 'var(--color-ide-border)',
                      }}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg border cursor-pointer hover:border-ide-accent/50 transition-all min-w-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 shrink">
                        <FolderOpen className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-ide-accent' : 'text-amber-500'}`} />
                        <span className="text-xs font-semibold truncate">{folderName}</span>
                      </div>
                      <span className="text-[10px] opacity-50 truncate font-mono text-right max-w-[200px] shrink-0">{path}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcut Cheat Sheet */}
        <div
          style={{ borderColor: 'var(--color-ide-border)' }}
          className="space-y-3 pt-4 border-t"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-70">Useful Keyboard Shortcuts</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {[
              { label: 'Quick Open', icon: Search, shortcut: 'Cmd+P' },
              { label: 'Command Palette', icon: Command, shortcut: 'Cmd+Shift+P' },
              { label: 'Settings', icon: Settings, shortcut: 'Cmd+,' },
              { label: 'Split Editor Right', icon: Columns2, shortcut: 'Cmd+\\' },
              { label: 'Toggle Terminal', icon: Terminal, shortcut: 'Cmd+`' },
              { label: 'Zoom In / Out', icon: ZoomIn, shortcut: 'Cmd+= / Cmd+-' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: 'var(--color-ide-sidebar)',
                  borderColor: 'var(--color-ide-border)',
                  color: 'var(--color-ide-text)',
                }}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <item.icon size={13} className="text-ide-accent" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <kbd
                  style={{
                    backgroundColor: 'var(--color-ide-bg)',
                    borderColor: 'var(--color-ide-border)',
                    color: 'var(--color-ide-text)',
                  }}
                  className="px-1.5 py-0.5 rounded border font-mono text-[10px] opacity-80"
                >
                  {formatShortcut(item.shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
