import React, { useState, useRef, useEffect } from 'react'
import { Trash2, Terminal as TerminalIcon, ChevronRight } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'

export const DebugConsoleView: React.FC = () => {
  const { debugLogs, addDebugLog, clearDebugLogs } = useIDEStore()
  const [inputVal, setInputVal] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [debugLogs])

  const handleEvaluate = () => {
    const trimmed = inputVal.trim()
    if (!trimmed) return

    addDebugLog('input', trimmed)
    setHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)
    setInputVal('')

    try {
      // Evaluate expression
      const result = Function(`"use strict"; return (${trimmed})`)()
      const formatted =
        typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
      addDebugLog('output', formatted)
    } catch (err) {
      addDebugLog('error', String(err))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEvaluate()
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(nextIdx)
        setInputVal(history[nextIdx])
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx)
          setInputVal(history[nextIdx])
        } else {
          setHistoryIndex(-1)
          setInputVal('')
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#181818] text-[#cccccc] font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1f1f1f] border-b border-ide-border text-xs">
        <div className="flex items-center gap-1.5 text-ide-muted text-[11px]">
          <TerminalIcon size={13} className="text-orange-400" />
          <span>Interactive JavaScript / Node REPL Console</span>
        </div>
        <button
          onClick={clearDebugLogs}
          className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Clear Console"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-[#181818]">
        {debugLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 leading-relaxed">
            {log.type === 'input' ? (
              <span className="text-ide-accent font-bold select-none">{'>'}</span>
            ) : log.type === 'error' ? (
              <span className="text-red-400 font-bold select-none">✕</span>
            ) : (
              <span className="text-green-400 select-none">◀</span>
            )}
            <span
              className={`flex-1 whitespace-pre-wrap ${
                log.type === 'input'
                  ? 'text-white'
                  : log.type === 'error'
                  ? 'text-red-400'
                  : 'text-[#aaa]'
              }`}
            >
              {log.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Prompt */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] border-t border-ide-border">
        <ChevronRight size={14} className="text-ide-accent shrink-0" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Evaluate JavaScript expression or inspect global variables..."
          className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder:text-ide-muted"
        />
      </div>
    </div>
  )
}
