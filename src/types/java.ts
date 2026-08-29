export interface JavaDependency {
  groupId: string
  artifactId: string
  version?: string
  scope?: string
  description?: string
}

export interface JavaProjectDetails {
  isSpringBoot: boolean
  springBootVersion?: string
  buildTool: 'maven' | 'gradle'
  groupId?: string
  artifactId?: string
  version?: string
  name?: string
  description?: string
  javaVersion?: string
  packaging?: string
  dependencies: JavaDependency[]
  mainClass?: string
  profiles?: string[]
}

export interface SpringEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'REQUEST'
  path: string
  controllerName: string
  methodName: string
  filePath: string
  lineNumber: number
  summary?: string
}

export interface SpringBean {
  id: string
  name: string
  type: 'controller' | 'service' | 'repository' | 'component' | 'entity' | 'config'
  filePath: string
  lineNumber: number
}

export interface SpringInitializrOptions {
  projectType: 'maven-project' | 'gradle-project'
  language: 'java' | 'kotlin'
  bootVersion: string
  groupId: string
  artifactId: string
  name: string
  description: string
  packageName: string
  packaging: 'jar' | 'war'
  javaVersion: '17' | '21' | '23'
  dependencies: string[]
}

export interface JavaEnvironmentInfo {
  javaInstalled: boolean
  javaVersion?: string
  javaVendor?: string
  mavenInstalled: boolean
  mavenVersion?: string
  gradleInstalled: boolean
  gradleVersion?: string
}
