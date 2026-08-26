import { StateCreator } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { PackageJson } from '../../types/ide'
import { FullIDEStore } from '../useIDEStore'

export interface NodeSlice {
  packageJson: PackageJson | null
  refreshPackageJson: () => Promise<void>
}

export const createNodeSlice: StateCreator<FullIDEStore, [], [], NodeSlice> = (set, get) => ({
  packageJson: null,

  refreshPackageJson: async () => {
    const dir = get().currentDir
    const separator = dir.endsWith('/') || dir.endsWith('\\') ? '' : '/'
    const pkgPath = `${dir}${separator}package.json`
    try {
      const content = await invoke<string>('read_file', { path: pkgPath })
      const parsed = JSON.parse(content) as PackageJson
      set({ packageJson: parsed })
    } catch {
      set({ packageJson: null })
    }
  }
})
