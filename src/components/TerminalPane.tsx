import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { motion, AnimatePresence } from 'framer-motion'
import { TerminalSquare, X } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export const TerminalPane = () => {
  const { terminalOpen, toggleTerminal, currentDir } = useIDEStore()
  const terminalRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  
  // Ref to hold the latest directory for the callback
  const currentDirRef = useRef(currentDir)
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  useEffect(() => {
    if (!terminalOpen || !terminalRef.current) return

    if (!termInstance.current) {
      const term = new Terminal({
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#ffffff',
        },
        fontFamily: "'Consolas', 'Courier New', monospace",
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
      
      term.writeln('Welcome to Cekcok IDE Terminal!')
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
              // Replace \n with \r\n for xterm
              if (output) term.write(output.replace(/\n/g, '\r\n'))
            } catch (err: unknown) {
              const errMsg = typeof err === 'string' ? err : String(err)
              term.write(`\x1b[31mError: ${errMsg.replace(/\n/g, '\r\n')}\x1b[0m`)
            }
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
  }, [terminalOpen])

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 250, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-ide-panel border-t border-ide-border flex flex-col"
        >
          <div className="flex justify-between items-center px-4 py-2 text-xs font-semibold uppercase text-ide-muted border-b border-ide-border">
            <div className="flex items-center gap-2">
              <TerminalSquare size={14} />
              Terminal
            </div>
            <button onClick={toggleTerminal} className="hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 p-2 overflow-hidden relative">
            <div ref={terminalRef} className="absolute inset-0 p-2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
