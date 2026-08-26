import React from 'react'
import { 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  FileCode2, 
  FileJson, 
  FileText, 
  File as FileIcon 
} from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'

const renderNodeIcon = (filename: string, isDir: boolean, isOpen: boolean) => {
  if (isDir) {
    return isOpen 
      ? <FolderOpen size={15} className="text-yellow-400 shrink-0" /> 
      : <Folder size={15} className="text-yellow-400 shrink-0" />
  }
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json': return <FileJson size={15} className="text-[#cbcb41] shrink-0" />
    case 'md': return <FileText size={15} className="text-[#519aba] shrink-0" />
    case 'rs': case 'ts': case 'tsx': case 'js': case 'jsx': return <FileCode2 size={15} className="text-[#80a4c2] shrink-0" />
    default: return <FileIcon size={15} className="text-[#80a4c2] shrink-0" />
  }
}

interface FileTreeItemProps {
  node: FileNode
  depth?: number
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, depth = 0 }) => {
  const { 
    openFile, 
    activeFile, 
    expandedFolders, 
    folderChildren, 
    toggleFolder 
  } = useIDEStore()

  const isExpanded = !!expandedFolders[node.path]
  const children = folderChildren[node.path] || []
  const isActive = activeFile?.path === node.path

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.is_dir) {
      toggleFolder(node.path)
    } else {
      openFile(node)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (node.is_dir) return
    e.dataTransfer.setData('application/json', JSON.stringify(node))
    e.dataTransfer.setData('text/plain', node.path)
  }

  return (
    <div>
      <div
        onClick={handleClick}
        draggable={!node.is_dir}
        onDragStart={handleDragStart}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex items-center gap-1.5 py-1 pr-2 rounded text-[13px] cursor-pointer transition-colors select-none group relative ${
          isActive 
            ? 'bg-ide-accent/25 text-white font-medium' 
            : 'hover:bg-white/5 text-[#cccccc]'
        }`}
        title={node.path}
      >
        {/* Indent Guide Marker */}
        {depth > 0 && (
          <div 
            className="absolute left-[7px] top-0 bottom-0 border-l border-white/5 pointer-events-none"
            style={{ left: `${(depth - 1) * 14 + 14}px` }}
          />
        )}

        {/* Expand / Collapse Chevron */}
        {node.is_dir ? (
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            <ChevronRight 
              size={13} 
              className={`text-[#888] group-hover:text-white transition-transform duration-150 ${
                isExpanded ? 'rotate-90 text-white' : ''
              }`} 
            />
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* File/Folder Icon */}
        {renderNodeIcon(node.name, node.is_dir, isExpanded)}

        {/* Label */}
        <span className="truncate text-xs">{node.name}</span>
      </div>

      {/* Recursive Children */}
      {node.is_dir && isExpanded && (
        <div>
          {children.length === 0 ? (
            <div 
              style={{ paddingLeft: `${(depth + 1) * 14 + 22}px` }} 
              className="py-0.5 text-[11px] text-[#777] italic"
            >
              (empty)
            </div>
          ) : (
            children.map((child) => (
              <FileTreeItem 
                key={child.path} 
                node={child} 
                depth={depth + 1} 
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
