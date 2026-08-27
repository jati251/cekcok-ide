import React, { useState } from 'react'
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Table as TableIcon,
  Minus,
  Palette,
  Highlighter,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { BlockNoteEditor } from '@blocknote/core'

interface DocumentRibbonProps {
  editor: BlockNoteEditor | null
  isDarkMode: boolean
}

export const DocumentRibbon: React.FC<DocumentRibbonProps> = ({ editor, isDarkMode }) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showBlockPicker, setShowBlockPicker] = useState(false)

  if (!editor) return null

  const applyStyle = (style: Record<string, boolean | string>) => {
    try {
      editor.toggleStyles(style)
      editor.focus()
    } catch (e) {
      console.warn('Style error:', e)
    }
  }

  const changeBlockType = (type: string, props?: Record<string, unknown>) => {
    try {
      const cursor = editor.getTextCursorPosition()
      if (cursor && cursor.block) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.updateBlock(cursor.block, { type, props: props || {} } as any)
      }
      setShowBlockPicker(false)
      editor.focus()
    } catch (e) {
      console.warn('Block change error:', e)
    }
  }

  const insertDivider = () => {
    try {
      const cursor = editor.getTextCursorPosition()
      if (cursor && cursor.block) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.insertBlocks([{ type: 'divider' } as any], cursor.block, 'after')
      }
      editor.focus()
    } catch (e) {
      console.warn('Insert divider error:', e)
    }
  }

  const insertTable = () => {
    try {
      const cursor = editor.getTextCursorPosition()
      if (cursor && cursor.block) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableBlock: any = {
          type: 'table',
          content: {
            type: 'tableContent',
            rows: [
              {
                cells: [[{ type: 'text', text: 'Header 1', styles: { bold: true } }], [{ type: 'text', text: 'Header 2', styles: { bold: true } }]],
              },
              {
                cells: [[{ type: 'text', text: 'Data 1', styles: {} }], [{ type: 'text', text: 'Data 2', styles: {} }]],
              },
            ],
          },
        }
        editor.insertBlocks([tableBlock], cursor.block, 'after')
      }
      editor.focus()
    } catch (e) {
      console.warn('Insert table error:', e)
    }
  }

  const textColors = [
    { label: 'Default', value: 'default', color: isDarkMode ? '#e2e8f0' : '#1e293b' },
    { label: 'Blue', value: 'blue', color: '#3b82f6' },
    { label: 'Red', value: 'red', color: '#ef4444' },
    { label: 'Green', value: 'green', color: '#10b981' },
    { label: 'Purple', value: 'purple', color: '#8b5cf6' },
    { label: 'Orange', value: 'orange', color: '#f97316' },
    { label: 'Pink', value: 'pink', color: '#ec4899' },
  ]

  const highlightColors = [
    { label: 'None', value: 'default', color: 'transparent' },
    { label: 'Yellow', value: 'yellow', color: '#fef08a' },
    { label: 'Green', value: 'green', color: '#bbf7d0' },
    { label: 'Blue', value: 'blue', color: '#bfdbfe' },
    { label: 'Purple', value: 'purple', color: '#e9d5ff' },
    { label: 'Pink', value: 'pink', color: '#fbcfe8' },
  ]

  const btnClass = `p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center`

  return (
    <div
      className={`w-full px-3 py-1.5 border-b flex flex-wrap items-center gap-1 text-xs select-none z-20 ${
        isDarkMode
          ? 'bg-[#1f1f22] border-[#2d2d30] text-gray-200'
          : 'bg-[#fafafa] border-gray-200 text-gray-800'
      }`}
    >
      {/* History Group */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-700/40">
        <button
          onClick={() => editor.undo()}
          className={btnClass}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={() => editor.redo()}
          className={btnClass}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Block Type Picker Dropdown */}
      <div className="relative pr-1.5 border-r border-gray-700/40">
        <button
          onClick={() => setShowBlockPicker(!showBlockPicker)}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-200 border border-white/10 font-medium transition-colors"
          title="Change Block Format"
        >
          <Pilcrow size={13} className="text-cyan-400" />
          <span>Styles</span>
          <ChevronDown size={12} className="text-gray-400" />
        </button>

        {showBlockPicker && (
          <div
            className="absolute left-0 top-full mt-1 w-44 rounded-xl bg-[#252528] border border-[#38383c] shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 text-xs text-gray-200"
            onClick={() => setShowBlockPicker(false)}
          >
            <button
              onClick={() => changeBlockType('paragraph')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left"
            >
              <Pilcrow size={13} />
              <span>Normal Text</span>
            </button>
            <button
              onClick={() => changeBlockType('heading', { level: 1 })}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left font-bold text-sm"
            >
              <Heading1 size={14} className="text-blue-400" />
              <span>Heading 1</span>
            </button>
            <button
              onClick={() => changeBlockType('heading', { level: 2 })}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left font-semibold"
            >
              <Heading2 size={13} className="text-cyan-400" />
              <span>Heading 2</span>
            </button>
            <button
              onClick={() => changeBlockType('heading', { level: 3 })}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left font-medium"
            >
              <Heading3 size={13} className="text-teal-400" />
              <span>Heading 3</span>
            </button>
            <div className="h-[1px] bg-white/10 my-0.5" />
            <button
              onClick={() => changeBlockType('bulletListItem')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left"
            >
              <List size={13} className="text-amber-400" />
              <span>Bullet List</span>
            </button>
            <button
              onClick={() => changeBlockType('numberedListItem')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left"
            >
              <ListOrdered size={13} className="text-emerald-400" />
              <span>Numbered List</span>
            </button>
            <button
              onClick={() => changeBlockType('checkListItem')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left"
            >
              <ListTodo size={13} className="text-purple-400" />
              <span>Task Checklist</span>
            </button>
          </div>
        )}
      </div>

      {/* Typography Formatting */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-700/40">
        <button
          onClick={() => applyStyle({ bold: true })}
          className={btnClass}
          title="Bold (Ctrl+B)"
        >
          <Bold size={13} className="font-bold" />
        </button>
        <button
          onClick={() => applyStyle({ italic: true })}
          className={btnClass}
          title="Italic (Ctrl+I)"
        >
          <Italic size={13} />
        </button>
        <button
          onClick={() => applyStyle({ underline: true })}
          className={btnClass}
          title="Underline (Ctrl+U)"
        >
          <Underline size={13} />
        </button>
        <button
          onClick={() => applyStyle({ strike: true })}
          className={btnClass}
          title="Strikethrough"
        >
          <Strikethrough size={13} />
        </button>
        <button
          onClick={() => applyStyle({ code: true })}
          className={btnClass}
          title="Inline Code"
        >
          <Code size={13} className="text-amber-400" />
        </button>
      </div>

      {/* Color & Highlight Pickers */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-gray-700/40">
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowHighlightPicker(false)
            }}
            className={`${btnClass} gap-1 px-1.5`}
            title="Text Color"
          >
            <Palette size={13} className="text-rose-400" />
            <ChevronDown size={10} className="text-gray-400" />
          </button>

          {showColorPicker && (
            <div
              className="absolute left-0 top-full mt-1 p-2 rounded-xl bg-[#252528] border border-[#38383c] shadow-2xl z-50 flex flex-col gap-1 w-32"
              onClick={() => setShowColorPicker(false)}
            >
              <span className="text-[10px] text-gray-400 font-semibold uppercase px-1">Text Color</span>
              {textColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => applyStyle({ textColor: c.value })}
                  className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/10 text-left text-xs"
                >
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.color }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker)
              setShowColorPicker(false)
            }}
            className={`${btnClass} gap-1 px-1.5`}
            title="Highlight Color"
          >
            <Highlighter size={13} className="text-yellow-400" />
            <ChevronDown size={10} className="text-gray-400" />
          </button>

          {showHighlightPicker && (
            <div
              className="absolute left-0 top-full mt-1 p-2 rounded-xl bg-[#252528] border border-[#38383c] shadow-2xl z-50 flex flex-col gap-1 w-32"
              onClick={() => setShowHighlightPicker(false)}
            >
              <span className="text-[10px] text-gray-400 font-semibold uppercase px-1">Highlight</span>
              {highlightColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => applyStyle({ backgroundColor: c.value })}
                  className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/10 text-left text-xs"
                >
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.color }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-700/40">
        <button
          onClick={() => changeBlockType('bulletListItem')}
          className={btnClass}
          title="Bullet List"
        >
          <List size={13} />
        </button>
        <button
          onClick={() => changeBlockType('numberedListItem')}
          className={btnClass}
          title="Numbered List"
        >
          <ListOrdered size={13} />
        </button>
        <button
          onClick={() => changeBlockType('checkListItem')}
          className={btnClass}
          title="Checklist"
        >
          <ListTodo size={13} />
        </button>
        <button
          onClick={() => changeBlockType('quote')}
          className={btnClass}
          title="Blockquote"
        >
          <Quote size={13} />
        </button>
      </div>

      {/* Insert Components */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={insertTable}
          className={`${btnClass} gap-1 px-2 text-emerald-400 hover:text-emerald-300 font-medium`}
          title="Insert 2x2 Table"
        >
          <TableIcon size={13} />
          <span className="hidden sm:inline text-[11px]">Table</span>
        </button>
        <button
          onClick={insertDivider}
          className={btnClass}
          title="Insert Horizontal Rule Divider"
        >
          <Minus size={13} />
        </button>
      </div>

      <div className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] text-gray-400">
        <Sparkles size={12} className="text-cyan-400" />
        <span>Type <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-200">/</kbd> for quick menu</span>
      </div>
    </div>
  )
}
