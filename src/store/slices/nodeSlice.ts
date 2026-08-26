import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { FullIDEStore } from '../useIDEStore'

export interface PackageJsonInfo {
  name?: string
  version?: string
  description?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface NodeSlice {
  packageJson: PackageJsonInfo | null
  refreshPackageJson: () => Promise<void>
}

export const createNodeSlice: StateCreator<FullIDEStore, [], [], NodeSlice> = (set, get) => ({
  packageJson: null,

  refreshPackageJson: async () => {
    const curDir = get().currentDir
    if (!curDir) return

    const pkgPath = `${curDir}/package.json`
    try {
      const content = await safeInvoke<string>('read_file', { path: pkgPath })
      const parsed = JSON.parse(content) as PackageJsonInfo
      set({ packageJson: parsed })
    } catch {
      set({ packageJson: null })
    }
  }
})
