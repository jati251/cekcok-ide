/**
 * Monaco Editor intelligence providers for Java and Spring Boot.
 */

let isRegistered = false

export function registerMonacoJavaProviders(monaco: any): void {
  if (isRegistered || !monaco || !monaco.languages) return
  isRegistered = true

  // 1. Register Java Snippets and Annotations Provider
  monaco.languages.registerCompletionItemProvider('java', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions = [
        // Spring Boot Annotations
        {
          label: '@SpringBootApplication',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@SpringBootApplication',
          detail: 'Spring Boot Main Application Annotation',
          documentation: 'Indicates a configuration class that declares one or more @Bean methods and triggers auto-configuration and component scanning.',
          range,
        },
        {
          label: '@RestController',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@RestController\n@RequestMapping("/api/v1/${1:resource}")',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Spring REST Controller',
          documentation: 'Convenience annotation that combines @Controller and @ResponseBody.',
          range,
        },
        {
          label: '@GetMapping',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@GetMapping("${1:/{id\\}}")\npublic ResponseEntity<${2:Object}> get${3:Item}(@PathVariable Long id) {\n\treturn ResponseEntity.ok(${4:null});\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Spring HTTP GET mapping',
          range,
        },
        {
          label: '@PostMapping',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@PostMapping\npublic ResponseEntity<${1:Object}> create(@RequestBody ${2:Object} request) {\n\treturn ResponseEntity.ok(${3:null});\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Spring HTTP POST mapping',
          range,
        },
        {
          label: '@PutMapping',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@PutMapping("/{id}")\npublic ResponseEntity<${1:Object}> update(@PathVariable Long id, @RequestBody ${2:Object} request) {\n\treturn ResponseEntity.ok(${3:null});\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Spring HTTP PUT mapping',
          range,
        },
        {
          label: '@DeleteMapping',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@DeleteMapping("/{id}")\npublic ResponseEntity<Void> delete(@PathVariable Long id) {\n\treturn ResponseEntity.noContent().build();\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Spring HTTP DELETE mapping',
          range,
        },
        {
          label: '@Service',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Service',
          detail: 'Spring Service Bean',
          documentation: 'Indicates that an annotated class is a "Service" containing business logic.',
          range,
        },
        {
          label: '@Repository',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Repository',
          detail: 'Spring Data Repository Bean',
          documentation: 'Indicates that an annotated class is a Data Access Object (DAO).',
          range,
        },
        {
          label: '@Autowired',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Autowired',
          detail: 'Spring Dependency Injection',
          range,
        },
        {
          label: '@Component',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Component',
          detail: 'Spring Generic Component Bean',
          range,
        },
        {
          label: '@Configuration',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Configuration',
          detail: 'Spring Configuration Class',
          range,
        },
        {
          label: '@Bean',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Bean\npublic ${1:Object} ${2:myBean}() {\n\treturn new ${1:Object}();\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Spring Bean definition method',
          range,
        },
        {
          label: '@Entity',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Entity\n@Table(name = "${1:table_name}")\npublic class ${2:EntityName} {\n\t@Id\n\t@GeneratedValue(strategy = GenerationType.IDENTITY)\n\tprivate Long id;\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'JPA Database Entity',
          range,
        },
        {
          label: '@Transactional',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Transactional',
          detail: 'Spring Declarative Transaction Management',
          range,
        },

        // Lombok
        {
          label: '@Data',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Data\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder',
          detail: 'Lombok Full Bundle (@Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor)',
          range,
        },
        {
          label: '@Slf4j',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@Slf4j',
          detail: 'Lombok SLF4J Logger injection',
          range,
        },

        // Classic Java & Spring Snippets
        {
          label: 'psvm',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'public static void main(String[] args) {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'public static void main(String[] args)',
          range,
        },
        {
          label: 'sout',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'System.out.println(${1});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'System.out.println()',
          range,
        },
        {
          label: 'soutv',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'System.out.println("${1:variable} = " + ${1:variable});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'System.out.println("var = " + var)',
          range,
        },
        {
          label: 'serr',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'System.err.println(${1});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'System.err.println()',
          range,
        },
        {
          label: 'log',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(${1:ClassName}.class);',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'SLF4J Logger Declaration',
          range,
        },
        {
          label: 'trycatch',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'try {\n\t$1\n} catch (Exception e) {\n\tlog.error("Error occurred: ", e);\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'try-catch block with logging',
          range,
        },
        {
          label: 'test',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@org.junit.jupiter.api.Test\nvoid ${1:testName}() {\n\t// given\n\t$2\n\t// when\n\t\n\t// then\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'JUnit 5 @Test method',
          range,
        },
      ]

      return { suggestions }
    },
  })

  // 2. Register Spring Boot Application Properties & YAML Autocompletion
  const springProperties = [
    { key: 'server.port', desc: 'Server HTTP port (e.g. 8080)', default: '8080' },
    { key: 'server.servlet.context-path', desc: 'Context path of the application (e.g. /api)', default: '/api' },
    { key: 'server.compression.enabled', desc: 'Whether response compression is enabled', default: 'true' },
    { key: 'spring.application.name', desc: 'Application name identifier', default: 'my-spring-app' },
    { key: 'spring.profiles.active', desc: 'Comma-separated list of active profiles', default: 'dev' },
    { key: 'spring.datasource.url', desc: 'JDBC URL of the database', default: 'jdbc:postgresql://localhost:5432/mydb' },
    { key: 'spring.datasource.username', desc: 'Login user of the database', default: 'postgres' },
    { key: 'spring.datasource.password', desc: 'Login password of the database', default: 'password' },
    { key: 'spring.datasource.driver-class-name', desc: 'Fully qualified name of the JDBC driver', default: 'org.postgresql.Driver' },
    { key: 'spring.datasource.hikari.maximum-pool-size', desc: 'Maximum size that the HikariCP pool is allowed to reach', default: '10' },
    { key: 'spring.jpa.hibernate.ddl-auto', desc: 'DDL auto mode (none, validate, update, create, create-drop)', default: 'update' },
    { key: 'spring.jpa.show-sql', desc: 'Whether to enable logging of SQL statements', default: 'true' },
    { key: 'spring.jpa.properties.hibernate.format_sql', desc: 'Format SQL statements when logging', default: 'true' },
    { key: 'spring.jpa.open-in-view', desc: 'Register OpenEntityManagerInViewInterceptor', default: 'false' },
    { key: 'spring.data.redis.host', desc: 'Redis server host', default: 'localhost' },
    { key: 'spring.data.redis.port', desc: 'Redis server port', default: '6379' },
    { key: 'spring.kafka.bootstrap-servers', desc: 'Comma-separated list of host:port Kafka brokers', default: 'localhost:9092' },
    { key: 'spring.kafka.consumer.group-id', desc: 'Unique string that identifies the Kafka consumer group', default: 'my-group' },
    { key: 'spring.rabbitmq.host', desc: 'RabbitMQ host', default: 'localhost' },
    { key: 'spring.rabbitmq.port', desc: 'RabbitMQ port', default: '5672' },
    { key: 'spring.mail.host', desc: 'SMTP server host', default: 'smtp.gmail.com' },
    { key: 'spring.mail.port', desc: 'SMTP server port', default: '587' },
    { key: 'management.endpoints.web.exposure.include', desc: 'Endpoint IDs that should be included in Actuator', default: 'health,info,metrics' },
    { key: 'management.endpoint.health.show-details', desc: 'When to show full health details (always, when-authorized, never)', default: 'always' },
    { key: 'logging.level.root', desc: 'Root logger level', default: 'INFO' },
    { key: 'logging.level.org.springframework.web', desc: 'Spring Web logging level', default: 'DEBUG' },
    { key: 'logging.level.org.hibernate.SQL', desc: 'Hibernate SQL logging level', default: 'DEBUG' },
  ]

  const propertyProvider = {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions = springProperties.map((prop) => ({
        label: prop.key,
        kind: monaco.languages.CompletionItemKind.Property,
        insertText: `${prop.key}=${prop.default}`,
        detail: `Spring Boot: ${prop.desc}`,
        documentation: `${prop.desc}\nDefault: ${prop.default}`,
        range,
      }))

      return { suggestions }
    },
  }

  // Register for ini (properties) and yaml
  monaco.languages.registerCompletionItemProvider('ini', propertyProvider)
  monaco.languages.registerCompletionItemProvider('yaml', propertyProvider)
}
