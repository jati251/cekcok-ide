import { useRef, useCallback, useEffect } from 'react'
import { useIDEStore } from '../store/useIDEStore'

export const useAutoSave = () => {
  const { settings, saveFile } = useIDEStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerAutoSave = useCallback(
    (path: string) => {
      if (settings.autoSave === 'afterDelay') {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          saveFile(path)
        }, 1000)
      }
    },
    [settings.autoSave, saveFile]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { triggerAutoSave }
}
