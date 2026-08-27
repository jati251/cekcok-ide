import { toast } from 'react-hot-toast'
import { BlockNoteEditor } from '@blocknote/core'

export async function exportDocumentMarkdown(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const md = await editor.blocksToMarkdownLossy(editor.document)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.md'
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${name}`)
  } catch (e) {
    console.error(e)
    toast.error('Failed to export markdown.')
  }
}

export async function exportDocumentHTML(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const html = await editor.blocksToHTMLLossy(editor.document)
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1e293b;}</style></head><body>${html}</body></html>`
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.html'
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${name}`)
  } catch (e) {
    console.error(e)
    toast.error('Failed to export HTML.')
  }
}

export async function exportDocumentText(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const md = await editor.blocksToMarkdownLossy(editor.document)
    // Strip simple markdown tags for plain text
    const plainText = md.replace(/[#*`_~]/g, '')
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.txt'
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${name}`)
  } catch (e) {
    console.error(e)
    toast.error('Failed to export plain text.')
  }
}

export function exportDocumentJSON(editor: BlockNoteEditor | null, docTitle: string) {
  if (!editor) return
  try {
    const json = JSON.stringify(editor.document, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = docTitle.replace(/\.(md|txt|html|json)$/i, '') + '.json'
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${name}`)
  } catch (e) {
    console.error(e)
    toast.error('Failed to export JSON blocks.')
  }
}

export function printDocument() {
  window.print()
}
