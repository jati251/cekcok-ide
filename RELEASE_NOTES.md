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
