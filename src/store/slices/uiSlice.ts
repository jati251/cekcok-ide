import { StateCreator } from 'zustand'
import {
  SidebarTab,
  UserSettings,
  PendingCloseFile,
  DragPayload,
  SidebarPosition,
  PanelPosition,
  SplitDirection,
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
  commandPaletteOpen: boolean
  quickOpenOpen: boolean
  pendingCloseFile: PendingCloseFile | null
  settings: UserSettings
  recentProjects: string[]
  zoomLevel: number
  pendingTerminalCommand: string | null
  dragPayload: DragPayload | null

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
  setCommandPaletteOpen: (open: boolean) => void
  setQuickOpenOpen: (open: boolean) => void
  setPendingCloseFile: (file: PendingCloseFile | null) => void
  runTerminalCommand: (cmd: string) => void
  clearPendingTerminalCommand: () => void
}

export const createUISlice: StateCreator<FullIDEStore, [], [], UISlice> = (set, get) => ({
  currentDir: '.',
  sidebarWidth: LAYOUT_CONSTRAINTS.SIDEBAR_DEFAULT_WIDTH,
  terminalHeight: LAYOUT_CONSTRAINTS.TERMINAL_DEFAULT_HEIGHT,
  terminalWidth: LAYOUT_CONSTRAINTS.TERMINAL_DEFAULT_WIDTH,
  sidebarOpen: true,
  terminalOpen: true,
  activeSidebarTab: 'explorer',
  commandPaletteOpen: false,
  quickOpenOpen: false,
  pendingCloseFile: null,
  settings: getSavedSettings(),
  recentProjects: getSavedRecentProjects(),
  zoomLevel: LAYOUT_CONSTRAINTS.ZOOM_DEFAULT,
  pendingTerminalCommand: null,
  dragPayload: null,

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

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickOpenOpen: (open) => set({ quickOpenOpen: open }),
  setPendingCloseFile: (file) => set({ pendingCloseFile: file }),

  runTerminalCommand: (cmd) =>
    set({
      terminalOpen: true,
      pendingTerminalCommand: cmd,
    }),
  clearPendingTerminalCommand: () => set({ pendingTerminalCommand: null }),
})
