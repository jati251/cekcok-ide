import React, { useState } from 'react'
import { Search, RefreshCw, Send, ArrowUpRight } from 'lucide-react'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import { NodeEndpoint } from '../../types/node'

export const NodeEndpointsView: React.FC = () => {
  const {
    nodeEndpoints,
    isScanningNode,
    refreshNodeEndpoints,
    openFile,
    runTerminalCommand,
  } = useIDEStore()

  const [methodFilter, setMethodFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'POST':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'PUT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'DELETE':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'PATCH':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  const getFrameworkBadge = (framework: string) => {
    switch (framework) {
      case 'nextjs':
        return 'bg-white/10 text-white border-white/20'
      case 'nestjs':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'hono':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'fastify':
        return 'bg-white/10 text-white border-white/20'
      case 'express':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  }

  const handleOpenEndpoint = (endpoint: NodeEndpoint) => {
    const filename = endpoint.filePath.split(/[/\\]/).pop() || 'file.ts'
    openFile({
      name: filename,
      path: endpoint.filePath,
      is_dir: false,
    } as FileNode)

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('editor-reveal-line', {
          detail: { line: endpoint.lineNumber, path: endpoint.filePath },
        })
      )
    }, 100)
  }

  const handleTestEndpoint = (e: React.MouseEvent, endpoint: NodeEndpoint) => {
    e.stopPropagation()
    const method = endpoint.method === 'ALL' ? 'GET' : endpoint.method
    const url = `http://localhost:3000${endpoint.path}`
    runTerminalCommand(`curl -X ${method} ${url}`)
  }

  const filteredEndpoints = nodeEndpoints.filter((ep) => {
    const matchMethod = methodFilter === 'ALL' || ep.method === methodFilter
    const matchQuery =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.handlerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.framework.toLowerCase().includes(searchQuery.toLowerCase())
    return matchMethod && matchQuery
  })

  return (
    <div className="flex flex-col h-full bg-ide-sidebar text-ide-text select-none">
      {/* Sub-header */}
      <div className="flex items-center justify-between border-b border-ide-border bg-[#1d1d1d] px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
          <Send size={12} />
          <span>REST API Routes ({nodeEndpoints.length})</span>
        </div>
        <button
          onClick={() => refreshNodeEndpoints()}
          className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer rounded hover:bg-white/10"
          title="Rescan workspace routes"
        >
          <RefreshCw size={12} className={isScanningNode ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2.5 space-y-2 border-b border-ide-border bg-[#1e1e1e]">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#888888]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter routes (e.g. /api/v1/users)..."
            className="w-full pl-7 pr-3 py-1 rounded bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer ${
                methodFilter === m
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-[#aaaaaa] hover:bg-white/10 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Routes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredEndpoints.length === 0 ? (
          <div className="p-6 text-center text-xs opacity-60 space-y-2">
            <Send size={24} className="mx-auto text-ide-muted opacity-40" />
            <p>No backend routes detected.</p>
            <p className="text-[10px]">
              Supports Express (<code>app.get</code>), NestJS (<code>@Get</code>), Next.js App Router (<code>route.ts</code>), and Hono.
            </p>
          </div>
        ) : (
          filteredEndpoints.map((ep) => (
            <div
              key={ep.id}
              onClick={() => handleOpenEndpoint(ep)}
              className="p-2.5 rounded-lg border border-ide-border bg-[#252525] hover:border-emerald-500/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono shrink-0 ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white truncate">
                    {ep.path}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border font-mono ${getFrameworkBadge(
                      ep.framework
                    )}`}
                  >
                    {ep.framework}
                  </span>
                  <button
                    onClick={(e) => handleTestEndpoint(e, ep)}
                    className="p-1 rounded hover:bg-emerald-500/20 text-[#888888] hover:text-emerald-400 transition-colors"
                    title={`Send test request to http://localhost:3000${ep.path}`}
                  >
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#888888] font-mono">
                <span className="truncate">{ep.handlerName}</span>
                <span className="text-[10px] shrink-0 text-[#666666]">
                  Line {ep.lineNumber}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
