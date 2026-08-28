import React, { useEffect, useRef, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { Plus, Trash2, RotateCcw, Play, TerminalSquare, X } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

interface TerminalOutputPayload {
  session_id: string
  data: string
}

interface TerminalExitPayload {
  session_id: string
  code: number | null
}

interface SingleTerminalProps {
  id: string
  isActive: boolean
  currentDir: string
  theme: string
  onExecuteRef?: React.MutableRefObject<((cmd: string) => void) | null>
  onClearRef?: React.MutableRefObject<(() => void) | null>
}

const SingleTerminal: React.FC<SingleTerminalProps> = ({
  id,
  isActive,
  currentDir,
  theme,
  onExecuteRef,
  onClearRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const unlistenRef = useRef<{ out: UnlistenFn | null; ex: UnlistenFn | null }>({ out: null, ex: null })
  const currentDirRef = useRef(currentDir)
  const historyRef = useRef<string[]>([])

  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  const isLight = theme === 'vs-light'

  const executeCommand = useCallback(
    async (cmd: string) => {
      if (!termInstance.current) return
      const term = termInstance.current
      term.writeln(`\r\n\x1b[32mcekcok-ide\x1b[0m $ ${cmd}`)

      const trimmed = cmd.trim()
      if (trimmed && historyRef.current[historyRef.current.length - 1] !== trimmed) {
        historyRef.current.push(trimmed)
      }

      try {
        await invoke('spawn_shell', {
          cmd,
          cwd: currentDirRef.current,
          sessionId: id,
          session_id: id,
        })
      } catch (err: unknown) {
        const errMsg = typeof err === 'string' ? err : String(err)
        term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m\r\n`)
        term.write('\r\n\x1b[32mcekcok-ide\x1b[0m $ ')
      }
      useIDEStore.getState().refreshGitStatus()
    },
    [id]
  )

  useEffect(() => {
    if (isActive) {
      if (onExecuteRef) {
        onExecuteRef.current = executeCommand
      }
      if (onClearRef) {
        onClearRef.current = () => {
          termInstance.current?.clear()
          termInstance.current?.write('\x1b[32mcekcok-ide\x1b[0m $ ')
        }
      }
    }
  }, [isActive, executeCommand, onExecuteRef, onClearRef])

  // Initialize Xterm for this specific session
  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      theme: {
        background: isLight ? '#ffffff' : '#181818',
        foreground: isLight ? '#333333' : '#cccccc',
        cursor: isLight ? '#007acc' : '#ffffff',
        selectionBackground: isLight ? '#add6ff' : '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
      },
      fontFamily: "'Consolas', 'Menlo', 'Courier New', monospace",
      fontSize: 13,
      cursorBlink: true,
      scrollback: 5000,
      convertEol: true,
    })
    const fit = new FitAddon()
    term.loadAddon(fit)

    term.open(containerRef.current)
    fit.fit()

    termInstance.current = term
    fitAddon.current = fit

    const PROMPT = '\x1b[32mcekcok-ide\x1b[0m $ '

    let currentLine = ''
    let cursorPos = 0
    let historyIndex = -1
    let savedCurrentLine = ''

    const prompt = () => {
      currentLine = ''
      cursorPos = 0
      historyIndex = -1
      savedCurrentLine = ''
      term.write(`\r\n${PROMPT}`)
    }

    const refreshLine = (newLine: string, newPos?: number) => {
      currentLine = newLine
      cursorPos = newPos !== undefined ? Math.max(0, Math.min(newPos, newLine.length)) : newLine.length
      term.write(`\r\x1b[K${PROMPT}${newLine}`)
      if (cursorPos < currentLine.length) {
        const moveBack = currentLine.length - cursorPos
        term.write(`\x1b[${moveBack}D`)
      }
    }

    term.writeln('\x1b[1;36mCekcok Native Terminal Session\x1b[0m')
    term.writeln('\x1b[90mType bash/node commands or run npm scripts.\x1b[0m')
    term.write(`\r\n${PROMPT}`)

    const dataDisposable = term.onData(async (data) => {
      // Enter
      if (data === '\r') {
        const cmdToRun = currentLine.trim()
        currentLine = ''
        cursorPos = 0
        historyIndex = -1
        savedCurrentLine = ''

        if (!cmdToRun) {
          prompt()
          return
        }

        // Add to history
        if (historyRef.current[historyRef.current.length - 1] !== cmdToRun) {
          historyRef.current.push(cmdToRun)
        }

        if (cmdToRun === 'clear') {
          term.clear()
          prompt()
          return
        }

        if (cmdToRun.startsWith('cd ')) {
          const targetDir = cmdToRun.slice(3).trim()
          try {
            const newPath = await invoke<string>('change_dir', {
              current: currentDirRef.current,
              target: targetDir,
            })
            currentDirRef.current = newPath
            useIDEStore.getState().setCurrentDir(newPath)
            term.writeln(`\r\n\x1b[90mChanged directory to ${newPath}\x1b[0m`)
          } catch (err: unknown) {
            const msg = typeof err === 'string' ? err : String(err)
            term.writeln(`\r\n\x1b[31mcd: ${msg}\x1b[0m`)
          }
          prompt()
          return
        }

        term.writeln('')
        try {
          await invoke('spawn_shell', {
            cmd: cmdToRun,
            cwd: currentDirRef.current,
            sessionId: id,
            session_id: id,
          })
        } catch (err: unknown) {
          const errMsg = typeof err === 'string' ? err : String(err)
          term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m\r\n`)
          prompt()
        }
        useIDEStore.getState().refreshGitStatus()
      }
      // Arrow Up (History Previous)
      else if (data === '\x1b[A' || data === '\x1bOA') {
        const history = historyRef.current
        if (history.length === 0) return

        if (historyIndex === -1) {
          savedCurrentLine = currentLine
          historyIndex = history.length - 1
        } else if (historyIndex > 0) {
          historyIndex--
        }

        refreshLine(history[historyIndex])
      }
      // Arrow Down (History Next)
      else if (data === '\x1b[B' || data === '\x1bOB') {
        const history = historyRef.current
        if (historyIndex === -1) return

        if (historyIndex < history.length - 1) {
          historyIndex++
          refreshLine(history[historyIndex])
        } else {
          historyIndex = -1
          refreshLine(savedCurrentLine)
        }
      }
      // Arrow Left
      else if (data === '\x1b[D') {
        if (cursorPos > 0) {
          cursorPos--
          term.write('\x1b[D')
        }
      }
      // Arrow Right
      else if (data === '\x1b[C') {
        if (cursorPos < currentLine.length) {
          cursorPos++
          term.write('\x1b[C')
        }
      }
      // Home / Ctrl+A
      else if (data === '\x1b[H' || data === '\x1b[1~' || data === '\x01') {
        refreshLine(currentLine, 0)
      }
      // End / Ctrl+E
      else if (data === '\x1b[F' || data === '\x1b[4~' || data === '\x05') {
        refreshLine(currentLine, currentLine.length)
      }
      // Backspace
      else if (data === '\x7f' || data === '\b') {
        if (cursorPos > 0) {
          const before = currentLine.slice(0, cursorPos - 1)
          const after = currentLine.slice(cursorPos)
          refreshLine(before + after, cursorPos - 1)
        }
      }
      // Delete key
      else if (data === '\x1b[3~') {
        if (cursorPos < currentLine.length) {
          const before = currentLine.slice(0, cursorPos)
          const after = currentLine.slice(cursorPos + 1)
          refreshLine(before + after, cursorPos)
        }
      }
      // Ctrl+C (Interrupt)
      else if (data === '\x03') {
        currentLine = ''
        cursorPos = 0
        historyIndex = -1
        savedCurrentLine = ''
        term.write('^C')
        try {
          invoke('kill_shell', { sessionId: id, session_id: id })
        } catch {
          // ignore
        }
        prompt()
      }
      // Ctrl+L (Clear screen but keep current buffer)
      else if (data === '\x0c') {
        term.clear()
        term.write(`\r\x1b[K${PROMPT}${currentLine}`)
        if (cursorPos < currentLine.length) {
          const moveBack = currentLine.length - cursorPos
          term.write(`\x1b[${moveBack}D`)
        }
      }
      // Printable characters & multi-char pasted input
      else if (!data.startsWith('\x1b')) {
        const sanitized = data.replace(/[\r\n]+/g, ' ')
        const before = currentLine.slice(0, cursorPos)
        const after = currentLine.slice(cursorPos)
        refreshLine(before + sanitized + after, cursorPos + sanitized.length)
      }
    })

    // Listen to streaming output
    listen<TerminalOutputPayload>('terminal-output', (event) => {
      if (event.payload.session_id === id) {
        term.write(event.payload.data)
      }
    }).then((unlisten) => {
      unlistenRef.current.out = unlisten
    })

    listen<TerminalExitPayload>('terminal-exit', (event) => {
      if (event.payload.session_id === id) {
        prompt()
        useIDEStore.getState().refreshGitStatus()
      }
    }).then((unlisten) => {
      unlistenRef.current.ex = unlisten
    })

    const handleResize = () => {
      fitAddon.current?.fit()
    }
    window.addEventListener('resize', handleResize)

    const currentUnlisten = unlistenRef.current
    return () => {
      window.removeEventListener('resize', handleResize)
      dataDisposable.dispose()
      if (currentUnlisten.out) currentUnlisten.out()
      if (currentUnlisten.ex) currentUnlisten.ex()
      try {
        invoke('kill_shell', { sessionId: id, session_id: id })
      } catch {
        // ignore
      }
      term.dispose()
    }
  }, [id, isLight])

  // Sync theme dynamically
  useEffect(() => {
    if (termInstance.current) {
      termInstance.current.options.theme = {
        background: isLight ? '#ffffff' : '#181818',
        foreground: isLight ? '#333333' : '#cccccc',
        cursor: isLight ? '#007acc' : '#ffffff',
        selectionBackground: isLight ? '#add6ff' : '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
      }
    }
  }, [isLight])

  // Fit & focus when active
  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        fitAddon.current?.fit()
        termInstance.current?.focus()
      }, 50)
    }
  }, [isActive])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 p-2 ${isActive ? 'block' : 'hidden'}`}
    />
  )
}

export const MultiTerminalView: React.FC = () => {
  const {
    currentDir,
    pendingTerminalCommand,
    clearPendingTerminalCommand,
    terminalOpen,
    terminals,
    activeTerminalId,
    addTerminalSession,
    removeTerminalSession,
    setActiveTerminalId,
    settings,
  } = useIDEStore()

  const activeExecuteRef = useRef<((cmd: string) => void) | null>(null)
  const activeClearRef = useRef<(() => void) | null>(null)

  // Handle programmatic commands (e.g. from sidebar scripts)
  useEffect(() => {
    if (pendingTerminalCommand) {
      const cmd = pendingTerminalCommand
      clearPendingTerminalCommand()
      setTimeout(() => {
        if (activeExecuteRef.current) {
          activeExecuteRef.current(cmd)
        }
      }, 150)
    }
  }, [pendingTerminalCommand, clearPendingTerminalCommand])

  const isPanelRight = settings.panelPosition === 'right'

  return (
    <div
      style={{
        backgroundColor: 'var(--color-ide-bg)',
        color: 'var(--color-ide-text)',
      }}
      className={`h-full flex ${isPanelRight ? 'flex-col' : 'flex-row'} overflow-hidden select-none`}
    >
      {/* Compact Top Header Bar when panel is on the right */}
      {isPanelRight && (
        <div
          style={{
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
          }}
          className="flex items-center justify-between px-2 py-1 border-b text-xs shrink-0"
        >
          {/* Session selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {terminals.map((term, index) => {
              const isActive = term.id === activeTerminalId
              return (
                <button
                  key={term.id}
                  onClick={() => setActiveTerminalId(term.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--color-ide-bg)' : 'transparent',
                    color: isActive ? 'var(--color-ide-text)' : 'var(--color-ide-muted)',
                    borderColor: isActive ? 'var(--color-ide-accent)' : 'transparent',
                  }}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer border transition-colors ${
                    isActive ? 'font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={term.name}
                >
                  <TerminalSquare size={11} className={isActive ? 'text-ide-accent' : 'opacity-60'} />
                  <span>{index + 1}: {term.name}</span>
                  {terminals.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTerminalSession(term.id)
                      }}
                      className="hover:text-red-400 cursor-pointer ml-0.5"
                      title="Close session"
                    >
                      <X size={10} />
                    </span>
                  )}
                </button>
              )
            })}
            <button
              onClick={() => addTerminalSession()}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="New Terminal Session"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => activeExecuteRef.current?.('npm test')}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Run npm test"
            >
              <Play size={12} />
            </button>
            <button
              onClick={() => activeClearRef.current?.()}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear Terminal"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Terminal Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="flex-1 p-1.5 overflow-hidden relative">
          {terminals.map((term) => (
            <SingleTerminal
              key={term.id}
              id={term.id}
              isActive={terminalOpen && term.id === activeTerminalId}
              currentDir={currentDir}
              theme={settings.theme}
              onExecuteRef={term.id === activeTerminalId ? activeExecuteRef : undefined}
              onClearRef={term.id === activeTerminalId ? activeClearRef : undefined}
            />
          ))}
        </div>
      </div>

      {/* Terminal Side Tabs & Toolbar (when panel is at the bottom) */}
      {!isPanelRight && (
        <div
          style={{
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
          }}
          className="w-48 border-l flex flex-col shrink-0"
        >
          {/* Terminal Sessions Toolbar */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-sidebar)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="flex items-center justify-between px-2 py-1.5 border-b text-xs"
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => addTerminalSession()}
                className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="New Terminal"
              >
                <Plus size={13} />
              </button>
              <button
                onClick={() => activeExecuteRef.current?.('npm test')}
                className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Run npm test"
              >
                <Play size={13} />
              </button>
              <button
                onClick={() => activeClearRef.current?.()}
                className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear Terminal"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => activeExecuteRef.current?.('clear')}
                className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset Shell Session"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {terminals.map((term, index) => {
              const isActive = term.id === activeTerminalId
              return (
                <div
                  key={term.id}
                  onClick={() => setActiveTerminalId(term.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--color-ide-bg)' : 'transparent',
                    color: isActive ? 'var(--color-ide-text)' : 'var(--color-ide-muted)',
                    borderColor: isActive ? 'var(--color-ide-accent)' : 'transparent',
                  }}
                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer group transition-colors border ${
                    isActive ? 'font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <TerminalSquare size={12} className={isActive ? 'text-ide-accent' : 'opacity-60'} />
                    <span className="truncate">
                      {index + 1}: {term.name}
                    </span>
                  </div>
                  {terminals.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTerminalSession(term.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-red-500 cursor-pointer"
                      title="Kill Terminal Session"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
