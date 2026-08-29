import { safeInvoke } from './tauriBridge'

export type JavaFileType =
  | 'class'
  | 'record'
  | 'interface'
  | 'enum'
  | 'controller'
  | 'service'
  | 'repository'
  | 'entity'
  | 'dto'
  | 'config'

export interface JavaScaffoldOptions {
  name: string
  fileType: JavaFileType
  targetDir: string
  customPackage?: string
}

/**
 * Calculates Java package declaration from absolute directory path.
 */
export function calculateJavaPackage(dirPath: string): string {
  const normalized = dirPath.replace(/\\/g, '/')
  const markers = ['/src/main/java/', '/src/test/java/', '/src/']

  for (const marker of markers) {
    const idx = normalized.indexOf(marker)
    if (idx !== -1) {
      const sub = normalized.substring(idx + marker.length).replace(/\/+$/, '')
      if (sub) {
        return sub.replace(/\//g, '.')
      }
    }
  }

  return ''
}

/**
 * Generates boilerplate code for a specific Java / Spring component type.
 */
export function generateJavaBoilerplate(
  className: string,
  fileType: JavaFileType,
  packageName: string
): string {
  const pkgLine = packageName ? `package ${packageName};\n\n` : ''

  switch (fileType) {
    case 'controller':
      return `${pkgLine}import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/v1/${className.toLowerCase().replace('controller', '')}s")
public class ${className} {

    @GetMapping
    public ResponseEntity<List<String>> getAll() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getById(@PathVariable Long id) {
        return ResponseEntity.ok("Item " + id);
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody Object request) {
        return ResponseEntity.ok("Created");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
`

    case 'service':
      return `${pkgLine}import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ${className} {

    private static final Logger log = LoggerFactory.getLogger(${className}.class);

    // Business logic methods
}
`

    case 'repository':
      return `${pkgLine}import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${className} extends JpaRepository<Object, Long> {
    // Custom query methods e.g. Optional<Entity> findByName(String name);
}
`

    case 'entity':
      return `${pkgLine}import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${className.toLowerCase()}s")
public class ${className} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public ${className}() {
    }

    public ${className}(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
`

    case 'record':
    case 'dto':
      return `${pkgLine}public record ${className}(
    Long id,
    String name,
    String email
) {
}
`

    case 'interface':
      return `${pkgLine}public interface ${className} {
    // Define contract methods
}
`

    case 'enum':
      return `${pkgLine}public enum ${className} {
    ACTIVE,
    INACTIVE,
    PENDING,
    ARCHIVED
}
`

    case 'config':
      return `${pkgLine}import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ${className} {

    // Define @Bean methods
}
`

    case 'class':
    default:
      return `${pkgLine}public class ${className} {

    public ${className}() {
    }

    public static void main(String[] args) {
        System.out.println("Hello from ${className}!");
    }
}
`
  }
}

/**
 * Creates the Java file on disk and returns its file path.
 */
export async function createJavaFile(options: JavaScaffoldOptions): Promise<string> {
  const { name, fileType, targetDir, customPackage } = options
  const cleanName = name.replace(/\.java$/, '').trim()
  const packageName = customPackage ?? calculateJavaPackage(targetDir)
  const content = generateJavaBoilerplate(cleanName, fileType, packageName)

  const filePath = `${targetDir}/${cleanName}.java`
  await safeInvoke('write_file', { path: filePath, content })
  return filePath
}
