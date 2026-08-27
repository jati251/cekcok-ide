import React from 'react'
import { ChevronRight, Wand2, WrapText } from 'lucide-react'
import { useIDEStore } from '@/store/useIDEStore'

interface EditorBreadcrumbsProps {
  path: string
  currentDir: string
  onFormat?: () => void
}

export const EditorBreadcrumbs: React.FC<EditorBreadcrumbsProps> = ({ path, currentDir, onFormat }) => {
  const { settings, updateSettings } = useIDEStore()

  if (path.startsWith('settings://') || path.startsWith('welcome://')) {
    return null
  }

  const relativePath = path.startsWith(currentDir)
    ? path.slice(currentDir.length).replace(/^[/\\]/, '')
    : path

  const segments = relativePath.split(/[/\\]/).filter(Boolean)

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-[#1a1a1a] border-b border-ide-border select-none shrink-0">
      <div className="flex items-center gap-1.5 text-[11px] text-ide-muted overflow-x-auto no-scrollbar">
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={11} className="text-white/20 shrink-0" />}
            <span
              className={`truncate hover:text-white transition-colors ${
                idx === segments.length - 1 ? 'text-white/80 font-medium' : ''
              }`}
            >
              {seg}
            </span>
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onFormat}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-ide-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Format Document"
        >
          <Wand2 size={12} />
          <span>Format</span>
        </button>
        <button
          onClick={() => updateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
            settings.wordWrap === 'on' 
              ? 'text-ide-accent bg-ide-accent/20' 
              : 'text-ide-muted hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Word Wrap"
        >
          <WrapText size={12} />
          <span>Wrap</span>
        </button>
      </div>
    </div>
  )
}
