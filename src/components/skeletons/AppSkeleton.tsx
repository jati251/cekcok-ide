import React from 'react'
import { motion } from 'framer-motion'

interface AppSkeletonProps {
  type: 'code' | 'spreadsheet' | 'document' | 'whiteboard' | 'home'
}

// Pre-computed deterministic widths to avoid Math.random() during render
const CODE_LINE_WIDTHS = [72, 45, 68, 55, 80, 38, 63, 50, 75, 42, 58, 70, 48, 65]
const DOC_LINE_WIDTHS = [85, 72, 90, 65, 78, 88, 70, 82]
const DOC_P2_WIDTHS = [75, 60, 85, 70, 55]

const ShimmerBlock: React.FC<{ className?: string; delay?: number; style?: React.CSSProperties }> = ({ className = '', delay = 0, style }) => (
  <motion.div
    className={`rounded bg-[#2d2d2d] ${className}`}
    style={style}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, delay }}
  />
)

const CodeSkeleton: React.FC = () => (
  <div className="flex flex-1 min-h-0">
    {/* Activity Bar */}
    <div className="w-12 bg-[#252526] border-r border-[#333] flex flex-col items-center gap-4 pt-4">
      {[0, 1, 2, 3].map((i) => (
        <ShimmerBlock key={i} className="w-7 h-7 rounded-md" delay={i * 0.1} />
      ))}
    </div>
    {/* Sidebar */}
    <div className="w-60 bg-[#252526] border-r border-[#333] p-3 flex flex-col gap-2">
      <ShimmerBlock className="w-3/4 h-4 mb-2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-2 pl-2">
          <ShimmerBlock className="w-4 h-4 shrink-0" delay={i * 0.08} />
          <ShimmerBlock className="flex-1 h-3" delay={i * 0.08} />
        </div>
      ))}
    </div>
    {/* Editor */}
    <div className="flex-1 flex flex-col">
      <div className="h-9 bg-[#1e1e1e] border-b border-[#333] flex items-center gap-1 px-2">
        <ShimmerBlock className="w-24 h-6 rounded-sm" />
        <ShimmerBlock className="w-20 h-6 rounded-sm" delay={0.1} />
      </div>
      <div className="h-6 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center gap-1 px-3">
        <ShimmerBlock className="w-16 h-3" />
        <ShimmerBlock className="w-20 h-3" delay={0.1} />
      </div>
      <div className="flex-1 bg-[#1e1e1e] p-4 flex flex-col gap-2">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <ShimmerBlock className="w-6 h-3" delay={i * 0.04} />
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
  <div className="flex-1 bg-[#1e1e1e] p-4">
    <div className="flex gap-px mb-px">
      <ShimmerBlock className="w-10 h-7" />
      {Array.from({ length: 8 }, (_, i) => (
        <ShimmerBlock key={i} className="flex-1 h-7" delay={i * 0.05} />
      ))}
    </div>
    {Array.from({ length: 15 }, (_, row) => (
      <div key={row} className="flex gap-px mb-px">
        <ShimmerBlock className="w-10 h-7" delay={row * 0.03} />
        {Array.from({ length: 8 }, (_, col) => (
          <ShimmerBlock key={col} className="flex-1 h-7" delay={row * 0.03 + col * 0.02} />
        ))}
      </div>
    ))}
  </div>
)

const DocumentSkeleton: React.FC = () => (
  <div className="flex-1 bg-white flex justify-center py-12 px-8">
    <div className="max-w-4xl w-full flex flex-col gap-4">
      <ShimmerBlock className="w-2/3 h-10 !bg-gray-200" />
      <div className="h-4" />
      {Array.from({ length: 8 }, (_, i) => (
        <ShimmerBlock
          key={i}
          className="h-4 !bg-gray-200"
          delay={i * 0.06}
          style={{ width: `${DOC_LINE_WIDTHS[i % DOC_LINE_WIDTHS.length]}%` }}
        />
      ))}
      <div className="h-2" />
      <ShimmerBlock className="w-1/2 h-6 !bg-gray-200" delay={0.5} />
      {Array.from({ length: 5 }, (_, i) => (
        <ShimmerBlock
          key={`p2-${i}`}
          className="h-4 !bg-gray-200"
          delay={0.5 + i * 0.06}
          style={{ width: `${DOC_P2_WIDTHS[i % DOC_P2_WIDTHS.length]}%` }}
        />
      ))}
    </div>
  </div>
)

const WhiteboardSkeleton: React.FC = () => (
  <div className="flex-1 bg-white relative overflow-hidden">
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-gray-100 rounded-lg p-2">
      {Array.from({ length: 6 }, (_, i) => (
        <ShimmerBlock key={i} className="w-8 h-8 rounded !bg-gray-200" delay={i * 0.08} />
      ))}
    </div>
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      <ShimmerBlock className="w-40 h-40 rounded-lg !bg-gray-300" />
    </div>
  </div>
)

const HomeSkeleton: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e]">
    <div className="max-w-4xl w-full p-8 flex flex-col items-center">
      <ShimmerBlock className="w-20 h-20 rounded-2xl mb-4" />
      <ShimmerBlock className="w-64 h-8 mb-2" />
      <ShimmerBlock className="w-48 h-4 mb-10" delay={0.1} />
      <div className="grid grid-cols-2 gap-6 w-full">
        {[0, 1, 2, 3].map((i) => (
          <ShimmerBlock key={i} className="h-36 rounded-xl" delay={i * 0.1} />
        ))}
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
  const isDark = type !== 'document' && type !== 'whiteboard'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full flex flex-col ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}
    >
      {/* Top bar skeleton */}
      <div className={`h-12 ${isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-gray-50 border-gray-200'} border-b flex items-center px-4 gap-3 shrink-0`}>
        <ShimmerBlock className={`w-6 h-6 rounded ${isDark ? '' : '!bg-gray-200'}`} />
        <ShimmerBlock className={`w-40 h-4 ${isDark ? '' : '!bg-gray-200'}`} delay={0.1} />
      </div>
      <SkeletonContent />
    </motion.div>
  )
}
