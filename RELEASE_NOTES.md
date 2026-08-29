# 🐯 Cekcok Super App v0.2.7 Release Notes

### 🚀 Highlights & Improvements in v0.2.7

- **🎨 Migration to Excalidraw Canvas Engine (100% Free & Open-Source MIT)**:
  - **Zero Commercial License Watermarks / Blank Screen Fix**: Replaced proprietary `tldraw` SDK with industry-standard `@excalidraw/excalidraw` (MIT License), eliminating all production license checks, timeout crashes, and blank screen delays.
  - **Instant 0ms Startup**: All sketch tools, shapes, fonts, and hand-drawn styling load instantly in offline desktop mode.
  - **Native `.excalidraw` & `.json` File Support**: Save and load diagrams locally, export high-res PNG and SVG vector graphics, with dark and light canvas themes.

---

# 🐯 Cekcok Super App v0.2.6 Release Notes

### 🚀 Highlights & Improvements in v0.2.6

- **☕ First-Class Java & Spring Boot Native Ecosystem**:
  - **Spring Initializr Project Generator**: Wizard to bootstrap Spring Boot projects with Maven or Gradle, Java 17/21 LTS/23, and interactive dependency selector (Web, Data JPA, Security, Lombok, MySQL, Postgres, Redis, Kafka, RabbitMQ, Actuator).
  - **Spring Boot Build & Run Suite**: 1-click tasks for Spring Boot Run, Remote JDWP Socket Debug (port 5005), Executable JAR Packaging, Test Suite, Docker Image creation, and Dependency Trees.
  - **Spring REST Endpoints & Beans Explorer**: Automatic workspace scanning for `@RestController`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, and Spring Beans (`@Service`, `@Repository`, `@Component`, `@Entity`, `@Configuration`) with click-to-jump to source line in Monaco Editor.
  - **Monaco Java & Properties Intelligence**: Autocompletion and snippets for Spring annotations, Java snippets (`psvm`, `sout`, `log`, etc.), and 100+ `application.properties` / `.yml` keys.
  - **Java Scaffolding**: Context menu action to scaffold Controllers, Services, Repositories, Entities, Records, and DTOs with auto-calculated package declarations.

- **⚡ First-Class Node.js & TypeScript Fullstack Suite**:
  - **Multi Package Manager Support (`npm`, `pnpm`, `yarn`, `bun`)**: Automatic lockfile detection and dynamic script execution with status bar badge.
  - **Node.js & Fullstack Project Generator**: Scaffold Vite + React 19 + TypeScript, Next.js 15 App Router, Express REST API, NestJS, and Hono with 1 click.
  - **Interactive Dependencies Inspector & Package Installer**: Searchable dependencies inspector with 1-click **"+ Install Package"** modal and uninstall actions.
  - **Node REST API & Route Scanner**: Live workspace route detector for Express, NestJS, Next.js App Router (`route.ts`), and Hono with click-to-jump to code line.
  - **TypeScript & React File Scaffolder**: Context menu generator for React components (`.tsx`), custom hooks, Express routes, NestJS services, and Vitest test files.

- **🎨 Whiteboard / Sketch 0ms Instant Offline Bundling**:
  - Bundled `@tldraw/assets` directly into local Vite chunks to eliminate all remote `unpkg.com` CDN network calls.
  - Whiteboard canvas now mounts instantly in 0ms without blank screen delays in production and offline mode.

---

# 🐯 Cekcok Super App v0.2.5 Release Notes

### 🚀 Highlights & Improvements in v0.2.5

- **🟢 🔵 🔴 Real-Time Git Change Gutter & Scrollbar Overview Ruler**:
  - **Live Overview Ruler & Minimap Indicators**:
    - 🟩 **Green (`#22c55e`)**: Real-time indicator for newly added lines.
    - 🟦 **Blue (`#3b82f6`)**: Real-time indicator for modified/edited lines.
    - 🟥 **Red (`#ef4444`)**: Real-time indicator for deleted lines.
  - **VS Code Style Gutter Indicators**:
    - Vertical colored bars for added/modified lines and precise red arrow carets for deletions beside line numbers.
  - **Smart Similarity Diff Alignment**: Distinguishes adjacent additions and modifications accurately without misclassifying new lines.

- **📄 Native Microsoft Word (`.docx`) Import & Rich Document Parsing**:
  - **Full `.docx` Document Support**: Import `.docx` files via OS file picker and drag-and-drop with complete extraction of headings, bold, italics, underlines, strikethrough, lists, blockquotes, and tables.
  - **Responsive Image & Signature Scaling**: Embedded signatures and high-res document images auto-scale responsively within document paper boundaries with zero horizontal overflow.
  - **Structured JSON Document Presentation**: JSON data files and workflows convert gracefully into structured document sections, headings, bold keys, and bullet lists instead of raw unstyled code blocks.

- **⚠️ Real-Time Language Diagnostics & Problems Integration**:
  - Full synchronization between Monaco Editor syntax markers, the Bottom Panel **Problems** tab, and the Status Bar counter badge.
  - Interactive red squiggly underlines and hover error tooltips across TypeScript, JavaScript, CSS, JSON, and HTML.

---

# 🐯 Cekcok Super App v0.2.4 Release Notes

### 🚀 Highlights & Improvements in v0.2.4

- **📁 Contextual Inline File & Folder Creation (VS Code Style)**:
  - **Smart Target Detection**: Creating a new file or folder now opens the inline input directly inside the selected/active folder instead of always at the root.
  - **Inline Subfolder Tree Mounting**: Subfolders automatically expand when creating new items inside them.
  - **Rich Keyboard Navigation**: Press `a` for New File, `Shift + A` for New Folder when Explorer is focused; `Enter` to confirm, `Esc` to cancel.

- **💻 Native Multi-Session Terminal Architecture**:
  - **Independent Shell Sessions**: Each terminal tab (`term-1`, `term-2`, etc.) now spawns an isolated Rust backend child process with dedicated PTY/stdio streams.
  - **Native `cd` Command Support**: Changing directories (`cd <path>`) in terminal updates the working directory and ide context seamlessly.
  - **Command History & Line Editing**: Navigate command history using **Arrow Up (↑)** and **Arrow Down (↓)**, with support for **Arrow Left/Right**, **Home/End**, **Ctrl+C**, **Ctrl+L**, and multi-line paste sanitization.

- **🎛️ Dynamic Tool Docking & Drag-and-Drop Guides**:
  - **Visual Docking Guides Overlay**: Dragging any tool tab or icon reveals clear docking zones for Left Sidebar, Bottom Panel, and Right Panel.
  - **Conflict-Free Drag Drops**: Strictly separated editor split drop zones from tool docking zones.
  - **Right Panel Compact Header**: When panel is docked to the right, tabs collapse to clean icon-only buttons with tooltips, and terminal renders a space-saving top session bar for 100% terminal width.
  - **Context Menu & Layout Customizer**: Right-click tabs or use the TitleBar Layout menu to dock tools between Sidebar and Panel with 1 click.

- **⚡ Core IDE Mandatory Suite (VS Code Parity)**:
  - **Fast Workspace Quick Open (`⌘P` / `Ctrl+P`)**: Sub-millisecond workspace-wide file indexing using Rust's Ripgrep `ignore::WalkBuilder` with real file icons and relative path matching.
  - **Monaco Visual Git Diff Editor**: Clicking any changed file in Git Sidebar opens Monaco's side-by-side Diff Editor showing exact modifications against `HEAD`.
  - **Git Status Badges in Explorer**: File tree items display colored text and git status badges (`M` amber, `U`/`A` green, `D` red).
  - **Format on Save & Shortcut Formatting (`Shift+Alt+F`)**: Auto-format documents on save (`Cmd+S`) or on demand with user preference toggle.
  - **Explorer Navigation Polish**: One-click **Reveal Active File (`Cmd+Shift+E`)** and **Collapse All Folders** buttons.
