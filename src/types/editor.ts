import { FileNode } from './workspace'

export interface PendingCloseFile {
  path: string
  pane: 1 | 2
  name: string
}

export type SplitDirection = 'horizontal' | 'vertical'

export type ToolId =
  | 'explorer'
  | 'search'
  | 'git'
  | 'node'
  | 'settings'
  | 'problems'
  | 'output'
  | 'debug'
  | 'ports'
  | 'terminal'

export interface DragPayload {
  type: 'file' | 'tab' | 'tool'
  file?: FileNode
  fromPane?: 1 | 2
  fromIndex?: number
  toolId?: ToolId
}
