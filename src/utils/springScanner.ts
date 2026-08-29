import { safeInvoke } from './tauriBridge'
import { SpringEndpoint, SpringBean } from '../types/java'

interface WorkspaceFileMatch {
  name: string
  path: string
  relative_path: string
}

/**
 * Scans workspace .java / .kt files for Spring Boot REST endpoints and Spring Beans.
 */
export async function scanSpringWorkspace(
  cwd: string
): Promise<{ endpoints: SpringEndpoint[]; beans: SpringBean[] }> {
  if (!cwd) return { endpoints: [], beans: [] }

  try {
    const javaFiles = await safeInvoke<WorkspaceFileMatch[]>('find_workspace_files', {
      cwd,
      query: '.java',
      limit: 300,
    })

    if (!javaFiles || javaFiles.length === 0) {
      return { endpoints: [], beans: [] }
    }

    const endpoints: SpringEndpoint[] = []
    const beans: SpringBean[] = []

    for (const file of javaFiles) {
      if (!file.name.endsWith('.java') && !file.name.endsWith('.kt')) continue

      try {
        const content = await safeInvoke<string>('read_file', { path: file.path })
        if (!content) continue

        const lines = content.split(/\r?\n/)

        // Detect Class-level annotations & Class name
        let isRestController = false
        let isController = false
        let isService = false
        let isRepo = false
        let isComponent = false
        let isEntity = false
        let isConfig = false

        let baseMappingPath = ''
        let className = file.name.replace(/\.(java|kt)$/, '')

        // Detect class name from content if different
        const classMatch = content.match(/(?:public\s+)?(?:class|interface|record)\s+([A-Za-z0-9_]+)/)
        if (classMatch) {
          className = classMatch[1]
        }

        // Check Bean types
        if (content.includes('@RestController')) isRestController = true
        if (content.includes('@Controller')) isController = true
        if (content.includes('@Service')) isService = true
        if (content.includes('@Repository')) isRepo = true
        if (content.includes('@Component')) isComponent = true
        if (content.includes('@Entity')) isEntity = true
        if (content.includes('@Configuration')) isConfig = true

        if (isRestController || isController) {
          beans.push({
            id: `bean-${file.path}-ctrl`,
            name: className,
            type: 'controller',
            filePath: file.path,
            lineNumber: 1,
          })
        }
        if (isService) {
          beans.push({
            id: `bean-${file.path}-svc`,
            name: className,
            type: 'service',
            filePath: file.path,
            lineNumber: 1,
          })
        }
        if (isRepo) {
          beans.push({
            id: `bean-${file.path}-repo`,
            name: className,
            type: 'repository',
            filePath: file.path,
            lineNumber: 1,
          })
        }
        if (isComponent) {
          beans.push({
            id: `bean-${file.path}-comp`,
            name: className,
            type: 'component',
            filePath: file.path,
            lineNumber: 1,
          })
        }
        if (isEntity) {
          beans.push({
            id: `bean-${file.path}-ent`,
            name: className,
            type: 'entity',
            filePath: file.path,
            lineNumber: 1,
          })
        }
        if (isConfig) {
          beans.push({
            id: `bean-${file.path}-cfg`,
            name: className,
            type: 'config',
            filePath: file.path,
            lineNumber: 1,
          })
        }

        // If it is a Controller or RestController, scan for Endpoints
        if (isRestController || isController || content.includes('Mapping')) {
          // Check class level RequestMapping
          const classMappingMatch = content.match(
            /@RequestMapping\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']/
          )
          if (classMappingMatch) {
            baseMappingPath = classMappingMatch[1]
            if (!baseMappingPath.startsWith('/') && baseMappingPath !== '') {
              baseMappingPath = '/' + baseMappingPath
            }
          }

          // Scan line by line for method annotations
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            const lineNum = i + 1

            let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'REQUEST' | null = null
            let subPath = ''

            const getMatch = line.match(/@GetMapping(?:\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']\s*\))?/)
            const postMatch = line.match(/@PostMapping(?:\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']\s*\))?/)
            const putMatch = line.match(/@PutMapping(?:\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']\s*\))?/)
            const delMatch = line.match(/@DeleteMapping(?:\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']\s*\))?/)
            const patchMatch = line.match(/@PatchMapping(?:\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']\s*\))?/)
            const reqMatch = line.match(/@RequestMapping(?:\s*\(\s*(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']\s*\))?/)

            if (getMatch) {
              method = 'GET'
              subPath = getMatch[1] || ''
            } else if (postMatch) {
              method = 'POST'
              subPath = postMatch[1] || ''
            } else if (putMatch) {
              method = 'PUT'
              subPath = putMatch[1] || ''
            } else if (delMatch) {
              method = 'DELETE'
              subPath = delMatch[1] || ''
            } else if (patchMatch) {
              method = 'PATCH'
              subPath = patchMatch[1] || ''
            } else if (reqMatch && !line.includes('class ')) {
              method = 'REQUEST'
              subPath = reqMatch[1] || ''
            }

            if (method) {
              if (subPath && !subPath.startsWith('/')) {
                subPath = '/' + subPath
              }
              let fullPath = `${baseMappingPath}${subPath}`.replace(/\/+/g, '/')
              if (!fullPath) fullPath = '/'

              // Look ahead a few lines for the Java method signature
              let methodName = 'handler()'
              for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
                const methodLine = lines[j].trim()
                const mMatch = methodLine.match(/(?:public|protected|private)?\s+[A-Za-z0-9_<>,[\]\s]+\s+([A-Za-z0-9_]+)\s*\(/)
                if (mMatch && !methodLine.includes('class ')) {
                  methodName = mMatch[1] + '()'
                  break
                }
              }

              endpoints.push({
                id: `${file.path}-${lineNum}-${method}-${fullPath}`,
                method,
                path: fullPath,
                controllerName: className,
                methodName,
                filePath: file.path,
                lineNumber: lineNum,
              })
            }
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    return { endpoints, beans }
  } catch (err) {
    console.error('Failed to scan Spring workspace:', err)
    return { endpoints: [], beans: [] }
  }
}
