import { safeInvoke } from './tauriBridge'

export interface WorkspaceSettings {
  theme?: string
  fontSize?: number
  tabSize?: number
  wordWrap?: 'on' | 'off'
  minimapEnabled?: boolean
  fontFamily?: string
  [key: string]: unknown
}

const SETTINGS_FILE = '.cekcok/settings.json'

/**
 * Attempts to load and parse the .cekcok/settings.json file for the current directory.
 * @param currentDir The root directory of the current project workspace.
 * @returns Parsed JSON object of the workspace settings, or null if it doesn't exist/invalid.
 */
export const loadWorkspaceSettings = async (currentDir: string | null): Promise<WorkspaceSettings | null> => {
  if (!currentDir) return null

  try {
    const separator = currentDir.includes('\\') ? '\\' : '/'
    const settingsPath = `${currentDir}${separator}${SETTINGS_FILE}`

    const content = await safeInvoke<string>('read_file', { path: settingsPath })
    
    if (content) {
      const parsed = JSON.parse(content)
      console.log(`[Workspace Settings] Loaded from ${settingsPath}`, parsed)
      return parsed
    }
  } catch {
    // Expected error if the file does not exist, so we silently ignore
    // console.debug('No workspace settings found or failed to parse.', error)
  }

  return null
}
