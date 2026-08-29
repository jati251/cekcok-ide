import { safeInvoke } from './tauriBridge'
import { JavaEnvironmentInfo } from '../types/java'

let cachedEnv: JavaEnvironmentInfo | null = null
let lastChecked = 0

/**
 * Checks system for Java (JDK), Maven, and Gradle availability and versions.
 */
export async function getJavaEnvironment(forceRefresh = false): Promise<JavaEnvironmentInfo> {
  const now = Date.now()
  if (!forceRefresh && cachedEnv && now - lastChecked < 60000) {
    return cachedEnv
  }

  const result: JavaEnvironmentInfo = {
    javaInstalled: false,
    mavenInstalled: false,
    gradleInstalled: false,
  }

  // 1. Check Java / JDK
  try {
    const javaOut = await safeInvoke<string>('execute_shell', {
      cmd: 'java -version 2>&1',
      cwd: '.',
    })

    if (javaOut && (javaOut.includes('version') || javaOut.includes('Runtime') || javaOut.includes('OpenJDK'))) {
      result.javaInstalled = true
      const verMatch = javaOut.match(/version\s*["']([^"']+)["']/)
      if (verMatch) {
        result.javaVersion = verMatch[1]
      } else {
        const altMatch = javaOut.match(/(?:openjdk|java)\s+(\d+(\.\d+)*)/i)
        result.javaVersion = altMatch ? altMatch[1] : 'Installed'
      }

      if (javaOut.includes('OpenJDK')) result.javaVendor = 'OpenJDK'
      else if (javaOut.includes('HotSpot')) result.javaVendor = 'Oracle HotSpot'
      else if (javaOut.includes('GraalVM')) result.javaVendor = 'GraalVM'
      else if (javaOut.includes('Temurin') || javaOut.includes('Adoptium')) result.javaVendor = 'Eclipse Temurin'
      else if (javaOut.includes('Corretto')) result.javaVendor = 'Amazon Corretto'
      else if (javaOut.includes('Zulu')) result.javaVendor = 'Azul Zulu'
      else result.javaVendor = 'JVM'
    }
  } catch {
    // Java not in path
  }

  // 2. Check Maven
  try {
    const mvnOut = await safeInvoke<string>('execute_shell', {
      cmd: 'mvn -v 2>&1',
      cwd: '.',
    })

    if (mvnOut && mvnOut.includes('Apache Maven')) {
      result.mavenInstalled = true
      const verMatch = mvnOut.match(/Apache Maven\s+([0-9.]+)/)
      result.mavenVersion = verMatch ? verMatch[1] : 'Installed'
    }
  } catch {
    // Maven not in path
  }

  // 3. Check Gradle
  try {
    const gradleOut = await safeInvoke<string>('execute_shell', {
      cmd: 'gradle -v 2>&1',
      cwd: '.',
    })

    if (gradleOut && gradleOut.includes('Gradle')) {
      result.gradleInstalled = true
      const verMatch = gradleOut.match(/Gradle\s+([0-9.]+)/)
      result.gradleVersion = verMatch ? verMatch[1] : 'Installed'
    }
  } catch {
    // Gradle not in path
  }

  cachedEnv = result
  lastChecked = now
  return result
}
