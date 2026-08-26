import React from 'react'
import { formatShortcut } from '@/utils/platform'

export const EmptyEditorWatermark: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-ide-muted select-none p-6 text-center animate-in fade-in duration-300">
      <img
        src="/logo.png"
        alt="Cekcok IDE"
        className="w-16 h-16 rounded-xl opacity-20 grayscale mb-6 pointer-events-none"
      />
      <div className="space-y-4 max-w-[300px]">
        <div className="flex justify-between items-center text-xs">
          <span>Show All Commands</span>
          <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">
            {formatShortcut('Cmd+Shift+P')}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span>Go to File</span>
          <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">
            {formatShortcut('Cmd+P')}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span>Find in Files</span>
          <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">
            {formatShortcut('Cmd+Shift+F')}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span>Toggle Terminal</span>
          <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded opacity-70">
            {formatShortcut('Cmd+`')}
          </span>
        </div>
      </div>
      <div className="mt-8 text-[11px] text-[#555] max-w-[220px]">
        Drag a file from the explorer onto the edge to split, or center to open here
      </div>
    </div>
  )
}
