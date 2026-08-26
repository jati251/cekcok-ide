export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const lowerName = filename.toLowerCase()

  if (lowerName === 'dockerfile' || lowerName.startsWith('docker-compose')) {
    return 'dockerfile'
  }
  if (lowerName === 'cargo.toml' || lowerName === 'cargo.lock') {
    return 'toml'
  }
  if (lowerName === 'go.mod' || lowerName === 'go.sum') {
    return 'go'
  }
  if (lowerName === 'makefile') {
    return 'makefile'
  }

  switch (ext) {
    // Rust
    case 'rs':
      return 'rust'

    // Go
    case 'go':
      return 'go'

    // Java & JVM
    case 'java':
    case 'class':
    case 'jar':
      return 'java'
    case 'kt':
    case 'kts':
      return 'kotlin'
    case 'scala':
      return 'scala'
    case 'gradle':
      return 'groovy'

    // C / C++ / C#
    case 'c':
    case 'h':
      return 'c'
    case 'cpp':
    case 'hpp':
    case 'cc':
    case 'cxx':
      return 'cpp'
    case 'cs':
      return 'csharp'

    // Python
    case 'py':
    case 'pyw':
      return 'python'

    // Web & JS/TS
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript'
    case 'json':
      return 'json'
    case 'html':
    case 'htm':
      return 'html'
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css'

    // Database
    case 'sql':
      return 'sql'

    // Shell
    case 'sh':
    case 'bash':
    case 'zsh':
      return 'shell'
    case 'bat':
    case 'cmd':
      return 'bat'
    case 'ps1':
      return 'powershell'

    // Config & Markup
    case 'md':
    case 'markdown':
      return 'markdown'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'toml':
      return 'toml'
    case 'xml':
      return 'xml'
    case 'ini':
      return 'ini'
    case 'graphql':
    case 'gql':
      return 'graphql'

    default:
      return 'plaintext'
  }
}

export const getLanguageLabel = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const lowerName = filename.toLowerCase()

  if (lowerName === 'dockerfile') return 'Dockerfile'
  if (lowerName.startsWith('cargo.')) return 'Cargo (Rust)'
  if (lowerName.startsWith('go.')) return 'Go Module'

  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'TypeScript'
    case 'js':
    case 'jsx':
      return 'JavaScript'
    case 'json':
      return 'JSON'
    case 'rs':
      return 'Rust'
    case 'go':
      return 'Go'
    case 'java':
      return 'Java'
    case 'kt':
      return 'Kotlin'
    case 'cpp':
    case 'hpp':
    case 'cc':
      return 'C++'
    case 'c':
    case 'h':
      return 'C'
    case 'cs':
      return 'C#'
    case 'py':
      return 'Python'
    case 'md':
      return 'Markdown'
    case 'css':
    case 'scss':
      return 'CSS'
    case 'html':
      return 'HTML'
    case 'sql':
      return 'SQL'
    case 'sh':
    case 'bash':
      return 'Shell'
    case 'yaml':
    case 'yml':
      return 'YAML'
    case 'toml':
      return 'TOML'
    case 'xml':
      return 'XML'
    default:
      return ext.toUpperCase() || 'Plain Text'
  }
}
