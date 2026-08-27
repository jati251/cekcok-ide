import { StateCreator } from 'zustand'
import { DiagnosticItem, OutputChannel, PortItem, TerminalSession } from '../../types/panel'
import { FullIDEStore } from '../useIDEStore'

export interface PanelSlice {
  // Rich Bottom Panel States
  diagnostics: DiagnosticItem[]
  outputLogs: Record<OutputChannel, string[]>
  activeOutputChannel: OutputChannel
  debugLogs: Array<{ id: string; type: 'input' | 'output' | 'error'; text: string; timestamp: Date }>
  ports: PortItem[]
  terminals: TerminalSession[]
  activeTerminalId: string

  // Bottom Panel Actions
  setDiagnostics: (items: DiagnosticItem[]) => void
  addOutputLog: (channel: OutputChannel, line: string) => void
  clearOutputLogs: (channel: OutputChannel) => void
  setActiveOutputChannel: (channel: OutputChannel) => void
  addDebugLog: (type: 'input' | 'output' | 'error', text: string) => void
  clearDebugLogs: () => void
  addPort: (port: PortItem) => void
  removePort: (portNumber: number) => void
  addTerminalSession: (name?: string) => string
  removeTerminalSession: (id: string) => void
  setActiveTerminalId: (id: string) => void
}

export const createPanelSlice: StateCreator<FullIDEStore, [], [], PanelSlice> = (set, get) => ({
  diagnostics: [],
  outputLogs: {
    Git: ['[Git Channel initialized]'],
    Build: ['[Build/Vite Channel initialized]'],
    System: ['[System Diagnostics Channel initialized]'],
  },
  activeOutputChannel: 'System',
  debugLogs: [
    {
      id: 'welcome-debug',
      type: 'output',
      text: 'Cekcok Debug Console (Node.js & JavaScript Evaluator). Type any JS expression to evaluate.',
      timestamp: new Date(),
    },
  ],
  ports: [
    { port: 1420, process: 'Tauri Dev Server', url: 'http://localhost:1420', isAuto: true },
    { port: 3000, process: 'Next.js / React Web', url: 'http://localhost:3000', isAuto: true },
    { port: 5173, process: 'Vite Dev Server', url: 'http://localhost:5173', isAuto: true },
  ],
  terminals: [{ id: 'term-1', name: 'bash' }],
  activeTerminalId: 'term-1',

  setDiagnostics: (items) => set({ diagnostics: items }),

  addOutputLog: (channel, line) =>
    set((state) => ({
      outputLogs: {
        ...state.outputLogs,
        [channel]: [...(state.outputLogs[channel] || []), line].slice(-500),
      },
    })),

  clearOutputLogs: (channel) =>
    set((state) => ({
      outputLogs: {
        ...state.outputLogs,
        [channel]: [],
      },
    })),

  setActiveOutputChannel: (channel) => set({ activeOutputChannel: channel }),

  addDebugLog: (type, text) =>
    set((state) => ({
      debugLogs: [
        ...state.debugLogs,
        {
          id: Math.random().toString(36).substring(7),
          type,
          text,
          timestamp: new Date(),
        },
      ].slice(-300),
    })),

  clearDebugLogs: () => set({ debugLogs: [] }),

  addPort: (port) =>
    set((state) => ({
      ports: state.ports.some((p) => p.port === port.port)
        ? state.ports.map((p) => (p.port === port.port ? port : p))
        : [...state.ports, port],
    })),

  removePort: (portNumber) =>
    set((state) => ({
      ports: state.ports.filter((p) => p.port !== portNumber),
    })),

  addTerminalSession: (name) => {
    const id = `term-${Date.now().toString(36)}`
    const termName = name || `terminal ${get().terminals.length + 1}`
    set((state) => ({
      terminals: [...state.terminals, { id, name: termName }],
      activeTerminalId: id,
    }))
    return id
  },

  removeTerminalSession: (id) => {
    set((state) => {
      const remaining = state.terminals.filter((t) => t.id !== id)
      if (remaining.length === 0) {
        const fallbackId = `term-${Date.now().toString(36)}`
        return {
          terminals: [{ id: fallbackId, name: 'bash' }],
          activeTerminalId: fallbackId,
        }
      }
      return {
        terminals: remaining,
        activeTerminalId:
          state.activeTerminalId === id ? remaining[0].id : state.activeTerminalId,
      }
    })
  },

  setActiveTerminalId: (id) => set({ activeTerminalId: id }),
})
