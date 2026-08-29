import { JavaProjectDetails, JavaDependency } from '../types/java'

/**
 * Parses a Maven pom.xml file to extract Spring Boot / Java project details and dependencies.
 */
export function parseMavenPom(content: string): JavaProjectDetails {
  // Extract groupId, artifactId, version, name, description
  const artifactMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/)
  const groupMatch = content.match(/<groupId>([^<]+)<\/groupId>/)
  const versionMatch = content.match(/<version>([^<]+)<\/version>/)
  const nameMatch = content.match(/<name>([^<]+)<\/name>/)
  const descMatch = content.match(/<description>([^<]+)<\/description>/)

  // Java version from properties or plugins
  const javaVerMatch =
    content.match(/<java\.version>([^<]+)<\/java\.version>/) ||
    content.match(/<maven\.compiler\.source>([^<]+)<\/maven\.compiler\.source>/) ||
    content.match(/<release>([^<]+)<\/release>/)

  // Spring Boot parent or plugin detection
  const isSpringBoot =
    content.includes('spring-boot-starter-parent') ||
    content.includes('spring-boot-maven-plugin') ||
    content.includes('org.springframework.boot')

  let springBootVersion: string | undefined
  const springBootParentMatch = content.match(
    /<parent>[\s\S]*?<groupId>org\.springframework\.boot<\/groupId>[\s\S]*?<artifactId>spring-boot-starter-parent<\/artifactId>[\s\S]*?<version>([^<]+)<\/version>[\s\S]*?<\/parent>/
  )
  if (springBootParentMatch) {
    springBootVersion = springBootParentMatch[1]
  } else {
    const pluginVersionMatch = content.match(
      /<artifactId>spring-boot-maven-plugin<\/artifactId>[\s\S]*?<version>([^<]+)<\/version>/
    )
    if (pluginVersionMatch) {
      springBootVersion = pluginVersionMatch[1]
    }
  }

  // Extract dependencies
  const dependencies: JavaDependency[] = []
  const depRegex = /<dependency>([\s\S]*?)<\/dependency>/g
  let match
  while ((match = depRegex.exec(content)) !== null) {
    const depBlock = match[1]
    const gMatch = depBlock.match(/<groupId>([^<]+)<\/groupId>/)
    const aMatch = depBlock.match(/<artifactId>([^<]+)<\/artifactId>/)
    const vMatch = depBlock.match(/<version>([^<]+)<\/version>/)
    const sMatch = depBlock.match(/<scope>([^<]+)<\/scope>/)

    if (gMatch && aMatch) {
      dependencies.push({
        groupId: gMatch[1].trim(),
        artifactId: aMatch[1].trim(),
        version: vMatch ? vMatch[1].trim() : undefined,
        scope: sMatch ? sMatch[1].trim() : 'compile',
      })
    }
  }

  return {
    isSpringBoot,
    springBootVersion,
    buildTool: 'maven',
    groupId: groupMatch ? groupMatch[1] : undefined,
    artifactId: artifactMatch ? artifactMatch[1] : undefined,
    name: nameMatch ? nameMatch[1] : artifactMatch ? artifactMatch[1] : 'Maven Project',
    version: versionMatch ? versionMatch[1] : '1.0.0',
    description: descMatch ? descMatch[1] : 'Maven Java Project',
    javaVersion: javaVerMatch ? javaVerMatch[1] : '17',
    packaging: content.includes('<packaging>war</packaging>') ? 'war' : 'jar',
    dependencies,
  }
}

/**
 * Parses a Gradle build.gradle or build.gradle.kts file.
 */
export function parseGradleBuild(content: string): JavaProjectDetails {
  const isSpringBoot =
    content.includes('org.springframework.boot') ||
    content.includes('spring-boot-starter') ||
    content.includes('io.spring.dependency-management')

  let springBootVersion: string | undefined
  const springPluginMatch =
    content.match(/id\s*\(?['"]org\.springframework\.boot['"]\)?\s*version\s*['"]([^'"]+)['"]/) ||
    content.match(/id\s+['"]org\.springframework\.boot['"]\s+version\s+['"]([^'"]+)['"]/)

  if (springPluginMatch) {
    springBootVersion = springPluginMatch[1]
  }

  const javaVerMatch =
    content.match(/sourceCompatibility\s*=\s*['"]?([0-9.]+)['"]?/) ||
    content.match(/languageVersion\s*=\s*JavaLanguageVersion\.of\s*\(\s*([0-9]+)\s*\)/)

  const groupMatch = content.match(/group\s*=\s*['"]([^'"]+)['"]/)
  const versionMatch = content.match(/version\s*=\s*['"]([^'"]+)['"]/)

  const dependencies: JavaDependency[] = []
  // Matches implementation 'group:artifact:version' or implementation("group:artifact:version")
  const depLineRegex =
    /(?:implementation|testImplementation|runtimeOnly|compileOnly|annotationProcessor)\s*\(?['"]([^'":]+):([^'":]+)(?::([^'"]+))?['"]\)?/g

  let depMatch
  while ((depMatch = depLineRegex.exec(content)) !== null) {
    dependencies.push({
      groupId: depMatch[1].trim(),
      artifactId: depMatch[2].trim(),
      version: depMatch[3] ? depMatch[3].trim() : undefined,
    })
  }

  return {
    isSpringBoot,
    springBootVersion,
    buildTool: 'gradle',
    groupId: groupMatch ? groupMatch[1] : undefined,
    artifactId: undefined,
    name: isSpringBoot ? 'Spring Boot Gradle App' : 'Gradle Java App',
    version: versionMatch ? versionMatch[1] : '1.0.0',
    description: 'Gradle JVM Project',
    javaVersion: javaVerMatch ? javaVerMatch[1] : '17',
    packaging: 'jar',
    dependencies,
  }
}
