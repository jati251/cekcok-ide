import { GitBranch, PanelLeft, Terminal, Command, PackageCheck, RefreshCw } from 'lucide-react'
import { useIDEStore, SidebarTab } from '../store/useIDEStore'

export const StatusBar = () => {
  const { 
    activeFile, 
    toggleSidebar, 
    toggleTerminal, 
    gitStatus, 
    setActiveSidebarTab,
    packageJson,
    setCommandPaletteOpen,
    refreshGitStatus,
    isGitLoading
  } = useIDEStore()

  const getLanguage = () => {
    if (!activeFile) return 'PLAINTEXT'
    const ext = activeFile.name.split('.').pop()?.toLowerCase() || ''
    switch (ext) {
      case 'ts': case 'tsx': return 'TypeScript'
      case 'js': case 'jsx': return 'JavaScript'
      case 'json': return 'JSON'
      case 'rs': return 'Rust'
      case 'md': return 'Markdown'
      case 'css': return 'CSS'
      case 'html': return 'HTML'
      default: return ext.toUpperCase()
    }
  }

  return (
    <footer className="h-[26px] bg-ide-accent text-white flex items-center justify-between px-3 text-[11px] select-none z-30 font-sans">
      <div className="flex items-center gap-2">
        {/* Toggle UI Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleSidebar} 
            className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer" 
            title="Toggle Primary Sidebar"
          >
            <PanelLeft size={13} />
          </button>
          <button 
            onClick={toggleTerminal} 
            className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer" 
            title="Toggle Terminal Panel"
          >
            <Terminal size={13} />
          </button>
        </div>

        {/* Git Branch & Sync */}
        {gitStatus.is_repo && (
          <div 
            onClick={() => setActiveSidebarTab('git' as SidebarTab)}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title={`Git branch: ${gitStatus.branch} (${gitStatus.ahead} ahead, ${gitStatus.behind} behind)`}
          >
            <GitBranch size={13} />
            <span className="font-mono">{gitStatus.branch}</span>
            {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
              <span className="text-[10px] opacity-90">
                ↑{gitStatus.ahead} ↓{gitStatus.behind}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                refreshGitStatus()
              }}
              className="hover:bg-white/30 p-0.5 rounded ml-0.5 cursor-pointer"
              title="Sync Git"
            >
              <RefreshCw size={10} className={isGitLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        {/* Node.js Project Indicator */}
        {packageJson && (
          <div 
            onClick={() => setActiveSidebarTab('node' as SidebarTab)}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title={`Node.js: ${packageJson.name || 'Project'} (v${packageJson.version || '1.0.0'})`}
          >
            <PackageCheck size={12} />
            <span>{packageJson.name || 'node-app'}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {activeFile && (
          <>
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              Ln 1, Col 1
            </div>
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              UTF-8
            </div>
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              {getLanguage()}
            </div>
          </>
        )}
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer flex items-center gap-1"
          title="Command Palette (Cmd+P / Cmd+Shift+P)"
        >
          <Command size={12} />
        </button>
      </div>
    </footer>
  )
}
