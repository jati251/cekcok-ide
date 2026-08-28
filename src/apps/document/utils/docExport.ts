import { toast } from 'react-hot-toast'
import { BlockNoteEditor } from '@blocknote/core'
import { safeInvoke } from '../../../utils/tauriBridge'

async function saveFileNatively(defaultFileName: string, content: string, filters: { name: string; extensions: string[] }[]) {
  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const filePath = await save({
      defaultPath: defaultFileName,
      filters,
      title: 'Save Document As',
    })

    if (filePath && typeof filePath === 'string') {
      await safeInvoke('write_file', { path: filePath, content })
      toast.success(`Saved successfully to ${filePath.split(/[/\\]/).pop()}`)
      return filePath
    }
  } catch (err) {
    console.warn('Native save dialog failed or cancelled, falling back to download:', err)
    // Fallback for non-Tauri / web preview
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultFileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${defaultFileName}`)
  }
}

export async function exportDocumentMarkdown(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const md = await editor.blocksToMarkdownLossy(editor.document)
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.md'
    await saveFileNatively(name, md, [{ name: 'Markdown', extensions: ['md', 'markdown'] }])
  } catch (e) {
    console.error(e)
    toast.error('Failed to export markdown.')
  }
}

export async function exportDocumentHTML(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const html = await editor.blocksToHTMLLossy(editor.document)
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; font-size: 12pt; }
      @page { margin: 15mm; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #1e293b;
    }
    h1, h2, h3, h4, h5, h6 { color: #0f172a; margin-top: 1.5em; }
    pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #f1f5f9; padding: 2px 5px; border-radius: 4px; }
    blockquote { border-left: 4px solid #cbd5e1; margin-left: 0; padding-left: 1rem; color: #475569; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.html'
    await saveFileNatively(name, fullHtml, [{ name: 'HTML Document', extensions: ['html', 'htm'] }])
  } catch (e) {
    console.error(e)
    toast.error('Failed to export HTML.')
  }
}

export async function exportDocumentText(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const md = await editor.blocksToMarkdownLossy(editor.document)
    const plainText = md.replace(/[#*`_~]/g, '')
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.txt'
    await saveFileNatively(name, plainText, [{ name: 'Plain Text', extensions: ['txt'] }])
  } catch (e) {
    console.error(e)
    toast.error('Failed to export plain text.')
  }
}

export async function exportDocumentJSON(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const json = JSON.stringify(editor.document, null, 2)
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.json'
    await saveFileNatively(name, json, [{ name: 'JSON Document', extensions: ['json'] }])
  } catch (e) {
    console.error(e)
    toast.error('Failed to export JSON blocks.')
  }
}

export function printDocument() {
  window.print()
}

