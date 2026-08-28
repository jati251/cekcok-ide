import { useRef, useCallback, useEffect } from 'react'
import { useIDEStore } from '../store/useIDEStore'

export const useAutoSave = () => {
  const { settings, saveFile } = useIDEStore()
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const triggerAutoSave = useCallback(
    (path: string) => {
      if (settings.autoSave === 'afterDelay') {
        const existing = timersRef.current.get(path)
        if (existing) clearTimeout(existing)

        const timer = setTimeout(() => {
          saveFile(path)
          timersRef.current.delete(path)
        }, 1000)

        timersRef.current.set(path, timer)
      }
    },
    [settings.autoSave, saveFile]
  )

  useEffect(() => {
    const currentTimers = timersRef.current
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer))
      currentTimers.clear()
    }
  }, [])

  return { triggerAutoSave }
}
