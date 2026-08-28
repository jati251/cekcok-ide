use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::{Command, Stdio, Child};
use std::sync::{Arc, Mutex};
use std::io::{BufRead, BufReader};
use tauri::{AppHandle, Emitter, State};

pub struct TerminalState {
    pub processes: Arc<Mutex<HashMap<String, Child>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TerminalOutputPayload {
    pub session_id: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TerminalExitPayload {
    pub session_id: String,
    pub code: Option<i32>,
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
pub fn read_file_bytes(path: &str) -> Result<Vec<u8>, String> {
    match fs::read(path) {
        Ok(bytes) => Ok(bytes),
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
pub fn write_file_bytes(path: &str, bytes: Vec<u8>) -> Result<(), String> {
    match fs::write(path, bytes) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn create_file(path: &str) -> Result<(), String> {
    let p = Path::new(path);
    if let Some(parent) = p.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    match fs::File::create(p) {
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

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> Result<(), std::io::Error> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn copy_path(source_path: &str, target_path: &str) -> Result<(), String> {
    let src = Path::new(source_path);
    let dst = Path::new(target_path);

    if !src.exists() {
        return Err(format!("Source path {} does not exist", source_path));
    }

    if src.is_dir() {
        copy_dir_all(src, dst).map_err(|e| e.to_string())
    } else {
        fs::copy(src, dst).map(|_| ()).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn duplicate_path(path: &str) -> Result<String, String> {
    let src = Path::new(path);
    if !src.exists() {
        return Err(format!("Path {} does not exist", path));
    }

    let parent = src.parent().unwrap_or(Path::new(""));
    let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("untitled");
    let ext = src.extension().and_then(|s| s.to_str());

    let mut counter = 1;
    let mut new_path_buf;
    loop {
        let new_name = if let Some(e) = ext {
            format!("{} copy {}.{}", stem, counter, e)
        } else {
            format!("{} copy {}", stem, counter)
        };
        new_path_buf = parent.join(new_name);
        if !new_path_buf.exists() {
            break;
        }
        counter += 1;
    }

    let new_path = new_path_buf.to_string_lossy().to_string();
    if src.is_dir() {
        copy_dir_all(src, &new_path_buf).map_err(|e| e.to_string())?;
    } else {
        fs::copy(src, &new_path_buf).map_err(|e| e.to_string())?;
    }

    Ok(new_path)
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
pub fn change_dir(current: &str, target: &str) -> Result<String, String> {
    let curr_path = Path::new(current);
    let target_path = Path::new(target);

    let resolved = if target_path.is_absolute() {
        target_path.to_path_buf()
    } else {
        curr_path.join(target_path)
    };

    let canonical = resolved.canonicalize().map_err(|e| e.to_string())?;
    if !canonical.is_dir() {
        return Err(format!("{} is not a directory", target));
    }

    Ok(canonical.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn spawn_shell(
    app: AppHandle,
    state: State<'_, TerminalState>,
    cmd: &str,
    cwd: &str,
    session_id: Option<String>,
) -> Result<(), String> {
    let sid = session_id.unwrap_or_else(|| "term-1".to_string());

    // If a process is already running for this session, kill it before spawning a new one
    let _ = kill_shell(state.clone(), Some(sid.clone()));

    #[cfg(target_os = "windows")]
    let mut command = Command::new("powershell.exe");
    #[cfg(target_os = "windows")]
    command.arg("-Command").arg(cmd);

    #[cfg(not(target_os = "windows"))]
    let mut command = Command::new("sh");
    #[cfg(not(target_os = "windows"))]
    command.arg("-c").arg(cmd);

    let mut child = command
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    {
        let mut processes_guard = state.processes.lock().unwrap();
        processes_guard.insert(sid.clone(), child);
    }

    let app_clone1 = app.clone();
    let sid_clone1 = sid.clone();
    // Stream Stdout
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for l in reader.lines().map_while(Result::ok) {
            let _ = app_clone1.emit("terminal-output", TerminalOutputPayload {
                session_id: sid_clone1.clone(),
                data: format!("{}\r\n", l),
            });
        }
    });

    let app_clone2 = app.clone();
    let sid_clone2 = sid.clone();
    // Stream Stderr
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for l in reader.lines().map_while(Result::ok) {
            let _ = app_clone2.emit("terminal-output", TerminalOutputPayload {
                session_id: sid_clone2.clone(),
                data: format!("\x1b[31m{}\x1b[0m\r\n", l),
            });
        }
    });

    // Wait for process to exit
    let app_clone3 = app.clone();
    let state_clone = state.processes.clone();
    let sid_clone3 = sid.clone();
    std::thread::spawn(move || {
        let mut exit_status = None;
        loop {
            std::thread::sleep(std::time::Duration::from_millis(50));
            let mut guard = state_clone.lock().unwrap();
            if let Some(child) = guard.get_mut(&sid_clone3) {
                match child.try_wait() {
                    Ok(Some(status)) => {
                        exit_status = Some(status);
                        guard.remove(&sid_clone3);
                        break;
                    }
                    Ok(None) => {}
                    Err(_) => {
                        guard.remove(&sid_clone3);
                        break;
                    }
                }
            } else {
                break;
            }
        }
        let _ = app_clone3.emit("terminal-exit", TerminalExitPayload {
            session_id: sid_clone3,
            code: exit_status.and_then(|s| s.code()),
        });
    });

    Ok(())
}

#[tauri::command]
pub fn kill_shell(state: State<'_, TerminalState>, session_id: Option<String>) -> Result<(), String> {
    let mut processes_guard = state.processes.lock().unwrap();
    if let Some(sid) = session_id {
        if let Some(mut child) = processes_guard.remove(&sid) {
            let _ = child.kill();
            let _ = child.wait();
        }
    } else {
        for (_, mut child) in processes_guard.drain() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
    Ok(())
}
