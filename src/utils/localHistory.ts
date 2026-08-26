import localforage from 'localforage'

export interface HistorySnapshot {
  timestamp: number
  content: string
}

const historyStore = localforage.createInstance({
  name: 'cekcok-ide',
  storeName: 'local_history'
})

export const saveLocalHistory = async (path: string, content: string) => {
  try {
    const existing = await historyStore.getItem<HistorySnapshot[]>(path) || []
    
    // Don't save if content hasn't changed since last snapshot
    if (existing.length > 0 && existing[existing.length - 1].content === content) {
      return
    }

    const newSnapshot: HistorySnapshot = {
      timestamp: Date.now(),
      content
    }

    // Keep last 50 snapshots per file
    const updated = [...existing, newSnapshot].slice(-50)
    await historyStore.setItem(path, updated)
  } catch (error) {
    console.error('Failed to save local history snapshot', error)
  }
}

export const getLocalHistory = async (path: string): Promise<HistorySnapshot[]> => {
  try {
    return await historyStore.getItem<HistorySnapshot[]>(path) || []
  } catch (error) {
    console.error('Failed to get local history', error)
    return []
  }
}

export const clearLocalHistory = async (path: string) => {
  try {
    await historyStore.removeItem(path)
  } catch (error) {
    console.error('Failed to clear local history', error)
  }
}
