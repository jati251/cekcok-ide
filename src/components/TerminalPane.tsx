import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { motion, AnimatePresence } from 'framer-motion'
import { TerminalSquare, X, Play, Trash2 } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export const TerminalPane = () => {
  const { 
    terminalOpen, 
    toggleTerminal, 
    currentDir, 
    pendingTerminalCommand, 
    clearPendingTerminalCommand,
    refreshGitStatus 
  } = useIDEStore()

  const terminalRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  
  const currentDirRef = useRef(currentDir)
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  const executeCommand = async (cmd: string) => {
    if (!termInstance.current) return
    const term = termInstance.current
    term.writeln(`\r\n\x1b[32mcekcok-ide\x1b[0m $ ${cmd}`)
    
    try {
      const output = await invoke<string>('execute_shell', { 
        cmd,
        cwd: currentDirRef.current
      })
      if (output) term.write(output.replace(/\n/g, '\r\n'))
    } catch (err: unknown) {
      const errMsg = typeof err === 'string' ? err : String(err)
      term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m\r\n`)
    }
    
    term.write('\r\n\x1b[32mcekcok-ide\x1b[0m $ ')
    refreshGitStatus()
  }

  // Handle programmatic commands (e.g. from NPM scripts runner or Command Palette)
  useEffect(() => {
    if (pendingTerminalCommand) {
      const cmd = pendingTerminalCommand
      clearPendingTerminalCommand()
      setTimeout(() => {
        executeCommand(cmd)
      }, 150)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTerminalCommand])

  useEffect(() => {
    if (!terminalOpen || !terminalRef.current) return

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

      term.onData(async (data) => {
        const code = data.charCodeAt(0)
        
        // Enter key
        if (code === 13) {
          term.write('\r\n')
          if (currentCommand.trim()) {
            try {
              const output = await invoke<string>('execute_shell', { 
                cmd: currentCommand,
                cwd: currentDirRef.current
              })
              if (output) term.write(output.replace(/\n/g, '\r\n'))
            } catch (err: unknown) {
              const errMsg = typeof err === 'string' ? err : String(err)
              term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m`)
            }
            refreshGitStatus()
          }
          currentCommand = ''
          prompt()
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
    }

    // Handle resize
    const handleResize = () => {
      fitAddon.current?.fit()
    }
    window.addEventListener('resize', handleResize)
    
    // Fit immediately after opening
    setTimeout(() => handleResize(), 100)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [terminalOpen, refreshGitStatus])

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 230, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-[#181818] border-t border-ide-border flex flex-col z-10 select-none"
        >
          <div className="flex justify-between items-center px-4 py-1.5 text-xs font-semibold uppercase text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <TerminalSquare size={14} className="text-green-400" />
              <span>Terminal (Node / Zsh)</span>
            </div>
            <div className="flex items-center gap-2">
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
                onClick={toggleTerminal} 
                className="hover:text-white text-[#888] transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
                title="Close Terminal Pane"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2 overflow-hidden relative">
            <div ref={terminalRef} className="absolute inset-0 p-2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
