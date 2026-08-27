import { invoke as tauriInvoke } from '@tauri-apps/api/core'

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
}

// In-browser mock workspace files for Web demo & mobile web deployment
const MOCK_WEB_FILES: Record<string, string> = {
  'welcome://get-started': '',
  '/demo-project/src/App.tsx': `import React, { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Cekcok IDE (Web Edition)</h1>
      <p>The high-velocity, lightweight web & desktop IDE.</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}
export default App`,
  '/demo-project/src/index.css': `body {
  margin: 0;
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
}`,
  '/demo-project/package.json': `{
  "name": "cekcok-web-demo",
  "version": "1.0.0",
  "description": "Cekcok IDE Web Edition",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "vite": "^7.3.0",
    "typescript": "^5.0.0"
  }
}`,
  '/demo-project/README.md': `# Cekcok IDE Web Edition

Welcome to the browser-compatible build of Cekcok IDE.
Edit files in real-time, test split editor layouts, and customize your workspace!
`
}

export const safeInvoke = async <T = unknown>(cmd: string, args: Record<string, unknown> = {}): Promise<T> => {
  if (isTauri()) {
    return await tauriInvoke<T>(cmd, args)
  }

  // Graceful Web Browser Fallbacks
  switch (cmd) {
    case 'read_dir': {
      const path = (args.path as string) || '/demo-project'
      if (path === '/demo-project') {
        return [
          {
            name: 'src',
            path: '/demo-project/src',
            is_dir: true,
            children: [
              { name: 'App.tsx', path: '/demo-project/src/App.tsx', is_dir: false },
              { name: 'index.css', path: '/demo-project/src/index.css', is_dir: false }
            ]
          },
          { name: 'package.json', path: '/demo-project/package.json', is_dir: false },
          { name: 'README.md', path: '/demo-project/README.md', is_dir: false }
        ] as unknown as T
      } else if (path === '/demo-project/src') {
        return [
          { name: 'App.tsx', path: '/demo-project/src/App.tsx', is_dir: false },
          { name: 'index.css', path: '/demo-project/src/index.css', is_dir: false }
        ] as unknown as T
      }
      return [] as unknown as T
    }

    case 'read_file': {
      const path = args.path as string
      if (MOCK_WEB_FILES[path]) {
        return MOCK_WEB_FILES[path] as unknown as T
      }
      const local = localStorage.getItem(`cekcok_file_${path}`)
      if (local !== null) return local as unknown as T
      return `// Web Mock File: ${path}\n// Running in browser mode.` as unknown as T
    }

    case 'write_file': {
      const path = args.path as string
      const content = (args.content as string) || ''
      MOCK_WEB_FILES[path] = content
      localStorage.setItem(`cekcok_file_${path}`, content)
      return 'OK' as unknown as T
    }

    case 'git_get_status': {
      return {
        is_repo: true,
        branch: 'main',
        staged: [],
        unstaged: [
          { path: 'src/App.tsx', status: 'M' }
        ],
        ahead: 0,
        behind: 0
      } as unknown as T
    }

    case 'search_files': {
      const query = ((args.query as string) || '').toLowerCase()
      const results: Array<{ file_name: string; file_path: string; line_number: number; line_text: string }> = []
      
      Object.entries(MOCK_WEB_FILES).forEach(([filePath, content]) => {
        if (filePath.startsWith('welcome://')) return
        const lines = content.split('\n')
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(query)) {
            results.push({
              file_name: filePath.split('/').pop() || '',
              file_path: filePath,
              line_number: idx + 1,
              line_text: line.trim()
            })
          }
        })
      })
      return results as unknown as T
    }

    case 'spawn_shell':
    case 'execute_shell': {
      return 'Web shell active. (Tauri native process required for local OS commands)' as unknown as T
    }

    default:
      return null as unknown as T
  }
}

/**
 * Restart the application via the Rust backend.
 * Used after installing an update to relaunch with the new version.
 */
export const restartApp = async (): Promise<void> => {
  if (isTauri()) {
    await tauriInvoke('restart_app')
  } else {
    window.location.reload()
  }
}
