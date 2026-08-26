import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { GitStatusResult } from '../../types/ide'
import { FullIDEStore } from '../useIDEStore'

export interface GitSlice {
  gitStatus: GitStatusResult
  isGitLoading: boolean
  refreshGitStatus: () => Promise<void>
}

export const createGitSlice: StateCreator<FullIDEStore, [], [], GitSlice> = (set, get) => ({
  gitStatus: {
    is_repo: false,
    branch: '',
    staged: [],
    unstaged: [],
    ahead: 0,
    behind: 0
  },
  isGitLoading: false,

  refreshGitStatus: async () => {
    const dir = get().currentDir
    set({ isGitLoading: true })
    try {
      const res = await safeInvoke<GitStatusResult>('git_get_status', { cwd: dir })
      set({ gitStatus: res, isGitLoading: false })
    } catch {
      set({ isGitLoading: false })
    }
  }
})
