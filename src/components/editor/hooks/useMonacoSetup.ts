import { useCallback } from 'react'
import { registerMonacoThemes } from '@/utils/themes'
import { useIDEStore, FileNode } from '@/store/useIDEStore'
import { DiagnosticItem } from '@/types/panel'

export const useMonacoSetup = (
  activeFile: FileNode | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstanceRef: React.MutableRefObject<any>
) => {
  const { saveFile, setDiagnostics } = useIDEStore()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorInstanceRef.current = editor
    registerMonacoThemes(monaco)

    // Configure TypeScript to support React/JSX and suppress false-positive missing module errors
    if (monaco.languages.typescript && monaco.languages.typescript.typescriptDefaults) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      })

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      })
    }

    // Sync Monaco real-time error & warning markers with Problems panel and Status Bar
    if (monaco.editor?.onDidChangeMarkers) {
      monaco.editor.onDidChangeMarkers(() => {
        const allMarkers = monaco.editor.getModelMarkers({})
        const items: DiagnosticItem[] = allMarkers.map((m: any) => ({
          id: `${m.resource.toString()}-${m.startLineNumber}-${m.startColumn}-${m.message}`,
          file: m.resource.path || m.resource.fsPath || m.resource.toString(),
          message: m.message,
          severity: m.severity === 8 ? 'error' : m.severity === 4 ? 'warning' : 'info',
          line: m.startLineNumber,
          col: m.startColumn,
          source: m.source || 'monaco',
        }))
        setDiagnostics(items)
      })
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        saveFile(activeFile.path)
      }
    })
  }, [activeFile, editorInstanceRef, saveFile, setDiagnostics])

  return { handleEditorMount }
}
