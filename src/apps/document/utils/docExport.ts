import { toast } from 'react-hot-toast'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { safeInvoke } from '../../../utils/tauriBridge'

export const SUPPORTED_DOC_EXTENSIONS = [
  '.docx',
  '.md',
  '.markdown',
  '.mdown',
  '.mkdn',
  '.txt',
  '.text',
  '.log',
  '.json',
  '.html',
  '.htm',
] as const

/**
 * Validates if a given file has a supported document extension with strict checking.
 */
export function validateDocumentExtension(filename: string): { valid: boolean; ext: string; error?: string } {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, ext: '', error: 'Nama file tidak boleh kosong.' }
  }

  const dotIdx = filename.lastIndexOf('.')
  if (dotIdx === -1) {
    return {
      valid: false,
      ext: '',
      error: 'File tidak memiliki ekstensi. Format yang didukung: Microsoft Word (.docx), Markdown (.md), Text (.txt), HTML (.html), JSON (.json).',
    }
  }

  const ext = filename.substring(dotIdx).toLowerCase()
  const isSupported = (SUPPORTED_DOC_EXTENSIONS as readonly string[]).includes(ext)

  if (!isSupported) {
    if (ext === '.doc') {
      return {
        valid: false,
        ext,
        error: `Format "${ext}" adalah format Microsoft Word biner lawas (Word 97-2003). Silakan simpan / konversi ke format .docx modern atau Markdown (.md) untuk dibuka di Cekcok Document.`,
      }
    }
    if (ext === '.pdf') {
      return {
        valid: false,
        ext,
        error: `Format PDF (.pdf) tidak dapat diedit secara langsung. Silakan gunakan format Word (.docx), Markdown (.md), Text (.txt), atau HTML (.html).`,
      }
    }
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv' || ext === '.tsv') {
      return {
        valid: false,
        ext,
        error: `Format "${ext}" adalah file spreadsheet. Silakan buka file ini di aplikasi Cekcok Spreadsheet (Excel).`,
      }
    }
    if (ext === '.tldr') {
      return {
        valid: false,
        ext,
        error: `Format .tldr adalah file diagram sketsa. Silakan buka di aplikasi Cekcok Sketch & Whiteboard.`,
      }
    }

    return {
      valid: false,
      ext,
      error: `Format file "${ext}" tidak didukung. Cekcok Document mendukung file Microsoft Word (.docx), Markdown (.md), Text (.txt), HTML (.html), dan JSON (.json).`,
    }
  }

  return { valid: true, ext }
}

/**
 * Sanitizes block array to ensure valid PartialBlock structure preserving all inline styling.
 */
function sanitizeBlockNoteBlocks(rawBlocks: any[]): PartialBlock[] {
  if (!Array.isArray(rawBlocks)) return []

  const validTypes = new Set([
    'paragraph',
    'heading',
    'bulletListItem',
    'numberedListItem',
    'checkListItem',
    'codeBlock',
    'table',
    'file',
    'image',
    'video',
    'audio',
  ])

  const sanitized: PartialBlock[] = []

  for (const raw of rawBlocks) {
    if (!raw || typeof raw !== 'object') continue

    const type = validTypes.has(raw.type) ? raw.type : 'paragraph'
    const block: any = { type }

    // Preserve custom block properties if present
    if (raw.props && typeof raw.props === 'object') {
      block.props = { ...raw.props }
    }

    // Preserve and sanitize content with styles
    if (type === 'image') {
      const url = raw.props?.url || (typeof raw.content === 'string' ? raw.content : '') || ''
      block.props = {
        ...raw.props,
        url: url || raw.props?.url || '',
        previewWidth: Math.min(raw.props?.previewWidth || 320, 500),
      }
    } else if (type === 'codeBlock') {
      block.content = typeof raw.content === 'string' ? raw.content : (Array.isArray(raw.content) ? raw.content.map((c: any) => c.text || '').join('') : '')
      if (raw.props?.language) {
        block.props = { ...block.props, language: raw.props.language }
      }
    } else if (type === 'table') {
      if (raw.content && typeof raw.content === 'object') {
        block.content = raw.content
      }
    } else if (Array.isArray(raw.content)) {
      block.content = raw.content.map((item: any) => {
        if (typeof item === 'string') {
          return { type: 'text', text: item, styles: {} }
        }
        if (item && typeof item === 'object') {
          if (item.type === 'link') {
            return {
              type: 'link',
              href: item.href || '',
              content: item.content || item.text || item.href || '',
            }
          }
          return {
            type: 'text',
            text: item.text || '',
            styles: {
              ...(item.styles && typeof item.styles === 'object' ? item.styles : {}),
              ...(item.bold ? { bold: true } : {}),
              ...(item.italic ? { italic: true } : {}),
              ...(item.underline ? { underline: true } : {}),
              ...(item.strike || item.strikethrough ? { strike: true } : {}),
              ...(item.code ? { code: true } : {}),
              ...(item.textColor ? { textColor: item.textColor } : {}),
              ...(item.backgroundColor ? { backgroundColor: item.backgroundColor } : {}),
            },
          }
        }
        return { type: 'text', text: String(item ?? ''), styles: {} }
      })
    } else if (typeof raw.content === 'string') {
      block.content = [{ type: 'text', text: raw.content, styles: raw.styles || {} }]
    } else {
      block.content = [{ type: 'text', text: '', styles: {} }]
    }

    // Recursively sanitize children
    if (Array.isArray(raw.children) && raw.children.length > 0) {
      block.children = sanitizeBlockNoteBlocks(raw.children)
    }

    sanitized.push(block)
  }

  return sanitized.length > 0 ? sanitized : [{ type: 'paragraph', content: [{ type: 'text', text: '', styles: {} }] }]
}

/**
 * Converts ProseMirror / TipTap doc JSON tree into BlockNote blocks.
 */
function parseProseMirrorDocToBlocks(doc: any): PartialBlock[] {
  if (!doc || !Array.isArray(doc.content)) return []

  const blocks: PartialBlock[] = []

  for (const node of doc.content) {
    if (!node || typeof node !== 'object') continue

    const parseInlineMarks = (inlineNodes: any[]) => {
      if (!Array.isArray(inlineNodes)) return [{ type: 'text', text: '', styles: {} }]
      return inlineNodes.map((item) => {
        const styles: Record<string, any> = {}
        if (Array.isArray(item.marks)) {
          for (const mark of item.marks) {
            if (mark.type === 'bold') styles.bold = true
            if (mark.type === 'italic') styles.italic = true
            if (mark.type === 'underline') styles.underline = true
            if (mark.type === 'strike') styles.strike = true
            if (mark.type === 'code') styles.code = true
            if (mark.type === 'textStyle' && mark.attrs?.color) styles.textColor = mark.attrs.color
            if (mark.type === 'highlight' && mark.attrs?.color) styles.backgroundColor = mark.attrs.color
          }
        }
        return {
          type: 'text',
          text: item.text || '',
          styles,
        }
      })
    }

    switch (node.type) {
      case 'heading': {
        const level = Math.min(3, Math.max(1, node.attrs?.level || 1)) as 1 | 2 | 3
        blocks.push({
          type: 'heading',
          props: { level },
          content: parseInlineMarks(node.content),
        } as any)
        break
      }
      case 'bulletList':
      case 'bullet_list': {
        if (Array.isArray(node.content)) {
          for (const item of node.content) {
            const itemContent = item.content?.[0]?.content || item.content || []
            blocks.push({
              type: 'bulletListItem',
              content: parseInlineMarks(itemContent),
            } as any)
          }
        }
        break
      }
      case 'orderedList':
      case 'ordered_list': {
        if (Array.isArray(node.content)) {
          for (const item of node.content) {
            const itemContent = item.content?.[0]?.content || item.content || []
            blocks.push({
              type: 'numberedListItem',
              content: parseInlineMarks(itemContent),
            } as any)
          }
        }
        break
      }
      case 'codeBlock':
      case 'code_block': {
        const codeText = Array.isArray(node.content) ? node.content.map((c: any) => c.text || '').join('') : (node.text || '')
        blocks.push({
          type: 'codeBlock',
          props: { language: node.attrs?.language || 'typescript' },
          content: codeText,
        } as any)
        break
      }
      default: {
        blocks.push({
          type: 'paragraph',
          content: parseInlineMarks(node.content),
        } as any)
        break
      }
    }
  }

  return sanitizeBlockNoteBlocks(blocks)
}

/**
 * Universal JSON parser that handles BlockNote arrays, wrapped objects, ProseMirror JSON, and converts arbitrary JSON into structured document blocks.
 */
function parseJsonToBlocks(content: string): PartialBlock[] {
  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch (err) {
    throw new Error(`Format JSON tidak valid: ${(err as Error).message}`, { cause: err })
  }

  // 1. Direct array of BlockNote blocks
  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && (parsed[0].type || parsed[0].content)) {
      return sanitizeBlockNoteBlocks(parsed)
    }
  }

  // 2. Wrapped document object (e.g. { blocks: [...] } or { document: [...] } or { content: [...] })
  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.blocks)) {
      return sanitizeBlockNoteBlocks(parsed.blocks)
    }
    if (Array.isArray(parsed.document)) {
      return sanitizeBlockNoteBlocks(parsed.document)
    }
    if (Array.isArray(parsed.content)) {
      return sanitizeBlockNoteBlocks(parsed.content)
    }
    if (Array.isArray(parsed.data)) {
      return sanitizeBlockNoteBlocks(parsed.data)
    }

    // 3. ProseMirror / TipTap doc
    if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
      const pmBlocks = parseProseMirrorDocToBlocks(parsed)
      if (pmBlocks.length > 0) return pmBlocks
    }
  }

  // 4. Transform arbitrary JSON / workflows into structured, human-readable document blocks
  return convertJsonToStructuredBlocks(parsed)
}

/**
 * Converts arbitrary JSON data into structured headings, bullet items, and formatted document blocks.
 */
function convertJsonToStructuredBlocks(parsed: any): PartialBlock[] {
  function processValue(val: any, prefix = ''): PartialBlock[] {
    const list: PartialBlock[] = []
    if (val === null || val === undefined) {
      list.push({
        type: 'paragraph',
        content: [{ type: 'text', text: `${prefix}null`, styles: { italic: true } }],
      } as any)
      return list
    }

    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      list.push({
        type: 'paragraph',
        content: [
          ...(prefix ? [{ type: 'text', text: `${prefix}: `, styles: { bold: true } }] : []),
          { type: 'text', text: String(val), styles: {} },
        ],
      } as any)
      return list
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        list.push({
          type: 'bulletListItem',
          content: [{ type: 'text', text: `${prefix}: []`, styles: {} }],
        } as any)
        return list
      }

      // Check if array of primitives
      if (val.every((item) => typeof item !== 'object' || item === null)) {
        list.push({
          type: 'bulletListItem',
          content: [
            ...(prefix ? [{ type: 'text', text: `${prefix}: `, styles: { bold: true } }] : []),
            { type: 'text', text: `[ ${val.join(', ')} ]`, styles: { code: true } },
          ],
        } as any)
        return list
      }

      // Array of objects (like workflow nodes, items, etc.)
      for (let i = 0; i < val.length; i++) {
        const item = val[i]
        if (item && typeof item === 'object') {
          const itemTitle = item.name || item.type || item.title || item.id || `Item #${i + 1}`
          list.push({
            type: 'heading',
            props: { level: 3 },
            content: [{ type: 'text', text: `${itemTitle} ${item.id && item.name ? `(#${item.id})` : ''}`, styles: { bold: true } }],
          } as any)

          for (const [k, v] of Object.entries(item)) {
            if (typeof v === 'object' && v !== null) {
              list.push({
                type: 'bulletListItem',
                content: [
                  { type: 'text', text: `${k}: `, styles: { bold: true } },
                  { type: 'text', text: JSON.stringify(v), styles: { code: true } },
                ],
              } as any)
            } else {
              list.push({
                type: 'bulletListItem',
                content: [
                  { type: 'text', text: `${k}: `, styles: { bold: true } },
                  { type: 'text', text: String(v), styles: {} },
                ],
              } as any)
            }
          }
        } else {
          list.push({
            type: 'bulletListItem',
            content: [{ type: 'text', text: String(item), styles: {} }],
          } as any)
        }
      }
      return list
    }

    if (typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        if (typeof v === 'object' && v !== null && Array.isArray(v)) {
          list.push({
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: `${k} (${v.length} items)`, styles: { bold: true } }],
          } as any)
          list.push(...processValue(v))
        } else if (typeof v === 'object' && v !== null) {
          list.push({
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: k, styles: { bold: true } }],
          } as any)
          for (const [subK, subV] of Object.entries(v)) {
            list.push({
              type: 'bulletListItem',
              content: [
                { type: 'text', text: `${subK}: `, styles: { bold: true } },
                { type: 'text', text: typeof subV === 'object' ? JSON.stringify(subV) : String(subV), styles: {} },
              ],
            } as any)
          }
        } else {
          list.push({
            type: 'bulletListItem',
            content: [
              { type: 'text', text: `${k}: `, styles: { bold: true } },
              { type: 'text', text: String(v), styles: {} },
            ],
          } as any)
        }
      }
      return list
    }

    return list
  }

  const generated = processValue(parsed)
  return sanitizeBlockNoteBlocks(generated.length > 0 ? generated : [{ type: 'paragraph', content: [{ type: 'text', text: '', styles: {} }] }])
}

/**
 * Converts an HTML DOM element and its children into BlockNote inline content objects preserving all styles.
 */
function convertHtmlNodeToInlineContent(node: Node): any[] {
  const result: any[] = []

  function walk(n: Node, activeStyles: Record<string, any>) {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.textContent || ''
      if (text) {
        result.push({
          type: 'text',
          text,
          styles: { ...activeStyles },
        })
      }
      return
    }

    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement
      const tagName = el.tagName.toLowerCase()

      if (tagName === 'br') {
        result.push({ type: 'text', text: '\n', styles: { ...activeStyles } })
        return
      }

      const styles = { ...activeStyles }
      if (tagName === 'strong' || tagName === 'b' || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight, 10) >= 600) {
        styles.bold = true
      }
      if (tagName === 'em' || tagName === 'i' || el.style.fontStyle === 'italic') {
        styles.italic = true
      }
      if (tagName === 'u' || tagName === 'ins' || el.style.textDecoration?.includes('underline')) {
        styles.underline = true
      }
      if (tagName === 's' || tagName === 'del' || tagName === 'strike' || el.style.textDecoration?.includes('line-through')) {
        styles.strike = true
      }
      if (tagName === 'code' || tagName === 'kbd' || tagName === 'samp') {
        styles.code = true
      }
      if (tagName === 'mark' || el.style.backgroundColor) {
        styles.backgroundColor = el.style.backgroundColor || 'yellow'
      }
      if (el.style.color) {
        styles.textColor = el.style.color
      }

      if (tagName === 'a') {
        const href = (el as HTMLAnchorElement).href || el.getAttribute('href') || '#'
        const linkText = el.textContent || href
        result.push({
          type: 'link',
          href,
          content: linkText,
        })
        return
      }

      for (let i = 0; i < el.childNodes.length; i++) {
        walk(el.childNodes[i], styles)
      }
    }
  }

  walk(node, {})
  return result.length > 0 ? result : [{ type: 'text', text: '', styles: {} }]
}

/**
 * Cleans and converts HTML content into BlockNote blocks with full style preservation.
 */
async function cleanAndParseHTMLToBlocks(editor: BlockNoteEditor, html: string): Promise<PartialBlock[]> {
  try {
    // Extract body if it's a complete HTML document
    let cleanHtml = html
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch && bodyMatch[1]) {
      cleanHtml = bodyMatch[1]
    }

    // Clean out script and style tags
    cleanHtml = cleanHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    const parsedBlocks = await editor.tryParseHTMLToBlocks(cleanHtml)
    if (parsedBlocks && parsedBlocks.length > 0) {
      return sanitizeBlockNoteBlocks(parsedBlocks)
    }
  } catch (err) {
    console.warn('BlockNote tryParseHTMLToBlocks failed, attempting DOM fallback:', err)
  }

  // Robust DOM Parser fallback extracting rich inline styles
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const blocks: PartialBlock[] = []

    const elements = doc.body.children.length > 0 ? Array.from(doc.body.children) : [doc.body]

    for (const el of elements) {
      const tagName = el.tagName.toLowerCase()
      const text = el.textContent?.trim() || ''
      if (!text && !['hr', 'img', 'table'].includes(tagName)) continue

      if (tagName === 'img') {
        const src = (el as HTMLImageElement).src || el.getAttribute('src') || ''
        if (src) {
          blocks.push({
            type: 'image',
            props: {
              url: src,
              previewWidth: 320,
              caption: el.getAttribute('alt') || '',
            },
          } as any)
        }
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const level = (tagName === 'h1' ? 1 : tagName === 'h2' ? 2 : 3) as 1 | 2 | 3
        blocks.push({
          type: 'heading',
          props: { level },
          content: convertHtmlNodeToInlineContent(el),
        } as any)
      } else if (tagName === 'pre' || tagName === 'code') {
        blocks.push({
          type: 'codeBlock',
          props: { language: 'html' },
          content: el.textContent || '',
        } as any)
      } else if (tagName === 'ul' || tagName === 'ol') {
        const listItems = Array.from(el.querySelectorAll('li'))
        for (const li of listItems) {
          blocks.push({
            type: tagName === 'ul' ? 'bulletListItem' : 'numberedListItem',
            content: convertHtmlNodeToInlineContent(li),
          } as any)
        }
      } else if (tagName === 'blockquote') {
        blocks.push({
          type: 'paragraph',
          props: { textColor: 'gray' },
          content: convertHtmlNodeToInlineContent(el),
        } as any)
      } else {
        // If paragraph contains an img, extract img separately
        const embeddedImg = el.querySelector('img')
        if (embeddedImg) {
          const src = embeddedImg.src || embeddedImg.getAttribute('src') || ''
          if (src) {
            blocks.push({
              type: 'image',
              props: {
                url: src,
                previewWidth: 320,
                caption: embeddedImg.getAttribute('alt') || '',
              },
            } as any)
          }
        }

        if (text) {
          blocks.push({
            type: 'paragraph',
            content: convertHtmlNodeToInlineContent(el),
          } as any)
        }
      }
    }

    if (blocks.length > 0) return sanitizeBlockNoteBlocks(blocks)
  } catch (domErr) {
    console.error('DOM Parser fallback failed:', domErr)
  }

  // Fallback to text lines
  return html.split('\n').filter(Boolean).map((line) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: line, styles: {} }],
  }))
}

/**
 * Converts a .docx (Microsoft Word) ArrayBuffer into BlockNote blocks with full styling and properly scaled images.
 */
export async function parseDocxToBlocks(editor: BlockNoteEditor, arrayBuffer: ArrayBuffer): Promise<PartialBlock[]> {
  try {
    const mammothModule: any = await import('mammoth')
    const convertFn = mammothModule.default?.convertToHtml || mammothModule.convertToHtml
    const imagesApi = mammothModule.default?.images || mammothModule.images
    const imagesHandler = imagesApi?.imgElement
      ? imagesApi.imgElement((image: any) => {
          return image.read('base64').then((imageBuffer: string) => ({
            src: `data:${image.contentType};base64,${imageBuffer}`,
          }))
        })
      : undefined

    const result = await convertFn({ arrayBuffer }, imagesHandler ? { convertImage: imagesHandler } : undefined)
    const html = result.value
    if (html && html.trim()) {
      return await cleanAndParseHTMLToBlocks(editor, html)
    }
    throw new Error('Tidak ada konten teks yang dapat diekstrak dari dokumen Word (.docx) ini.')
  } catch (err) {
    console.error('Mammoth .docx conversion failed:', err)
    throw new Error(`Gagal membaca file .docx: ${(err as Error).message || err}`, { cause: err })
  }
}

/**
 * Converts raw file content into BlockNote blocks based on extension with full style preservation.
 */
export async function parseDocumentContent(
  editor: BlockNoteEditor,
  contentOrBuffer: string | ArrayBuffer,
  filename: string
): Promise<PartialBlock[]> {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (ext === 'docx') {
    if (contentOrBuffer instanceof ArrayBuffer) {
      return await parseDocxToBlocks(editor, contentOrBuffer)
    }
    if (typeof contentOrBuffer === 'string') {
      const buffer = new TextEncoder().encode(contentOrBuffer).buffer
      return await parseDocxToBlocks(editor, buffer)
    }
  }

  const content = typeof contentOrBuffer === 'string' ? contentOrBuffer : new TextDecoder().decode(contentOrBuffer)

  if (ext === 'json') {
    return parseJsonToBlocks(content)
  }

  if (ext === 'html' || ext === 'htm') {
    return await cleanAndParseHTMLToBlocks(editor, content)
  }

  // Markdown or plain text (.md, .markdown, .txt, .text, .log)
  try {
    // Strip YAML frontmatter if present
    let cleanMarkdown = content
    if (cleanMarkdown.startsWith('---')) {
      const match = cleanMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
      if (match) {
        cleanMarkdown = cleanMarkdown.substring(match[0].length)
      }
    }

    const blocks = await editor.tryParseMarkdownToBlocks(cleanMarkdown)
    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      return sanitizeBlockNoteBlocks(blocks)
    }
  } catch (err) {
    console.warn('BlockNote tryParseMarkdownToBlocks failed, falling back to line parser:', err)
  }

  // Plain text fallback
  const lines = content.split(/\r?\n/)
  const textBlocks: PartialBlock[] = lines.map((line) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: line, styles: {} }],
  }))

  return textBlocks.length > 0 ? textBlocks : [{ type: 'paragraph', content: [{ type: 'text', text: '', styles: {} }] }]
}

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

