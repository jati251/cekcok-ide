import React from 'react'
import { RefreshCw, Play, Terminal, Layers } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'

export const NodeSidebar: React.FC = () => {
  const { projectInfo, refreshPackageJson, runTerminalCommand } = useIDEStore()

  const handleRunScript = (command: string) => {
    runTerminalCommand(command)
  }

  const getBadgeColor = (kind: string) => {
    switch (kind) {
      case 'rust':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'golang':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'java':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'python':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'node':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      default:
        return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  return (
    <div className="flex flex-col h-full bg-ide-sidebar text-ide-text">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
        <span>Project & Build Suite</span>
        <button
          onClick={refreshPackageJson}
          className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          title="Reload Project Manifests"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {!projectInfo || projectInfo.kind === 'generic' ? (
        <div className="p-4 text-center text-xs text-[#888] space-y-3">
          <Layers size={28} className="mx-auto text-ide-muted opacity-50" />
          <p>No project manifest found (package.json, Cargo.toml, go.mod, pom.xml, build.gradle, or pyproject.toml).</p>
          <div className="flex flex-col gap-1.5 pt-2">
            <button
              onClick={() => runTerminalCommand('npm init -y')}
              className="bg-white/5 hover:bg-white/10 text-white px-2.5 py-1.5 rounded text-[11px] cursor-pointer text-left border border-white/10 transition-colors"
            >
              + Initialize Node.js (`npm init -y`)
            </button>
            <button
              onClick={() => runTerminalCommand('cargo init')}
              className="bg-white/5 hover:bg-white/10 text-white px-2.5 py-1.5 rounded text-[11px] cursor-pointer text-left border border-white/10 transition-colors"
            >
              + Initialize Rust (`cargo init`)
            </button>
            <button
              onClick={() => runTerminalCommand('go mod init myapp')}
              className="bg-white/5 hover:bg-white/10 text-white px-2.5 py-1.5 rounded text-[11px] cursor-pointer text-left border border-white/10 transition-colors"
            >
              + Initialize Go (`go mod init myapp`)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Project Info Header */}
          <div className="bg-[#252526] p-3 rounded-lg border border-ide-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs truncate">{projectInfo.title}</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(
                  projectInfo.kind
                )}`}
              >
                {projectInfo.kind.toUpperCase()}
              </span>
            </div>
            {projectInfo.version && (
              <div className="text-[11px] font-mono text-ide-muted">{projectInfo.version}</div>
            )}
            {projectInfo.description && (
              <p className="text-[11px] text-[#888] line-clamp-2">{projectInfo.description}</p>
            )}
          </div>

          {/* Quick Execution & Build Tasks */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-2">
              <span>Run & Build Tasks</span>
              <Terminal size={12} className="text-ide-muted" />
            </div>

            <div className="space-y-1.5">
              {projectInfo.scripts.length === 0 ? (
                <div className="text-xs text-ide-muted italic py-2">No predefined scripts found.</div>
              ) : (
                projectInfo.scripts.map((script) => (
                  <div
                    key={script.name}
                    className="flex items-center justify-between bg-[#252526] hover:bg-[#2d2d2d] border border-ide-border hover:border-ide-accent/50 px-2.5 py-2 rounded cursor-pointer group transition-colors"
                    onClick={() => handleRunScript(script.command)}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-mono text-xs text-white font-medium truncate">
                        {script.name}
                      </span>
                      <span className="text-[10px] text-[#888] font-mono truncate">{script.command}</span>
                    </div>
                    <button
                      className="bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white p-1.5 rounded transition-colors cursor-pointer shrink-0"
                      title={`Run: ${script.command}`}
                    >
                      <Play size={11} fill="currentColor" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
