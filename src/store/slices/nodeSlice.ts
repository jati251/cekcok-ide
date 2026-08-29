import { StateCreator } from 'zustand'
import { safeInvoke } from '../../utils/tauriBridge'
import { FullIDEStore } from '../useIDEStore'
import {
  PackageJson,
  PackageManager,
  NodeProjectDetails,
  NodeEndpoint,
} from '../../types/node'
import { JavaProjectDetails, SpringEndpoint, SpringBean } from '../../types/java'
import { parseMavenPom, parseGradleBuild } from '../../utils/javaParser'
import { scanSpringWorkspace } from '../../utils/springScanner'
import {
  detectPackageManager,
  detectNodeFrameworks,
  extractNodeDependencies,
  formatPackageRunCommand,
} from '../../utils/nodeParser'
import { scanNodeWorkspace } from '../../utils/nodeScanner'

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
  packageManager: PackageManager
  nodeDetails: NodeProjectDetails | null
  nodeEndpoints: NodeEndpoint[]
  isScanningNode: boolean
  javaDetails: JavaProjectDetails | null
  springEndpoints: SpringEndpoint[]
  springBeans: SpringBean[]
  isScanningSpring: boolean
  setPackageManager: (pm: PackageManager) => void
  refreshPackageJson: () => Promise<void>
  refreshSpringEndpoints: () => Promise<void>
  refreshNodeEndpoints: () => Promise<void>
}

export const createNodeSlice: StateCreator<FullIDEStore, [], [], NodeSlice> = (set, get) => ({
  projectInfo: null,
  packageJson: null,
  packageManager: 'npm',
  nodeDetails: null,
  nodeEndpoints: [],
  isScanningNode: false,
  javaDetails: null,
  springEndpoints: [],
  springBeans: [],
  isScanningSpring: false,

  setPackageManager: (pm: PackageManager) => {
    set({ packageManager: pm })
    const pkg = get().packageJson
    if (pkg && pkg.scripts) {
      const scripts = Object.entries(pkg.scripts).map(([name]) => ({
        name,
        command: formatPackageRunCommand(pm, name),
        source: pm,
      }))
      const cur = get().projectInfo
      if (cur) {
        set({
          projectInfo: {
            ...cur,
            scripts,
          },
        })
      }
    }
  },

  refreshSpringEndpoints: async () => {
    const curDir = get().currentDir
    if (!curDir) return

    set({ isScanningSpring: true })
    try {
      const { endpoints, beans } = await scanSpringWorkspace(curDir)
      set({ springEndpoints: endpoints, springBeans: beans, isScanningSpring: false })
    } catch {
      set({ isScanningSpring: false })
    }
  },

  refreshNodeEndpoints: async () => {
    const curDir = get().currentDir
    if (!curDir) return

    set({ isScanningNode: true })
    try {
      const endpoints = await scanNodeWorkspace(curDir)
      set({ nodeEndpoints: endpoints, isScanningNode: false })
    } catch {
      set({ isScanningNode: false })
    }
  },

  refreshPackageJson: async () => {
    const curDir = get().currentDir
    if (!curDir) {
      set({
        projectInfo: null,
        packageJson: null,
        nodeDetails: null,
        nodeEndpoints: [],
        javaDetails: null,
        springEndpoints: [],
        springBeans: [],
      })
      return
    }

    // 1. Check for Java / Spring Boot / Maven / Gradle (pom.xml or build.gradle)
    const pomPath = `${curDir}/pom.xml`
    const gradlePath = `${curDir}/build.gradle`
    const gradleKtsPath = `${curDir}/build.gradle.kts`

    try {
      let javaDetails: JavaProjectDetails | null = null
      let isMaven = false

      try {
        const pomContent = await safeInvoke<string>('read_file', { path: pomPath })
        javaDetails = parseMavenPom(pomContent)
        isMaven = true
      } catch {
        try {
          const gradleContent = await safeInvoke<string>('read_file', { path: gradlePath })
          javaDetails = parseGradleBuild(gradleContent)
        } catch {
          const gradleKtsContent = await safeInvoke<string>('read_file', { path: gradleKtsPath })
          javaDetails = parseGradleBuild(gradleKtsContent)
        }
      }

      if (javaDetails) {
        const isSpring = javaDetails.isSpringBoot
        const scripts = isMaven
          ? isSpring
            ? [
                { name: 'Spring Boot: Run', command: 'mvn spring-boot:run', source: 'spring' },
                {
                  name: 'Spring Boot: Debug (Port 5005)',
                  command:
                    'mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"',
                  source: 'spring',
                },
                { name: 'Spring Boot: Package JAR', command: 'mvn clean package -DskipTests', source: 'maven' },
                { name: 'Run Tests', command: 'mvn test', source: 'maven' },
                { name: 'Clean & Compile', command: 'mvn clean compile', source: 'maven' },
                { name: 'Build Docker Container', command: 'mvn spring-boot:build-image', source: 'spring' },
                { name: 'Dependency Tree', command: 'mvn dependency:tree', source: 'maven' },
              ]
            : [
                { name: 'mvn clean compile', command: 'mvn clean compile', source: 'maven' },
                { name: 'mvn test', command: 'mvn test', source: 'maven' },
                { name: 'mvn package', command: 'mvn package', source: 'maven' },
                { name: 'mvn clean', command: 'mvn clean', source: 'maven' },
              ]
          : isSpring
          ? [
              { name: 'Spring Boot: Run', command: './gradlew bootRun', source: 'spring' },
              { name: 'Spring Boot: Debug', command: './gradlew bootRun --debug-jvm', source: 'spring' },
              { name: 'Spring Boot: Package JAR', command: './gradlew bootJar -x test', source: 'gradle' },
              { name: 'Run Tests', command: './gradlew test', source: 'gradle' },
              { name: 'Build Project', command: './gradlew build', source: 'gradle' },
              { name: 'Clean Project', command: './gradlew clean', source: 'gradle' },
              { name: 'Dependencies', command: './gradlew dependencies', source: 'gradle' },
            ]
          : [
              { name: 'gradle build', command: './gradlew build', source: 'gradle' },
              { name: 'gradle test', command: './gradlew test', source: 'gradle' },
              { name: 'gradle clean', command: './gradlew clean', source: 'gradle' },
            ]

        const title = isSpring
          ? `${javaDetails.name || 'Spring Boot Application'} (Spring Boot ${javaDetails.springBootVersion || ''})`.trim()
          : `${javaDetails.name || 'Java Application'} (${isMaven ? 'Maven' : 'Gradle'})`

        set({
          packageJson: null,
          nodeDetails: null,
          nodeEndpoints: [],
          javaDetails,
          projectInfo: {
            kind: 'java',
            title,
            version: javaDetails.version || (isMaven ? 'Maven' : 'Gradle'),
            description: javaDetails.description || 'Java JVM Application',
            scripts,
            dependenciesCount: javaDetails.dependencies.length,
          },
        })

        if (isSpring) {
          get().refreshSpringEndpoints()
        }
        return
      }
    } catch {
      // not java
    }

    // 2. Check for Node.js (package.json)
    const pkgPath = `${curDir}/package.json`
    try {
      const content = await safeInvoke<string>('read_file', { path: pkgPath })
      const parsed: PackageJson = JSON.parse(content)

      const pm = await detectPackageManager(curDir)
      const frameworks = detectNodeFrameworks(parsed)
      const deps = extractNodeDependencies(parsed)

      const scripts = parsed.scripts
        ? Object.entries(parsed.scripts).map(([name]) => ({
            name,
            command: formatPackageRunCommand(pm, name),
            source: pm,
          }))
        : []

      const nodeDetails: NodeProjectDetails = {
        packageManager: pm,
        frameworks,
        dependencies: deps,
        hasTypeScript: !!(
          parsed.devDependencies?.['typescript'] ||
          parsed.dependencies?.['typescript'] ||
          frameworks.includes('TypeScript')
        ),
        isModule: parsed.type === 'module',
      }

      set({
        javaDetails: null,
        springEndpoints: [],
        springBeans: [],
        packageJson: parsed,
        packageManager: pm,
        nodeDetails,
        projectInfo: {
          kind: 'node',
          title: parsed.name || 'Node.js Project',
          version: parsed.version || '1.0.0',
          description: parsed.description || frameworks.join(' • ') || 'Node.js application',
          scripts,
          dependenciesCount: deps.length,
        },
      })

      // Scan routes in background
      get().refreshNodeEndpoints()
      return
    } catch {
      // not node
    }

    // 3. Check for Rust (Cargo.toml)
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
        nodeDetails: null,
        nodeEndpoints: [],
        javaDetails: null,
        springEndpoints: [],
        springBeans: [],
        projectInfo: {
          kind: 'rust',
          title,
          version,
          description: 'Rust Cargo workspace / crate',
          scripts,
          dependenciesCount: content.match(/\[dependencies\]/g) ? 1 : 0,
        },
      })
      return
    } catch {
      // not rust
    }

    // 4. Check for Go (go.mod)
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
        nodeDetails: null,
        nodeEndpoints: [],
        javaDetails: null,
        springEndpoints: [],
        springBeans: [],
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
          nodeDetails: null,
          nodeEndpoints: [],
          javaDetails: null,
          springEndpoints: [],
          springBeans: [],
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
      nodeDetails: null,
      nodeEndpoints: [],
      javaDetails: null,
      springEndpoints: [],
      springBeans: [],
      projectInfo: {
        kind: 'generic',
        title: curDir.split(/[/\\]/).pop() || 'Project Workspace',
        scripts: [],
        dependenciesCount: 0,
      },
    })
  },
})
