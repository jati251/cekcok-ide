import { FortuneSheetData } from '../../utils/spreadsheetHelper'

export interface SpreadsheetTemplate {
  name: string
  data: FortuneSheetData[]
}

export function getSpreadsheetTemplate(type: 'budget' | 'invoice' | 'grades'): SpreadsheetTemplate {
  if (type === 'budget') {
    return {
      name: 'Monthly Budget 2026.xlsx',
      data: [
        {
          name: 'Budget',
          id: 'sheet_budget',
          order: 0,
          status: 1,
          row: 60,
          column: 26,
          config: { columnlen: { 0: 160, 1: 120, 2: 120, 3: 120 } },
          celldata: [
            { r: 0, c: 0, v: { v: 'Expense Category', bl: 1, bg: '#dbeafe' } },
            { r: 0, c: 1, v: { v: 'Budget ($)', bl: 1, bg: '#dbeafe', ht: 1 } },
            { r: 0, c: 2, v: { v: 'Actual ($)', bl: 1, bg: '#dbeafe', ht: 1 } },
            { r: 0, c: 3, v: { v: 'Variance ($)', bl: 1, bg: '#dbeafe', ht: 1 } },
            { r: 1, c: 0, v: { v: 'Housing & Rent' } },
            { r: 1, c: 1, v: { v: 1500, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 1, c: 2, v: { v: 1500, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 1, c: 3, v: { f: '=B2-C2', v: 0 } },
            { r: 2, c: 0, v: { v: 'Groceries & Food' } },
            { r: 2, c: 1, v: { v: 600, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 2, c: 2, v: { v: 540, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 2, c: 3, v: { f: '=B3-C3', v: 60 } },
            { r: 3, c: 0, v: { v: 'Utilities & Internet' } },
            { r: 3, c: 1, v: { v: 250, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 3, c: 2, v: { v: 280, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 3, c: 3, v: { f: '=B4-C4', v: -30 } },
            { r: 4, c: 0, v: { v: 'Software & Subscriptions' } },
            { r: 4, c: 1, v: { v: 100, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 4, c: 2, v: { v: 85, ct: { fa: '$#,##0', t: 'n' } } },
            { r: 4, c: 3, v: { f: '=B5-C5', v: 15 } },
            { r: 5, c: 0, v: { v: 'Total Expenses', bl: 1, bg: '#f3f4f6' } },
            { r: 5, c: 1, v: { f: '=SUM(B2:B5)', bl: 1, bg: '#f3f4f6' } },
            { r: 5, c: 2, v: { f: '=SUM(C2:C5)', bl: 1, bg: '#f3f4f6' } },
            { r: 5, c: 3, v: { f: '=SUM(D2:D5)', bl: 1, bg: '#f3f4f6' } },
          ],
        },
      ],
    }
  }

  if (type === 'invoice') {
    return {
      name: 'Client Billing Invoice.xlsx',
      data: [
        {
          name: 'Invoice',
          id: 'sheet_inv',
          order: 0,
          status: 1,
          row: 50,
          column: 26,
          config: { columnlen: { 0: 220, 1: 80, 2: 100, 3: 120 } },
          celldata: [
            { r: 0, c: 0, v: { v: 'INVOICE: Cekcok Dev Services', bl: 1, fs: 14 } },
            { r: 2, c: 0, v: { v: 'Item Description', bl: 1, bg: '#e0e7ff' } },
            { r: 2, c: 1, v: { v: 'Qty / Hours', bl: 1, bg: '#e0e7ff', ht: 1 } },
            { r: 2, c: 2, v: { v: 'Rate ($)', bl: 1, bg: '#e0e7ff', ht: 1 } },
            { r: 2, c: 3, v: { v: 'Total ($)', bl: 1, bg: '#e0e7ff', ht: 1 } },
            { r: 3, c: 0, v: { v: 'Frontend React Architecture' } },
            { r: 3, c: 1, v: { v: 40 } },
            { r: 3, c: 2, v: { v: 75 } },
            { r: 3, c: 3, v: { f: '=B4*C4', v: 3000 } },
            { r: 4, c: 0, v: { v: 'Rust Tauri IPC Backend Engine' } },
            { r: 4, c: 1, v: { v: 30 } },
            { r: 4, c: 2, v: { v: 85 } },
            { r: 4, c: 3, v: { f: '=B5*C5', v: 2550 } },
            { r: 5, c: 0, v: { v: 'Performance Tuning & Profiling' } },
            { r: 5, c: 1, v: { v: 15 } },
            { r: 5, c: 2, v: { v: 90 } },
            { r: 5, c: 3, v: { f: '=B6*C6', v: 1350 } },
            { r: 7, c: 2, v: { v: 'Subtotal:', bl: 1, ht: 2 } },
            { r: 7, c: 3, v: { f: '=SUM(D4:D6)', bl: 1, bg: '#f1f5f9' } },
            { r: 8, c: 2, v: { v: 'Tax (10%):', bl: 1, ht: 2 } },
            { r: 8, c: 3, v: { f: '=D8*0.1', bl: 1 } },
            { r: 9, c: 2, v: { v: 'Grand Total:', bl: 1, ht: 2, bg: '#fef08a' } },
            { r: 9, c: 3, v: { f: '=D8+D9', bl: 1, bg: '#fef08a' } },
          ],
        },
      ],
    }
  }

  return {
    name: 'Class Gradebook & Average.xlsx',
    data: [
      {
        name: 'Grades',
        id: 'sheet_grades',
        order: 0,
        status: 1,
        row: 50,
        column: 26,
        config: { columnlen: { 0: 160, 1: 90, 2: 90, 3: 90, 4: 100 } },
        celldata: [
          { r: 0, c: 0, v: { v: 'Student Name', bl: 1, bg: '#fef3c7' } },
          { r: 0, c: 1, v: { v: 'Assignment', bl: 1, bg: '#fef3c7', ht: 1 } },
          { r: 0, c: 2, v: { v: 'Midterm', bl: 1, bg: '#fef3c7', ht: 1 } },
          { r: 0, c: 3, v: { v: 'Final Exam', bl: 1, bg: '#fef3c7', ht: 1 } },
          { r: 0, c: 4, v: { v: 'Average Score', bl: 1, bg: '#fef3c7', ht: 1 } },
          { r: 1, c: 0, v: { v: 'Alex Morgan' } },
          { r: 1, c: 1, v: { v: 92 } },
          { r: 1, c: 2, v: { v: 88 } },
          { r: 1, c: 3, v: { v: 95 } },
          { r: 1, c: 4, v: { f: '=AVERAGE(B2:D2)' } },
          { r: 2, c: 0, v: { v: 'Carlos Rivera' } },
          { r: 2, c: 1, v: { v: 78 } },
          { r: 2, c: 2, v: { v: 82 } },
          { r: 2, c: 3, v: { v: 85 } },
          { r: 2, c: 4, v: { f: '=AVERAGE(B3:D3)' } },
          { r: 3, c: 0, v: { v: 'Diana Chen' } },
          { r: 3, c: 1, v: { v: 96 } },
          { r: 3, c: 2, v: { v: 98 } },
          { r: 3, c: 3, v: { v: 94 } },
          { r: 3, c: 4, v: { f: '=AVERAGE(B4:D4)' } },
        ],
      },
    ],
  }
}
