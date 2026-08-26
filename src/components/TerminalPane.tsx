import React, { useEffect, useRef, useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { TerminalSquare, X, Play, Trash2, Maximize2, Minimize2, RotateCcw } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export const TerminalPane: React.FC = () => {
  const {
    terminalOpen,
    terminalHeight,
    setTerminalHeight,
    toggleTerminal,
    currentDir,
    pendingTerminalCommand,
    clearPendingTerminalCommand,
    refreshGitStatus,
  } = useIDEStore()

  const [isMaximized, setIsMaximized] = useState(false)
  const previousHeightRef = useRef(terminalHeight)
  const terminalRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const unlistenRef = useRef<{ out: UnlistenFn | null; ex: UnlistenFn | null }>({ out: null, ex: null })

  const currentDirRef = useRef(currentDir)
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  const executeCommand = useCallback(async (cmd: string) => {
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
  }, [refreshGitStatus])

  // Toggle maximize terminal height
  const handleToggleMaximize = () => {
    if (isMaximized) {
      setTerminalHeight(previousHeightRef.current)
      setIsMaximized(false)
    } else {
      previousHeightRef.current = terminalHeight
      setTerminalHeight(window.innerHeight * 0.75)
      setIsMaximized(true)
    }
  }

  // Handle programmatic commands
  useEffect(() => {
    if (pendingTerminalCommand) {
      const cmd = pendingTerminalCommand
      clearPendingTerminalCommand()
      setTimeout(() => {
        executeCommand(cmd)
      }, 150)
    }
  }, [pendingTerminalCommand, clearPendingTerminalCommand, executeCommand])

  // Initialize Xterm once and keep alive in DOM
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
        // Handle ANSI escape sequences for arrow keys
        if (data === '\x1b[A') {
          // Up arrow: Navigate history back
          if (history.length > 0) {
            if (historyIndex === -1) {
              historyIndex = history.length - 1
            } else if (historyIndex > 0) {
              historyIndex--
            }
            // Clear current line
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
          // Down arrow: Navigate history forward
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
        // Readable chars
        else if (code >= 32 && code <= 126) {
          currentCommand += data
          term.write(data)
        }
      })

      // Listen to streaming output ONCE
      const setupListeners = async () => {
        const out = await listen<string>('terminal-output', (event) => {
          if (termInstance.current) {
            termInstance.current.write(event.payload)
          }
        })
        const ex = await listen<number | null>('terminal-exit', (event) => {
          if (termInstance.current) {
            if (event.payload !== null && event.payload !== undefined && event.payload !== 0) {
              termInstance.current.write(`\r\n\x1b[33m[Process exited with code ${event.payload}]\x1b[0m\r\n\x1b[32mcekcok-ide\x1b[0m $ `)
            } else {
              termInstance.current.write(`\r\n\x1b[32mcekcok-ide\x1b[0m $ `)
            }
          }
        })
        unlistenRef.current = { out, ex: ex as unknown as UnlistenFn }
      }
      setupListeners()
    }

    // Handle resize
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

  // Fit terminal whenever it becomes visible
  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => {
        fitAddon.current?.fit()
        termInstance.current?.focus()
      }, 50)
    }
  }, [terminalOpen, terminalHeight])

  return (
    <div
      style={{
        height: terminalHeight,
        display: terminalOpen ? 'flex' : 'none',
      }}
      className="bg-[#181818] border-t border-ide-border flex-col z-10 select-none shrink-0"
    >
      {/* Terminal Header Bar */}
      <div className="flex justify-between items-center px-4 py-1.5 text-xs font-semibold uppercase text-ide-muted border-b border-ide-border bg-[#1f1f1f] shrink-0">
        <div className="flex items-center gap-2">
          <TerminalSquare size={14} className="text-green-400" />
          <span>Terminal (Node / Zsh)</span>
          <span className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.2 rounded font-mono">
            bash
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              termInstance.current?.clear()
              termInstance.current?.write('\x1b[32mcekcok-ide\x1b[0m $ ')
            }}
            className="hover:text-white text-[#888] transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
            title="Clear Terminal"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => executeCommand('npm test')}
            className="hover:text-white text-[#888] transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
            title="Run npm test"
          >
            <Play size={13} />
          </button>
          <button
            onClick={() => executeCommand('clear')}
            className="hover:text-white text-[#888] transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
            title="Reset Shell Session"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={handleToggleMaximize}
            className="hover:text-white text-[#888] transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
            title={isMaximized ? 'Restore Terminal Panel' : 'Maximize Terminal Panel'}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={toggleTerminal}
            className="hover:text-white text-[#888] transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
            title="Close Terminal Panel (Cmd+` / Cmd+J)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Canvas Container */}
      <div className="flex-1 p-2 overflow-hidden relative">
        <div ref={terminalRef} className="absolute inset-0 p-2" />
      </div>
    </div>
  )
}
