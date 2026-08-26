import { StateCreator } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { GitStatusResult } from '../../types/ide'
import { INITIAL_GIT_STATUS } from '../../constants/defaults'
import { FullIDEStore } from '../useIDEStore'

export interface GitSlice {
  gitStatus: GitStatusResult
  isGitLoading: boolean
  refreshGitStatus: () => Promise<void>
}

export const createGitSlice: StateCreator<FullIDEStore, [], [], GitSlice> = (set, get) => ({
  gitStatus: INITIAL_GIT_STATUS,
  isGitLoading: false,

  refreshGitStatus: async () => {
    const dir = get().currentDir
    set({ isGitLoading: true })
    try {
      const res = await invoke<GitStatusResult>('git_get_status', { cwd: dir })
      set({ gitStatus: res, isGitLoading: false })
    } catch {
      set({ isGitLoading: false })
    }
  }
})
