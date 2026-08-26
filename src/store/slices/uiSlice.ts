import { StateCreator } from 'zustand'
import {
  SidebarTab,
  UserSettings,
  PendingCloseFile,
  DragPayload,
  SidebarPosition,
  PanelPosition,
  SplitDirection,
  BottomPanelTab,
  DiagnosticItem,
  OutputChannel,
  PortItem,
  TerminalSession,
} from '../../types/ide'
import { LAYOUT_CONSTRAINTS } from '../../constants/defaults'
import {
  getSavedSettings,
  saveSettingsToStorage,
  getSavedRecentProjects,
  saveRecentProjectsToStorage,
} from '../../utils/storage'
import { FullIDEStore } from '../useIDEStore'

export interface UISlice {
  currentDir: string
  sidebarWidth: number
  terminalHeight: number
  terminalWidth: number
  sidebarOpen: boolean
  terminalOpen: boolean
  activeSidebarTab: SidebarTab
  activeBottomTab: BottomPanelTab
  commandPaletteOpen: boolean
  quickOpenOpen: boolean
  pendingCloseFile: PendingCloseFile | null
  settings: UserSettings
  recentProjects: string[]
  zoomLevel: number
  pendingTerminalCommand: string | null
  dragPayload: DragPayload | null
  zenMode: boolean
  searchEverywhereOpen: boolean
  
  // Rich Bottom Panel States
  diagnostics: DiagnosticItem[]
  outputLogs: Record<OutputChannel, string[]>
  activeOutputChannel: OutputChannel
  debugLogs: Array<{ id: string; type: 'input' | 'output' | 'error'; text: string; timestamp: Date }>
  ports: PortItem[]
  terminals: TerminalSession[]
  activeTerminalId: string

  setCurrentDir: (dir: string) => void
  setSidebarWidth: (w: number) => void
  setTerminalHeight: (h: number) => void
  setTerminalWidth: (w: number) => void
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void
  updateSettings: (partial: Partial<UserSettings>) => void
  setSidebarPosition: (pos: SidebarPosition) => void
  setPanelPosition: (pos: PanelPosition) => void
  setSplitDirection: (dir: SplitDirection) => void
  setDragPayload: (payload: DragPayload | null) => void
  addRecentProject: (path: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTerminal: () => void
  setTerminalOpen: (open: boolean) => void
  setActiveSidebarTab: (tab: SidebarTab) => void
  setActiveBottomTab: (tab: BottomPanelTab) => void
  setCommandPaletteOpen: (open: boolean) => void
  setQuickOpenOpen: (open: boolean) => void
  setPendingCloseFile: (file: PendingCloseFile | null) => void
  runTerminalCommand: (cmd: string) => void
  clearPendingTerminalCommand: () => void
  setZenMode: (open: boolean) => void
  toggleZenMode: () => void
  setSearchEverywhereOpen: (open: boolean) => void

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

export const createUISlice: StateCreator<FullIDEStore, [], [], UISlice> = (set, get) => ({
  currentDir: '',
  sidebarWidth: LAYOUT_CONSTRAINTS.SIDEBAR_DEFAULT_WIDTH,
  terminalHeight: LAYOUT_CONSTRAINTS.TERMINAL_DEFAULT_HEIGHT,
  terminalWidth: LAYOUT_CONSTRAINTS.TERMINAL_DEFAULT_WIDTH,
  sidebarOpen: true,
  terminalOpen: true,
  activeSidebarTab: 'explorer',
  activeBottomTab: 'terminal',
  commandPaletteOpen: false,
  quickOpenOpen: false,
  pendingCloseFile: null,
  settings: getSavedSettings(),
  recentProjects: getSavedRecentProjects(),
  zoomLevel: LAYOUT_CONSTRAINTS.ZOOM_DEFAULT,
  pendingTerminalCommand: null,
  dragPayload: null,
  zenMode: false,
  searchEverywhereOpen: false,

  // Rich Bottom Panel States Default
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

  setCurrentDir: (dir) => {
    set({ currentDir: dir, expandedFolders: {}, folderChildren: {} })
    get().addRecentProject(dir)
    get().refreshGitStatus()
    get().refreshPackageJson()
  },

  setSidebarWidth: (w) =>
    set({
      sidebarWidth: Math.max(
        LAYOUT_CONSTRAINTS.SIDEBAR_MIN_WIDTH,
        Math.min(w, LAYOUT_CONSTRAINTS.SIDEBAR_MAX_WIDTH)
      ),
    }),

  setTerminalHeight: (h) =>
    set({
      terminalHeight: Math.max(
        LAYOUT_CONSTRAINTS.TERMINAL_MIN_HEIGHT,
        Math.min(h, LAYOUT_CONSTRAINTS.TERMINAL_MAX_HEIGHT)
      ),
    }),

  setTerminalWidth: (w) =>
    set({
      terminalWidth: Math.max(
        LAYOUT_CONSTRAINTS.TERMINAL_MIN_WIDTH,
        Math.min(w, LAYOUT_CONSTRAINTS.TERMINAL_MAX_WIDTH)
      ),
    }),

  setZoomLevel: (updater) =>
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.zoomLevel) : updater
      return {
        zoomLevel: Math.max(
          LAYOUT_CONSTRAINTS.ZOOM_MIN,
          Math.min(LAYOUT_CONSTRAINTS.ZOOM_MAX, Math.round(next * 100) / 100)
        ),
      }
    }),

  updateSettings: (partial) =>
    set((state) => {
      const updated = { ...state.settings, ...partial }
      saveSettingsToStorage(updated)
      return { settings: updated }
    }),

  setSidebarPosition: (pos) => get().updateSettings({ sidebarPosition: pos }),
  setPanelPosition: (pos) => get().updateSettings({ panelPosition: pos }),
  setSplitDirection: (dir) => get().updateSettings({ splitDirection: dir }),
  setDragPayload: (payload) => set({ dragPayload: payload }),

  addRecentProject: (path) => {
    if (path === '.' || !path) return
    const recents = [path, ...get().recentProjects.filter((p) => p !== path)].slice(0, 10)
    set({ recentProjects: recents })
    saveRecentProjectsToStorage(recents, path)
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  setTerminalOpen: (open) => set({ terminalOpen: open }),

  setActiveSidebarTab: (tab) =>
    set((state) => {
      if (state.activeSidebarTab === tab && state.sidebarOpen) {
        return { sidebarOpen: false }
      }
      return { activeSidebarTab: tab, sidebarOpen: true }
    }),

  setActiveBottomTab: (tab) =>
    set({
      activeBottomTab: tab,
      terminalOpen: true,
    }),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickOpenOpen: (open) => set({ quickOpenOpen: open }),
  setPendingCloseFile: (file) => set({ pendingCloseFile: file }),

  runTerminalCommand: (cmd) =>
    set({
      terminalOpen: true,
      activeBottomTab: 'terminal',
      pendingTerminalCommand: cmd,
    }),
  clearPendingTerminalCommand: () => set({ pendingTerminalCommand: null }),
  setZenMode: (open) => set({ zenMode: open }),
  toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
  setSearchEverywhereOpen: (open) => set({ searchEverywhereOpen: open }),

  // Bottom Panel Actions
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
        { id: Math.random().toString(36).substring(2, 9), type, text, timestamp: new Date() },
      ].slice(-300),
    })),
  clearDebugLogs: () => set({ debugLogs: [] }),
  addPort: (port) =>
    set((state) => ({
      ports: [...state.ports.filter((p) => p.port !== port.port), port],
    })),
  removePort: (portNumber) =>
    set((state) => ({
      ports: state.ports.filter((p) => p.port !== portNumber),
    })),
  addTerminalSession: (name) => {
    const newId = `term-${Date.now()}`
    const sessionName = name || `bash ${get().terminals.length + 1}`
    set((state) => ({
      terminals: [...state.terminals, { id: newId, name: sessionName }],
      activeTerminalId: newId,
    }))
    return newId
  },
  removeTerminalSession: (id) =>
    set((state) => {
      const remaining = state.terminals.filter((t) => t.id !== id)
      if (remaining.length === 0) {
        const fallback = { id: 'term-1', name: 'bash' }
        return { terminals: [fallback], activeTerminalId: 'term-1' }
      }
      return {
        terminals: remaining,
        activeTerminalId:
          state.activeTerminalId === id ? remaining[0].id : state.activeTerminalId,
      }
    }),
  setActiveTerminalId: (id) => set({ activeTerminalId: id }),
})
