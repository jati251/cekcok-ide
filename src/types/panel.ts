export type BottomPanelTab = 'problems' | 'output' | 'debug' | 'ports' | 'terminal'

export type OutputChannel = 'Git' | 'Build' | 'System'

export interface DiagnosticItem {
  id: string
  file: string
  line: number
  col: number
  message: string
  severity: 'error' | 'warning' | 'info'
  source?: string
}

export interface PortItem {
  port: number
  process: string
  url: string
  isAuto?: boolean
}

export interface TerminalSession {
  id: string
  name: string
}
