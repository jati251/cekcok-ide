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
      <div
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
          color: 'var(--color-ide-muted)',
        }}
        className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b"
      >
        <span>Project &amp; Build Suite</span>
        <button
          onClick={refreshPackageJson}
          className="opacity-70 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Reload Project Manifests"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {!projectInfo || projectInfo.kind === 'generic' ? (
        <div className="p-4 text-center text-xs opacity-60 space-y-3">
          <Layers size={28} className="mx-auto text-ide-muted opacity-50" />
          <p>No project manifest found (package.json, Cargo.toml, go.mod, pom.xml, build.gradle, or pyproject.toml).</p>
          <div className="flex flex-col gap-1.5 pt-2">
            <button
              onClick={() => runTerminalCommand('npm init -y')}
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
                color: 'var(--color-ide-text)',
              }}
              className="px-2.5 py-1.5 rounded text-[11px] cursor-pointer text-left border transition-colors hover:border-ide-accent"
            >
              + Initialize Node.js (`npm init -y`)
            </button>
            <button
              onClick={() => runTerminalCommand('cargo init')}
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
                color: 'var(--color-ide-text)',
              }}
              className="px-2.5 py-1.5 rounded text-[11px] cursor-pointer text-left border transition-colors hover:border-ide-accent"
            >
              + Initialize Rust (`cargo init`)
            </button>
            <button
              onClick={() => runTerminalCommand('go mod init myapp')}
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
                color: 'var(--color-ide-text)',
              }}
              className="px-2.5 py-1.5 rounded text-[11px] cursor-pointer text-left border transition-colors hover:border-ide-accent"
            >
              + Initialize Go (`go mod init myapp`)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Project Info Header */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-bg)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="p-3 rounded-lg border space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs truncate">{projectInfo.title}</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(
                  projectInfo.kind
                )}`}
              >
                {projectInfo.kind.toUpperCase()}
              </span>
            </div>
            {projectInfo.version && (
              <div className="text-[11px] font-mono opacity-60">{projectInfo.version}</div>
            )}
            {projectInfo.description && (
              <p className="text-[11px] opacity-60 line-clamp-2">{projectInfo.description}</p>
            )}
          </div>

          {/* Quick Execution & Build Tasks */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold opacity-70 uppercase tracking-wider mb-2">
              <span>Run &amp; Build Tasks</span>
              <Terminal size={12} className="opacity-60" />
            </div>

            <div className="space-y-1.5">
              {projectInfo.scripts.length === 0 ? (
                <div className="text-xs opacity-60 italic py-2">No predefined scripts found.</div>
              ) : (
                projectInfo.scripts.map((script) => (
                  <div
                    key={script.name}
                    onClick={() => handleRunScript(script.command)}
                    style={{
                      backgroundColor: 'var(--color-ide-bg)',
                      borderColor: 'var(--color-ide-border)',
                      color: 'var(--color-ide-text)',
                    }}
                    className="flex items-center justify-between border hover:border-ide-accent px-2.5 py-2 rounded cursor-pointer group transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-mono text-xs font-medium truncate">
                        {script.name}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono truncate">{script.command}</span>
                    </div>
                    <button
                      className="bg-emerald-600/20 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white p-1.5 rounded transition-colors cursor-pointer shrink-0"
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
