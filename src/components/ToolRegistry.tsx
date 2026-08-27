import React from 'react'
import { Files, Search, GitBranch, Layers, Settings, TerminalSquare, AlertCircle, FileText, Terminal as BugIcon, Globe } from 'lucide-react'
import { ExplorerSidebar } from './sidebar/ExplorerSidebar'
import { SearchSidebar } from './sidebar/SearchSidebar'
import { GitSidebar } from './sidebar/GitSidebar'
import { NodeSidebar } from './sidebar/NodeSidebar'
import { MultiTerminalView } from './bottom-panel/MultiTerminalView'
import { ProblemsView } from './bottom-panel/ProblemsView'
import { OutputView } from './bottom-panel/OutputView'
import { DebugConsoleView } from './bottom-panel/DebugConsoleView'
import { PortsView } from './bottom-panel/PortsView'
import { ToolId, DiagnosticItem } from '../types/ide'
import { FullIDEStore } from '../store/useIDEStore'

export interface ToolDefinition {
  id: ToolId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>
  component: React.ComponentType<unknown>
  getBadge?: (state: FullIDEStore) => React.ReactNode | number | undefined
}

export const TOOLS: Record<ToolId, ToolDefinition> = {
  explorer: {
    id: 'explorer',
    label: 'Explorer',
    icon: Files,
    component: ExplorerSidebar,
  },
  search: {
    id: 'search',
    label: 'Search',
    icon: Search,
    component: SearchSidebar,
  },
  git: {
    id: 'git',
    label: 'Source Control',
    icon: GitBranch,
    component: GitSidebar,
    getBadge: (state) => {
      const total = state.gitStatus.staged.length + state.gitStatus.unstaged.length
      return total > 0 ? total : undefined
    }
  },
  node: {
    id: 'node',
    label: 'Project & Build Suite',
    icon: Layers,
    component: NodeSidebar,
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    component: () => <div className="p-4 text-ide-muted text-sm">Settings is open in editor tab.</div>,
  },
  problems: {
    id: 'problems',
    label: 'Problems',
    icon: AlertCircle,
    component: ProblemsView,
    getBadge: (state) => {
      const errors = state.diagnostics.filter((d: DiagnosticItem) => d.severity === 'error').length
      const warnings = state.diagnostics.filter((d: DiagnosticItem) => d.severity === 'warning').length
      const total = errors + warnings
      if (total === 0) return undefined
      return (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          errors > 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {total}
        </span>
      )
    }
  },
  output: {
    id: 'output',
    label: 'Output',
    icon: FileText,
    component: OutputView,
  },
  debug: {
    id: 'debug',
    label: 'Debug Console',
    icon: BugIcon,
    component: DebugConsoleView,
  },
  ports: {
    id: 'ports',
    label: 'Ports',
    icon: Globe,
    component: PortsView,
    getBadge: (state) => {
      return state.ports.length > 0 ? (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-ide-accent/20 text-ide-accent">
          {state.ports.length}
        </span>
      ) : undefined
    }
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    icon: TerminalSquare,
    component: MultiTerminalView,
  }
}
