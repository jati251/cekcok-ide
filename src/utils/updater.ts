import { check, Update } from '@tauri-apps/plugin-updater'
import { toast } from 'react-hot-toast'

export interface UpdateInfo {
  version: string
  currentVersion: string
  body?: string
  date?: string
}

let activeUpdate: Update | null = null

export async function checkForAppUpdates(silent = false): Promise<UpdateInfo | null> {
  try {
    const update = await check()
    if (update) {
      activeUpdate = update
      return {
        version: update.version,
        currentVersion: update.currentVersion,
        body: update.body || 'New features, improvements and bug fixes.',
        date: update.date,
      }
    } else {
      activeUpdate = null
      if (!silent) {
        toast.success('You are using the latest version of Cekcok Super App!', { id: 'app-update-latest' })
      }
      return null
    }
  } catch (err) {
    if (!silent) {
      console.error('Update check failed:', err)
      toast.error('Failed to check for updates. Check your internet connection.', { id: 'app-update-fail' })
    }
    return null
  }
}

export async function installCurrentUpdate(onProgress?: (progress: number) => void): Promise<void> {
  if (!activeUpdate) {
    const update = await check()
    if (!update) throw new Error('No update available')
    activeUpdate = update
  }

  let totalBytes = 0
  let downloadedBytes = 0

  await activeUpdate.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        totalBytes = event.data.contentLength || 0
        break
      case 'Progress':
        downloadedBytes += event.data.chunkLength
        if (totalBytes > 0 && onProgress) {
          onProgress(Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)))
        }
        break
      case 'Finished':
        if (onProgress) onProgress(100)
        break
    }
  })
}
