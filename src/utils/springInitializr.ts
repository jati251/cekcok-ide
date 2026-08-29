import { safeInvoke } from './tauriBridge'
import { SpringInitializrOptions } from '../types/java'

export interface InitializrDependencyItem {
  id: string
  name: string
  category: string
  description: string
  groupId: string
  artifactId: string
  scope?: string
}

export const SPRING_DEPENDENCY_PRESETS: InitializrDependencyItem[] = [
  // Web
  {
    id: 'web',
    name: 'Spring Web',
    category: 'Web',
    description: 'Build web, RESTful APIs using Spring MVC & Apache Tomcat.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-web',
  },
  {
    id: 'webflux',
    name: 'Spring Reactive Web',
    category: 'Web',
    description: 'Build reactive REST applications using Spring WebFlux & Netty.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-webflux',
  },
  {
    id: 'graphql',
    name: 'Spring for GraphQL',
    category: 'Web',
    description: 'Build GraphQL applications powered by GraphQL Java.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-graphql',
  },
  {
    id: 'validation',
    name: 'Validation',
    category: 'Web',
    description: 'Bean Validation with Hibernate validator (@NotNull, @Size, @Valid).',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-validation',
  },

  // SQL / Data
  {
    id: 'data-jpa',
    name: 'Spring Data JPA',
    category: 'SQL & Data',
    description: 'Persist data in SQL stores with Java Persistence API & Hibernate.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-data-jpa',
  },
  {
    id: 'data-jdbc',
    name: 'Spring Data JDBC',
    category: 'SQL & Data',
    description: 'Spring Data JDBC without JPA/Hibernate complexities.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-data-jdbc',
  },
  {
    id: 'h2',
    name: 'H2 Database',
    category: 'SQL & Data',
    description: 'Fast, embedded in-memory database for testing and dev.',
    groupId: 'com.h2database',
    artifactId: 'h2',
    scope: 'runtime',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Driver',
    category: 'SQL & Data',
    description: 'PostgreSQL JDBC driver.',
    groupId: 'org.postgresql',
    artifactId: 'postgresql',
    scope: 'runtime',
  },
  {
    id: 'mysql',
    name: 'MySQL Driver',
    category: 'SQL & Data',
    description: 'MySQL Connector/J driver.',
    groupId: 'com.mysql',
    artifactId: 'mysql-connector-j',
    scope: 'runtime',
  },
  {
    id: 'flyway',
    name: 'Flyway Migration',
    category: 'SQL & Data',
    description: 'Version control for your database schema.',
    groupId: 'org.flywaydb',
    artifactId: 'flyway-core',
  },
  {
    id: 'redis',
    name: 'Spring Data Redis',
    category: 'SQL & Data',
    description: 'Advanced key-value store cache and message broker.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-data-redis',
  },

  // Developer Tools
  {
    id: 'devtools',
    name: 'Spring Boot DevTools',
    category: 'Developer Tools',
    description: 'Provides fast application restarts, LiveReload, and dev configs.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-devtools',
    scope: 'runtime',
  },
  {
    id: 'lombok',
    name: 'Lombok',
    category: 'Developer Tools',
    description: 'Java annotation library which reduces boilerplate code.',
    groupId: 'org.projectlombok',
    artifactId: 'lombok',
    scope: 'provided',
  },
  {
    id: 'configuration-processor',
    name: 'Spring Configuration Processor',
    category: 'Developer Tools',
    description: 'Generates metadata for auto-completion of custom @ConfigurationProperties.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-configuration-processor',
    scope: 'provided',
  },

  // Security
  {
    id: 'security',
    name: 'Spring Security',
    category: 'Security',
    description: 'Highly customizable authentication and access-control framework.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-security',
  },
  {
    id: 'oauth2-client',
    name: 'OAuth2 Client',
    category: 'Security',
    description: 'Spring Security OAuth2/OIDC login client support.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-oauth2-client',
  },

  // Messaging
  {
    id: 'kafka',
    name: 'Spring for Apache Kafka',
    category: 'Messaging',
    description: 'Publish, subscribe, and process streams of records with Kafka.',
    groupId: 'org.springframework.kafka',
    artifactId: 'spring-kafka',
  },
  {
    id: 'amqp',
    name: 'Spring for RabbitMQ',
    category: 'Messaging',
    description: 'AMQP messaging with RabbitMQ.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-amqp',
  },

  // Ops & Monitoring
  {
    id: 'actuator',
    name: 'Spring Boot Actuator',
    category: 'Ops & Monitoring',
    description: 'Production-ready features like health checks, metrics, info endpoints.',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-actuator',
  },
  {
    id: 'prometheus',
    name: 'Prometheus Metrics',
    category: 'Ops & Monitoring',
    description: 'Micrometer Prometheus registry for scraping metrics.',
    groupId: 'io.micrometer',
    artifactId: 'micrometer-registry-prometheus',
    scope: 'runtime',
  },
]

/**
 * Scaffolds a complete, runnable Spring Boot project locally.
 */
export async function scaffoldSpringBootProject(
  targetDir: string,
  options: SpringInitializrOptions
): Promise<void> {
  const {
    projectType,
    groupId,
    artifactId,
    name,
    description,
    packageName,
    bootVersion,
    javaVersion,
    dependencies,
  } = options

  // 1. Create target directory structure
  await safeInvoke('create_dir', { path: targetDir })

  const packagePath = packageName.replace(/\./g, '/')
  const mainJavaDir = `${targetDir}/src/main/java/${packagePath}`
  const mainResDir = `${targetDir}/src/main/resources`
  const testJavaDir = `${targetDir}/src/test/java/${packagePath}`

  await safeInvoke('create_dir', { path: `${mainJavaDir}/controller` })
  await safeInvoke('create_dir', { path: mainResDir })
  await safeInvoke('create_dir', { path: testJavaDir })

  const selectedDeps = SPRING_DEPENDENCY_PRESETS.filter((d) => dependencies.includes(d.id))
  const isWeb = dependencies.includes('web') || dependencies.includes('webflux')

  // Main Application class name e.g. DemoApplication
  const mainClassName =
    name.charAt(0).toUpperCase() + name.slice(1).replace(/[^A-Za-z0-9]/g, '') + 'Application'

  // Generate Build File (Maven pom.xml or Gradle build.gradle)
  if (projectType === 'maven-project') {
    const depsXml = selectedDeps
      .map((dep) => {
        let scopeTag = ''
        if (dep.scope === 'runtime') scopeTag = '\n\t\t\t<scope>runtime</scope>'
        if (dep.scope === 'provided') scopeTag = '\n\t\t\t<optional>true</optional>'
        return `\t\t<dependency>\n\t\t\t<groupId>${dep.groupId}</groupId>\n\t\t\t<artifactId>${dep.artifactId}</artifactId>${scopeTag}\n\t\t</dependency>`
      })
      .join('\n')

    const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
\txsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
\t<modelVersion>4.0.0</modelVersion>
\t<parent>
\t\t<groupId>org.springframework.boot</groupId>
\t\t<artifactId>spring-boot-starter-parent</artifactId>
\t\t<version>${bootVersion}</version>
\t\t<relativePath/> <!-- lookup parent from repository -->
\t</parent>
\t<groupId>${groupId}</groupId>
\t<artifactId>${artifactId}</artifactId>
\t<version>0.0.1-SNAPSHOT</version>
\t<name>${name}</name>
\t<description>${description || 'Demo project for Spring Boot'}</description>
\t<properties>
\t\t<java.version>${javaVersion}</java.version>
\t</properties>
\t<dependencies>
${depsXml}

\t\t<dependency>
\t\t\t<groupId>org.springframework.boot</groupId>
\t\t\t<artifactId>spring-boot-starter-test</artifactId>
\t\t\t<scope>test</scope>
\t\t</dependency>
\t</dependencies>

\t<build>
\t\t<plugins>
\t\t\t<plugin>
\t\t\t\t<groupId>org.springframework.boot</groupId>
\t\t\t\t<artifactId>spring-boot-maven-plugin</artifactId>
\t\t\t</plugin>
\t\t</plugins>
\t</build>
</project>
`
    await safeInvoke('write_file', { path: `${targetDir}/pom.xml`, content: pomXml })
  } else {
    // Gradle build.gradle
    const gradleDeps = selectedDeps
      .map((dep) => {
        if (dep.scope === 'runtime') return `\truntimeOnly '${dep.groupId}:${dep.artifactId}'`
        if (dep.scope === 'provided') return `\tcompileOnly '${dep.groupId}:${dep.artifactId}'\n\tannotationProcessor '${dep.groupId}:${dep.artifactId}'`
        return `\timplementation '${dep.groupId}:${dep.artifactId}'`
      })
      .join('\n')

    const buildGradle = `plugins {
\tid 'java'
\tid 'org.springframework.boot' version '${bootVersion}'
\tid 'io.spring.dependency-management' version '1.1.7'
}

group = '${groupId}'
version = '0.0.1-SNAPSHOT'

java {
\ttoolchain {
\t\tlanguageVersion = JavaLanguageVersion.of(${javaVersion})
\t}
}

repositories {
\tmavenCentral()
}

dependencies {
${gradleDeps}
\ttestImplementation 'org.springframework.boot:spring-boot-starter-test'
\ttestRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
\tuseJUnitPlatform()
}
`
    const settingsGradle = `rootProject.name = '${artifactId}'\n`

    await safeInvoke('write_file', { path: `${targetDir}/build.gradle`, content: buildGradle })
    await safeInvoke('write_file', { path: `${targetDir}/settings.gradle`, content: settingsGradle })
  }

  // 2. Main Application class
  const appJava = `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${mainClassName} {

    public static void main(String[] args) {
        SpringApplication.run(${mainClassName}.class, args);
    }

}
`
  await safeInvoke('write_file', {
    path: `${mainJavaDir}/${mainClassName}.java`,
    content: appJava,
  })

  // 3. Welcome REST Controller if Web is included
  if (isWeb) {
    const controllerJava = `package ${packageName}.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> sayHello() {
        return Map.of(
            "status", "success",
            "message", "Hello from Cekcok IDE & Spring Boot!",
            "timestamp", System.currentTimeMillis()
        );
    }

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        return Map.of("status", "UP", "app", "${name}");
    }
}
`
    await safeInvoke('write_file', {
      path: `${mainJavaDir}/controller/HelloController.java`,
      content: controllerJava,
    })
  }

  // 4. application.properties / yml
  const appProperties = `# Spring Boot Application Configuration
spring.application.name=${artifactId}
server.port=8080

# Logging Configuration
logging.level.root=INFO
logging.level.${packageName}=DEBUG

# Actuator Config (if included)
management.endpoints.web.exposure.include=health,info,metrics
`
  await safeInvoke('write_file', {
    path: `${mainResDir}/application.properties`,
    content: appProperties,
  })

  // 5. Test class
  const testJava = `package ${packageName};

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ${mainClassName}Tests {

    @Test
    void contextLoads() {
    }

}
`
  await safeInvoke('write_file', {
    path: `${testJavaDir}/${mainClassName}Tests.java`,
    content: testJava,
  })

  // 6. .gitignore
  const gitignore = `HELP.md
target/
build/
.gradle/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/resources/architecture/gradle-wrapper.jar

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

### VS Code & Cekcok IDE ###
.vscode/

### macOS / OS ###
.DS_Store
Thumbs.db
`
  await safeInvoke('write_file', { path: `${targetDir}/.gitignore`, content: gitignore })

  // 7. README.md
  const readme = `# ${name}

> Generated with **Cekcok IDE** Spring Initializr

## Getting Started

### Prerequisites
- JDK ${javaVersion} or newer installed
- ${projectType === 'maven-project' ? 'Maven (`mvn`)' : 'Gradle (`gradle`)'}

### Running the application
\`\`\`bash
${projectType === 'maven-project' ? 'mvn spring-boot:run' : './gradlew bootRun'}
\`\`\`

### Building executable JAR
\`\`\`bash
${projectType === 'maven-project' ? 'mvn clean package' : './gradlew bootJar'}
\`\`\`

### Endpoints
- Welcome Endpoint: \`http://localhost:8080/api/v1/hello\`
- Health Check: \`http://localhost:8080/api/v1/health\`
`
  await safeInvoke('write_file', { path: `${targetDir}/README.md`, content: readme })
}
