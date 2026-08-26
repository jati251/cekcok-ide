import React, { useEffect, useRef, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { Plus, Trash2, RotateCcw, Play, TerminalSquare, X } from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export const MultiTerminalView: React.FC = () => {
  const {
    currentDir,
    pendingTerminalCommand,
    clearPendingTerminalCommand,
    refreshGitStatus,
    terminalOpen,
    terminals,
    activeTerminalId,
    addTerminalSession,
    removeTerminalSession,
    setActiveTerminalId,
  } = useIDEStore()

  const terminalRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const unlistenRef = useRef<{ out: UnlistenFn | null; ex: UnlistenFn | null }>({ out: null, ex: null })

  const currentDirRef = useRef(currentDir)
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  const executeCommand = useCallback(
    async (cmd: string) => {
      if (!termInstance.current) return
      const term = termInstance.current
      term.writeln(`\r\n\x1b[32mcekcok-ide\x1b[0m $ ${cmd}`)

      try {
        await invoke('spawn_shell', {
          cmd,
          cwd: currentDirRef.current,
        })
      } catch (err: unknown) {
        const errMsg = typeof err === 'string' ? err : String(err)
        term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m\r\n`)
        term.write('\r\n\x1b[32mcekcok-ide\x1b[0m $ ')
      }
      refreshGitStatus()
    },
    [refreshGitStatus]
  )

  // Handle programmatic commands (e.g. from sidebar scripts)
  useEffect(() => {
    if (pendingTerminalCommand) {
      const cmd = pendingTerminalCommand
      clearPendingTerminalCommand()
      setTimeout(() => {
        executeCommand(cmd)
      }, 150)
    }
  }, [pendingTerminalCommand, clearPendingTerminalCommand, executeCommand])

  // Initialize Xterm once
  useEffect(() => {
    if (!terminalRef.current) return

    if (!termInstance.current) {
      const term = new Terminal({
        theme: {
          background: '#181818',
          foreground: '#cccccc',
          cursor: '#ffffff',
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

      term.open(terminalRef.current)
      fit.fit()

      termInstance.current = term
      fitAddon.current = fit

      const prompt = () => term.write('\r\n\x1b[32mcekcok-ide\x1b[0m $ ')

      term.writeln('\x1b[1;34mCekcok Native Node.js & Shell Terminal\x1b[0m')
      term.writeln('Type standard bash/node commands or run npm scripts from the sidebar.')
      prompt()

      let currentCommand = ''
      const history: string[] = []
      let historyIndex = -1

      term.onData(async (data) => {
        // Arrow keys history navigation
        if (data === '\x1b[A') {
          if (history.length > 0) {
            if (historyIndex === -1) {
              historyIndex = history.length - 1
            } else if (historyIndex > 0) {
              historyIndex--
            }
            while (currentCommand.length > 0) {
              term.write('\b \b')
              currentCommand = currentCommand.slice(0, -1)
            }
            currentCommand = history[historyIndex] || ''
            term.write(currentCommand)
          }
          return
        }

        if (data === '\x1b[B') {
          if (historyIndex !== -1) {
            if (historyIndex < history.length - 1) {
              historyIndex++
              while (currentCommand.length > 0) {
                term.write('\b \b')
                currentCommand = currentCommand.slice(0, -1)
              }
              currentCommand = history[historyIndex] || ''
              term.write(currentCommand)
            } else {
              historyIndex = -1
              while (currentCommand.length > 0) {
                term.write('\b \b')
                currentCommand = currentCommand.slice(0, -1)
              }
            }
          }
          return
        }

        const code = data.charCodeAt(0)

        // Ctrl+C
        if (code === 3) {
          term.write('^C\r\n')
          invoke('kill_shell').catch(console.error)
          currentCommand = ''
          historyIndex = -1
          prompt()
          return
        }

        // Enter key
        if (code === 13) {
          term.write('\r\n')
          const cmdToRun = currentCommand.trim()
          if (cmdToRun) {
            history.push(cmdToRun)
            historyIndex = -1
            try {
              await invoke('spawn_shell', {
                cmd: cmdToRun,
                cwd: currentDirRef.current,
              })
            } catch (err: unknown) {
              const errMsg = typeof err === 'string' ? err : String(err)
              term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m\r\n`)
              prompt()
            }
            refreshGitStatus()
          } else {
            prompt()
          }
          currentCommand = ''
        }
        // Backspace
        else if (code === 127) {
          if (currentCommand.length > 0) {
            currentCommand = currentCommand.slice(0, -1)
            term.write('\b \b')
          }
        }
        // Printable ASCII
        else if (code >= 32 && code <= 126) {
          currentCommand += data
          term.write(data)
        }
      })

      // Listen to output events
      const setupListeners = async () => {
        const out = await listen<string>('terminal-output', (event) => {
          if (termInstance.current) {
            termInstance.current.write(event.payload)
          }
        })
        const ex = await listen<number | null>('terminal-exit', (event) => {
          if (termInstance.current) {
            if (event.payload !== null && event.payload !== undefined && event.payload !== 0) {
              termInstance.current.write(
                `\r\n\x1b[33m[Process exited with code ${event.payload}]\x1b[0m\r\n\x1b[32mcekcok-ide\x1b[0m $ `
              )
            } else {
              termInstance.current.write(`\r\n\x1b[32mcekcok-ide\x1b[0m $ `)
            }
          }
        })
        unlistenRef.current = { out, ex: ex as unknown as UnlistenFn }
      }
      setupListeners()
    }

    const handleResize = () => {
      if (terminalOpen) {
        fitAddon.current?.fit()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [refreshGitStatus, terminalOpen])

  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => {
        fitAddon.current?.fit()
        termInstance.current?.focus()
      }, 50)
    }
  }, [terminalOpen, activeTerminalId])

  return (
    <div className="h-full flex bg-[#181818] overflow-hidden select-none">
      {/* Terminal Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="flex-1 p-2 overflow-hidden relative">
          <div ref={terminalRef} className="absolute inset-0 p-2" />
        </div>
      </div>

      {/* Terminal Side Tabs & Toolbar (VS Code Style) */}
      <div className="w-48 bg-[#1f1f1f] border-l border-ide-border flex flex-col shrink-0">
        {/* Terminal Sessions Toolbar */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-ide-border bg-[#1a1a1a] text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => addTerminalSession()}
              className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="New Terminal"
            >
              <Plus size={13} />
            </button>
            <button
              onClick={() => executeCommand('npm test')}
              className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Run npm test"
            >
              <Play size={13} />
            </button>
            <button
              onClick={() => {
                termInstance.current?.clear()
                termInstance.current?.write('\x1b[32mcekcok-ide\x1b[0m $ ')
              }}
              className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear Terminal"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => executeCommand('clear')}
              className="p-1 rounded text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer group transition-colors ${
                  isActive
                    ? 'bg-ide-accent/20 text-white font-medium'
                    : 'text-ide-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <TerminalSquare size={12} className={isActive ? 'text-ide-accent' : 'text-[#777]'} />
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
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-ide-muted hover:text-white"
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
    </div>
  )
}
