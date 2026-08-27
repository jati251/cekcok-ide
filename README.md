<div align="center">
  <img src="public/logo.png" alt="Cekcok IDE Mascot" width="160" style="border-radius: 24px;" />
  <h1>Cekcok IDE</h1>
  <p><strong>The High-Velocity, Modular Desktop IDE for Relentless Developers</strong></p>
  <p><em>Built with Tauri v2, Rust, React 19, Tailwind CSS v4, and Monaco Editor.</em></p>

  <p>
    <img src="https://img.shields.io/badge/Tauri-v2.0-24c8db?style=flat-square&logo=tauri&logoColor=white" alt="Tauri v2" />
    <img src="https://img.shields.io/badge/Rust-1.80+-orange?style=flat-square&logo=rust&logoColor=white" alt="Rust" />
    <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Monaco-Editor-blue?style=flat-square&logo=visualstudiocode&logoColor=white" alt="Monaco" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## ⚡ Overview

**Cekcok IDE** is a lightweight, cross-platform code editor designed for developers who demand lightning-fast boot times, low memory footprints, and deep native integration without the bloat of standard Electron apps. 

Named after the spirited Indonesian word *cekcok* (to bicker or debate vigorously), this editor is built for coders who care about every tab, space, semicolon, and nanosecond of execution.

---

## ✨ Key Features

### 🖥️ 1. Monaco Editor Engine & Multi-Pane Splitting
- **Full Monaco Core**: Syntax highlighting, bracket colorization, minimap, multi-cursor editing, and code suggestions.
- **Visual 4-Way Split Drop Zones**: Drag files or tabs to the Left, Right, Top, or Bottom to instantly create split grids (side-by-side or stacked).
- **Tab State Persistence**: Viewport scroll, cursor selections, and dirty buffers are preserved smoothly across pane switches.

### 💻 2. VS Code-Style Rich Bottom Panel
- **⚠️ Problems & Diagnostics**: Real-time Monaco syntax and type error detection. Click any error to jump directly to the exact file and line number.
- **📤 Output Channels**: Filterable system streams for **Git**, **Build/Vite**, and **System Diagnostics**.
- **🐛 Debug Console**: Interactive JavaScript & Node.js REPL console for live expression evaluation and runtime debugging.
- **💻 Multi-Instance Streaming Terminal**: Native non-blocking PTY/shell stream (`sh`, `bash`, `zsh`) with multi-tab support, arrow key history navigation, clean exit handling, and `Ctrl+C` process termination.
- **🌐 Ports Viewer**: Integrated local port forwarder & status detector with one-click **Open in Browser** actions.

### 📂 3. Git & Node.js Integrated Tooling
- **Native Source Control**: View diffs, stage/unstage files, discard changes, and write commit messages with one keypress.
- **NPM & Node.js Suite**: Automatically detects `package.json`, displays dependencies, and provides one-click triggers for `npm run <script>`.
- **Parallel Fast Search**: Ripgrep-powered workspace text search (`rayon` multi-threaded regex matching) with .gitignore awareness.

### 🎨 4. Native OS Look & Feel
- **Universal Window Dragging**: Seamless trackpad and mouse window positioning across macOS and Windows.
- **Native OS Menus**: Full top-bar application menus on macOS and Windows with synchronized keyboard accelerators.
- **Dynamic Platform Shortcuts**: Dynamic UI adaptation displaying `⌘` / `Cmd` on macOS and `Ctrl` on Windows & Linux.

---

## ⌨️ Keyboard Shortcuts Reference

| Command | macOS | Windows / Linux |
| :--- | :--- | :--- |
| **Quick Open File** | `Cmd + P` | `Ctrl + P` |
| **Command Palette** | `Cmd + Shift + P` | `Ctrl + Shift + P` |
| **Search Everywhere** | `Double Shift` / `Cmd + Shift + F` | `Double Shift` / `Ctrl + Shift + F` |
| **Save File** | `Cmd + S` | `Ctrl + S` |
| **Close Active Tab** | `Cmd + W` | `Ctrl + W` |
| **Toggle Primary Sidebar** | `Cmd + B` | `Ctrl + B` |
| **Toggle Terminal / Bottom Panel** | `Cmd + \`` or `Cmd + J` | `Ctrl + \`` or `Ctrl + J` |
| **Split Editor Right** | `Cmd + \` | `Ctrl + \` |
| **Open Settings** | `Cmd + ,` | `Ctrl + ,` |
| **Zoom In / Out** | `Cmd + =` / `Cmd + -` | `Ctrl + =` / `Ctrl + -` |
| **Commit Staged Changes** | `Cmd + Enter` | `Ctrl + Enter` |

---

## 🛠️ Prerequisites & Setup

### 1. System Requirements

- **Node.js**: `v18.0.0` or later (v20+ recommended)
- **Rust**: `1.77.0` or later with `cargo` installed via [rustup.rs](https://rustup.rs/)

#### Platform-Specific Native Libraries:
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: Microsoft C++ Build Tools and WebView2 Runtime
- **Linux (Debian/Ubuntu)**:
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```

---

## 🚀 Development Workflow

```bash
# 1. Clone repository
git clone https://github.com/jati251/cekcok-ide.git
cd cekcok-ide

# 2. Install frontend dependencies
npm install

# 3. Launch Tauri development desktop application
npm run tauri dev
```

---

## 📦 Building for Production

To create standalone, optimized native binaries for your operating system:

```bash
# Build native installer / bundle
npm run tauri build
```

The compiled binaries will be output to:
- **macOS**: `src-tauri/target/release/bundle/dmg/` or `.app`
- **Windows**: `src-tauri/target/release/bundle/msi/` or `.exe`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `.AppImage`

---

## 🚢 Deployment to MinIO

Cekcok supports automated deployment of release artifacts (installers + auto-updater bundles) to a self-hosted MinIO object storage.

### Prerequisites

1. **MinIO Client (`mc`)** installed and configured:
   ```bash
   # macOS
   brew install minio-mc
   
   # Configure your MinIO alias (replace with your endpoint/credentials)
   mc alias set homelab https://your-minio-endpoint ACCESS_KEY SECRET_KEY
   ```

2. **Tauri signing key** at `src-tauri/cekcok.key` (generate with `npx tauri signer generate -w src-tauri/cekcok.key`)

### Multi-Platform Deployment (macOS & Windows)

Run the deployment script on macOS or Windows:

```bash
# Build, sign, and upload to MinIO in one step
npm run deploy
```

This script will:
- Run linter check (`npm run lint`)
- Build the Tauri app with updater signing enabled
- On **macOS**: uploads `.dmg` installer and `.app.tar.gz` updater bundle
- On **Windows**: uploads `.exe` / `.msi` installers and `.nsis.zip` updater bundle
- Atomically updates and preserves multi-platform signatures in `latest.json`

## 🏗️ Architecture

```
cekcok-ide/
├── public/                     # Static brand assets, favicon, mascot logo
├── scripts/                    # Automation scripts (deploy, build)
│   └── deploy-minio.sh                # Local macOS build + MinIO deploy
├── src/                        # Frontend UI (React 19 + TypeScript + Tailwind v4)
│   ├── apps/                   # Super App workspaces (lazy-loaded)
│   │   ├── home/SuperHome.tsx         # Dashboard launcher
│   │   ├── code/CodeWorkspace.tsx     # Monaco Code IDE
│   │   ├── spreadsheet/               # Fortune Sheet workspace
│   │   ├── document/                  # BlockNote document editor
│   │   └── whiteboard/                # Tldraw drawing canvas
│   ├── components/             # Shared IDE UI components
│   │   ├── skeletons/          # Animated skeleton loaders
│   │   ├── bottom-panel/       # Problems, Output, Debug, Terminal, Ports
│   │   ├── editor/             # Monaco Editor & multi-pane grid
│   │   └── sidebar/            # Explorer, Git, Search, Node sidebars
│   ├── hooks/                  # Global shortcuts, native menu, auto-save
│   ├── store/                  # Zustand state management
│   │   ├── useIDEStore.ts              # Root store composition
│   │   └── slices/                     # Modular state slices
│   │       ├── workspaceSlice.ts      # File tree & workspace filesystem
│   │       ├── editorSlice.ts         # Panes, tabs, dirty tracking
│   │       ├── uiSlice.ts            # Panels, layout, theme, app routing
│   │       ├── gitSlice.ts           # Git status & operations
│   │       └── nodeSlice.ts          # NPM/Node.js project state
│   ├── types/                  # Shared TypeScript type definitions
│   ├── constants/              # App-wide defaults & configuration
│   └── utils/                  # Platform helpers, themes, languages, updater
└── src-tauri/                  # Backend (Rust + Tauri v2 Engine)
    ├── src/
    │   ├── lib.rs                  # Tauri setup, native menus & command registration
    │   ├── fs_commands.rs          # File system operations & streaming shell process
    │   ├── git_commands.rs         # Git status, stage, discard, commit, push, pull
    │   └── search_commands.rs      # Rayon + ripgrep regex file search
    ├── capabilities/               # Tauri v2 security policies & window permissions
    └── tauri.conf.json             # Tauri app configuration
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
