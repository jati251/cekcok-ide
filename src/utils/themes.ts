export interface ThemeDefinition {
  id: string
  name: string
  monacoBase: 'vs' | 'vs-dark' | 'hc-black'
  colors: {
    bg: string
    sidebar: string
    activityBar: string
    tabActive: string
    tabInactive: string
    border: string
    text: string
    muted: string
    accent: string
    accentHover: string
    statusBar: string
    statusBarText: string
    terminalBg: string
  }
}

export const THEMES: Record<string, ThemeDefinition> = {
  'vs-dark': {
    id: 'vs-dark',
    name: 'Dark+ (VS Code)',
    monacoBase: 'vs-dark',
    colors: {
      bg: '#1e1e1e',
      sidebar: '#252526',
      activityBar: '#181818',
      tabActive: '#1e1e1e',
      tabInactive: '#2d2d2d',
      border: '#333333',
      text: '#cccccc',
      muted: '#888888',
      accent: '#007acc',
      accentHover: '#005f9e',
      statusBar: '#007acc',
      statusBarText: '#ffffff',
      terminalBg: '#181818',
    }
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula Official',
    monacoBase: 'vs-dark',
    colors: {
      bg: '#282a36',
      sidebar: '#21222c',
      activityBar: '#191a21',
      tabActive: '#282a36',
      tabInactive: '#191a21',
      border: '#44475a',
      text: '#f8f8f2',
      muted: '#6272a4',
      accent: '#bd93f9',
      accentHover: '#a371f7',
      statusBar: '#6272a4',
      statusBarText: '#f8f8f2',
      terminalBg: '#1e1f29',
    }
  },
  'one-dark': {
    id: 'one-dark',
    name: 'One Dark Pro',
    monacoBase: 'vs-dark',
    colors: {
      bg: '#282c34',
      sidebar: '#21252b',
      activityBar: '#1b1d23',
      tabActive: '#282c34',
      tabInactive: '#21252b',
      border: '#181a1f',
      text: '#abb2bf',
      muted: '#5c6370',
      accent: '#61afef',
      accentHover: '#4d9be6',
      statusBar: '#21252b',
      statusBarText: '#9da5b4',
      terminalBg: '#21252b',
    }
  },
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark Default',
    monacoBase: 'vs-dark',
    colors: {
      bg: '#0d1117',
      sidebar: '#161b22',
      activityBar: '#010409',
      tabActive: '#0d1117',
      tabInactive: '#161b22',
      border: '#30363d',
      text: '#c9d1d9',
      muted: '#8b949e',
      accent: '#58a6ff',
      accentHover: '#388bfd',
      statusBar: '#161b22',
      statusBarText: '#8b949e',
      terminalBg: '#090d12',
    }
  },
  'synthwave': {
    id: 'synthwave',
    name: "SynthWave '84",
    monacoBase: 'vs-dark',
    colors: {
      bg: '#262335',
      sidebar: '#1e1b2e',
      activityBar: '#161424',
      tabActive: '#262335',
      tabInactive: '#1a1829',
      border: '#463465',
      text: '#ffffff',
      muted: '#848bbd',
      accent: '#ff7edb',
      accentHover: '#f957c7',
      statusBar: '#1f1b2c',
      statusBarText: '#fe4450',
      terminalBg: '#1e1a2d',
    }
  },
  'vs-light': {
    id: 'vs-light',
    name: 'Light+ (VS Code)',
    monacoBase: 'vs',
    colors: {
      bg: '#ffffff',
      sidebar: '#f3f3f3',
      activityBar: '#2c2c2c',
      tabActive: '#ffffff',
      tabInactive: '#ececec',
      border: '#e5e5e5',
      text: '#333333',
      muted: '#717171',
      accent: '#007acc',
      accentHover: '#005f9e',
      statusBar: '#007acc',
      statusBarText: '#ffffff',
      terminalBg: '#f8f8f8',
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerMonacoThemes = (monaco: any) => {
  if (!monaco || !monaco.editor) return

  // Register Dracula
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'identifier', foreground: 'f8f8f2' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a44',
      'editorCursor.foreground': '#aeafad',
      'editorWhitespace.foreground': '#44475a',
      'editorIndentGuide.background1': '#44475a',
    }
  })

  // Register One Dark
  monaco.editor.defineTheme('one-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'string', foreground: '98c379' },
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'identifier', foreground: 'abb2bf' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'type', foreground: 'e5c07b' },
      { token: 'function', foreground: '61afef' },
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editor.lineHighlightBackground': '#2c313a',
      'editorCursor.foreground': '#528bff',
    }
  })

  // Register GitHub Dark
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'identifier', foreground: 'c9d1d9' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b22',
      'editorCursor.foreground': '#58a6ff',
    }
  })

  // Register SynthWave
  monaco.editor.defineTheme('synthwave', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '848bbd', fontStyle: 'italic' },
      { token: 'string', foreground: 'ff7edb' },
      { token: 'keyword', foreground: 'fe4450' },
      { token: 'identifier', foreground: 'ffffff' },
      { token: 'number', foreground: 'f92aad' },
      { token: 'type', foreground: '72f1b8' },
      { token: 'function', foreground: '36f9f6' },
    ],
    colors: {
      'editor.background': '#262335',
      'editor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#34294f44',
      'editorCursor.foreground': '#fe4450',
    }
  })
}
