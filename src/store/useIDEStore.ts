import { create } from 'zustand'
import { WorkspaceSlice, createWorkspaceSlice } from './slices/workspaceSlice'
import { EditorSlice, createEditorSlice } from './slices/editorSlice'
import { GitSlice, createGitSlice } from './slices/gitSlice'
import { NodeSlice, createNodeSlice } from './slices/nodeSlice'
import { UISlice, createUISlice } from './slices/uiSlice'

// Re-export shared types for convenient consumer access
export * from '../types/ide'

export type FullIDEStore = WorkspaceSlice & EditorSlice & GitSlice & NodeSlice & UISlice

export const useIDEStore = create<FullIDEStore>()((...a) => ({
  ...createWorkspaceSlice(...a),
  ...createEditorSlice(...a),
  ...createGitSlice(...a),
  ...createNodeSlice(...a),
  ...createUISlice(...a),
}))
