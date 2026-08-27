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
    settings,
  } = useIDEStore()

  const terminalRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const unlistenRef = useRef<{ out: UnlistenFn | null; ex: UnlistenFn | null }>({ out: null, ex: null })

  const currentDirRef = useRef(currentDir)
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  const isLight = settings.theme === 'vs-light'

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
      const isInitialLight = settings.theme === 'vs-light'
      const term = new Terminal({
        theme: {
          background: isInitialLight ? '#ffffff' : '#181818',
          foreground: isInitialLight ? '#333333' : '#cccccc',
          cursor: isInitialLight ? '#007acc' : '#ffffff',
          selectionBackground: isInitialLight ? '#add6ff' : '#264f78',
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

      term.writeln('\x1b[1;36mCekcok Native Node.js & Shell Terminal\x1b[0m')
      term.writeln(
        '\x1b[90mType standard bash/node commands or run npm scripts from the sidebar.\x1b[0m'
      )
      prompt()

      let currentLine = ''

      term.onData(async (data) => {
        if (data === '\r') {
          // Enter key
          const cmdToRun = currentLine.trim()
          currentLine = ''

          if (!cmdToRun) {
            prompt()
            return
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
            })
          } catch (err: unknown) {
            const errMsg = typeof err === 'string' ? err : String(err)
            term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m\r\n`)
            prompt()
          }
          refreshGitStatus()
        } else if (data === '\x7f' || data === '\b') {
          // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1)
            term.write('\b \b')
          }
        } else if (data === '\x03') {
          // Ctrl+C
          currentLine = ''
          term.write('^C')
          prompt()
        } else if (data >= ' ' || data === '\t') {
          currentLine += data
          term.write(data)
        }
      })

      // Listen to streaming stdout/stderr from Rust backend
      listen<string>('shell-stdout', (event) => {
        const payload = event.payload.replace(/\r?\n/g, '\r\n')
        term.write(payload)
      }).then((unlisten) => {
        unlistenRef.current.out = unlisten
      })

      listen<number>('shell-exit', () => {
        prompt()
        refreshGitStatus()
      }).then((unlisten) => {
        unlistenRef.current.ex = unlisten
      })
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
  }, [refreshGitStatus, terminalOpen, settings.theme])

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

  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => {
        fitAddon.current?.fit()
        termInstance.current?.focus()
      }, 50)
    }
  }, [terminalOpen, activeTerminalId])

  return (
    <div
      style={{
        backgroundColor: 'var(--color-ide-bg)',
        color: 'var(--color-ide-text)',
      }}
      className="h-full flex overflow-hidden select-none"
    >
      {/* Terminal Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="flex-1 p-2 overflow-hidden relative">
          <div ref={terminalRef} className="absolute inset-0 p-2" />
        </div>
      </div>

      {/* Terminal Side Tabs & Toolbar (VS Code Style) */}
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
              onClick={() => executeCommand('npm test')}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Run npm test"
            >
              <Play size={13} />
            </button>
            <button
              onClick={() => {
                termInstance.current?.clear()
                termInstance.current?.write('\x1b[32mcekcok-ide\x1b[0m $ ')
              }}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear Terminal"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => executeCommand('clear')}
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
    </div>
  )
}
