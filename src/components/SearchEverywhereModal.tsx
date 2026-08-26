import React, { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Search as SearchIcon, File, X } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'

export const SearchEverywhereModal: React.FC = () => {
  const { 
    searchEverywhereOpen, 
    setSearchEverywhereOpen, 
    currentDir, 
    openFile,
    setCommandPaletteOpen,
  } = useIDEStore()
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{name: string, path: string}[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchEverywhereOpen) {
      setTimeout(() => {
        setQuery('')
        setResults([])
        setSelectedIndex(0)
        inputRef.current?.focus()
      }, 50)
    }
  }, [searchEverywhereOpen])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim() || !currentDir) {
        setResults([])
        return
      }
      try {
        const res = await invoke<{file_name: string, file_path: string, line_number: number, line_text: string}[]>('search_files', {
          cwd: currentDir,
          query: query,
          caseSensitive: false
        })
        
        const uniqueFiles = new Map()
        res.forEach(r => {
          if (!uniqueFiles.has(r.file_path)) {
            uniqueFiles.set(r.file_path, { name: r.file_name, path: r.file_path })
          }
        })
        setResults(Array.from(uniqueFiles.values()).slice(0, 10))
      } catch (e) {
        console.error(e)
      }
    }
    
    const debounce = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounce)
  }, [query, currentDir])

  const handleSelect = (file: {name: string, path: string}) => {
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={() => setSearchEverywhereOpen(false)}>
      <div 
        className="bg-[#252526] border border-ide-border shadow-2xl rounded-lg w-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-ide-border bg-[#1e1e1e] p-2 text-xs">
          <div className="flex-1 flex gap-2">
            <button className="px-3 py-1.5 bg-ide-accent/20 text-ide-accent rounded font-medium">All</button>
            <button className="px-3 py-1.5 text-ide-muted hover:text-white transition-colors">Files</button>
            <button className="px-3 py-1.5 text-ide-muted hover:text-white transition-colors">Symbols</button>
            <button 
              className="px-3 py-1.5 text-ide-muted hover:text-white transition-colors"
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
            className="p-1 text-ide-muted hover:text-white rounded hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center p-3 border-b border-ide-border bg-[#2d2d2d]">
          <SearchIcon size={16} className="text-ide-accent mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Everywhere (Double Shift)"
            className="flex-1 bg-transparent text-white text-sm focus:outline-none"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto p-1.5">
          {results.length === 0 && query ? (
            <div className="p-4 text-center text-xs text-ide-muted">No matches found</div>
          ) : results.length === 0 && !query ? (
            <div className="p-4 text-center text-xs text-ide-muted">Type to start searching files...</div>
          ) : (
            results.map((res, i) => (
              <div
                key={res.path}
                onClick={() => handleSelect(res)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  i === selectedIndex ? 'bg-ide-accent text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                }`}
              >
                <File size={14} className={i === selectedIndex ? 'text-white' : 'text-[#4fc1ff]'} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{res.name}</span>
                  <span className={`text-[10px] truncate ${i === selectedIndex ? 'text-white/80' : 'text-ide-muted'}`}>
                    {res.path.replace(currentDir, '')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
