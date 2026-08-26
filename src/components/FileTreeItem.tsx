import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { renderFileOrFolderIcon } from '../utils/fileIcons'
import { FileTreeContextMenu } from './FileTreeContextMenu'

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
    toggleFolder,
    renamePathItem,
    createFileInDir,
    createFolderInDir,
    settings,
    setIsDraggingFile,
  } = useIDEStore()

  const isExpanded = !!expandedFolders[node.path]
  const children = folderChildren[node.path] || []
  const isActive = activeFile?.path === node.path

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [creatingChild, setCreatingChild] = useState<{ isDir: boolean } | null>(null)
  const [newChildName, setNewChildName] = useState('')

  const renameInputRef = useRef<HTMLInputElement>(null)
  const newChildInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [isRenaming])

  useEffect(() => {
    if (creatingChild) {
      newChildInputRef.current?.focus()
    }
  }, [creatingChild])

  // Filter hidden and ignored items based on settings
  if (node.is_hidden && !settings.showHiddenFiles) {
    return null
  }
  if (node.is_ignored && !settings.showIgnoredFiles) {
    return null
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.is_dir) {
      toggleFolder(node.path)
    } else {
      openFile(node)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (node.is_dir) return
    const payload = {
      type: 'file' as const,
      file: node,
    }
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.setData('text/plain', node.path)
    e.dataTransfer.effectAllowed = 'copyMove'
    useIDEStore.getState().setDragPayload(payload)
    setIsDraggingFile(true)
  }

  const handleDragEnd = () => {
    useIDEStore.getState().setDragPayload(null)
    setIsDraggingFile(false)
  }

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== node.name) {
      const sep = node.path.includes('/') ? '/' : '\\'
      const parent = node.path.substring(0, Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\')))
      const newPath = parent ? `${parent}${sep}${trimmed}` : trimmed
      await renamePathItem(node.path, newPath)
    }
    setIsRenaming(false)
  }

  const handleNewChildSubmit = async () => {
    const trimmed = newChildName.trim()
    if (trimmed && creatingChild) {
      if (creatingChild.isDir) {
        await createFolderInDir(node.path, trimmed)
      } else {
        await createFileInDir(node.path, trimmed)
      }
    }
    setCreatingChild(null)
    setNewChildName('')
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable={!node.is_dir && !isRenaming}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex items-center gap-1.5 py-1 pr-2 rounded text-[13px] cursor-pointer transition-colors select-none group relative ${
          isActive
            ? 'bg-ide-accent/25 text-white font-medium'
            : node.is_ignored
            ? 'hover:bg-white/5 text-[#777777] opacity-60'
            : 'hover:bg-white/5 text-[#cccccc]'
        }`}
        title={node.is_ignored ? `${node.path} [Git Ignored]` : node.path}
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
        {renderFileOrFolderIcon(node.name, node.is_dir, isExpanded)}

        {/* Label or Inline Rename Input */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') setIsRenaming(false)
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#3c3c3c] text-white text-xs px-1 py-0.5 rounded border border-ide-accent outline-none w-full"
          />
        ) : (
          <span className="truncate text-xs">{node.name}</span>
        )}
      </div>

      {/* Inline New Child Creation Input */}
      {creatingChild && (
        <div
          style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
          className="flex items-center gap-1.5 py-1 pr-2"
        >
          <span className="w-4 shrink-0" />
          {renderFileOrFolderIcon(newChildName || 'new', creatingChild.isDir, false)}
          <input
            ref={newChildInputRef}
            type="text"
            placeholder={creatingChild.isDir ? 'Folder name...' : 'File name...'}
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onBlur={handleNewChildSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNewChildSubmit()
              if (e.key === 'Escape') setCreatingChild(null)
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#3c3c3c] text-white text-xs px-1 py-0.5 rounded border border-ide-accent outline-none w-full"
          />
        </div>
      )}

      {/* Recursive Children */}
      {node.is_dir && isExpanded && (
        <div>
          {children.length === 0 && !creatingChild ? (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 22}px` }}
              className="py-0.5 text-[11px] text-[#777] italic"
            >
              (empty)
            </div>
          ) : (
            children.map((child) => (
              <FileTreeItem key={child.path} node={child} depth={depth + 1} />
            ))
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <FileTreeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={node}
          onClose={() => setContextMenu(null)}
          onNewFile={() => {
            if (!isExpanded) toggleFolder(node.path)
            setCreatingChild({ isDir: false })
          }}
          onNewFolder={() => {
            if (!isExpanded) toggleFolder(node.path)
            setCreatingChild({ isDir: true })
          }}
          onRename={() => {
            setRenameValue(node.name)
            setIsRenaming(true)
          }}
        />
      )}
    </div>
  )
}
