import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'
import { safeInvoke } from './tauriBridge'

export interface FortuneCell {
  r: number
  c: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  v: any
}

export interface FortuneSheetData {
  name: string
  id?: string
  order?: number
  status?: number
  row?: number
  column?: number
  celldata?: FortuneCell[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[][]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calcChain?: any[]
}

/**
 * Creates default starter data for a new spreadsheet workbook
 */
export function createDefaultSpreadsheetData(): FortuneSheetData[] {
  return [
    {
      name: 'Sheet1',
      id: 'sheet_01',
      order: 0,
      status: 1,
      row: 60,
      column: 26,
      config: {
        columnlen: { 0: 150, 1: 110, 2: 130, 3: 130 },
      },
      celldata: [
        { r: 0, c: 0, v: { v: 'Product / Item', m: 'Product / Item', bg: '#f1f5f9', bl: 1 } },
        { r: 0, c: 1, v: { v: 'Quantity', m: 'Quantity', bg: '#f1f5f9', bl: 1, ht: 1 } },
        { r: 0, c: 2, v: { v: 'Price ($)', m: 'Price ($)', bg: '#f1f5f9', bl: 1, ht: 1 } },
        { r: 0, c: 3, v: { v: 'Total ($)', m: 'Total ($)', bg: '#f1f5f9', bl: 1, ht: 1 } },
        { r: 1, c: 0, v: { v: 'Cekcok Pro License', m: 'Cekcok Pro License' } },
        { r: 1, c: 1, v: { v: 5, m: '5', ht: 1 } },
        { r: 1, c: 2, v: { v: 49, m: '49', ht: 1 } },
        { r: 1, c: 3, v: { v: 245, f: '=B2*C2', m: '245', ht: 1 } },
        { r: 2, c: 0, v: { v: 'Cloud Sync Storage', m: 'Cloud Sync Storage' } },
        { r: 2, c: 1, v: { v: 2, m: '2', ht: 1 } },
        { r: 2, c: 2, v: { v: 120, m: '120', ht: 1 } },
        { r: 2, c: 3, v: { v: 240, f: '=B3*C3', m: '240', ht: 1 } },
        { r: 3, c: 0, v: { v: 'Grand Total', m: 'Grand Total', bl: 1, bg: '#e0f2fe' } },
        { r: 3, c: 1, v: { v: '', m: '', bg: '#e0f2fe' } },
        { r: 3, c: 2, v: { v: '', m: '', bg: '#e0f2fe' } },
        { r: 3, c: 3, v: { v: 485, f: '=SUM(D2:D3)', m: '485', bl: 1, bg: '#e0f2fe', ht: 1 } },
      ],
    },
  ]
}

/**
 * Converts a SheetJS color representation to standard Hex CSS color.
 */
function parseXlsxColor(colorObj: any): string | undefined {
  if (!colorObj) return undefined
  if (typeof colorObj === 'string') {
    if (colorObj.startsWith('#')) return colorObj
    return `#${colorObj}`
  }
  if (colorObj.rgb) {
    const rawRgb = String(colorObj.rgb).trim()
    if (rawRgb.length === 8) {
      // Strips alpha prefix e.g. "FFFF0000" -> "#FF0000"
      return `#${rawRgb.substring(2)}`
    }
    if (rawRgb.length === 6) {
      return `#${rawRgb}`
    }
  }
  return undefined
}

/**
 * Converts FortuneSheet workbook data into an XLSX Workbook object
 */
export function fortuneToXLSX(sheets: FortuneSheetData[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()

  sheets.forEach((sheet) => {
    const sheetName = sheet.name || 'Sheet'
    const ws: XLSX.WorkSheet = {}
    let maxR = 0
    let maxC = 0

    if (sheet.celldata && sheet.celldata.length > 0) {
      sheet.celldata.forEach((cell) => {
        const { r, c, v } = cell
        if (r > maxR) maxR = r
        if (c > maxC) maxC = c

        const cellRef = XLSX.utils.encode_cell({ r, c })
        const rawVal = v?.v !== undefined ? v.v : typeof v === 'string' || typeof v === 'number' ? v : ''
        const formula = v?.f ? String(v.f).replace(/^=/, '') : undefined

        const cellObj: XLSX.CellObject = {
          t: typeof rawVal === 'number' ? 'n' : typeof rawVal === 'boolean' ? 'b' : 's',
          v: rawVal,
        }

        if (formula) {
          cellObj.f = formula
        }

        // Preserve formatting & styles back to SheetJS
        const style: any = {}
        if (v?.bl || v?.it || v?.fc || v?.fs || v?.ff) {
          style.font = {
            name: v.ff || undefined,
            sz: v.fs || undefined,
            bold: !!v.bl,
            italic: !!v.it,
            color: v.fc ? { rgb: v.fc.replace(/^#/, '') } : undefined,
          }
        }
        if (v?.bg) {
          style.fill = {
            fgColor: { rgb: v.bg.replace(/^#/, '') },
          }
        }
        if (v?.ht !== undefined || v?.vt !== undefined || v?.tb) {
          style.alignment = {
            horizontal: v.ht === 0 ? 'center' : v.ht === 2 ? 'right' : 'left',
            vertical: v.vt === 1 ? 'top' : v.vt === 2 ? 'bottom' : 'center',
            wrapText: v.tb === 2,
          }
        }
        if (Object.keys(style).length > 0) {
          cellObj.s = style
        }

        ws[cellRef] = cellObj
      })
    } else if (sheet.data && sheet.data.length > 0) {
      sheet.data.forEach((rowArr, r) => {
        if (!rowArr) return
        rowArr.forEach((cell, c) => {
          if (!cell) return
          if (r > maxR) maxR = r
          if (c > maxC) maxC = c

          const cellRef = XLSX.utils.encode_cell({ r, c })
          const rawVal = cell.v !== undefined ? cell.v : cell
          const formula = cell.f ? String(cell.f).replace(/^=/, '') : undefined

          const cellObj: XLSX.CellObject = {
            t: typeof rawVal === 'number' ? 'n' : typeof rawVal === 'boolean' ? 'b' : 's',
            v: rawVal,
          }
          if (formula) cellObj.f = formula
          ws[cellRef] = cellObj
        })
      })
    }

    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(maxR, 10), c: Math.max(maxC, 10) },
    })

    // Convert FortuneSheet merge back to SheetJS !merges
    if (sheet.config?.merge) {
      const merges: XLSX.Range[] = []
      Object.values(sheet.config.merge).forEach((m: any) => {
        if (m && typeof m.r === 'number' && typeof m.c === 'number') {
          merges.push({
            s: { r: m.r, c: m.c },
            e: { r: m.r + (m.rs || 1) - 1, c: m.c + (m.cs || 1) - 1 },
          })
        }
      })
      if (merges.length > 0) {
        ws['!merges'] = merges
      }
    }

    // Convert FortuneSheet columnlen back to !cols
    if (sheet.config?.columnlen) {
      const cols: any[] = []
      Object.entries(sheet.config.columnlen).forEach(([cStr, px]) => {
        const c = parseInt(cStr, 10)
        cols[c] = { wpx: Number(px) }
      })
      if (cols.length > 0) {
        ws['!cols'] = cols
      }
    }

    // Convert FortuneSheet rowlen back to !rows
    if (sheet.config?.rowlen) {
      const rows: any[] = []
      Object.entries(sheet.config.rowlen).forEach(([rStr, px]) => {
        const r = parseInt(rStr, 10)
        rows[r] = { hpx: Number(px) }
      })
      if (rows.length > 0) {
        ws['!rows'] = rows
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31))
  })

  return wb
}

export const SUPPORTED_SPREADSHEET_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.tsv'] as const

/**
 * Validates if a given filename or path has a supported spreadsheet format.
 */
export function validateSpreadsheetExtension(filename: string): { valid: boolean; ext: string; error?: string } {
  if (!filename) {
    return { valid: false, ext: '', error: 'Nama file tidak boleh kosong.' }
  }

  const dotIdx = filename.lastIndexOf('.')
  if (dotIdx === -1) {
    return {
      valid: false,
      ext: '',
      error: 'File tidak memiliki ekstensi. Hanya mendukung format Excel (.xlsx, .xls) dan CSV/TSV.',
    }
  }

  const ext = filename.substring(dotIdx).toLowerCase()
  const isSupported = (SUPPORTED_SPREADSHEET_EXTENSIONS as readonly string[]).includes(ext)

  if (!isSupported) {
    return {
      valid: false,
      ext,
      error: `Format file "${ext}" tidak didukung. Cekcok Spreadsheet hanya mendukung file Excel (.xlsx, .xls) dan CSV/TSV.`,
    }
  }

  return { valid: true, ext }
}

/**
 * Parses an ArrayBuffer, Uint8Array, or string into FortuneSheet data structure with full styling, merged cells, and auto-sized column widths.
 */
export function xlsxToFortune(bufferOrData: ArrayBuffer | Uint8Array | string): FortuneSheetData[] {
  try {
    const isString = typeof bufferOrData === 'string'
    const wb = isString
      ? XLSX.read(bufferOrData, { type: 'string', raw: false, cellFormula: true, cellStyles: true, cellNF: true, cellDates: true })
      : XLSX.read(bufferOrData, { type: 'array', cellFormula: true, cellStyles: true, cellNF: true, cellDates: true })

    if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
      throw new Error('Workbook tidak memiliki sheet.')
    }

    const result: FortuneSheetData[] = []

    wb.SheetNames.forEach((name, idx) => {
      const ws = wb.Sheets[name]
      if (!ws) return

      const celldata: FortuneCell[] = []
      const ref = ws['!ref'] || 'A1:Z60'
      let range = { s: { r: 0, c: 0 }, e: { r: 59, c: 25 } }

      try {
        range = XLSX.utils.decode_range(ref)
      } catch (e) {
        console.warn(`Could not decode range "${ref}" for sheet ${name}:`, e)
      }

      // 1. Process Merged Cells
      const mergeConfig: Record<string, { r: number; c: number; rs: number; cs: number }> = {}
      if (Array.isArray(ws['!merges'])) {
        ws['!merges'].forEach((m: XLSX.Range) => {
          const key = `${m.s.r}_${m.s.c}`
          mergeConfig[key] = {
            r: m.s.r,
            c: m.s.c,
            rs: m.e.r - m.s.r + 1,
            cs: m.e.c - m.s.c + 1,
          }
        })
      }

      // 2. Process Column Widths & Content-based Sizing
      const columnlen: Record<string, number> = {}
      if (Array.isArray(ws['!cols'])) {
        ws['!cols'].forEach((col: any, cIdx: number) => {
          if (col) {
            if (col.wpx) {
              columnlen[String(cIdx)] = Math.max(50, Math.round(col.wpx))
            } else if (col.wch) {
              columnlen[String(cIdx)] = Math.max(50, Math.round(col.wch * 8.5 + 16))
            } else if (col.width) {
              columnlen[String(cIdx)] = Math.max(50, Math.round(col.width * 8.5 + 16))
            }
          }
        })
      }

      // Track max content length per column for intelligent auto-fit
      const colMaxLengths: Record<number, number> = {}

      // 3. Process Row Heights
      const rowlen: Record<string, number> = {}
      if (Array.isArray(ws['!rows'])) {
        ws['!rows'].forEach((row: any, rIdx: number) => {
          if (row) {
            if (row.hpx) {
              rowlen[String(rIdx)] = Math.max(22, Math.round(row.hpx))
            } else if (row.hpt) {
              rowlen[String(rIdx)] = Math.max(22, Math.round(row.hpt * 1.33))
            }
          }
        })
      }

      // 4. Iterate and construct cells with complete styling
      for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c })
          const cell = ws[cellRef]
          if (cell && cell.v !== undefined && cell.v !== null) {
            const rawVal = cell.v
            const formattedVal = cell.w !== undefined ? String(cell.w) : String(rawVal)
            const formula = cell.f ? (String(cell.f).startsWith('=') ? String(cell.f) : `=${cell.f}`) : undefined

            // Estimate column length if not in a multi-col merge
            const isMergedChild = Array.isArray(ws['!merges']) && ws['!merges'].some((m: XLSX.Range) =>
              r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c && (m.s.c !== m.e.c)
            )
            if (!isMergedChild && formattedVal.length > 0) {
              colMaxLengths[c] = Math.max(colMaxLengths[c] || 0, formattedVal.length)
            }

            // Extract Cell Styles
            const style = cell.s || {}
            const font = style.font || {}
            const fill = style.fill || {}
            const alignment = style.alignment || {}

            const isBold = font.bold ? 1 : 0
            const isItalic = font.italic ? 1 : 0
            const fontSize = font.sz ? Math.round(font.sz) : undefined
            const fontFamily = font.name || undefined
            const fontColor = parseXlsxColor(font.color)
            const bgColor = parseXlsxColor(fill.fgColor || fill.bgColor)

            // Horizontal alignment: 0=center, 1=left, 2=right
            let ht: number | undefined = undefined
            if (alignment.horizontal === 'center') ht = 0
            else if (alignment.horizontal === 'right') ht = 2
            else if (alignment.horizontal === 'left') ht = 1
            else if (typeof rawVal === 'number') ht = 2

            // Vertical alignment: 0=middle, 1=top, 2=bottom
            let vt: number | undefined = undefined
            if (alignment.vertical === 'top') vt = 1
            else if (alignment.vertical === 'bottom') vt = 2
            else if (alignment.vertical === 'center') vt = 0

            // Text wrap
            const tb = alignment.wrapText ? 2 : 1

            // Merge metadata for the top-left cell
            const mergeKey = `${r}_${c}`
            const mergeInfo = mergeConfig[mergeKey]

            celldata.push({
              r,
              c,
              v: {
                v: rawVal,
                m: formattedVal,
                f: formula,
                bl: isBold,
                it: isItalic,
                fs: fontSize,
                ff: fontFamily,
                fc: fontColor,
                bg: bgColor,
                ht,
                vt,
                tb,
                mc: mergeInfo ? { r, c, rs: mergeInfo.rs, cs: mergeInfo.cs } : undefined,
                ct: { fa: cell.z || 'General', t: cell.t === 'n' ? 'n' : cell.t === 'b' ? 'b' : 'g' },
              },
            })
          }
        }
      }

      // 5. Ensure column widths fit cell contents so text is not cut off
      Object.entries(colMaxLengths).forEach(([cStr, maxLen]) => {
        const c = parseInt(cStr, 10)
        const autoPx = Math.min(400, Math.max(75, Math.round(maxLen * 8.8 + 24)))
        if (!columnlen[String(c)] || columnlen[String(c)] < autoPx * 0.85) {
          columnlen[String(c)] = autoPx
        }
      })

      result.push({
        name: name.substring(0, 31),
        id: `sheet_${Date.now()}_${idx + 1}`,
        order: idx,
        status: idx === 0 ? 1 : 0,
        row: Math.max(60, range.e.r + 20),
        column: Math.max(26, range.e.c + 10),
        config: {
          merge: mergeConfig,
          columnlen,
          rowlen,
        },
        celldata,
      })
    })

    return result.length > 0 ? result : createDefaultSpreadsheetData()
  } catch (error) {
    console.error('Error parsing spreadsheet data:', error)
    throw error
  }
}

/**
 * Downloads data as XLSX file in browser / webview or saves natively
 */
export async function downloadWorkbookAsXLSX(sheets: FortuneSheetData[], filename = 'Spreadsheet.xlsx') {
  const wb = fortuneToXLSX(sheets)
  const defaultName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`

  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const filePath = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }],
      title: 'Save Spreadsheet As',
    })

    if (filePath && typeof filePath === 'string') {
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      await safeInvoke('write_file_bytes', { path: filePath, bytes: Array.from(new Uint8Array(buffer)) })
      toast.success(`Saved Excel workbook to ${filePath.split(/[/\\]/).pop()}`)
      return filePath
    }
  } catch (err) {
    console.warn('Native XLSX save dialog failed or cancelled, falling back to browser download:', err)
    XLSX.writeFile(wb, defaultName)
  }
}

/**
 * Downloads active sheet as CSV file or saves natively
 */
export async function downloadActiveSheetAsCSV(sheets: FortuneSheetData[], filename = 'Spreadsheet.csv') {
  const activeSheet = sheets.find((s) => s.status === 1) || sheets[0]
  const wb = fortuneToXLSX([activeSheet])
  const ws = wb.Sheets[wb.SheetNames[0]]
  const csv = XLSX.utils.sheet_to_csv(ws)
  const defaultName = filename.endsWith('.csv') ? filename : `${filename}.csv`

  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const filePath = await save({
      defaultPath: defaultName,
      filters: [{ name: 'CSV (Comma delimited)', extensions: ['csv'] }],
      title: 'Export Active Sheet As CSV',
    })

    if (filePath && typeof filePath === 'string') {
      await safeInvoke('write_file', { path: filePath, content: csv })
      toast.success(`Saved CSV to ${filePath.split(/[/\\]/).pop()}`)
      return filePath
    }
  } catch (err) {
    console.warn('Native CSV save dialog failed or cancelled, falling back to browser download:', err)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultName
    a.click()
    URL.revokeObjectURL(url)
  }
}
