import { create } from 'zustand'
import { FileSlice, createFileSlice } from './slices/fileSlice'
import { GitSlice, createGitSlice } from './slices/gitSlice'
import { NodeSlice, createNodeSlice } from './slices/nodeSlice'
import { UISlice, createUISlice } from './slices/uiSlice'

// Re-export shared types for convenient consumer access
export * from '../types/ide'

export type FullIDEStore = FileSlice & GitSlice & NodeSlice & UISlice

export const useIDEStore = create<FullIDEStore>()((...a) => ({
  ...createFileSlice(...a),
  ...createGitSlice(...a),
  ...createNodeSlice(...a),
  ...createUISlice(...a),
}))
