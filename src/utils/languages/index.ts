import { FILENAME_TO_LANGUAGE, EXTENSION_TO_LANGUAGE } from './mappings'
import { FILENAME_TO_LABEL, EXTENSION_TO_LABEL } from './labels'

/**
 * Returns the Monaco Editor language ID for a given filename.
 * Uses dictionary lookup for O(1) resolution across 60+ languages.
 */
export const getLanguageFromFilename = (filename: string): string => {
  if (!filename) return 'plaintext'
  
  const lowerName = filename.toLowerCase()

  // 1. Check exact filename match first (e.g., Dockerfile, Makefile, cargo.toml)
  if (FILENAME_TO_LANGUAGE[lowerName]) {
    return FILENAME_TO_LANGUAGE[lowerName]
  }

  // 2. Extract extension and lookup
  const parts = lowerName.split('.')
  const ext = parts.length > 1 ? parts.pop() : ''
  
  if (ext && EXTENSION_TO_LANGUAGE[ext]) {
    return EXTENSION_TO_LANGUAGE[ext]
  }

  // Fallback
  return 'plaintext'
}

/**
 * Returns a human-readable label for a given filename (e.g. for StatusBar).
 */
export const getLanguageLabel = (filename: string): string => {
  if (!filename) return 'Plain Text'
  
  const lowerName = filename.toLowerCase()

  if (FILENAME_TO_LABEL[lowerName]) {
    return FILENAME_TO_LABEL[lowerName]
  }

  const parts = lowerName.split('.')
  const ext = parts.length > 1 ? parts.pop() : ''
  
  if (ext && EXTENSION_TO_LABEL[ext]) {
    return EXTENSION_TO_LABEL[ext]
  }

  return ext ? ext.toUpperCase() : 'Plain Text'
}
