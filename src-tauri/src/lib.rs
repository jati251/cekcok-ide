use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitFileChange {
    pub path: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatusResult {
    pub is_repo: bool,
    pub branch: String,
    pub staged: Vec<GitFileChange>,
    pub unstaged: Vec<GitFileChange>,
    pub ahead: usize,
    pub behind: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub line_number: usize,
    pub line_text: String,
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

                // Skip hidden files
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

#[tauri::command]
fn write_file(path: &str, content: &str) -> Result<(), String> {
    match fs::write(path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn create_file(path: &str) -> Result<(), String> {
    match fs::File::create(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn create_dir(path: &str) -> Result<(), String> {
    match fs::create_dir_all(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn execute_shell(cmd: &str, cwd: &str) -> Result<String, String> {
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
fn git_get_status(cwd: &str) -> Result<GitStatusResult, String> {
    let output = Command::new("git")
        .current_dir(cwd)
        .args(["status", "--porcelain=v1", "-b"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Ok(GitStatusResult {
            is_repo: false,
            branch: "".to_string(),
            staged: Vec::new(),
            unstaged: Vec::new(),
            ahead: 0,
            behind: 0,
        });
    }

    let out_str = String::from_utf8_lossy(&output.stdout);
    let mut branch = "main".to_string();
    let mut ahead = 0;
    let mut behind = 0;
    let mut staged = Vec::new();
    let mut unstaged = Vec::new();

    for line in out_str.lines() {
        if line.starts_with("##") {
            let b_info = &line[3..];
            if let Some(pos) = b_info.find("...") {
                branch = b_info[..pos].to_string();
                if let Some(ahead_pos) = b_info.find("ahead ") {
                    let num_str: String = b_info[ahead_pos + 6..]
                        .chars()
                        .take_while(|c| c.is_ascii_digit())
                        .collect();
                    ahead = num_str.parse().unwrap_or(0);
                }
                if let Some(behind_pos) = b_info.find("behind ") {
                    let num_str: String = b_info[behind_pos + 7..]
                        .chars()
                        .take_while(|c| c.is_ascii_digit())
                        .collect();
                    behind = num_str.parse().unwrap_or(0);
                }
            } else {
                branch = b_info.split_whitespace().next().unwrap_or("main").to_string();
            }
            continue;
        }

        if line.len() < 3 {
            continue;
        }

        let chars: Vec<char> = line.chars().collect();
        let x = chars[0];
        let y = chars[1];
        let file_path = line[3..].trim().to_string();

        if x == '?' && y == '?' {
            unstaged.push(GitFileChange {
                path: file_path,
                status: "U".to_string(),
            });
        } else {
            if x != ' ' && x != '?' {
                staged.push(GitFileChange {
                    path: file_path.clone(),
                    status: x.to_string(),
                });
            }
            if y != ' ' && y != '?' {
                unstaged.push(GitFileChange {
                    path: file_path,
                    status: y.to_string(),
                });
            }
        }
    }

    Ok(GitStatusResult {
        is_repo: true,
        branch,
        staged,
        unstaged,
        ahead,
        behind,
    })
}

#[tauri::command]
fn git_stage(cwd: &str, files: Vec<String>) -> Result<String, String> {
    let mut cmd = Command::new("git");
    cmd.current_dir(cwd);
    if files.is_empty() || (files.len() == 1 && files[0] == ".") {
        cmd.args(["add", "-A"]);
    } else {
        cmd.arg("add").arg("--").args(&files);
    }
    let output = cmd.output().map_err(|e| e.to_string())?;
    if output.status.success() {
        Ok("Staged successfully".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_unstage(cwd: &str, files: Vec<String>) -> Result<String, String> {
    let mut cmd = Command::new("git");
    cmd.current_dir(cwd);
    if files.is_empty() || (files.len() == 1 && files[0] == ".") {
        cmd.args(["restore", "--staged", "."]);
    } else {
        cmd.arg("restore").arg("--staged").arg("--").args(&files);
    }
    let output = cmd.output().map_err(|e| e.to_string())?;
    if output.status.success() {
        Ok("Unstaged successfully".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_discard(cwd: &str, files: Vec<String>) -> Result<String, String> {
    for f in &files {
        let _ = Command::new("git")
            .current_dir(cwd)
            .args(["restore", "--", f])
            .output();
        let _ = Command::new("git")
            .current_dir(cwd)
            .args(["clean", "-fd", "--", f])
            .output();
    }
    Ok("Discarded changes".to_string())
}

#[tauri::command]
fn git_commit(cwd: &str, message: &str) -> Result<String, String> {
    let output = Command::new("git")
        .current_dir(cwd)
        .args(["commit", "-m", message])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_push(cwd: &str) -> Result<String, String> {
    let output = Command::new("git")
        .current_dir(cwd)
        .arg("push")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let err = String::from_utf8_lossy(&output.stderr).to_string();
        if err.trim().is_empty() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(err)
        }
    }
}

#[tauri::command]
fn git_pull(cwd: &str) -> Result<String, String> {
    let output = Command::new("git")
        .current_dir(cwd)
        .arg("pull")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn search_dir_recursive(
    dir: &Path,
    query: &str,
    case_sensitive: bool,
    results: &mut Vec<SearchResult>,
    max_results: usize,
) {
    if results.len() >= max_results {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    let target_query = if case_sensitive {
        query.to_string()
    } else {
        query.to_lowercase()
    };

    for entry in entries.flatten() {
        if results.len() >= max_results {
            break;
        }

        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.')
            || name == "node_modules"
            || name == "target"
            || name == "dist"
            || name == "build"
            || name == ".next"
        {
            continue;
        }

        if path.is_dir() {
            search_dir_recursive(&path, query, case_sensitive, results, max_results);
        } else if path.is_file() {
            if let Ok(content) = fs::read_to_string(&path) {
                for (idx, line) in content.lines().enumerate() {
                    let line_to_check = if case_sensitive {
                        line.to_string()
                    } else {
                        line.to_lowercase()
                    };

                    if line_to_check.contains(&target_query) {
                        results.push(SearchResult {
                            file_path: path.to_string_lossy().into_owned(),
                            file_name: name.clone(),
                            line_number: idx + 1,
                            line_text: line.trim().to_string(),
                        });

                        if results.len() >= max_results {
                            break;
                        }
                    }
                }
            }
        }
    }
}

#[tauri::command]
fn search_files(cwd: &str, query: &str, case_sensitive: bool) -> Result<Vec<SearchResult>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    let mut results = Vec::new();
    let root = Path::new(cwd);
    if root.exists() && root.is_dir() {
        search_dir_recursive(root, query, case_sensitive, &mut results, 100);
    }
    Ok(results)
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
