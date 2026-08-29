export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export interface PackageJson {
  name?: string
  version?: string
  description?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  engines?: Record<string, string>
  packageManager?: string
  type?: 'module' | 'commonjs'
}

export interface NodeDependencyItem {
  name: string
  version: string
  isDev: boolean
  isPeer?: boolean
}

export interface NodeEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL' | 'USE'
  path: string
  handlerName: string
  filePath: string
  lineNumber: number
  framework: 'express' | 'nestjs' | 'nextjs' | 'fastify' | 'hono' | 'koa'
}

export interface NodeProjectDetails {
  packageManager: PackageManager
  frameworks: string[]
  dependencies: NodeDependencyItem[]
  hasTypeScript: boolean
  isModule: boolean
}

export interface NodeInitializrOptions {
  template: 'vite-react-ts' | 'nextjs-ts' | 'express-ts' | 'nestjs-ts' | 'hono-bun-ts' | 'vite-vue-ts'
  name: string
  packageManager: PackageManager
  useTailwind?: boolean
  useEslint?: boolean
}
