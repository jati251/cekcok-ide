import { useEffect, useRef, useState } from 'react'
import { FileNode } from '@/store/useIDEStore'
import { safeInvoke } from '@/utils/tauriBridge'
import { computeLineDiff } from '@/utils/lineDiff'

export const useChangeDecorations = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstanceRef: React.MutableRefObject<any>,
  activeFile: FileNode | null,
  currentDir: string | null
) => {
  const [baseContent, setBaseContent] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decorationsCollectionRef = useRef<any>(null)
  const currentPathRef = useRef<string | null>(null)

  // 1. Fetch Git baseline content or file initial state when active file changes
  useEffect(() => {
    if (!activeFile || activeFile.isDiff || !activeFile.path) {
      setBaseContent(null)
      currentPathRef.current = null
      return
    }

    if (activeFile.path.startsWith('settings://') || activeFile.path.startsWith('welcome://')) {
      setBaseContent(null)
      currentPathRef.current = null
      return
    }

    let isMounted = true
    currentPathRef.current = activeFile.path

    const fetchBaseline = async () => {
      // If activeFile already has originalContent specified (e.g. from diff or git)
      if (activeFile.originalContent !== undefined && activeFile.originalContent !== null) {
        if (isMounted) setBaseContent(activeFile.originalContent)
        return
      }

      if (currentDir) {
        try {
          const diffData = await safeInvoke<{
            original_content: string
            modified_content: string
          }>('git_get_file_diff', {
            cwd: currentDir,
            file: activeFile.path,
            staged: false,
          })

          if (isMounted && currentPathRef.current === activeFile.path) {
            if (diffData?.original_content !== undefined) {
              setBaseContent(diffData.original_content)
              return
            }
          }
        } catch {
          // Non-git file or git call failed
        }
      }

      // Fallback: Use initial loaded content as baseline
      if (isMounted && currentPathRef.current === activeFile.path) {
        setBaseContent(activeFile.content ?? '')
      }
    }

    fetchBaseline()

    return () => {
      isMounted = false
    }
  }, [activeFile?.path, currentDir, activeFile?.originalContent])

  // 2. Compute and apply Monaco change decorations in gutter and scrollbar overview ruler
  useEffect(() => {
    const editor = editorInstanceRef.current
    if (!editor || !activeFile || baseContent === null) {
      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.clear()
      }
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).monaco
    if (!monaco) return

    const currentContent = activeFile.content ?? ''
    const lineChanges = computeLineDiff(baseContent, currentContent)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newDecorations: any[] = []

    for (const change of lineChanges) {
      if (change.type === 'added') {
        newDecorations.push({
          range: new monaco.Range(change.startLine, 1, change.endLine, 1),
          options: {
            isWholeLine: true,
            linesDecorationsClassName: 'git-gutter-added',
            overviewRuler: {
              color: 'rgba(34, 197, 94, 0.9)', // Green #22c55e
              position: monaco.editor.OverviewRulerLane.Right,
            },
            minimap: {
              color: 'rgba(34, 197, 94, 0.9)',
              position: monaco.editor.MinimapPosition.Inline,
            },
          },
        })
      } else if (change.type === 'modified') {
        newDecorations.push({
          range: new monaco.Range(change.startLine, 1, change.endLine, 1),
          options: {
            isWholeLine: true,
            linesDecorationsClassName: 'git-gutter-modified',
            overviewRuler: {
              color: 'rgba(59, 130, 246, 0.9)', // Blue #3b82f6
              position: monaco.editor.OverviewRulerLane.Right,
            },
            minimap: {
              color: 'rgba(59, 130, 246, 0.9)',
              position: monaco.editor.MinimapPosition.Inline,
            },
          },
        })
      } else if (change.type === 'deleted') {
        const lineCount = editor.getModel()?.getLineCount() || 1
        const targetLine = Math.max(1, Math.min(change.startLine, lineCount))
        newDecorations.push({
          range: new monaco.Range(targetLine, 1, targetLine, 1),
          options: {
            isWholeLine: true,
            linesDecorationsClassName: 'git-gutter-deleted',
            overviewRuler: {
              color: 'rgba(239, 68, 68, 0.9)', // Red #ef4444
              position: monaco.editor.OverviewRulerLane.Right,
            },
            minimap: {
              color: 'rgba(239, 68, 68, 0.9)',
              position: monaco.editor.MinimapPosition.Inline,
            },
          },
        })
      }
    }

    if (!decorationsCollectionRef.current) {
      decorationsCollectionRef.current = editor.createDecorationsCollection(newDecorations)
    } else {
      decorationsCollectionRef.current.set(newDecorations)
    }

    return () => {
      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.clear()
      }
    }
  }, [activeFile?.content, baseContent, editorInstanceRef, activeFile])
}
