import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Search as SearchIcon } from 'lucide-react'
import { useIDEStore, SearchResultItem } from '../../store/useIDEStore'

export const SearchSidebar: React.FC = () => {
  const { currentDir, openFile } = useIDEStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await invoke<SearchResultItem[]>('search_files', {
        cwd: currentDir,
        query: searchQuery,
        caseSensitive,
      })
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-ide-muted mb-2">
        Search
      </div>

      <form onSubmit={handleSearch} className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in files..."
            className="w-full bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-ide-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`absolute right-1 px-1.5 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
              caseSensitive ? 'bg-ide-accent text-white' : 'text-[#888] hover:text-white'
            }`}
            title="Match Case"
          >
            Aa
          </button>
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="w-full bg-ide-accent hover:bg-ide-accent-hover text-white text-xs py-1 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5 font-medium"
        >
          <SearchIcon size={12} />
          {isSearching ? 'Searching...' : 'Find'}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto mt-3 border-t border-ide-border pt-2 space-y-1">
        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="text-xs text-[#888] text-center py-4">No results found</div>
        )}
        {searchResults.map((res, i) => (
          <div
            key={`${res.file_path}-${res.line_number}-${i}`}
            onClick={() => {
              openFile({ name: res.file_name, path: res.file_path, is_dir: false })
            }}
            className="p-1.5 hover:bg-white/5 rounded cursor-pointer text-xs group"
          >
            <div className="flex items-center justify-between text-ide-muted text-[11px]">
              <span className="truncate text-[#9cdcfe]">{res.file_name}</span>
              <span className="text-[#888]">:{res.line_number}</span>
            </div>
            <div className="text-white/80 truncate font-mono text-[11px] mt-0.5">
              {res.line_text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
