# 🐯 Cekcok Super App v0.2.0 Release Notes

### 🚀 Highlights & Major Overhaul

- **🏠 Interactive Recent Projects & Documents on Home**:
  - Direct launch of recent Code projects, Excel spreadsheets, Word documents, and Sketch drawings from the Home screen.
  - Search filter, category tabs (All, Code, Excel, Word, Sketch), and relative timestamps.
  - Automatic cross-workspace persistence with local storage caching.

- **🪟 Unified Native TitleBar & macOS Traffic Lights Fix**:
  - Resolved macOS native red/yellow/green window controls overlap across all apps.
  - Seamless native window dragging and double-click to maximize across all workspaces.
  - Integrated **App Switcher Dropdown** in the top-right corner to jump between Home, Code, Excel, Word, and Sketch instantly.

- **📊 Excel Spreadsheet Overhaul (MS Excel Alternative)**:
  - Eliminated coordinate rendering glitches (`A1:NaN`) with full CSS isolation.
  - Native **Import from .xlsx / .csv** and **Export to .xlsx / .csv** powered by SheetJS (`xlsx`).
  - Preloaded starter templates: Monthly Budget & Expenses, Client Billing Invoice, Student Grade Book.
  - Quick formula cheat sheet (`SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN`, `IF`, `CONCAT`).

- **📝 Word Document Overhaul (MS Word Alternative)**:
  - Distraction-free Notion/Word style editor with Dark / Light workspace mode toggle.
  - Starter templates: RFC Architecture Design Spec, Meeting Minutes & Agenda, Release Notes Spec.
  - Rich export options: Markdown (`.md`), HTML (`.html`), Plain text (`.txt`), and Print / Save to PDF (`window.print()`).
  - Live stats counter: real-time word count, character count, and estimated reading time.

- **🎨 Vector Sketch & Whiteboard (Drawing Suite)**:
  - Fixed canvas clipping and coordinate calculations with full-screen absolute viewport.
  - One-click export to **PNG image**, **SVG vector**, and **`.tldr` project JSON**.
  - Dark / Light canvas mode sync, Zoom to Fit, Clear Canvas, and persistent local state.

- **🔄 Enhanced In-App Auto Updater**:
  - Live progress bar tracking percentage (`0-100%`), transferred size (MB), and status phases.
  - Silent startup check with unobtrusive update notices and global update badges in StatusBar, Home, and Settings.
  - One-click install and restart via Tauri v2 updater runtime.
