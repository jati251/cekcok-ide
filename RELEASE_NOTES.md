# 🐯 Cekcok Super App v0.2.3 Release Notes

### 🚀 Highlights & Improvements in v0.2.3

- **✨ Critical Black/Blank Screen Fix**:
  - Resolved Vite/Rollup circular module dependency created by premature chunking, restoring rock-solid ESM execution order on cold startup across macOS and Windows.

- **🔔 Interactive Update Toast UI**:
  - Fixed updater notifications to render pure React JSX elements with clickable action buttons for instant in-app updating.

- **🖼️ Zero-Copy Native Media & Image Viewer**:
  - **Tauri Direct Stream Asset Protocol**: Render high-resolution photos (JPG, PNG, WebP, GIF, SVG, ICO) of any size in <10ms with zero memory pressure.
  - **Interactive Preview Controls**: Smooth Zoom (10% to 1000%), Pan/Drag Canvas, Reset View, Resolution Badges, and File Path copy.
  - **Dual Mode SVG Support**: View visual vector rendering or switch to Monaco XML code editing in real-time with breadcrumb actions.

- **📑 VS Code-Grade Tab & Editor Experience**:
  - **Middle-Click to Close Tab**: Instant tab dismissal with mouse scroll wheel.
  - **Dirty Dot Hover Morph**: Unsaved dot `●` smoothly transforms into clickable `✕` on hover.
  - **Quick Action Tab Bar Toolbar**: Save All (`Cmd+Alt+S`), Split Right (`Cmd+\`), and Close All Tabs buttons directly in the tab header.
  - **Double Click Tab Bar**: Quickly create a new file by double clicking empty tab bar space.
  - **Enhanced Context Menu**: Close Saved, Close Others, Close to the Right, Reopen Closed Tab (`Cmd+Shift+T`), Copy Path, and Reveal in File Manager / Finder.

- **💾 Native Save / Export / Print Integration**:
  - **Document Workspace**: Native OS Save As dialogs for Markdown (`.md`), HTML (`.html`), Plain text (`.txt`), and JSON (`.json`) with `@media print` support.
  - **Spreadsheet Workspace**: Native file export for Excel (`.xlsx`) and CSV (`.csv`) via Rust binary streams.
  - **Whiteboard Workspace**: Native drawing export for `.tldr` diagram files.
