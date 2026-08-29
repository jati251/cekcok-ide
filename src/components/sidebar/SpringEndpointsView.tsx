import React, { useState } from 'react'
import {
  Search,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Send,
  Database,
  Cog,
  FileCode,
} from 'lucide-react'
import { useIDEStore, FileNode } from '../../store/useIDEStore'
import { SpringEndpoint, SpringBean } from '../../types/java'

export const SpringEndpointsView: React.FC = () => {
  const {
    springEndpoints,
    springBeans,
    isScanningSpring,
    refreshSpringEndpoints,
    openFile,
    runTerminalCommand,
  } = useIDEStore()

  const [methodFilter, setMethodFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'endpoints' | 'beans'>('endpoints')

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

  const handleOpenEndpoint = (endpoint: SpringEndpoint) => {
    const filename = endpoint.filePath.split(/[/\\]/).pop() || 'File.java'
    openFile({
      name: filename,
      path: endpoint.filePath,
      is_dir: false,
    } as FileNode)

    // Trigger editor scroll to line event
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('editor-reveal-line', {
          detail: { line: endpoint.lineNumber, path: endpoint.filePath },
        })
      )
    }, 100)
  }

  const handleOpenBean = (bean: SpringBean) => {
    const filename = bean.filePath.split(/[/\\]/).pop() || 'File.java'
    openFile({
      name: filename,
      path: bean.filePath,
      is_dir: false,
    } as FileNode)
  }

  const handleTestEndpoint = (e: React.MouseEvent, endpoint: SpringEndpoint) => {
    e.stopPropagation()
    const method = endpoint.method === 'REQUEST' ? 'GET' : endpoint.method
    const url = `http://localhost:8080${endpoint.path}`
    runTerminalCommand(`curl -X ${method} ${url}`)
  }

  const filteredEndpoints = springEndpoints.filter((ep) => {
    const matchMethod = methodFilter === 'ALL' || ep.method === methodFilter
    const matchQuery =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.controllerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.methodName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchMethod && matchQuery
  })

  const filteredBeans = springBeans.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-ide-sidebar text-ide-text select-none">
      {/* Sub-Header Tabs */}
      <div className="flex border-b border-ide-border bg-[#1d1d1d] px-3">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`flex items-center gap-1.5 py-2 px-3 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'endpoints'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <Send size={12} />
          <span>REST Endpoints ({springEndpoints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('beans')}
          className={`flex items-center gap-1.5 py-2 px-3 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'beans'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <Layers size={12} />
          <span>Spring Beans ({springBeans.length})</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => refreshSpringEndpoints()}
          className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer self-center rounded hover:bg-white/10"
          title="Rescan Spring Annotations"
        >
          <RefreshCw size={12} className={isScanningSpring ? 'animate-spin' : ''} />
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
            placeholder={
              activeTab === 'endpoints'
                ? 'Filter by route (e.g. /api/v1/users)...'
                : 'Filter beans (e.g. UserService)...'
            }
            className="w-full pl-7 pr-3 py-1 rounded bg-[#282828] border border-ide-border text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>

        {activeTab === 'endpoints' && (
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
        )}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {activeTab === 'endpoints' ? (
          filteredEndpoints.length === 0 ? (
            <div className="p-6 text-center text-xs opacity-60 space-y-2">
              <Send size={24} className="mx-auto text-ide-muted opacity-40" />
              <p>No Spring REST endpoints found in workspace.</p>
              <p className="text-[10px]">
                Create a controller with <code>@RestController</code> and <code>@GetMapping</code> to see live endpoints here.
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

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleTestEndpoint(e, ep)}
                      className="p-1 rounded hover:bg-emerald-500/20 text-[#888888] hover:text-emerald-400 transition-colors"
                      title={`Send curl ${ep.method} request to http://localhost:8080${ep.path}`}
                    >
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#888888] font-mono">
                  <span className="truncate">
                    {ep.controllerName}.{ep.methodName}
                  </span>
                  <span className="text-[10px] shrink-0 text-[#666666]">
                    Line {ep.lineNumber}
                  </span>
                </div>
              </div>
            ))
          )
        ) : filteredBeans.length === 0 ? (
          <div className="p-6 text-center text-xs opacity-60 space-y-2">
            <Layers size={24} className="mx-auto text-ide-muted opacity-40" />
            <p>No Spring Beans found in workspace.</p>
          </div>
        ) : (
          filteredBeans.map((bean) => {
            const Icon =
              bean.type === 'repository'
                ? Database
                : bean.type === 'config'
                ? Cog
                : FileCode

            return (
              <div
                key={bean.id}
                onClick={() => handleOpenBean(bean)}
                className="p-2.5 rounded-lg border border-ide-border bg-[#252525] hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-white truncate font-mono">
                    {bean.name}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-[#888888] border border-white/10 shrink-0">
                  {bean.type}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
