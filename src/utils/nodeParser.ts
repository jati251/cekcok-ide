import { safeInvoke } from './tauriBridge'
import { PackageJson, PackageManager, NodeDependencyItem } from '../types/node'

/**
 * Detects the active package manager based on lockfiles in the workspace directory.
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  if (!cwd) return 'npm'

  try {
    const files = await safeInvoke<Array<{ name: string }>>('read_dir', {
      path: cwd,
      show_hidden: true,
    })

    const fileNames = new Set(files.map((f) => f.name.toLowerCase()))

    if (fileNames.has('pnpm-lock.yaml')) return 'pnpm'
    if (fileNames.has('bun.lockb') || fileNames.has('bun.lock')) return 'bun'
    if (fileNames.has('yarn.lock')) return 'yarn'
    if (fileNames.has('package-lock.json')) return 'npm'
  } catch {
    // fallback
  }

  return 'npm'
}

/**
 * Detects frameworks, libraries, and tools from package.json.
 */
export function detectNodeFrameworks(pkg: PackageJson): string[] {
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.peerDependencies || {}),
  }

  const frameworks: string[] = []

  // Fullstack & Web Frameworks
  if (allDeps['next']) frameworks.push('Next.js')
  else if (allDeps['react']) frameworks.push('React')

  if (allDeps['vue']) frameworks.push('Vue.js')
  if (allDeps['svelte'] || allDeps['@sveltejs/kit']) frameworks.push('Svelte')
  if (allDeps['astro']) frameworks.push('Astro')
  if (allDeps['@remix-run/react']) frameworks.push('Remix')

  // Backend Frameworks
  if (allDeps['@nestjs/core']) frameworks.push('NestJS')
  if (allDeps['express']) frameworks.push('Express')
  if (allDeps['fastify']) frameworks.push('Fastify')
  if (allDeps['hono']) frameworks.push('Hono')
  if (allDeps['koa']) frameworks.push('Koa')

  // Build & Tooling
  if (allDeps['vite']) frameworks.push('Vite')
  if (allDeps['tailwindcss'] || allDeps['@tailwindcss/postcss']) frameworks.push('Tailwind')
  if (allDeps['typescript']) frameworks.push('TypeScript')
  if (allDeps['prisma'] || allDeps['@prisma/client']) frameworks.push('Prisma')
  if (allDeps['drizzle-orm']) frameworks.push('Drizzle')
  if (allDeps['vitest']) frameworks.push('Vitest')
  if (allDeps['jest']) frameworks.push('Jest')
  if (allDeps['electron']) frameworks.push('Electron')
  if (allDeps['@tauri-apps/api']) frameworks.push('Tauri')

  return frameworks
}

/**
 * Extracts and categorizes all dependencies from package.json.
 */
export function extractNodeDependencies(pkg: PackageJson): NodeDependencyItem[] {
  const items: NodeDependencyItem[] = []

  if (pkg.dependencies) {
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      items.push({ name, version: String(version), isDev: false })
    }
  }

  if (pkg.devDependencies) {
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      items.push({ name, version: String(version), isDev: true })
    }
  }

  if (pkg.peerDependencies) {
    for (const [name, version] of Object.entries(pkg.peerDependencies)) {
      items.push({ name, version: String(version), isDev: false, isPeer: true })
    }
  }

  return items
}

/**
 * Formats script run command with the appropriate package manager.
 */
export function formatPackageRunCommand(pm: PackageManager, scriptName: string): string {
  switch (pm) {
    case 'pnpm':
      return `pnpm ${scriptName}`
    case 'bun':
      return `bun run ${scriptName}`
    case 'yarn':
      return `yarn ${scriptName}`
    case 'npm':
    default:
      return `npm run ${scriptName}`
  }
}

/**
 * Formats package installation command.
 */
export function formatInstallCommand(
  pm: PackageManager,
  packageName: string,
  isDev: boolean
): string {
  switch (pm) {
    case 'pnpm':
      return isDev ? `pnpm add -D ${packageName}` : `pnpm add ${packageName}`
    case 'bun':
      return isDev ? `bun add -d ${packageName}` : `bun add ${packageName}`
    case 'yarn':
      return isDev ? `yarn add --dev ${packageName}` : `yarn add ${packageName}`
    case 'npm':
    default:
      return isDev ? `npm install -D ${packageName}` : `npm install ${packageName}`
  }
}

/**
 * Formats package uninstall command.
 */
export function formatUninstallCommand(pm: PackageManager, packageName: string): string {
  switch (pm) {
    case 'pnpm':
      return `pnpm remove ${packageName}`
    case 'bun':
      return `bun remove ${packageName}`
    case 'yarn':
      return `yarn remove ${packageName}`
    case 'npm':
    default:
      return `npm uninstall ${packageName}`
  }
}
