export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'rs':
      return 'rust'
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
    case 'md':
      return 'markdown'
    case 'css':
      return 'css'
    case 'html':
      return 'html'
    case 'py':
      return 'python'
    case 'go':
      return 'go'
    case 'sh':
    case 'bash':
    case 'zsh':
      return 'shell'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'toml':
      return 'toml'
    default:
      return 'plaintext'
  }
}

export const getLanguageLabel = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
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
    case 'md':
      return 'Markdown'
    case 'css':
      return 'CSS'
    case 'html':
      return 'HTML'
    case 'py':
      return 'Python'
    case 'go':
      return 'Go'
    case 'sh':
      return 'Shell'
    default:
      return ext.toUpperCase() || 'PLAINTEXT'
  }
}
