import React from 'react'
import { ChevronRight } from 'lucide-react'

interface EditorBreadcrumbsProps {
  path: string
  currentDir: string
}

export const EditorBreadcrumbs: React.FC<EditorBreadcrumbsProps> = ({ path, currentDir }) => {
  if (path.startsWith('settings://') || path.startsWith('welcome://')) {
    return null
  }

  const relativePath = path.startsWith(currentDir)
    ? path.slice(currentDir.length).replace(/^[/\\]/, '')
    : path

  const segments = relativePath.split(/[/\\]/).filter(Boolean)

  return (
    <div className="flex items-center gap-1.5 px-4 py-1 text-[11px] bg-[#1a1a1a] border-b border-ide-border text-ide-muted overflow-x-auto no-scrollbar select-none shrink-0">
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
  )
}
