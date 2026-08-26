/**
 * Platform Detection & Shortcut Formatting Utilities
 * Dynamically adapts shortcuts between macOS (Cmd / ⌘) and Windows/Linux (Ctrl)
 */

export const isMacOS = (): boolean => {
  if (typeof navigator === 'undefined') return true
  const platform = navigator.platform || (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || ''
  const userAgent = navigator.userAgent || ''
  return /Mac|iPhone|iPod|iPad/i.test(platform) || /Macintosh|Mac OS X/i.test(userAgent)
}

/**
 * Returns the primary modifier key name ('Cmd' on macOS, 'Ctrl' on Windows/Linux)
 */
export const getModKey = (): string => {
  return isMacOS() ? 'Cmd' : 'Ctrl'
}

/**
 * Returns the primary modifier symbol ('⌘' on macOS, 'Ctrl' on Windows/Linux)
 */
export const getModSymbol = (): string => {
  return isMacOS() ? '⌘' : 'Ctrl'
}

/**
 * Formats a key combination dynamically according to the user's OS.
 * Examples:
 *   formatShortcut('Cmd+P') -> 'Cmd+P' (Mac) / 'Ctrl+P' (Win)
 *   formatShortcut('Cmd+Shift+P') -> 'Cmd+Shift+P' (Mac) / 'Ctrl+Shift+P' (Win)
 *   formatShortcut('Cmd+,') -> 'Cmd+,' (Mac) / 'Ctrl+,' (Win)
 */
export const formatShortcut = (shortcut: string): string => {
  const isMac = isMacOS()
  if (isMac) {
    return shortcut
  }
  return shortcut.replace(/\bCmd\b/g, 'Ctrl')
}
