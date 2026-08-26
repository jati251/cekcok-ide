import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { FullIDEStore } from '../useIDEStore'

import { PackageJson } from '../../types/ide'

export type ProjectKind = 'node' | 'rust' | 'golang' | 'java' | 'python' | 'generic'

export interface ProjectManifestInfo {
  kind: ProjectKind
  title: string
  version?: string
  description?: string
  scripts: Array<{ name: string; command: string; source: string }>
  dependenciesCount: number
}

export interface NodeSlice {
  projectInfo: ProjectManifestInfo | null
  packageJson: PackageJson | null
  refreshPackageJson: () => Promise<void>
}

export const createNodeSlice: StateCreator<FullIDEStore, [], [], NodeSlice> = (set, get) => ({
  projectInfo: null,
  packageJson: null,

  refreshPackageJson: async () => {
    const curDir = get().currentDir
    if (!curDir) {
      set({ projectInfo: null, packageJson: null })
      return
    }

    // 1. Check for Node.js (package.json)
    const pkgPath = `${curDir}/package.json`
    try {
      const content = await safeInvoke<string>('read_file', { path: pkgPath })
      const parsed = JSON.parse(content)
      const scripts = parsed.scripts
        ? Object.entries(parsed.scripts).map(([name, command]) => ({
            name,
            command: String(command),
            source: 'npm',
          }))
        : []
      const depCount =
        Object.keys(parsed.dependencies || {}).length +
        Object.keys(parsed.devDependencies || {}).length

      set({
        packageJson: parsed,
        projectInfo: {
          kind: 'node',
          title: parsed.name || 'Node.js Project',
          version: parsed.version || '1.0.0',
          description: parsed.description,
          scripts,
          dependenciesCount: depCount,
        },
      })
      return
    } catch {
      // not node
    }

    // 2. Check for Rust (Cargo.toml)
    const cargoPath = `${curDir}/Cargo.toml`
    try {
      const content = await safeInvoke<string>('read_file', { path: cargoPath })
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/)
      const verMatch = content.match(/version\s*=\s*"([^"]+)"/)
      const title = nameMatch ? nameMatch[1] : 'Rust Crate'
      const version = verMatch ? verMatch[1] : '0.1.0'

      const scripts = [
        { name: 'cargo check', command: 'cargo check', source: 'cargo' },
        { name: 'cargo build', command: 'cargo build', source: 'cargo' },
        { name: 'cargo run', command: 'cargo run', source: 'cargo' },
        { name: 'cargo test', command: 'cargo test', source: 'cargo' },
        { name: 'cargo clippy', command: 'cargo clippy', source: 'cargo' },
      ]

      set({
        packageJson: null,
        projectInfo: {
          kind: 'rust',
          title,
          version,
          description: 'Rust Cargo workspace / crate',
          scripts,
          dependenciesCount: (content.match(/\[dependencies\]/g) ? 1 : 0),
        },
      })
      return
    } catch {
      // not rust
    }

    // 3. Check for Go (go.mod)
    const goModPath = `${curDir}/go.mod`
    try {
      const content = await safeInvoke<string>('read_file', { path: goModPath })
      const moduleMatch = content.match(/module\s+([^\s\n]+)/)
      const goVerMatch = content.match(/go\s+([^\s\n]+)/)
      const title = moduleMatch ? moduleMatch[1] : 'Go Module'
      const version = goVerMatch ? `Go ${goVerMatch[1]}` : 'Go'

      const scripts = [
        { name: 'go build', command: 'go build ./...', source: 'go' },
        { name: 'go run', command: 'go run .', source: 'go' },
        { name: 'go test', command: 'go test ./...', source: 'go' },
        { name: 'go mod tidy', command: 'go mod tidy', source: 'go' },
      ]

      set({
        packageJson: null,
        projectInfo: {
          kind: 'golang',
          title,
          version,
          description: 'Go module workspace',
          scripts,
          dependenciesCount: 0,
        },
      })
      return
    } catch {
      // not go
    }

    // 4. Check for Java / Gradle / Maven (pom.xml or build.gradle)
    const pomPath = `${curDir}/pom.xml`
    const gradlePath = `${curDir}/build.gradle`
    try {
      let isMaven = false
      try {
        await safeInvoke<string>('read_file', { path: pomPath })
        isMaven = true
      } catch {
        await safeInvoke<string>('read_file', { path: gradlePath })
      }

      const scripts = isMaven
        ? [
            { name: 'mvn clean compile', command: 'mvn clean compile', source: 'maven' },
            { name: 'mvn test', command: 'mvn test', source: 'maven' },
            { name: 'mvn package', command: 'mvn package', source: 'maven' },
            { name: 'mvn spring-boot:run', command: 'mvn spring-boot:run', source: 'maven' },
          ]
        : [
            { name: 'gradle build', command: './gradlew build', source: 'gradle' },
            { name: 'gradle test', command: './gradlew test', source: 'gradle' },
            { name: 'gradle bootRun', command: './gradlew bootRun', source: 'gradle' },
          ]

      set({
        packageJson: null,
        projectInfo: {
          kind: 'java',
          title: isMaven ? 'Maven Project' : 'Gradle Project',
          version: isMaven ? 'Maven' : 'Gradle',
          description: 'Java / JVM application suite',
          scripts,
          dependenciesCount: 0,
        },
      })
      return
    } catch {
      // not java
    }

    // 5. Check for Python (pyproject.toml or requirements.txt)
    const reqPath = `${curDir}/requirements.txt`
    const pyprojPath = `${curDir}/pyproject.toml`
    try {
      let isPy = false
      try {
        await safeInvoke<string>('read_file', { path: reqPath })
        isPy = true
      } catch {
        await safeInvoke<string>('read_file', { path: pyprojPath })
        isPy = true
      }

      if (isPy) {
        const scripts = [
          { name: 'python main', command: 'python main.py', source: 'python' },
          { name: 'pytest', command: 'pytest', source: 'python' },
          { name: 'pip install', command: 'pip install -r requirements.txt', source: 'pip' },
        ]

        set({
          packageJson: null,
          projectInfo: {
            kind: 'python',
            title: 'Python Project',
            version: 'Python 3',
            description: 'Python scripts and virtualenv',
            scripts,
            dependenciesCount: 0,
          },
        })
        return
      }
    } catch {
      // not python
    }

    // Default: Generic project
    set({
      packageJson: null,
      projectInfo: {
        kind: 'generic',
        title: curDir.split(/[/\\]/).pop() || 'Project Workspace',
        scripts: [],
        dependenciesCount: 0,
      },
    })
  },
})
