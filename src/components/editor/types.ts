import { FileNode } from '@/types/ide'

export type DropZonePosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | null

export interface TabContextMenuState {
  x: number
  y: number
  file: FileNode
}

export interface SinglePaneProps {
  paneId: 1 | 2
  files: FileNode[]
  activeFile: FileNode | null
  isActivePane: boolean
}
