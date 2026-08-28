import React, { useState, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'
import { renderFileOrFolderIcon } from '../utils/fileIcons'
import { FileTreeContextMenu } from './FileTreeContextMenu'

interface FileTreeItemProps {
  node: FileNode
  depth?: number
}

export const FileTreeItem = React.memo<FileTreeItemProps>(({ node, depth = 0 }) => {
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
    selectedNode,
    setSelectedNode,
    creatingItemState,
    setCreatingItemState,
    startCreateItem,
    currentDir,
    gitStatus,
  } = useIDEStore()

  const isExpanded = !!expandedFolders[node.path]
  const children = folderChildren[node.path] || []
  const isActive = activeFile?.path === node.path
  const isSelected = selectedNode?.path === node.path
  const isCreatingInsideThisFolder = node.is_dir && creatingItemState?.parentPath === node.path

  // Determine Git status for this file
  const relativeNodePath = node.path
    .replace(currentDir, '')
    .replace(/^[/\\]/, '')
    .replace(/\\/g, '/')

  const gitChange = !node.is_dir
    ? gitStatus.unstaged.find((f) => f.path === relativeNodePath) ||
      gitStatus.staged.find((f) => f.path === relativeNodePath)
    : null

  const gitStatusCode = gitChange?.status

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [newChildName, setNewChildName] = useState('')

  const isSubmittingChildRef = useRef(false)

  // Filter hidden and ignored items based on settings
  if (node.is_hidden && !settings.showHiddenFiles) {
    return null
  }
  if (node.is_ignored && !settings.showIgnoredFiles) {
    return null
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNode(node)
    if (node.is_dir) {
      toggleFolder(node.path)
    } else {
      openFile(node)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedNode(node)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (node.is_dir || isRenaming) return
    if (e.button !== 0) return // Only left click

    const payload = {
      type: 'file' as const,
      file: node,
    }
    useIDEStore.getState().setPendingDragPayload(payload)
    useIDEStore.getState().setDragStartCoords({ x: e.clientX, y: e.clientY })
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
    if (isSubmittingChildRef.current) return
    const trimmed = newChildName.trim()
    if (!trimmed || !creatingItemState) {
      setCreatingItemState(null)
      setNewChildName('')
      return
    }

    isSubmittingChildRef.current = true
    try {
      if (creatingItemState.isDir) {
        await createFolderInDir(node.path, trimmed)
      } else {
        await createFileInDir(node.path, trimmed)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreatingItemState(null)
      setNewChildName('')
      isSubmittingChildRef.current = false
    }
  }

  return (
    <div data-drop-zone="sidebar" data-path={node.path}>
      <div
        tabIndex={0}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onKeyDown={(e) => {
          if (isRenaming || isCreatingInsideThisFolder) return
          const isCmdOrCtrl = e.metaKey || e.ctrlKey

          // Keyboard shortcut 'a' (New File) or 'A' (New Folder) when tree item is focused
          if (!isCmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault()
            e.stopPropagation()
            startCreateItem(e.shiftKey, node.path)
            return
          }

          if (e.key === 'Enter' || e.key === 'F2') {
            e.preventDefault()
            e.stopPropagation()
            setRenameValue(node.name)
            setIsRenaming(true)
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault()
            e.stopPropagation()
            import('@tauri-apps/plugin-dialog').then(({ ask }) => {
              ask(`Are you sure you want to delete '${node.name}'?`, {
                title: 'Delete Confirmation',
                kind: 'warning',
              }).then(confirmed => {
                if (confirmed) {
                  useIDEStore.getState().deletePathItem(node.path)
                  import('react-hot-toast').then(({ toast }) => toast.success(`Deleted ${node.name}`))
                }
              })
            })
          } else if (isCmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault()
            e.stopPropagation()
            useIDEStore.getState().setFileClipboard('copy', node)
            import('react-hot-toast').then(({ toast }) => toast.success(`Copied path to clipboard`))
          } else if (isCmdOrCtrl && (e.key === 'x' || e.key === 'X')) {
            e.preventDefault()
            e.stopPropagation()
            useIDEStore.getState().setFileClipboard('cut', node)
            import('react-hot-toast').then(({ toast }) => toast.success(`Cut path to clipboard`))
          } else if (isCmdOrCtrl && (e.key === 'v' || e.key === 'V')) {
            e.preventDefault()
            e.stopPropagation()
            if (node.is_dir) {
              useIDEStore.getState().pasteFileToDir(node.path)
            } else {
              const parentPath = node.path.substring(0, Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\')))
              useIDEStore.getState().pasteFileToDir(parentPath)
            }
          }
        }}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex items-center gap-1.5 py-1 pr-2 rounded text-[13px] cursor-pointer transition-colors select-none group relative outline-none focus-visible:ring-1 focus-visible:ring-ide-accent/50 ${
          isActive
            ? 'bg-ide-accent/25 text-white font-medium'
            : isSelected
            ? 'bg-white/10 text-white font-normal'
            : node.is_ignored
            ? 'hover:bg-white/5 text-[#777777] opacity-60'
            : gitStatusCode === 'M'
            ? 'text-amber-300 hover:bg-white/5'
            : gitStatusCode === 'U' || gitStatusCode === 'A'
            ? 'text-green-300 hover:bg-white/5'
            : gitStatusCode === 'D'
            ? 'text-red-300 hover:bg-white/5'
            : 'hover:bg-white/5 text-[#cccccc]'
        }`}
        title={
          node.is_ignored
            ? `${node.path} [Git Ignored]`
            : gitStatusCode
            ? `${node.path} [Git: ${gitStatusCode}]`
            : node.path
        }
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
            autoFocus
            onFocus={(e) => e.target.select()}
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

        {/* Git Status Badge */}
        {gitStatusCode && !isRenaming && (
          <span
            className={`text-[10px] font-bold font-mono px-1 ml-auto shrink-0 ${
              gitStatusCode === 'M'
                ? 'text-amber-400'
                : gitStatusCode === 'U' || gitStatusCode === 'A'
                ? 'text-green-400'
                : gitStatusCode === 'D'
                ? 'text-red-400'
                : 'text-ide-accent'
            }`}
          >
            {gitStatusCode}
          </span>
        )}
      </div>

      {/* Recursive Children and/or Inline Child Creation Input directly inside this folder */}
      {node.is_dir && (isExpanded || isCreatingInsideThisFolder) && (
        <div>
          {/* Inline Input for New File/Folder inside this specific folder */}
          {isCreatingInsideThisFolder && (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
              className="flex items-center gap-1.5 py-1 px-2 my-0.5 bg-white/5 rounded border border-ide-accent/40"
            >
              <span className="w-4 shrink-0 flex items-center justify-center">
                {renderFileOrFolderIcon(
                  newChildName || (creatingItemState?.isDir ? 'folder' : 'file'),
                  !!creatingItemState?.isDir,
                  false
                )}
              </span>
              <input
                autoFocus
                type="text"
                placeholder={creatingItemState?.isDir ? 'Folder name...' : 'File name (e.g. index.ts)...'}
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onBlur={handleNewChildSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewChildSubmit()
                  if (e.key === 'Escape') {
                    setCreatingItemState(null)
                    setNewChildName('')
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#3c3c3c] text-white text-xs px-1.5 py-0.5 rounded border border-ide-accent outline-none w-full shadow-inner"
              />
            </div>
          )}

          {children.length === 0 && !isCreatingInsideThisFolder ? (
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
            startCreateItem(false, node.path)
          }}
          onNewFolder={() => {
            startCreateItem(true, node.path)
          }}
          onRename={() => {
            setRenameValue(node.name)
            setIsRenaming(true)
          }}
        />
      )}
    </div>
  )
})
