import * as XLSX from 'xlsx'

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
        const rawVal = v?.v !== undefined ? v.v : (typeof v === 'string' || typeof v === 'number' ? v : '')
        const formula = v?.f ? String(v.f).replace(/^=/, '') : undefined

        const cellObj: XLSX.CellObject = {
          t: typeof rawVal === 'number' ? 'n' : typeof rawVal === 'boolean' ? 'b' : 's',
          v: rawVal,
        }

        if (formula) {
          cellObj.f = formula
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

    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31))
  })

  return wb
}

/**
 * Parses an ArrayBuffer or binary string into FortuneSheet data structure
 */
export function xlsxToFortune(buffer: ArrayBuffer | Uint8Array): FortuneSheetData[] {
  const wb = XLSX.read(buffer, { type: 'array', cellFormula: true, cellStyles: true })
  const result: FortuneSheetData[] = []

  wb.SheetNames.forEach((name, idx) => {
    const ws = wb.Sheets[name]
    const celldata: FortuneCell[] = []
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z60')

    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        const cell = ws[cellRef]
        if (cell && cell.v !== undefined) {
          celldata.push({
            r,
            c,
            v: {
              v: cell.v,
              m: String(cell.w || cell.v),
              f: cell.f ? `=${cell.f}` : undefined,
              ct: { fa: 'General', t: cell.t === 'n' ? 'n' : 'g' },
            },
          })
        }
      }
    }

    result.push({
      name,
      id: `sheet_${idx + 1}`,
      order: idx,
      status: idx === 0 ? 1 : 0,
      row: Math.max(60, range.e.r + 15),
      column: Math.max(26, range.e.c + 5),
      celldata,
    })
  })

  return result.length > 0 ? result : createDefaultSpreadsheetData()
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
      const { safeInvoke } = await import('./tauriBridge')
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      await safeInvoke('write_file_bytes', { path: filePath, bytes: Array.from(new Uint8Array(buffer)) })
      const { toast } = await import('react-hot-toast')
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
      const { safeInvoke } = await import('./tauriBridge')
      await safeInvoke('write_file', { path: filePath, content: csv })
      const { toast } = await import('react-hot-toast')
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
