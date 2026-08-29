import React, { useState } from 'react'
import {
  RefreshCw,
  Play,
  Terminal,
  Layers,
  Coffee,
  Send,
  Package,
  Plus,
  Search,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { SpringEndpointsView } from './SpringEndpointsView'
import { NodeEndpointsView } from './NodeEndpointsView'
import { PackageManager } from '../../types/node'
import { formatUninstallCommand } from '../../utils/nodeParser'

export const NodeSidebar: React.FC = () => {
  const {
    projectInfo,
    javaDetails,
    nodeDetails,
    packageManager,
    setPackageManager,
    refreshPackageJson,
    runTerminalCommand,
    springEndpoints,
    nodeEndpoints,
  } = useIDEStore()

  const [activeTab, setActiveTab] = useState<'tasks' | 'endpoints' | 'dependencies'>('tasks')
  const [depFilter, setDepFilter] = useState('')

  const handleRunScript = (command: string) => {
    runTerminalCommand(command)
  }

  const handleUninstall = (pkgName: string) => {
    const cmd = formatUninstallCommand(packageManager, pkgName)
    runTerminalCommand(cmd)
  }

  const getBadgeColor = (kind: string) => {
    switch (kind) {
      case 'rust':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'golang':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'java':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'python':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'node':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      default:
        return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  const isJava = projectInfo?.kind === 'java' || !!javaDetails
  const isNode = projectInfo?.kind === 'node' || !!nodeDetails

  const filteredJavaDeps = (javaDetails?.dependencies || []).filter(
    (d) =>
      d.artifactId.toLowerCase().includes(depFilter.toLowerCase()) ||
      d.groupId.toLowerCase().includes(depFilter.toLowerCase())
  )

  const filteredNodeDeps = (nodeDetails?.dependencies || []).filter((d) =>
    d.name.toLowerCase().includes(depFilter.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-ide-sidebar text-ide-text select-none">
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
          color: 'var(--color-ide-muted)',
        }}
        className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b shrink-0"
      >
        <div className="flex items-center gap-1.5">
          {isJava ? (
            <Coffee size={14} className="text-emerald-400" />
          ) : isNode ? (
            <Layers size={14} className="text-emerald-400" />
          ) : null}
          <span>
            {isJava && javaDetails?.isSpringBoot
              ? 'Spring Boot Suite'
              : isNode
              ? 'Node.js & TS Suite'
              : 'Project & Build Suite'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isNode ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-install-package'))}
              className="opacity-70 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-emerald-400"
              title="Install NPM Package"
            >
              <Plus size={13} />
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-spring-initializr'))}
              className="opacity-70 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-emerald-400"
              title="Create New Spring Boot Project"
            >
              <Plus size={13} />
            </button>
          )}
          <button
            onClick={refreshPackageJson}
            className="opacity-70 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Reload Project Manifests & Dependencies"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Tabs if Java / Spring Boot */}
      {isJava && (
        <div className="flex border-b border-ide-border bg-[#1d1d1d] px-2 shrink-0">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Play size={11} />
            <span>Tasks</span>
          </button>
          {javaDetails?.isSpringBoot && (
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`flex items-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'endpoints'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              <Send size={11} />
              <span>Endpoints</span>
              {springEndpoints.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  {springEndpoints.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`flex items-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'dependencies'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Package size={11} />
            <span>Deps ({javaDetails?.dependencies.length || 0})</span>
          </button>
        </div>
      )}

      {/* Tabs if Node.js */}
      {isNode && (
        <div className="flex border-b border-ide-border bg-[#1d1d1d] px-2 shrink-0">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Play size={11} />
            <span>Scripts</span>
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'endpoints'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Send size={11} />
            <span>Routes</span>
            {nodeEndpoints.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                {nodeEndpoints.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`flex items-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'dependencies'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Package size={11} />
            <span>Deps ({nodeDetails?.dependencies.length || 0})</span>
          </button>
        </div>
      )}

      {/* Views */}
      {isJava && activeTab === 'endpoints' ? (
        <SpringEndpointsView />
      ) : isNode && activeTab === 'endpoints' ? (
        <NodeEndpointsView />
      ) : (isJava || isNode) && activeTab === 'dependencies' ? (
        /* Sub-view: Dependencies Inspector */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#888888]"
              />
              <input
                type="text"
                value={depFilter}
                onChange={(e) => setDepFilter(e.target.value)}
                placeholder="Filter dependencies..."
                className="w-full pl-7 pr-3 py-1 rounded bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            {isNode && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-install-package'))}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title="Install New Package"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {isJava ? (
              filteredJavaDeps.length === 0 ? (
                <div className="p-4 text-center text-xs opacity-60">No matching dependencies</div>
              ) : (
                filteredJavaDeps.map((dep, idx) => (
                  <div
                    key={`${dep.groupId}-${dep.artifactId}-${idx}`}
                    className="p-2.5 rounded-lg border border-ide-border bg-[#252525] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-white truncate">
                        {dep.artifactId}
                      </span>
                      {dep.scope && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 text-[#888888] font-mono border border-white/10">
                          {dep.scope}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#888888] truncate">
                      {dep.groupId}
                    </div>
                    {dep.version && (
                      <div className="text-[10px] font-mono text-emerald-400">
                        v{dep.version}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : filteredNodeDeps.length === 0 ? (
              <div className="p-4 text-center text-xs opacity-60">No matching packages</div>
            ) : (
              filteredNodeDeps.map((dep) => (
                <div
                  key={dep.name}
                  className="p-2.5 rounded-lg border border-ide-border bg-[#252525] hover:border-[#555] transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white truncate">
                      {dep.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border font-mono ${
                        dep.isDev
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {dep.isDev ? 'DEV' : 'PROD'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
                    <span>{dep.version}</span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`https://www.npmjs.com/package/${dep.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-emerald-400 p-0.5"
                        title="View on npmjs.org"
                      >
                        <ExternalLink size={11} />
                      </a>
                      <button
                        onClick={() => handleUninstall(dep.name)}
                        className="hover:text-red-400 p-0.5 cursor-pointer"
                        title={`Uninstall ${dep.name}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : !projectInfo || projectInfo.kind === 'generic' ? (
        <div className="p-4 text-center text-xs opacity-60 space-y-3">
          <Layers size={28} className="mx-auto text-ide-muted opacity-50" />
          <p>No project manifest found in current workspace.</p>
          <div className="flex flex-col gap-1.5 pt-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-node-initializr'))}
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
                color: 'var(--color-ide-text)',
              }}
              className="px-2.5 py-2 rounded text-[11px] cursor-pointer text-left border transition-colors hover:border-emerald-500 flex items-center gap-2 font-medium"
            >
              <Layers size={14} className="text-emerald-400" />
              <span>+ New Node.js / React / Next.js Project</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-spring-initializr'))}
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
                color: 'var(--color-ide-text)',
              }}
              className="px-2.5 py-2 rounded text-[11px] cursor-pointer text-left border transition-colors hover:border-emerald-500 flex items-center gap-2 font-medium"
            >
              <Coffee size={14} className="text-emerald-400" />
              <span>+ New Spring Boot Project (Spring Initializr)</span>
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
            className="p-3 rounded-lg border space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs truncate">{projectInfo.title}</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(
                  projectInfo.kind
                )}`}
              >
                {projectInfo.kind === 'java' && javaDetails?.isSpringBoot
                  ? 'SPRING BOOT'
                  : projectInfo.kind.toUpperCase()}
              </span>
            </div>

            {projectInfo.version && (
              <div className="text-[11px] font-mono opacity-60">v{projectInfo.version}</div>
            )}

            {/* Framework tags if Node */}
            {isNode && nodeDetails && nodeDetails.frameworks.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {nodeDetails.frameworks.map((fw) => (
                  <span
                    key={fw}
                    className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            )}

            {/* Package Manager Selector if Node */}
            {isNode && (
              <div className="flex items-center justify-between pt-1.5 border-t border-ide-border/50 text-[11px]">
                <span className="text-[#888888]">Package Manager:</span>
                <select
                  value={packageManager}
                  onChange={(e) => setPackageManager(e.target.value as PackageManager)}
                  className="bg-[#282828] border border-ide-border text-white text-[10px] font-bold uppercase rounded px-1.5 py-0.5 outline-none cursor-pointer"
                >
                  <option value="npm">NPM</option>
                  <option value="pnpm">PNPM</option>
                  <option value="yarn">YARN</option>
                  <option value="bun">BUN</option>
                </select>
              </div>
            )}

            {javaDetails?.javaVersion && (
              <div className="text-[10px] font-mono text-emerald-400 pt-1">
                Java {javaDetails.javaVersion} &bull; {javaDetails.buildTool.toUpperCase()}
              </div>
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
                    className="flex items-center justify-between border hover:border-emerald-500 px-2.5 py-2 rounded cursor-pointer group transition-colors"
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
