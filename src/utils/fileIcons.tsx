import {
  Folder,
  FolderOpen,
  FileCode2,
  FileJson,
  FileText,
  File as FileIcon,
} from 'lucide-react'

export const renderFileOrFolderIcon = (filename: string, isDir: boolean, isOpen: boolean) => {
  if (isDir) {
    return isOpen ? (
      <FolderOpen size={15} className="text-yellow-400 shrink-0" />
    ) : (
      <Folder size={15} className="text-yellow-400 shrink-0" />
    )
  }

  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json':
      return <FileJson size={15} className="text-[#cbcb41] shrink-0" />
    case 'md':
      return <FileText size={15} className="text-[#519aba] shrink-0" />
    case 'rs':
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode2 size={15} className="text-[#80a4c2] shrink-0" />
    default:
      return <FileIcon size={15} className="text-[#80a4c2] shrink-0" />
  }
}
