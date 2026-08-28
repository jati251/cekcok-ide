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
  ToolLayout,
  ToolId,
  ToolPanelPosition,
  AppType,
} from '../../types'
import { LAYOUT_CONSTRAINTS } from '../../constants/defaults'
import {
  getSavedSettings,
  saveSettingsToStorage,
  getSavedRecentProjects,
  saveRecentProjectsToStorage,
} from '../../utils/storage'
import { FullIDEStore } from '../useIDEStore'

export interface UISlice {
  activeApp: AppType
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
  pendingDragPayload: DragPayload | null
  dragStartCoords: { x: number; y: number } | null
  zenMode: boolean
  searchEverywhereOpen: boolean
  isDraggingFile: boolean
  toolLayout: ToolLayout

  setActiveApp: (app: AppType) => void
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
  setPendingDragPayload: (payload: DragPayload | null) => void
  setDragStartCoords: (coords: { x: number; y: number } | null) => void
  addRecentProject: (path: string) => void
  removeRecentProject: (path: string) => void
  setPendingTerminalCommand: (cmd: string | null) => void
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
  setSettingsModalOpen: (open: boolean) => void
  settingsModalOpen: boolean
  setBranchSwitcherOpen: (open: boolean) => void
  branchSwitcherOpen: boolean
  setToolLayout: (toolId: ToolId, position: ToolPanelPosition) => void
  resetToolLayout: () => void
  setIsDraggingFile: (dragging: boolean) => void
}

export const createUISlice: StateCreator<FullIDEStore, [], [], UISlice> = (set, get) => ({
  activeApp: 'home',
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
  pendingDragPayload: null,
  dragStartCoords: null,
  isDraggingFile: false,
  zenMode: false,
  searchEverywhereOpen: false,
  settingsModalOpen: false,
  branchSwitcherOpen: false,
  toolLayout: {
    explorer: 'left',
    search: 'left',
    git: 'left',
    node: 'left',
    settings: 'hidden',
    problems: 'bottom',
    output: 'bottom',
    debug: 'bottom',
    terminal: 'bottom',
    ports: 'bottom',
  },

  setActiveApp: (app) => set({ activeApp: app }),

  setCurrentDir: async (dir) => {
    set({ currentDir: dir, expandedFolders: {}, folderChildren: {} })
    get().addRecentProject(dir)
    get().refreshGitStatus()
    get().refreshPackageJson()

    // Record to unified recents
    if (dir && dir !== '.') {
      const { addRecentItem } = await import('../../utils/recentItems')
      const dirName = dir.split(/[/\\]/).filter(Boolean).pop() || dir
      addRecentItem({
        title: dirName,
        path: dir,
        app: 'code',
        description: dir,
      })
    }

    // Load Workspace Settings
    const { loadWorkspaceSettings } = await import('../../utils/workspaceSettings')
    const workspaceSettings = await loadWorkspaceSettings(dir)
    if (workspaceSettings) {
      set((state) => ({ settings: { ...state.settings, ...workspaceSettings } }))
    } else {
      set({ settings: getSavedSettings() })
    }
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
  setPendingDragPayload: (payload) => set({ pendingDragPayload: payload }),
  setDragStartCoords: (coords) => set({ dragStartCoords: coords }),

  addRecentProject: (path) => {
    if (path === '.' || !path) return
    const recents = [path, ...get().recentProjects.filter((p) => p !== path)].slice(0, 10)
    set({ recentProjects: recents })
    saveRecentProjectsToStorage(recents, path)
  },

  removeRecentProject: (path) => {
    const recents = get().recentProjects.filter((p) => p !== path)
    set({ recentProjects: recents })
    saveRecentProjectsToStorage(recents, get().currentDir === path ? '' : get().currentDir)
  },

  setPendingTerminalCommand: (cmd) => set({ pendingTerminalCommand: cmd }),

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
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
  setBranchSwitcherOpen: (open) => set({ branchSwitcherOpen: open }),
  setToolLayout: (toolId, position) => {
    const { toolLayout, activeSidebarTab, activeBottomTab } = get()
    if (toolLayout[toolId] === position) return

    const newLayout = { ...toolLayout, [toolId]: position }

    if (position === 'left') {
      const updates: Partial<FullIDEStore> = {
        toolLayout: newLayout,
        activeSidebarTab: toolId as SidebarTab,
        sidebarOpen: true,
      }
      if (activeBottomTab === (toolId as unknown as BottomPanelTab)) {
        const remainingBottom = (Object.keys(newLayout) as ToolId[]).filter(
          (k) => newLayout[k] === 'bottom'
        ) as unknown as BottomPanelTab[]
        if (remainingBottom.length > 0) {
          updates.activeBottomTab = remainingBottom[0]
        }
      }
      set(updates)
    } else if (position === 'bottom') {
      const updates: Partial<FullIDEStore> = {
        toolLayout: newLayout,
        activeBottomTab: toolId as unknown as BottomPanelTab,
        terminalOpen: true,
      }
      if (activeSidebarTab === (toolId as unknown as SidebarTab)) {
        const remainingLeft = (Object.keys(newLayout) as ToolId[]).filter(
          (k) => newLayout[k] === 'left'
        ) as unknown as SidebarTab[]
        if (remainingLeft.length > 0) {
          updates.activeSidebarTab = remainingLeft[0]
        }
      }
      set(updates)
    } else {
      set({ toolLayout: newLayout })
    }
  },

  resetToolLayout: () =>
    set({
      toolLayout: {
        explorer: 'left',
        search: 'left',
        git: 'left',
        node: 'left',
        settings: 'hidden',
        problems: 'bottom',
        output: 'bottom',
        debug: 'bottom',
        terminal: 'bottom',
        ports: 'bottom',
      },
      activeSidebarTab: 'explorer',
      activeBottomTab: 'terminal',
    }),

  setIsDraggingFile: (dragging) => set({ isDraggingFile: dragging }),
})
