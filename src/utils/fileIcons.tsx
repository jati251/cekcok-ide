import {
  Folder,
  FolderOpen,
  FileCode2,
  FileJson,
  FileText,
  File as FileIcon,
  Coffee,
  Globe,
  Database,
  Terminal,
  Settings,
  Lock,
  Cpu,
} from 'lucide-react'

export const renderFileOrFolderIcon = (filename: string, isDir: boolean, isOpen: boolean) => {
  if (isDir) {
    return isOpen ? (
      <FolderOpen size={15} className="text-yellow-400 shrink-0" />
    ) : (
      <Folder size={15} className="text-yellow-400 shrink-0" />
    )
  }

  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const lowerName = filename.toLowerCase()

  // Specific filename matches
  if (lowerName === 'dockerfile' || lowerName.startsWith('docker-compose')) {
    return <Cpu size={15} className="text-[#3880ff] shrink-0" />
  }
  if (lowerName.startsWith('.env')) {
    return <Lock size={15} className="text-[#e5c07b] shrink-0" />
  }
  if (lowerName === 'cargo.toml' || lowerName === 'cargo.lock') {
    return <FileCode2 size={15} className="text-[#dea584] shrink-0" />
  }
  if (lowerName === 'go.mod' || lowerName === 'go.sum') {
    return <FileCode2 size={15} className="text-[#00add8] shrink-0" />
  }
  if (
    lowerName === 'pom.xml' ||
    lowerName === 'build.gradle' ||
    lowerName === 'build.gradle.kts' ||
    lowerName === 'settings.gradle' ||
    lowerName === 'settings.gradle.kts'
  ) {
    return <Coffee size={15} className="text-[#e76f51] shrink-0" />
  }
  if (
    lowerName.startsWith('application.') ||
    lowerName.startsWith('application-') ||
    lowerName.startsWith('bootstrap.') ||
    lowerName.startsWith('bootstrap-')
  ) {
    return <Settings size={15} className="text-[#6db33f] shrink-0" />
  }
  if (lowerName === 'mvnw' || lowerName === 'mvnw.cmd' || lowerName === 'gradlew' || lowerName === 'gradlew.bat') {
    return <Terminal size={15} className="text-[#e76f51] shrink-0" />
  }

  switch (ext) {
    // Java & JVM
    case 'java':
    case 'class':
    case 'jar':
    case 'gradle':
    case 'kt':
    case 'kts':
      return <Coffee size={15} className="text-[#e76f51] shrink-0" />

    // Go
    case 'go':
      return <FileCode2 size={15} className="text-[#00add8] shrink-0" />

    // Rust
    case 'rs':
      return <FileCode2 size={15} className="text-[#dea584] shrink-0" />

    // C / C++ / C#
    case 'c':
    case 'h':
      return <FileCode2 size={15} className="text-[#555555] shrink-0" />
    case 'cpp':
    case 'hpp':
    case 'cc':
    case 'cxx':
      return <FileCode2 size={15} className="text-[#f34b7d] shrink-0" />
    case 'cs':
      return <FileCode2 size={15} className="text-[#178600] shrink-0" />

    // Python
    case 'py':
    case 'pyw':
    case 'ipynb':
      return <FileCode2 size={15} className="text-[#3572a5] shrink-0" />

    // Web & JavaScript / TypeScript
    case 'ts':
    case 'tsx':
      return <FileCode2 size={15} className="text-[#3178c6] shrink-0" />
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode2 size={15} className="text-[#f1e05a] shrink-0" />
    case 'json':
      return <FileJson size={15} className="text-[#cbcb41] shrink-0" />
    case 'html':
    case 'htm':
      return <Globe size={15} className="text-[#e34c26] shrink-0" />
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode2 size={15} className="text-[#563d7c] shrink-0" />

    // SQL / DB
    case 'sql':
    case 'prisma':
      return <Database size={15} className="text-[#e38c00] shrink-0" />

    // Shell & Scripts
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
    case 'bat':
    case 'cmd':
    case 'ps1':
      return <Terminal size={15} className="text-[#89e051] shrink-0" />

    // Docs & Configs
    case 'md':
    case 'markdown':
    case 'txt':
    case 'pdf':
      return <FileText size={15} className="text-[#519aba] shrink-0" />
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'xml':
    case 'ini':
    case 'conf':
      return <Settings size={15} className="text-[#cb8b41] shrink-0" />

    default:
      return <FileIcon size={15} className="text-[#80a4c2] shrink-0" />
  }
}
