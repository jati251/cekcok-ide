use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::process::{Command, Stdio, Child};
use std::sync::{Arc, Mutex};
use std::io::{BufRead, BufReader};
use tauri::{AppHandle, Emitter, State};

pub struct TerminalState {
    pub process: Arc<Mutex<Option<Child>>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_hidden: bool,
    pub is_ignored: bool,
}

#[tauri::command]
pub fn read_dir(path: &str, show_hidden: Option<bool>) -> Result<Vec<FileNode>, String> {
    let mut files = Vec::new();
    let dir_path = Path::new(path);
    let allow_hidden = show_hidden.unwrap_or(true);

    if !dir_path.exists() || !dir_path.is_dir() {
        return Err(format!("Path {} is not a valid directory", path));
    }

    match fs::read_dir(dir_path) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let path_buf = entry.path();
                let file_name = entry.file_name().into_string().unwrap_or_default();

                let is_hidden = file_name.starts_with('.');
                let is_ignored = is_hidden_or_ignored_name(&file_name);

                // If hidden files are disabled, skip hidden files completely (except .gitignore or .env if needed)
                if is_hidden && !allow_hidden {
                    continue;
                }

                files.push(FileNode {
                    name: file_name,
                    path: path_buf.to_string_lossy().into_owned(),
                    is_dir: path_buf.is_dir(),
                    is_hidden,
                    is_ignored,
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

fn is_hidden_or_ignored_name(name: &str) -> bool {
    matches!(
        name,
        "node_modules"
            | ".git"
            | "dist"
            | "build"
            | "target"
            | ".next"
            | ".turbo"
            | ".DS_Store"
            | ".cache"
            | "out"
            | "coverage"
    )
}

#[tauri::command]
pub fn read_file(path: &str) -> Result<String, String> {
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn write_file(path: &str, content: &str) -> Result<(), String> {
    match fs::write(path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn create_file(path: &str) -> Result<(), String> {
    match fs::File::create(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn create_dir(path: &str) -> Result<(), String> {
    match fs::create_dir_all(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_path(path: &str) -> Result<(), String> {
    let p = Path::new(path);
    if !p.exists() {
        return Err(format!("Path {} does not exist", path));
    }

    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn rename_path(old_path: &str, new_path: &str) -> Result<(), String> {
    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reveal_in_file_manager(path: &str) -> Result<(), String> {
    let p = Path::new(path);
    if !p.exists() {
        return Err(format!("Path {} does not exist", path));
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(parent) = p.parent() {
            Command::new("xdg-open")
                .arg(parent)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn execute_shell(cmd: &str, cwd: &str) -> Result<String, String> {
    let output = Command::new("sh")
        .current_dir(cwd)
        .arg("-c")
        .arg(cmd)
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(format!("{}{}", stdout, stderr))
    } else {
        Err(format!("{}{}", stdout, stderr))
    }
}

#[tauri::command]
pub fn spawn_shell(app: AppHandle, state: State<'_, TerminalState>, cmd: &str, cwd: &str) -> Result<(), String> {
    // If a process is already running, kill it before spawning a new one
    kill_shell(state.clone())?;

    let mut child = Command::new("sh")
        .current_dir(cwd)
        .arg("-c")
        .arg(cmd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    // Save the child process in state so it can be killed later
    {
        let mut process_guard = state.process.lock().unwrap();
        *process_guard = Some(child);
    }

    let app_clone1 = app.clone();
    let app_clone2 = app.clone();

    // Stream Stdout
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for l in reader.lines().map_while(Result::ok) {
            let _ = app_clone1.emit("terminal-output", format!("{}\r\n", l));
        }
    });

    // Stream Stderr
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for l in reader.lines().map_while(Result::ok) {
            let _ = app_clone2.emit("terminal-output", format!("\x1b[31m{}\x1b[0m\r\n", l));
        }
    });

    // Wait for process to exit
    let app_clone3 = app.clone();
    let state_clone = state.process.clone();
    std::thread::spawn(move || {
        // Wait for the process to actually finish by acquiring the lock
        let mut exit_status = None;
        {
            let mut guard = state_clone.lock().unwrap();
            if let Some(child) = guard.as_mut() {
                exit_status = child.wait().ok();
            }
            // Once finished, remove it from state
            *guard = None;
        }
        let _ = app_clone3.emit("terminal-exit", exit_status.map(|s| s.code()).unwrap_or(Some(0)));
    });

    Ok(())
}

#[tauri::command]
pub fn kill_shell(state: State<'_, TerminalState>) -> Result<(), String> {
    let mut process_guard = state.process.lock().unwrap();
    if let Some(mut child) = process_guard.take() {
        let _ = child.kill();
        let _ = child.wait(); // ensure zombie process is reaped
    }
    Ok(())
}
