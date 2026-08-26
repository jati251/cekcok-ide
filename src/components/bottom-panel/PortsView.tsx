import React, { useState } from 'react'
import { Globe, ExternalLink, Plus, Trash2, Radio } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'

export const PortsView: React.FC = () => {
  const { ports, addPort, removePort } = useIDEStore()
  const [newPortNumber, setNewPortNumber] = useState('')
  const [newProcessName, setNewProcessName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pNum = parseInt(newPortNumber, 10)
    if (!pNum || isNaN(pNum)) return

    addPort({
      port: pNum,
      process: newProcessName.trim() || `Custom Port :${pNum}`,
      url: `http://localhost:${pNum}`,
      isAuto: false,
    })

    setNewPortNumber('')
    setNewProcessName('')
    setIsAdding(false)
  }

  const handleOpenBrowser = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="h-full flex flex-col bg-[#181818] text-[#cccccc] font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1f1f1f] border-b border-ide-border text-xs">
        <div className="flex items-center gap-1.5 text-ide-muted text-[11px]">
          <Globe size={13} className="text-cyan-400" />
          <span>Forwarded Ports & Local Services ({ports.length})</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-ide-accent/20 text-ide-accent hover:bg-ide-accent hover:text-white transition-colors cursor-pointer text-xs font-medium"
        >
          <Plus size={12} />
          <span>Forward a Port</span>
        </button>
      </div>

      {/* Inline Add Port Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-ide-border text-xs"
        >
          <input
            type="number"
            placeholder="Port (e.g. 8080)"
            value={newPortNumber}
            onChange={(e) => setNewPortNumber(e.target.value)}
            className="w-32 bg-[#1e1e1e] border border-ide-border text-white px-2 py-1 rounded outline-none text-xs focus:border-ide-accent"
            autoFocus
          />
          <input
            type="text"
            placeholder="Service label (e.g. API Server)"
            value={newProcessName}
            onChange={(e) => setNewProcessName(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-ide-border text-white px-2 py-1 rounded outline-none text-xs focus:border-ide-accent"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-ide-accent text-white rounded font-medium hover:bg-ide-accent-hover transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2 py-1 text-ide-muted hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Ports Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-ide-border text-ide-muted text-[11px] uppercase bg-[#1a1a1a]">
              <th className="py-1.5 px-4 font-semibold">Port</th>
              <th className="py-1.5 px-4 font-semibold">Process / Name</th>
              <th className="py-1.5 px-4 font-semibold">Local Address</th>
              <th className="py-1.5 px-4 font-semibold">Status</th>
              <th className="py-1.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ports.map((item) => (
              <tr
                key={item.port}
                className="border-b border-ide-border/50 hover:bg-white/5 transition-colors group"
              >
                <td className="py-2 px-4 font-mono font-semibold text-white">{item.port}</td>
                <td className="py-2 px-4 text-[#ddd]">{item.process}</td>
                <td className="py-2 px-4 font-mono text-ide-accent underline decoration-ide-accent/40 hover:decoration-ide-accent cursor-pointer"
                  onClick={() => handleOpenBrowser(item.url)}
                >
                  {item.url}
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-1.5 text-green-400 text-[11px]">
                    <Radio size={10} className="animate-pulse" />
                    <span>Listening</span>
                  </div>
                </td>
                <td className="py-2 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenBrowser(item.url)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-[11px]"
                      title="Open in Browser"
                    >
                      <ExternalLink size={11} />
                      <span>Open</span>
                    </button>
                    {!item.isAuto && (
                      <button
                        onClick={() => removePort(item.port)}
                        className="p-1 rounded text-ide-muted hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Remove Port"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
