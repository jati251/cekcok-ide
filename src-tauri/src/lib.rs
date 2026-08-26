use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
}

#[tauri::command]
fn read_dir(path: &str) -> Result<Vec<FileNode>, String> {
    let mut files = Vec::new();
    let dir_path = Path::new(path);

    if !dir_path.exists() || !dir_path.is_dir() {
        return Err(format!("Path {} is not a valid directory", path));
    }

    match fs::read_dir(dir_path) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let path_buf = entry.path();
                let file_name = entry.file_name().into_string().unwrap_or_default();
                
                // Skip hidden files or system files
                if file_name.starts_with('.') {
                    continue; 
                }

                files.push(FileNode {
                    name: file_name,
                    path: path_buf.to_string_lossy().into_owned(),
                    is_dir: path_buf.is_dir(),
                });
            }
            
            // Sort: directories first, then files
            files.sort_by(|a, b| {
                if a.is_dir && !b.is_dir {
                    std::cmp::Ordering::Less
                } else if !a.is_dir && b.is_dir {
                    std::cmp::Ordering::Greater
                } else {
                    a.name.cmp(&b.name)
                }
            });
            
            Ok(files)
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn read_file(path: &str) -> Result<String, String> {
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_dir, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
