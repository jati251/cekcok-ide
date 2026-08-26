import { useCallback } from 'react'
import { registerMonacoThemes } from '@/utils/themes'
import { useIDEStore, FileNode } from '@/store/useIDEStore'

export const useMonacoSetup = (
  activeFile: FileNode | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstanceRef: React.MutableRefObject<any>
) => {
  const { saveFile } = useIDEStore()

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

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        saveFile(activeFile.path)
      }
    })
  }, [activeFile, editorInstanceRef, saveFile])

  return { handleEditorMount }
}
