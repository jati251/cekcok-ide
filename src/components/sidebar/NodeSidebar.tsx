import React from 'react'
import { RefreshCw, Package, Play, Plus } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'

export const NodeSidebar: React.FC = () => {
  const { packageJson, refreshPackageJson, runTerminalCommand } = useIDEStore()

  const handleRunNpmScript = (scriptName: string) => {
    runTerminalCommand(`npm run ${scriptName}`)
  }

  const handleInstallNpm = () => {
    runTerminalCommand('npm install')
  }

  const handleAddDependency = () => {
    const pkg = prompt('Enter package name to install (e.g. lodash):')
    if (pkg) {
      runTerminalCommand(`npm install ${pkg}`)
    }
  }

  return (
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
              <span className="font-bold text-white text-xs truncate">
                {packageJson.name || 'node-project'}
              </span>
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
              {packageJson.scripts &&
                Object.entries(packageJson.scripts).map(([name, cmd]) => (
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
              {packageJson.dependencies &&
                Object.entries(packageJson.dependencies).map(([pkg, ver]) => (
                  <div
                    key={pkg}
                    className="flex items-center justify-between text-xs px-2 py-1 hover:bg-white/5 rounded"
                  >
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
              {packageJson.devDependencies &&
                Object.entries(packageJson.devDependencies).map(([pkg, ver]) => (
                  <div
                    key={pkg}
                    className="flex items-center justify-between text-xs px-2 py-1 hover:bg-white/5 rounded"
                  >
                    <span className="truncate text-white/80">{pkg}</span>
                    <span className="text-[10px] font-mono text-ide-muted">{ver}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
