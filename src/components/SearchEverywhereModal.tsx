import React, { useState, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { safeInvoke } from '../utils/tauriBridge'
import { useClickOutside } from '../hooks/useClickOutside'
import { renderFileOrFolderIcon } from '../utils/fileIcons'

export const SearchEverywhereModal: React.FC = () => {
  const searchEverywhereOpen = useIDEStore((s) => s.searchEverywhereOpen)
  const setSearchEverywhereOpen = useIDEStore((s) => s.setSearchEverywhereOpen)
  const currentDir = useIDEStore((s) => s.currentDir)
  const openFile = useIDEStore((s) => s.openFile)
  const setCommandPaletteOpen = useIDEStore((s) => s.setCommandPaletteOpen)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ name: string; path: string }[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const modalRef = useClickOutside<HTMLDivElement>(
    () => setSearchEverywhereOpen(false),
    searchEverywhereOpen
  )

  useEffect(() => {
    let isMounted = true
    if (!query.trim() || !currentDir) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      safeInvoke<{ file_name: string; file_path: string; line_number: number; line_text: string }[]>(
        'search_files',
        {
          cwd: currentDir,
          query: query,
          caseSensitive: false,
        }
      )
        .then((res) => {
          if (!isMounted || !res) return
          const uniqueFiles = new Map()
          res.forEach((r) => {
            if (!uniqueFiles.has(r.file_path)) {
              uniqueFiles.set(r.file_path, { name: r.file_name, path: r.file_path })
            }
          })
          setResults(Array.from(uniqueFiles.values()).slice(0, 15))
        })
        .catch((err) => {
          console.error(err)
        })
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, currentDir])

  const handleSelect = (file: { name: string; path: string }) => {
    openFile({ name: file.name, path: file.path, is_dir: false })
    setSearchEverywhereOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchEverywhereOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  if (!searchEverywhereOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-[12vh] px-2 bg-black/50 backdrop-blur-xs select-none"
      onClick={() => setSearchEverywhereOpen(false)}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'var(--color-ide-sidebar)',
          borderColor: 'var(--color-ide-border)',
          color: 'var(--color-ide-text)',
        }}
        className="border shadow-2xl rounded-2xl w-full max-w-[95vw] sm:w-[620px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scope Tabs Header */}
        <div
          style={{
            backgroundColor: 'var(--color-ide-bg)',
            borderColor: 'var(--color-ide-border)',
          }}
          className="flex items-center justify-between border-b px-3 py-2 text-xs"
        >
          <div className="flex gap-1.5">
            <button className="px-3 py-1 bg-ide-accent/20 text-ide-accent rounded-lg font-semibold cursor-pointer">
              All
            </button>
            <button className="px-3 py-1 text-ide-muted hover:text-[var(--color-ide-text)] transition-colors cursor-pointer">
              Files
            </button>
            <button className="px-3 py-1 text-ide-muted hover:text-[var(--color-ide-text)] transition-colors cursor-pointer">
              Symbols
            </button>
            <button
              className="px-3 py-1 text-ide-muted hover:text-[var(--color-ide-text)] transition-colors cursor-pointer"
              onClick={() => {
                setSearchEverywhereOpen(false)
                setCommandPaletteOpen(true)
              }}
            >
              Actions
            </button>
          </div>
          <button
            onClick={() => setSearchEverywhereOpen(false)}
            className="p-1 text-ide-muted hover:text-[var(--color-ide-text)] rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Input Field */}
        <div
          style={{
            backgroundColor: 'var(--color-ide-bg)',
            borderColor: 'var(--color-ide-border)',
          }}
          className="flex items-center px-3.5 py-3 border-b gap-3"
        >
          <SearchIcon size={16} className="text-ide-accent shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Everywhere (Double Shift)..."
            style={{ color: 'var(--color-ide-text)' }}
            className="flex-1 bg-transparent text-sm focus:outline-hidden placeholder:text-ide-muted/60"
          />
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {results.length === 0 && query ? (
            <div className="p-5 text-center text-xs text-ide-muted">No matches found</div>
          ) : results.length === 0 && !query ? (
            <div className="p-5 text-center text-xs text-ide-muted">Type to start searching files...</div>
          ) : (
            results.map((res, i) => {
              const isSelected = i === selectedIndex
              return (
                <div
                  key={res.path}
                  onClick={() => handleSelect(res)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-ide-accent text-white shadow-xs font-medium'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="shrink-0 flex items-center">
                    {renderFileOrFolderIcon(res.name, false, false)}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs truncate">{res.name}</span>
                    <span
                      className={`text-[10px] truncate font-mono ${
                        isSelected ? 'text-white/80' : 'text-ide-muted'
                      }`}
                    >
                      {res.path.replace(currentDir, '')}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: 'var(--color-ide-bg)',
            borderColor: 'var(--color-ide-border)',
          }}
          className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-ide-muted shrink-0"
        >
          <div className="flex items-center gap-3">
            <span><kbd className="border border-ide-border px-1 py-0.5 rounded font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="border border-ide-border px-1 py-0.5 rounded font-mono">↵</kbd> open</span>
            <span><kbd className="border border-ide-border px-1 py-0.5 rounded font-mono">Esc</kbd> close</span>
          </div>
          <span className="font-medium text-ide-accent">Double Shift</span>
        </div>
      </div>
    </div>
  )
}
