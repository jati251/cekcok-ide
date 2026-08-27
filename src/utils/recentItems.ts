import { AppType } from '../types/ide'

export interface RecentItem {
  id: string
  title: string
  path?: string
  app: AppType
  lastModified: number
  description?: string
}

const RECENT_ITEMS_KEY = 'cekcok_unified_recent_items_v1'

export function getRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_ITEMS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Failed to load recent items:', e)
  }

  return []
}

export function saveRecentItems(items: RecentItem[]): void {
  try {
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(items.slice(0, 30)))
  } catch (e) {
    console.error('Failed to save recent items:', e)
  }
}

export function addRecentItem(item: {
  title: string
  path?: string
  app: AppType
  description?: string
}): void {
  const current = getRecentItems()
  const filtered = current.filter(
    (x) => !(x.app === item.app && (x.title === item.title || (item.path && x.path === item.path)))
  )
  const newItem: RecentItem = {
    id: `${item.app}-${Date.now()}`,
    title: item.title,
    path: item.path,
    app: item.app,
    description: item.description,
    lastModified: Date.now(),
  }
  const updated = [newItem, ...filtered].slice(0, 30)
  saveRecentItems(updated)
}

export function removeRecentItem(id: string): void {
  const current = getRecentItems()
  const updated = current.filter((x) => x.id !== id)
  saveRecentItems(updated)
}

export function formatTimeAgo(timestamp: number): string {
  const elapsed = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(elapsed / (1000 * 60))
  const hours = Math.floor(elapsed / (1000 * 60 * 60))
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))

  if (minutes < 2) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}
