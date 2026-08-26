pub mod fs_commands;
pub mod git_commands;
pub mod search_commands;

use fs_commands::{create_dir, create_file, execute_shell, read_dir, read_file, write_file};
use git_commands::{
    git_commit, git_discard, git_get_status, git_push, git_pull, git_stage, git_unstage,
};
use search_commands::search_files;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_dir,
            read_file,
            execute_shell,
            write_file,
            create_file,
            create_dir,
            git_get_status,
            git_stage,
            git_unstage,
            git_discard,
            git_commit,
            git_push,
            git_pull,
            search_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
