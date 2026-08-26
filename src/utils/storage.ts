import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants/defaults'
import { UserSettings } from '../types/ide'

export const getSavedSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS
}

export const saveSettingsToStorage = (settings: UserSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export const getSavedRecentProjects = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return []
}

export const saveRecentProjectsToStorage = (recents: string[], lastProject?: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(recents))
    if (lastProject) {
      localStorage.setItem(STORAGE_KEYS.LAST_PROJECT, lastProject)
    }
  } catch {
    // ignore
  }
}

export const getSavedLastProject = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_PROJECT)
  } catch {
    return null
  }
}
