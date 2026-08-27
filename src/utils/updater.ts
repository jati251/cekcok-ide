import { check, Update } from '@tauri-apps/plugin-updater'
import { toast } from 'react-hot-toast'

export interface UpdateInfo {
  version: string
  currentVersion: string
  body?: string
  date?: string
}

export type UpdateStage = 'idle' | 'checking' | 'available' | 'downloading' | 'installing' | 'ready_to_restart' | 'error'

export interface UpdateProgressState {
  stage: UpdateStage
  percentage: number
  downloadedBytes: number
  totalBytes: number
  error?: string
}

let activeUpdate: Update | null = null
let cachedUpdateInfo: UpdateInfo | null = null

// Simple event target for updater events across components
export const updaterEventEmitter = new EventTarget()

export function getCachedUpdate(): UpdateInfo | null {
  return cachedUpdateInfo
}

/**
 * Check for available application updates
 */
export async function checkForAppUpdates(silent = false): Promise<UpdateInfo | null> {
  try {
    updaterEventEmitter.dispatchEvent(new CustomEvent('update-status', { detail: { stage: 'checking' } }))
    const update = await check()
    
    if (update && update.available) {
      activeUpdate = update
      cachedUpdateInfo = {
        version: update.version,
        currentVersion: update.currentVersion,
        body: update.body || 'Performance enhancements, bug fixes, and new productivity features.',
        date: update.date,
      }

      updaterEventEmitter.dispatchEvent(
        new CustomEvent('update-status', { detail: { stage: 'available', info: cachedUpdateInfo } })
      )

      if (silent) {
        // Show non-intrusive notification toast
        toast((t) => (
          `<div class="flex items-center gap-3 py-1">
            <div>
              <p class="font-semibold text-xs text-white">Update Available: v${update.version}</p>
              <p class="text-[11px] text-gray-400">Click to install new version</p>
            </div>
            <button
              id="toast-update-btn-${t.id}"
              class="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-md shadow-xs transition-colors"
            >
              Update
            </button>
          </div>`
        ), {
          id: 'app-update-available-toast',
          duration: 10000,
        })
      }

      return cachedUpdateInfo
    } else {
      activeUpdate = null
      cachedUpdateInfo = null
      updaterEventEmitter.dispatchEvent(new CustomEvent('update-status', { detail: { stage: 'idle' } }))
      
      if (!silent) {
        toast.success('You are running the latest version of Cekcok IDE!', { id: 'app-update-latest' })
      }
      return null
    }
  } catch (err) {
    activeUpdate = null
    updaterEventEmitter.dispatchEvent(new CustomEvent('update-status', { detail: { stage: 'error', error: String(err) } }))
    if (!silent) {
      console.error('Update check failed:', err)
      toast.error('Could not check for updates. Check internet connection.', { id: 'app-update-fail' })
    }
    return null
  }
}

/**
 * Downloads and installs the pending update with progressive event stream
 */
export async function installCurrentUpdate(
  onProgress?: (state: UpdateProgressState) => void
): Promise<void> {
  if (!activeUpdate) {
    const update = await check()
    if (!update || !update.available) throw new Error('No update available to install')
    activeUpdate = update
  }

  let totalBytes = 0
  let downloadedBytes = 0

  onProgress?.({
    stage: 'downloading',
    percentage: 0,
    downloadedBytes: 0,
    totalBytes: 0,
  })

  try {
    await activeUpdate.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started': {
          totalBytes = event.data.contentLength || 0
          onProgress?.({
            stage: 'downloading',
            percentage: 0,
            downloadedBytes: 0,
            totalBytes,
          })
          break
        }

        case 'Progress': {
          downloadedBytes += event.data.chunkLength
          const pct = totalBytes > 0 ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)) : 0
          onProgress?.({
            stage: 'downloading',
            percentage: pct,
            downloadedBytes,
            totalBytes,
          })
          break
        }

        case 'Finished': {
          onProgress?.({
            stage: 'installing',
            percentage: 100,
            downloadedBytes: totalBytes,
            totalBytes,
          })
          break
        }
      }
    })

    onProgress?.({
      stage: 'ready_to_restart',
      percentage: 100,
      downloadedBytes: totalBytes,
      totalBytes,
    })
  } catch (err) {
    console.error('Update install error:', err)
    onProgress?.({
      stage: 'error',
      percentage: 0,
      downloadedBytes,
      totalBytes,
      error: String(err),
    })
    throw err
  }
}

/**
 * Formats bytes to human readable format (e.g. 14.5 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
