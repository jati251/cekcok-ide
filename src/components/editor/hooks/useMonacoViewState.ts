import { useRef, useEffect } from 'react'
import { FileNode } from '@/types/ide'

export const useMonacoViewState = (
  activeFile: FileNode | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstanceRef: React.MutableRefObject<any>
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewStateMapRef = useRef<Map<string, any>>(new Map())
  const previousFilePathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!editorInstanceRef.current) return
    const editor = editorInstanceRef.current

    if (previousFilePathRef.current) {
      const state = editor.saveViewState()
      if (state) {
        viewStateMapRef.current.set(previousFilePathRef.current, state)
      }
    }

    if (activeFile) {
      const savedState = viewStateMapRef.current.get(activeFile.path)
      if (savedState) {
        editor.restoreViewState(savedState)
      }
      previousFilePathRef.current = activeFile.path
    } else {
      previousFilePathRef.current = null
    }
  }, [activeFile, editorInstanceRef])
}
