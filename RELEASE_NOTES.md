# 🐯 Cekcok Super App v0.2.1 Release Notes

### 🚀 Highlights & Improvements in v0.2.1

- **🎨 Whiteboard & Sketch Crash Fix & Resilience**:
  - **Re-render storm fix**: Resolved unhandled high-frequency store updates during pointer movements, camera panning, and ticks by filtering store mutations (`entry.source === 'user'`).
  - **Memory & Listener cleanup**: Guaranteed store unsubscription and memoized mount callbacks to avoid memory leaks or duplicate handlers.
  - **Dedicated Error Boundary & Recovery**: Added robust error boundaries around canvas rendering with an emergency "Reset Cache & Reload" fallback to recover seamlessly from corrupted IndexedDB storage states without app crashes.
  - **Safe Zoom & Export**: Protected empty-canvas calculations for Zoom-to-Fit, PNG, SVG, and JSON project exports.

- **🏠 Clean & Modern Dashboard**:
  - **Minimalist Hero Header**: Replaced oversized logos and heavy gradient glows with a clean, compact header and dashboard icon.
  - **Simplified Dashboard Identity**: Renamed "Cekcok Super Workspace" to "Dashboard" across TitleBar, AppSwitcher, and navigation buttons.
  - **Clean Footer**: Streamlined footer metadata and removed cluttered system labels.

- **📦 Unified App Versioning (v0.2.1)**:
  - Centralized application version constants (`APP_VERSION = '0.2.1'`).
  - Synchronized versions across `package.json`, `Cargo.toml`, `tauri.conf.json`, `WelcomeView`, `SettingsView`, and documentation.
