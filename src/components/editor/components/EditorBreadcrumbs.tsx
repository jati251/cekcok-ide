import React from 'react'
import { ChevronRight, Wand2, WrapText } from 'lucide-react'
import { useIDEStore } from '@/store/useIDEStore'

interface EditorBreadcrumbsProps {
  path: string
  currentDir: string
  onFormat?: () => void
}

export const EditorBreadcrumbs: React.FC<EditorBreadcrumbsProps> = ({ path, currentDir, onFormat }) => {
  const wordWrap = useIDEStore((s) => s.settings.wordWrap)
  const updateSettings = useIDEStore((s) => s.updateSettings)

  if (path.startsWith('settings://') || path.startsWith('welcome://')) {
    return null
  }

  const relativePath = path.startsWith(currentDir)
    ? path.slice(currentDir.length).replace(/^[/\\]/, '')
    : path

  const segments = relativePath.split(/[/\\]/).filter(Boolean)

  return (
    <div
      style={{
        backgroundColor: 'var(--color-ide-bg)',
        borderColor: 'var(--color-ide-border)',
      }}
      className="flex items-center justify-between px-3.5 py-1 border-b select-none shrink-0"
    >
      <div className="flex items-center gap-1.5 text-[11px] text-ide-muted overflow-x-auto no-scrollbar">
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={11} className="opacity-40 shrink-0" />}
            <span
              style={{
                color: idx === segments.length - 1 ? 'var(--color-ide-text)' : undefined,
              }}
              className={`truncate hover:opacity-100 transition-opacity ${
                idx === segments.length - 1 ? 'font-medium opacity-90' : 'opacity-60'
              }`}
            >
              {seg}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        {onFormat && (
          <button
            onClick={onFormat}
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] text-ide-muted hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Format Document"
          >
            <Wand2 size={11} />
            <span>Format</span>
          </button>
        )}
        <button
          onClick={() => updateSettings({ wordWrap: wordWrap === 'on' ? 'off' : 'on' })}
          style={{ borderColor: 'var(--color-ide-border)' }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] transition-colors cursor-pointer ${
            wordWrap === 'on'
              ? 'text-ide-accent bg-ide-accent/15 border-ide-accent/30 font-medium'
              : 'text-ide-muted hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Toggle Word Wrap"
        >
          <WrapText size={11} />
          <span>Wrap</span>
        </button>
      </div>
    </div>
  )
}
