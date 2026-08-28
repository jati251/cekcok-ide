import React, { useState, useRef } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Image as ImageIcon, Copy, Check, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { convertFileSrc } from '@tauri-apps/api/core'

interface MediaPreviewProps {
  filePath: string
  fileName: string
  svgContent?: string
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ filePath, fileName, svgContent }) => {
  const [zoom, setZoom] = useState<number>(1)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const isSvg = fileName.toLowerCase().endsWith('.svg')
  const imageSrc = isSvg && svgContent
    ? `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`
    : filePath.startsWith('data:') || filePath.startsWith('blob:')
    ? filePath
    : convertFileSrc(filePath)

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.25, 10))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.25, 0.1))
  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleFitToWindow = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    }
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText(filePath)
    setIsCopied(true)
    toast.success('File path copied to clipboard')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-[#1e1e1e] select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-9 px-3 bg-[#252526] border-b border-[#333333] flex items-center justify-between text-xs text-[#cccccc] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-blue-400" />
          <span className="font-mono text-[11px] truncate max-w-xs">{fileName}</span>
          {dimensions && (
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-[#aaaaaa]">
              {dimensions.width} × {dimensions.height} px
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            title="Zoom Out (Cmd -)"
            className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-[11px] px-1 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In (Cmd +)"
            className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom (100%)"
            className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors text-[10px] font-mono"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={handleFitToWindow}
            title="Fit View"
            className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
          >
            <Maximize2 size={13} />
          </button>

          <div className="w-[1px] h-3.5 bg-white/20 mx-1" />

          <button
            onClick={handleCopyPath}
            title="Copy Absolute Path"
            className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors flex items-center gap-1"
          >
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Main Preview Canvas Area with Checkered Background */}
      <div
        className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: `
            linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#181818',
        }}
      >
        {loadError ? (
          <div className="flex flex-col items-center gap-2 text-xs text-rose-400 bg-black/40 p-4 rounded-lg border border-rose-500/20">
            <AlertCircle size={24} />
            <span>Failed to load image preview</span>
            <span className="text-[10px] text-[#888888] font-mono">{loadError}</span>
          </div>
        ) : (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              transformOrigin: 'center center',
            }}
            className="flex items-center justify-center p-8 pointer-events-none"
          >
            <img
              src={imageSrc}
              alt={fileName}
              onLoad={(e) => {
                setIsLoading(false)
                handleImageLoad(e)
              }}
              onError={() => {
                setIsLoading(false)
                setLoadError('Unable to render image format')
              }}
              className={`max-w-none shadow-2xl border border-white/10 rounded-sm transition-opacity duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                imageRendering: zoom > 2 ? 'pixelated' : 'auto',
              }}
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="h-6 px-3 bg-[#1e1e1e] border-t border-[#333333] flex items-center justify-between text-[11px] text-[#888888] shrink-0 font-mono">
        <span className="truncate max-w-sm">{filePath}</span>
        <span>Hold Space / Drag to Pan • Ctrl+Scroll to Zoom</span>
      </div>
    </div>
  )
}
