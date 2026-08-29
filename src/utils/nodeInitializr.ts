import { safeInvoke } from './tauriBridge'
import { NodeInitializrOptions } from '../types/node'

export interface NodeTemplateInfo {
  id: NodeInitializrOptions['template']
  title: string
  category: string
  description: string
  iconBadge: string
  tags: string[]
}

export const NODE_TEMPLATES: NodeTemplateInfo[] = [
  {
    id: 'vite-react-ts',
    title: 'Vite + React 19 + TypeScript',
    category: 'Frontend SPA',
    description: 'Blazing fast React 19 frontend with TypeScript and modern Tailwind CSS.',
    iconBadge: '⚛️ React',
    tags: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS'],
  },
  {
    id: 'nextjs-ts',
    title: 'Next.js 15 (App Router + TypeScript)',
    category: 'Fullstack Framework',
    description: 'Production-ready fullstack React with Server Components, API routes, and Tailwind.',
    iconBadge: '▲ Next.js',
    tags: ['Next.js 15', 'App Router', 'React 19', 'TypeScript'],
  },
  {
    id: 'express-ts',
    title: 'Express REST API (TypeScript)',
    category: 'Backend API',
    description: 'Clean Express RESTful service with TypeScript, CORS, Dotenv, and router structure.',
    iconBadge: '🌿 Express',
    tags: ['Express', 'TypeScript', 'Node.js', 'REST API'],
  },
  {
    id: 'nestjs-ts',
    title: 'NestJS Architecture (TypeScript)',
    category: 'Backend Framework',
    description: 'Scalable enterprise backend with modules, dependency injection, and decorators.',
    iconBadge: '🦁 NestJS',
    tags: ['NestJS', 'TypeScript', 'Decorators', 'Dependency Injection'],
  },
  {
    id: 'hono-bun-ts',
    title: 'Hono / Bun Ultra-Fast Web API',
    category: 'Microservices & Edge',
    description: 'Ultrafast, lightweight web framework designed for Bun, Node.js, and Cloudflare.',
    iconBadge: '🔥 Hono',
    tags: ['Hono', 'Bun', 'TypeScript', 'Edge API'],
  },
  {
    id: 'vite-vue-ts',
    title: 'Vite + Vue 3 + TypeScript',
    category: 'Frontend SPA',
    description: 'Modern Vue 3 Composition API with Vite bundler and TypeScript.',
    iconBadge: '💚 Vue 3',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'Pinia'],
  },
]

/**
 * Scaffolds a complete Node.js / TypeScript project locally.
 */
export async function scaffoldNodeProject(
  targetDir: string,
  options: NodeInitializrOptions
): Promise<void> {
  const { template, name, packageManager } = options

  await safeInvoke('create_dir', { path: targetDir })

  if (template === 'vite-react-ts') {
    // 1. Vite React TypeScript
    const pkgJson = {
      name,
      private: true,
      version: '0.0.1',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc -b && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'lucide-react': '^0.475.0',
      },
      devDependencies: {
        '@types/react': '^19.0.8',
        '@types/react-dom': '^19.0.3',
        '@vitejs/plugin-react': '^4.3.4',
        typescript: '~5.7.2',
        vite: '^6.1.0',
      },
    }

    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`

    const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`

    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

    const appTsx = `import React, { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem 2rem' }}>
      <h1>⚡ ${name}</h1>
      <p>Built with <strong>Vite + React 19 + TypeScript</strong> in Cekcok IDE.</p>
      <button 
        onClick={() => setCount((c) => c + 1)}
        style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px' }}
      >
        Count is {count}
      </button>
    </div>
  )
}
`

    const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`

    await safeInvoke('create_dir', { path: `${targetDir}/src` })
    await safeInvoke('write_file', { path: `${targetDir}/package.json`, content: JSON.stringify(pkgJson, null, 2) })
    await safeInvoke('write_file', { path: `${targetDir}/vite.config.ts`, content: viteConfig })
    await safeInvoke('write_file', { path: `${targetDir}/tsconfig.json`, content: tsConfig })
    await safeInvoke('write_file', { path: `${targetDir}/index.html`, content: indexHtml })
    await safeInvoke('write_file', { path: `${targetDir}/src/App.tsx`, content: appTsx })
    await safeInvoke('write_file', { path: `${targetDir}/src/main.tsx`, content: mainTsx })

  } else if (template === 'express-ts') {
    // 2. Express TypeScript REST API
    const pkgJson = {
      name,
      version: '1.0.0',
      description: 'Express REST API with TypeScript',
      main: 'dist/index.js',
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
      },
      dependencies: {
        express: '^4.21.2',
        cors: '^2.8.5',
        dotenv: '^16.4.7',
      },
      devDependencies: {
        '@types/express': '^5.0.0',
        '@types/cors': '^2.8.17',
        '@types/node': '^22.13.4',
        typescript: '^5.7.3',
        tsx: '^4.19.2',
      },
    }

    const tsConfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
`

    const indexTs = `import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { userRouter } from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() })
})

// Users resource API
app.use('/api/v1/users', userRouter)

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`)
})
`

    const usersTs = `import { Router } from 'express'

export const userRouter = Router()

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
]

userRouter.get('/', (req, res) => {
  res.json({ data: users })
})

userRouter.get('/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id))
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ data: user })
})

userRouter.post('/', (req, res) => {
  const newUser = { id: users.length + 1, ...req.body }
  users.push(newUser)
  res.status(201).json({ message: 'User created', data: newUser })
})
`

    await safeInvoke('create_dir', { path: `${targetDir}/src/routes` })
    await safeInvoke('write_file', { path: `${targetDir}/package.json`, content: JSON.stringify(pkgJson, null, 2) })
    await safeInvoke('write_file', { path: `${targetDir}/tsconfig.json`, content: tsConfig })
    await safeInvoke('write_file', { path: `${targetDir}/src/index.ts`, content: indexTs })
    await safeInvoke('write_file', { path: `${targetDir}/src/routes/users.ts`, content: usersTs })

  } else if (template === 'nextjs-ts') {
    // 3. Next.js 15 App Router
    const pkgJson = {
      name,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        next: '^15.1.7',
      },
      devDependencies: {
        typescript: '^5.7.3',
        '@types/node': '^22.13.4',
        '@types/react': '^19.0.8',
        '@types/react-dom': '^19.0.3',
      },
    }

    const tsConfig = `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`

    const layoutTsx = `import React from 'react'

export const metadata = {
  title: '${name}',
  description: 'Created with Cekcok IDE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
`

    const pageTsx = `import React from 'react'

export default function Home() {
  return (
    <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>▲ Welcome to ${name}</h1>
      <p>Next.js 15 with App Router &amp; Server Components.</p>
    </main>
  )
}
`

    const routeTs = `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Hello from Next.js App Router API in Cekcok IDE!',
    timestamp: Date.now(),
  })
}
`

    await safeInvoke('create_dir', { path: `${targetDir}/src/app/api/hello` })
    await safeInvoke('write_file', { path: `${targetDir}/package.json`, content: JSON.stringify(pkgJson, null, 2) })
    await safeInvoke('write_file', { path: `${targetDir}/tsconfig.json`, content: tsConfig })
    await safeInvoke('write_file', { path: `${targetDir}/src/app/layout.tsx`, content: layoutTsx })
    await safeInvoke('write_file', { path: `${targetDir}/src/app/page.tsx`, content: pageTsx })
    await safeInvoke('write_file', { path: `${targetDir}/src/app/api/hello/route.ts`, content: routeTs })

  } else {
    // Default fallback / Hono
    const pkgJson = {
      name,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        start: 'node src/index.js',
      },
      dependencies: {
        hono: '^4.6.20',
      },
      devDependencies: {
        '@types/node': '^22.13.4',
        typescript: '^5.7.3',
        tsx: '^4.19.2',
      },
    }

    const indexTs = `import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono API in Cekcok IDE!'))
app.get('/health', (c) => c.json({ status: 'UP', framework: 'Hono' }))

export default app
`
    await safeInvoke('create_dir', { path: `${targetDir}/src` })
    await safeInvoke('write_file', { path: `${targetDir}/package.json`, content: JSON.stringify(pkgJson, null, 2) })
    await safeInvoke('write_file', { path: `${targetDir}/src/index.ts`, content: indexTs })
  }

  // Generate .gitignore
  const gitignore = `node_modules/
dist/
build/
.next/
.env
.env.local
.DS_Store
*.log
`
  await safeInvoke('write_file', { path: `${targetDir}/.gitignore`, content: gitignore })

  // Generate README.md
  const readme = `# ${name}

> Generated with **Cekcok IDE** Node Initializr

## Getting Started

### 1. Install Dependencies
\`\`\`bash
${packageManager === 'pnpm' ? 'pnpm install' : packageManager === 'bun' ? 'bun install' : packageManager === 'yarn' ? 'yarn' : 'npm install'}
\`\`\`

### 2. Start Development Server
\`\`\`bash
${packageManager === 'pnpm' ? 'pnpm dev' : packageManager === 'bun' ? 'bun run dev' : packageManager === 'yarn' ? 'yarn dev' : 'npm run dev'}
\`\`\`
`
  await safeInvoke('write_file', { path: `${targetDir}/README.md`, content: readme })
}
