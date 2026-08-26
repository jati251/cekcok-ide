import React, { useRef, useEffect } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'
import { useIDEStore, OutputChannel } from '../../store/useIDEStore'

const CHANNELS: OutputChannel[] = ['System', 'Git', 'Build']

export const OutputView: React.FC = () => {
  const { outputLogs, activeOutputChannel, setActiveOutputChannel, clearOutputLogs } =
    useIDEStore()

  const logs = outputLogs[activeOutputChannel] || []
  const logsCount = logs.length
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logsCount])

  return (
    <div className="h-full flex flex-col bg-[#181818] text-[#cccccc] font-sans select-none overflow-hidden">
      {/* Output Header Controls */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1f1f1f] border-b border-ide-border text-xs">
        <div className="flex items-center gap-2">
          <span className="text-ide-muted text-[11px]">Channel:</span>
          <div className="relative">
            <select
              value={activeOutputChannel}
              onChange={(e) => setActiveOutputChannel(e.target.value as OutputChannel)}
              className="bg-[#2a2a2a] text-white text-xs px-2.5 py-0.5 rounded border border-ide-border outline-none appearance-none pr-6 cursor-pointer hover:border-ide-accent"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ide-muted pointer-events-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => clearOutputLogs(activeOutputChannel)}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear Output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Output Console Stream */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-[#ddd] space-y-0.5 bg-[#181818]">
        {logs.length === 0 ? (
          <div className="text-ide-muted italic text-[11px]">No output in this channel.</div>
        ) : (
          logs.map((line, idx) => (
            <div key={idx} className="leading-relaxed hover:bg-white/5 px-1 rounded">
              <span className="text-[#666] select-none mr-2">{idx + 1}</span>
              <span>{line}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
