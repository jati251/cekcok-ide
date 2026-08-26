import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, FileCode2, FileJson, FileText, File as FileIcon, FilePlus, FolderPlus } from 'lucide-react'
import { useIDEStore, FileNode } from '../store/useIDEStore'

const getIconForFile = (filename: string, isDir: boolean) => {
  if (isDir) return FolderOpen
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json': return FileJson
    case 'md': return FileText
    case 'rs': case 'ts': case 'tsx': case 'js': case 'jsx': return FileCode2
    default: return FileIcon
  }
}

export const Sidebar = () => {
  const { 
    sidebarOpen, 
    fileTree, 
    activeFile, 
    setFileTree, 
    setCurrentDir,
    openFile 
  } = useIDEStore()

  const loadDirectory = async (path: string) => {
    try {
      const result = await invoke<FileNode[]>("read_dir", { path })
      setFileTree(result)
      setCurrentDir(path)
    } catch (error) {
      console.error("Failed to load directory:", error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadDirectory(".")
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileClick = (file: FileNode) => {
    if (file.is_dir) {
      loadDirectory(file.path)
    } else {
      openFile(file)
    }
  }

  const handleOpenFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
      })
      if (selectedPath && typeof selectedPath === 'string') {
        loadDirectory(selectedPath)
      }
    } catch (error) {
      console.error("Failed to open folder dialog:", error)
    }
  }

  const handleCreateNode = async (isDir: boolean) => {
    const name = prompt(`Enter new ${isDir ? 'folder' : 'file'} name:`)
    if (!name) return

    const separator = currentDir.endsWith('/') || currentDir.endsWith('\\') ? '' : '/'
    const newPath = `${currentDir}${separator}${name}`
    
    try {
      if (isDir) {
        await invoke("create_dir", { path: newPath })
      } else {
        await invoke("create_file", { path: newPath })
      }
      loadDirectory(currentDir)
    } catch (err) {
      alert(`Failed to create: ${err}`)
    }
  }

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 250, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col bg-ide-sidebar border-r border-ide-border overflow-hidden whitespace-nowrap"
        >
          <div className="flex justify-between items-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border">
            <span>Explorer</span>
            <div className="flex gap-1 items-center">
              <button 
                onClick={() => handleCreateNode(false)}
                className="hover:text-white transition-colors p-1"
                title="New File"
              >
                <FilePlus size={14} />
              </button>
              <button 
                onClick={() => handleCreateNode(true)}
                className="hover:text-white transition-colors p-1"
                title="New Folder"
              >
                <FolderPlus size={14} />
              </button>
              <button 
                onClick={handleOpenFolder}
                className="text-[10px] hover:text-white transition-colors ml-1"
                title="Open Folder"
              >
                [OPEN]
              </button>
              <button 
                onClick={() => loadDirectory(".")}
                className="text-[10px] hover:text-white transition-colors"
                title="Go back to root"
              >
                [ROOT]
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {fileTree.map((file) => {
              const Icon = getIconForFile(file.name, file.is_dir)
              const isActive = activeFile?.path === file.path
              return (
                <div 
                  key={file.path}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-[13px] cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-ide-accent/20 text-white' 
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  <Icon size={16} className={file.is_dir ? "text-yellow-500" : "text-current"} />
                  <span className="truncate">{file.name}</span>
                </div>
              )
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
