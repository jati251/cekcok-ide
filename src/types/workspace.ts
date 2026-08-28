export type AppType = 'home' | 'code' | 'spreadsheet' | 'document' | 'whiteboard'

export interface FileNode {
  name: string
  path: string
  is_dir: boolean
  is_hidden?: boolean
  is_ignored?: boolean
  isDirty?: boolean
  content?: string
  isDiff?: boolean
  originalContent?: string
  diffStaged?: boolean
}

export interface SearchResultItem {
  file_path: string
  file_name: string
  line_number: number
  line_text: string
}

export type ClipboardAction = 'copy' | 'cut'

export interface FileClipboardState {
  action: ClipboardAction
  file: FileNode
}
