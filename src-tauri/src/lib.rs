pub mod fs_commands;
pub mod git_commands;
pub mod search_commands;

use fs_commands::{
    create_dir, create_file, delete_path, execute_shell, read_dir, read_file, rename_path,
    reveal_in_file_manager, write_file, spawn_shell, kill_shell, TerminalState,
};
use git_commands::{
    git_commit, git_discard, git_get_status, git_pull, git_push, git_stage, git_unstage, git_log, git_checkout_branch
};
use search_commands::search_files;

#[tauri::command]
fn restart_app(app: tauri::AppHandle) {
    app.restart();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            read_dir,
            read_file,
            execute_shell,
            spawn_shell,
            kill_shell,
            write_file,
            create_file,
            create_dir,
            delete_path,
            rename_path,
            reveal_in_file_manager,
            git_get_status,
            git_stage,
            git_unstage,
            git_discard,
            git_commit,
            git_push,
            git_pull,
            git_log,
            git_checkout_branch,
            search_files,
            restart_app
        ])
        .setup(|app| {
            use std::sync::{Arc, Mutex};
            use tauri::Manager;
            
            app.manage(TerminalState {
                process: Arc::new(Mutex::new(None)),
            });

            if let Some(window) = app.get_webview_window("main") {
                if let Some(icon) = app.default_window_icon() {
                    let _ = window.set_icon(icon.clone());
                }
            }

            use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu, AboutMetadata};

            let file_menu = Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &MenuItem::with_id(app, "new_file", "New File", true, Some("CmdOrCtrl+N"))?,
                    &MenuItem::with_id(app, "new_folder", "New Folder", true, Some("CmdOrCtrl+Shift+N"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "open_folder", "Open Folder...", true, Some("CmdOrCtrl+O"))?,
                    &MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "settings", "Preferences: Settings", true, Some("CmdOrCtrl+,"))?,
                    &MenuItem::with_id(app, "welcome", "Get Started", true, None::<&str>)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::close_window(app, None::<&str>)?,
                ],
            )?;

            let edit_menu = Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None::<&str>)?,
                    &PredefinedMenuItem::redo(app, None::<&str>)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None::<&str>)?,
                    &PredefinedMenuItem::copy(app, None::<&str>)?,
                    &PredefinedMenuItem::paste(app, None::<&str>)?,
                    &PredefinedMenuItem::select_all(app, None::<&str>)?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "format_document", "Format Document", true, Some("Shift+Alt+F"))?,
                    &MenuItem::with_id(app, "toggle_word_wrap", "Toggle Word Wrap", true, Some("Alt+Z"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "command_palette", "Command Palette...", true, Some("CmdOrCtrl+Shift+P"))?,
                ],
            )?;

            let view_menu = Submenu::with_items(
                app,
                "View",
                true,
                &[
                    &MenuItem::with_id(app, "toggle_sidebar", "Toggle Primary Sidebar", true, Some("CmdOrCtrl+B"))?,
                    &MenuItem::with_id(app, "toggle_terminal", "Toggle Terminal Panel", true, Some("CmdOrCtrl+`"))?,
                    &MenuItem::with_id(app, "toggle_split", "Toggle Split Editor", true, Some("CmdOrCtrl+\\"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+="))?,
                    &MenuItem::with_id(app, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+-"))?,
                    &MenuItem::with_id(app, "zoom_reset", "Reset Zoom", true, Some("CmdOrCtrl+Num0"))?,
                ],
            )?;

            let go_menu = Submenu::with_items(
                app,
                "Go",
                true,
                &[
                    &MenuItem::with_id(app, "search_everywhere", "Go to File...", true, Some("CmdOrCtrl+P"))?,
                ],
            )?;

            #[cfg(target_os = "macos")]
            {
                let app_menu = Submenu::with_items(
                    app,
                    "Cekcok IDE",
                    true,
                    &[
                        &PredefinedMenuItem::about(app, None::<&str>, None::<AboutMetadata>)?,
                        &PredefinedMenuItem::separator(app)?,
                        &PredefinedMenuItem::services(app, None::<&str>)?,
                        &PredefinedMenuItem::separator(app)?,
                        &PredefinedMenuItem::hide(app, None::<&str>)?,
                        &PredefinedMenuItem::hide_others(app, None::<&str>)?,
                        &PredefinedMenuItem::show_all(app, None::<&str>)?,
                        &PredefinedMenuItem::separator(app)?,
                        &PredefinedMenuItem::quit(app, None::<&str>)?,
                    ],
                )?;
                let menu = Menu::with_items(app, &[&app_menu, &file_menu, &edit_menu, &view_menu, &go_menu])?;
                app.set_menu(menu)?;
            }

            #[cfg(not(target_os = "macos"))]
            {
                let menu = Menu::with_items(app, &[&file_menu, &edit_menu, &view_menu, &go_menu])?;
                app.set_menu(menu)?;
            }

            Ok(())
        })
        .on_menu_event(|app, event| {
            use tauri::Emitter;
            let id = event.id.as_ref();
            if [
                "new_file", "new_folder", "open_folder", "save", "settings", "welcome",
                "format_document", "toggle_word_wrap", "command_palette",
                "toggle_sidebar", "toggle_terminal", "toggle_split",
                "zoom_in", "zoom_out", "zoom_reset",
                "search_everywhere"
            ].contains(&id) {
                app.emit("menu-action", id).unwrap_or_default();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
