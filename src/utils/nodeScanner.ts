import { safeInvoke } from './tauriBridge'
import { NodeEndpoint } from '../types/node'

interface WorkspaceFileMatch {
  name: string
  path: string
  relative_path: string
}

/**
 * Scans workspace files for Node.js, Express, NestJS, Next.js, Fastify, and Hono routes.
 */
export async function scanNodeWorkspace(cwd: string): Promise<NodeEndpoint[]> {
  if (!cwd) return []

  try {
    const files = await safeInvoke<WorkspaceFileMatch[]>('find_workspace_files', {
      cwd,
      query: '',
      limit: 400,
    })

    if (!files || files.length === 0) return []

    const endpoints: NodeEndpoint[] = []

    for (const file of files) {
      const relPath = file.relative_path.replace(/\\/g, '/')
      const ext = file.name.split('.').pop()?.toLowerCase() || ''

      // Only scan code files, skip node_modules, dist, build, .git
      if (
        !['ts', 'js', 'tsx', 'jsx', 'mjs'].includes(ext) ||
        relPath.includes('node_modules') ||
        relPath.includes('dist/') ||
        relPath.includes('build/') ||
        relPath.includes('.next/')
      ) {
        continue
      }

      // 1. Check Next.js App Router (app/**/route.ts)
      if (file.name.startsWith('route.') && (relPath.includes('/app/') || relPath.startsWith('app/'))) {
        try {
          const content = await safeInvoke<string>('read_file', { path: file.path })
          if (content) {
            const lines = content.split(/\r?\n/)
            // Calculate route path from directory
            const sub = relPath.substring(relPath.indexOf('app/') + 4).replace(/\/route\.[a-z]+$/, '')
            const routePath = sub ? `/${sub}` : '/'

            const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = [
              'GET',
              'POST',
              'PUT',
              'DELETE',
              'PATCH',
            ]

            methods.forEach((m) => {
              const regex = new RegExp(`(?:export\\s+(?:async\\s+)?function\\s+${m}|export\\s+const\\s+${m}\\s*=)`, 'g')
              lines.forEach((line, idx) => {
                if (regex.test(line)) {
                  endpoints.push({
                    id: `${file.path}-${idx + 1}-${m}-${routePath}`,
                    method: m,
                    path: routePath,
                    handlerName: `${m} handler`,
                    filePath: file.path,
                    lineNumber: idx + 1,
                    framework: 'nextjs',
                  })
                }
              })
            })
            continue
          }
        } catch {
          // ignore
        }
      }

      // 2. Check Next.js Pages API (pages/api/**/*.ts)
      if (relPath.includes('pages/api/')) {
        const sub = relPath.substring(relPath.indexOf('pages/api/') + 6).replace(/\.[a-z]+$/, '')
        const routePath = `/${sub}`
        endpoints.push({
          id: `${file.path}-1-ALL-${routePath}`,
          method: 'ALL',
          path: routePath,
          handlerName: 'Pages API Handler',
          filePath: file.path,
          lineNumber: 1,
          framework: 'nextjs',
        })
        continue
      }

      // 3. Scan file content for Express, NestJS, Fastify, Hono
      try {
        const content = await safeInvoke<string>('read_file', { path: file.path })
        if (!content) continue

        // Quick check to avoid regex on files without router keywords
        if (
          !content.includes('.get(') &&
          !content.includes('.post(') &&
          !content.includes('.put(') &&
          !content.includes('.delete(') &&
          !content.includes('.patch(') &&
          !content.includes('@Get(') &&
          !content.includes('@Post(') &&
          !content.includes('@Put(') &&
          !content.includes('@Delete(') &&
          !content.includes('@Patch(')
        ) {
          continue
        }

        const lines = content.split(/\r?\n/)

        // Detect NestJS Controller prefix
        let nestControllerPrefix = ''
        const nestCtrlMatch = content.match(/@Controller\s*\(\s*['"`]([^'"`]*)['"`]\s*\)/)
        const isNest = content.includes('@nestjs/common') || !!nestCtrlMatch
        if (nestCtrlMatch) {
          nestControllerPrefix = nestCtrlMatch[1] ? `/${nestCtrlMatch[1].replace(/^\//, '')}` : ''
        }

        // Detect framework type
        let framework: 'express' | 'nestjs' | 'fastify' | 'hono' = 'express'
        if (isNest) framework = 'nestjs'
        else if (content.includes('from \'hono\'') || content.includes('from "hono"')) framework = 'hono'
        else if (content.includes('fastify')) framework = 'fastify'

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          const lineNum = i + 1

          // NestJS Decorators
          if (isNest) {
            const nestMatch = line.match(
              /@(Get|Post|Put|Delete|Patch)\s*\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/i
            )
            if (nestMatch) {
              const method = nestMatch[1].toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
              const sub = nestMatch[2] ? `/${nestMatch[2].replace(/^\//, '')}` : ''
              let fullPath = `${nestControllerPrefix}${sub}`.replace(/\/+/g, '/')
              if (!fullPath) fullPath = '/'

              // find method name
              let handlerName = 'handler()'
              for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
                const mMatch = lines[j].match(/(?:async\s+)?([A-Za-z0-9_]+)\s*\(/)
                if (mMatch) {
                  handlerName = `${mMatch[1]}()`
                  break
                }
              }

              endpoints.push({
                id: `${file.path}-${lineNum}-${method}-${fullPath}`,
                method,
                path: fullPath,
                handlerName,
                filePath: file.path,
                lineNumber: lineNum,
                framework: 'nestjs',
              })
              continue
            }
          }

          // Express, Fastify, Hono: app.get('/path', ...) or router.get('/path', ...)
          const routeMatch = line.match(
            /(?:app|router|server|api|v1|route|routes)\.(get|post|put|delete|patch|all)\s*\(\s*['"`]([^'"`]+)['"`]/i
          )

          if (routeMatch) {
            const method = routeMatch[1].toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL'
            const routePath = routeMatch[2].startsWith('/') ? routeMatch[2] : `/${routeMatch[2]}`

            // try to get handler name from line or filename
            const handlerName = file.name.replace(/\.[a-z]+$/, '')

            endpoints.push({
              id: `${file.path}-${lineNum}-${method}-${routePath}`,
              method,
              path: routePath,
              handlerName,
              filePath: file.path,
              lineNumber: lineNum,
              framework,
            })
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    return endpoints
  } catch (err) {
    console.error('Failed to scan Node.js workspace routes:', err)
    return []
  }
}
