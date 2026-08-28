# Cekcok IDE — AI Context

> This file provides structured context for AI coding assistants (Gemini, Copilot, etc.) working on this codebase.

## Project Summary

**Cekcok IDE** is a lightweight, cross-platform desktop code editor built with **Tauri v2** (Rust backend) and **React 19** (TypeScript frontend). It targets developers who want a fast, native IDE experience without Electron overhead.

- **App ID**: `com.cekcok.ide`
- **Version**: `0.2.4`
- **License**: MIT

---

## Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Desktop Runtime** | Tauri | v2.x |
| **Backend** | Rust | 2021 edition |
| **Frontend Framework** | React | 19.x |
| **Language** | TypeScript | ~5.8 |
| **Bundler** | Vite | 7.x |
| **Styling** | Tailwind CSS | v4.x (via `@tailwindcss/postcss`) |
| **State Management** | Zustand | 5.x |
| **Code Editor** | Monaco Editor | via `@monaco-editor/react` |
| **Terminal** | xterm.js | v6.x (`@xterm/xterm`) |
| **Animation** | Framer Motion | 13.x |

---

## Architecture Overview

### Frontend (`src/`)

The frontend is a single-page React application using a **slice-based Zustand store** pattern.

#### State Management (`src/store/`)

- **Root store**: `useIDEStore.ts` — composes all slices into a single Zustand store.
- **Slices** follow the pattern `src/store/slices/<domain>Slice.ts`:
  - `fileSlice.ts` — Open files, active tabs, dirty/unsaved tracking, file content.
  - `uiSlice.ts` — Panel visibility, layout, sidebar selection, theme, zoom.
  - `gitSlice.ts` — Git repository status, staged/unstaged files.
  - `nodeSlice.ts` — NPM project detection, dependencies, scripts.

#### Components (`src/components/`)

Components are organized by IDE region:

- **`editor/`** — Monaco Editor panes with multi-pane split support. Contains sub-components, editor-scoped hooks, and type definitions.
- **`bottom-panel/`** — Tabbed bottom panel: Problems, Output, Debug Console, Ports, Terminal.
- **`sidebar/`** — Left sidebar views: Explorer (file tree), Git, Search, Node.js.
- **Top-level components**: `ActivityBar`, `TitleBar`, `StatusBar`, `CommandPalette`, `SettingsView`, `WelcomeView`.

#### Hooks (`src/hooks/`)

- `useKeyboardShortcuts.ts` — Global keyboard shortcut handler (cross-platform).
- `useNativeMenu.ts` — Tauri native menu event listener bridge.
- `useAutoSave.ts` — Automatic file save on content change.

#### Utils (`src/utils/`)

- `tauriBridge.ts` — **All Tauri IPC `invoke()` calls are centralized here.** This is the single interface between frontend and Rust backend.
- `themes.ts` — Monaco Editor theme definitions.
- `languages.ts` — File extension → language detection and mappings.
- `fileIcons.tsx` — File/folder icon component resolver.
- `platform.ts` — OS-aware shortcut label generation (`⌘` vs `Ctrl`).
- `storage.ts` — Persistent storage helpers (via `localforage`).
- `localHistory.ts` — Local file revision history tracking.

### Backend (`src-tauri/src/`)

The Rust backend exposes Tauri commands grouped by domain:

- **`lib.rs`** — Tauri app setup, native menu creation, command registration via `.invoke_handler()`.
- **`fs_commands.rs`** — File system: read/write files, list directories, streaming shell process execution.
- **`git_commands.rs`** — Git operations: status, stage, unstage, discard, commit, push, pull.
- **`search_commands.rs`** — Multi-threaded workspace text search using `rayon` + `regex` with `.gitignore` awareness via the `ignore` crate.

---

## Key Patterns & Conventions

### Tauri IPC Communication

All frontend ↔ backend communication uses Tauri's `invoke()` API:

```typescript
// Frontend (src/utils/tauriBridge.ts)
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("command_name", { arg1: "value" });
```

```rust
// Backend (src-tauri/src/*.rs)
#[tauri::command]
fn command_name(arg1: String) -> Result<String, String> { ... }
```

Commands are registered in `lib.rs` via `tauri::generate_handler![]`.

### Tauri Plugins Used

| Plugin | Purpose |
| :--- | :--- |
| `tauri-plugin-fs` | Native file system access |
| `tauri-plugin-dialog` | OS native file/folder dialogs |
| `tauri-plugin-shell` | Shell command execution & streaming |
| `tauri-plugin-os` | OS detection (platform, arch) |
| `tauri-plugin-clipboard-manager` | System clipboard access |
| `tauri-plugin-opener` | Open URLs/files in default apps |

### Path Aliases

TypeScript path alias `@/*` maps to `src/*`:

```json
// tsconfig.json
{ "paths": { "@/*": ["src/*"] } }
```

```typescript
// vite.config.ts
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```

### Styling Conventions

- Uses **Tailwind CSS v4** with PostCSS integration (`@tailwindcss/postcss`).
- Custom utility classes and design tokens are defined in `src/index.css` and `src/App.css`.
- Component-scoped styles use Tailwind utility classes inline.

### Module System

- ESM (`"type": "module"` in `package.json`).
- TypeScript with `"moduleResolution": "bundler"` mode.
- Separate `tsconfig.node.json` for Node.js context files (e.g., `vite.config.ts`).

---

## Development Commands

```bash
# Install dependencies
npm install

# Start Tauri dev mode (frontend + Rust backend hot-reload)
npm run tauri dev

# Build production bundle
npm run tauri build

# Run ESLint
npm run lint

# Frontend-only dev server (no Tauri backend)
npm run dev
```

---

## Important Notes for AI Assistants

1. **Don't suggest Electron APIs** — This is a Tauri app. Use `@tauri-apps/*` packages.
2. **IPC is centralized** — All `invoke()` calls go through `src/utils/tauriBridge.ts`. Don't scatter them across components.
3. **Zustand slices** — New state should follow the slice pattern in `src/store/slices/`.
4. **Tauri v2 APIs** — This uses Tauri v2, not v1. Import paths are `@tauri-apps/api/*` and `@tauri-apps/plugin-*`.
5. **Cross-platform** — Always handle macOS, Windows, and Linux differences (keyboard shortcuts, path separators, shell commands).
6. **Rust commands** — New backend features should be added as `#[tauri::command]` functions in the appropriate `*_commands.rs` file and registered in `lib.rs`.
