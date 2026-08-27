import React from 'react'
import { motion } from 'framer-motion'

interface AppSkeletonProps {
  type: 'code' | 'spreadsheet' | 'document' | 'whiteboard' | 'home'
}

// Pre-computed deterministic widths to avoid Math.random() during render
const CODE_LINE_WIDTHS = [72, 45, 68, 55, 80, 38, 63, 50, 75, 42, 58, 70, 48, 65]
const DOC_LINE_WIDTHS = [85, 72, 90, 65, 78, 88, 70, 82]
const DOC_P2_WIDTHS = [75, 60, 85, 70, 55]

const ShimmerBlock: React.FC<{ className?: string; delay?: number; style?: React.CSSProperties }> = ({
  className = '',
  delay = 0,
  style,
}) => (
  <motion.div
    className={`rounded-md bg-white/10 ${className}`}
    style={style}
    animate={{ opacity: [0.2, 0.45, 0.2] }}
    transition={{ duration: 1.5, repeat: Infinity, delay }}
  />
)

const CodeSkeleton: React.FC = () => (
  <div className="flex flex-1 min-h-0 bg-[#1e1e1e]">
    {/* Activity Bar */}
    <div className="w-12 bg-[#181818] border-r border-[#333] flex flex-col items-center gap-4 pt-4 shrink-0">
      {[0, 1, 2, 3].map((i) => (
        <ShimmerBlock key={i} className="w-6 h-6 rounded-md" delay={i * 0.1} />
      ))}
    </div>
    {/* Sidebar */}
    <div className="w-56 bg-[#252526] border-r border-[#333] p-3 flex flex-col gap-2 shrink-0">
      <ShimmerBlock className="w-2/3 h-4 mb-2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-2 pl-2">
          <ShimmerBlock className="w-3.5 h-3.5 shrink-0" delay={i * 0.08} />
          <ShimmerBlock className="flex-1 h-3" delay={i * 0.08} />
        </div>
      ))}
    </div>
    {/* Editor */}
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-9 bg-[#181818] border-b border-[#333] flex items-center gap-2 px-2 shrink-0">
        <ShimmerBlock className="w-28 h-6 rounded-t-md" />
        <ShimmerBlock className="w-24 h-6 rounded-t-md opacity-50" delay={0.1} />
      </div>
      <div className="flex-1 bg-[#1e1e1e] p-4 flex flex-col gap-2 overflow-hidden">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <ShimmerBlock className="w-6 h-3 opacity-30" delay={i * 0.04} />
            <ShimmerBlock
              className="h-3"
              delay={i * 0.04}
              style={{ width: `${CODE_LINE_WIDTHS[i % CODE_LINE_WIDTHS.length]}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)

const SpreadsheetSkeleton: React.FC = () => (
  <div className="flex-1 bg-[#1e1e1e] flex flex-col overflow-hidden">
    {/* Formula bar shimmer */}
    <div className="h-9 bg-[#252526] border-b border-[#333] flex items-center gap-2 px-3 shrink-0">
      <ShimmerBlock className="w-14 h-5 rounded" />
      <ShimmerBlock className="w-px h-4 bg-white/20" />
      <ShimmerBlock className="flex-1 h-5 rounded" delay={0.1} />
    </div>

    {/* Grid header row */}
    <div className="flex bg-[#252526] border-b border-[#333] px-2 py-1 gap-1 shrink-0">
      <ShimmerBlock className="w-10 h-6 rounded-xs" />
      {Array.from({ length: 10 }, (_, i) => (
        <ShimmerBlock key={i} className="flex-1 h-6 rounded-xs" delay={i * 0.03} />
      ))}
    </div>

    {/* Grid rows */}
    <div className="flex-1 p-2 space-y-1 overflow-hidden">
      {Array.from({ length: 14 }, (_, row) => (
        <div key={row} className="flex gap-1">
          <ShimmerBlock className="w-10 h-6 rounded-xs opacity-60" delay={row * 0.02} />
          {Array.from({ length: 10 }, (_, col) => (
            <ShimmerBlock key={col} className="flex-1 h-6 rounded-xs" delay={row * 0.02 + col * 0.01} />
          ))}
        </div>
      ))}
    </div>
  </div>
)

const DocumentSkeleton: React.FC = () => (
  <div className="flex-1 bg-[#18181a] flex flex-col overflow-hidden">
    {/* Top formatting ribbon shimmer */}
    <div className="h-10 bg-[#202022] border-b border-[#38383c] flex items-center gap-2 px-4 shrink-0">
      <ShimmerBlock className="w-20 h-6 rounded" />
      <ShimmerBlock className="w-24 h-6 rounded" delay={0.05} />
      <ShimmerBlock className="w-16 h-6 rounded" delay={0.1} />
      <div className="flex-1" />
      <ShimmerBlock className="w-24 h-6 rounded" delay={0.15} />
    </div>

    {/* Document page layout */}
    <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
      <div className="max-w-3xl w-full bg-[#202022] border border-[#38383c] rounded-2xl p-8 flex flex-col gap-4 shadow-xl">
        <ShimmerBlock className="w-2/3 h-8 rounded-lg mb-2" />
        {Array.from({ length: 6 }, (_, i) => (
          <ShimmerBlock
            key={i}
            className="h-3.5"
            delay={i * 0.05}
            style={{ width: `${DOC_LINE_WIDTHS[i % DOC_LINE_WIDTHS.length]}%` }}
          />
        ))}
        <div className="h-4" />
        <ShimmerBlock className="w-1/2 h-6 rounded-md mb-1" delay={0.3} />
        {Array.from({ length: 5 }, (_, i) => (
          <ShimmerBlock
            key={`p2-${i}`}
            className="h-3.5"
            delay={0.3 + i * 0.05}
            style={{ width: `${DOC_P2_WIDTHS[i % DOC_P2_WIDTHS.length]}%` }}
          />
        ))}
      </div>
    </div>
  </div>
)

const WhiteboardSkeleton: React.FC = () => (
  <div className="flex-1 bg-[#18181a] relative overflow-hidden flex items-center justify-center">
    {/* Floating toolbar */}
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-[#202022] border border-[#38383c] rounded-xl p-2 shadow-2xl">
      {Array.from({ length: 7 }, (_, i) => (
        <ShimmerBlock key={i} className="w-7 h-7 rounded-lg" delay={i * 0.06} />
      ))}
    </div>
    <div className="flex flex-col items-center gap-3 opacity-30">
      <ShimmerBlock className="w-32 h-32 rounded-2xl" />
      <ShimmerBlock className="w-48 h-3 rounded" delay={0.1} />
    </div>
  </div>
)

const HomeSkeleton: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center py-6 px-4 sm:px-8 bg-[#18181a] overflow-hidden">
    <div className="max-w-5xl w-full flex flex-col gap-6">
      {/* Dashboard header shimmer */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <ShimmerBlock className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <ShimmerBlock className="w-24 h-5" />
            <ShimmerBlock className="w-56 h-3" delay={0.05} />
          </div>
        </div>
      </div>

      {/* 4 Workspaces cards shimmer */}
      <div>
        <ShimmerBlock className="w-24 h-3.5 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-[#202022] border border-[#38383c] rounded-xl p-3.5 space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <ShimmerBlock className="w-8 h-8 rounded-lg" delay={i * 0.05} />
                <ShimmerBlock className="w-16 h-4 rounded-full" delay={i * 0.05} />
              </div>
              <ShimmerBlock className="w-24 h-4" delay={i * 0.05 + 0.05} />
              <ShimmerBlock className="w-full h-8" delay={i * 0.05 + 0.1} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent items card shimmer */}
      <div className="bg-[#202022] border border-[#38383c] rounded-xl p-4 space-y-3 shadow-lg flex-1 min-h-48">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <ShimmerBlock className="w-40 h-4" />
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <ShimmerBlock key={i} className="w-12 h-6 rounded-md" delay={i * 0.04} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5 pt-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-[#18181a] p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShimmerBlock className="w-6 h-6 rounded-md" delay={i * 0.05} />
                <div className="space-y-1">
                  <ShimmerBlock className="w-36 h-3.5" delay={i * 0.05} />
                  <ShimmerBlock className="w-24 h-2.5" delay={i * 0.05 + 0.05} />
                </div>
              </div>
              <ShimmerBlock className="w-14 h-4 rounded" delay={i * 0.05} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const skeletonMap: Record<AppSkeletonProps['type'], React.FC> = {
  code: CodeSkeleton,
  spreadsheet: SpreadsheetSkeleton,
  document: DocumentSkeleton,
  whiteboard: WhiteboardSkeleton,
  home: HomeSkeleton,
}

export const AppSkeleton: React.FC<AppSkeletonProps> = ({ type }) => {
  const SkeletonContent = skeletonMap[type]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col bg-[#18181a] text-white select-none overflow-hidden"
    >
      {/* Standard 38px TitleBar skeleton across all apps */}
      <header className="h-[38px] bg-[#181818] border-b border-[#333] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-[72px] shrink-0" />
          <ShimmerBlock className="w-20 h-4 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-20 h-6 rounded-md" delay={0.1} />
        </div>
      </header>
      <SkeletonContent />
    </motion.div>
  )
}
