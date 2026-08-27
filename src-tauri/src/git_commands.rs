use serde::{Deserialize, Serialize};
use std::process::Command;

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

#[tauri::command]
pub fn git_get_status(cwd: &str) -> Result<GitStatusResult, String> {
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
pub fn git_stage(cwd: &str, files: Vec<String>) -> Result<String, String> {
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
pub fn git_unstage(cwd: &str, files: Vec<String>) -> Result<String, String> {
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
pub fn git_discard(cwd: &str, files: Vec<String>) -> Result<String, String> {
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
pub fn git_commit(cwd: &str, message: &str) -> Result<String, String> {
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
pub fn git_push(cwd: &str) -> Result<String, String> {
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
pub fn git_pull(cwd: &str) -> Result<String, String> {
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

#[tauri::command]
pub fn git_log(cwd: &str, limit: Option<usize>) -> Result<Vec<String>, String> {
    let limit_str = limit.unwrap_or(10).to_string();
    let output = Command::new("git")
        .current_dir(cwd)
        .args(["log", &format!("-n{}", limit_str), "--pretty=format:%h - %s (%cr) <%an>"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let logs = stdout.lines().map(|s| s.to_string()).collect();
        Ok(logs)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn git_checkout_branch(cwd: &str, branch: &str, create: bool) -> Result<String, String> {
    let mut args = vec!["checkout"];
    if create {
        args.push("-b");
    }
    args.push(branch);

    let output = Command::new("git")
        .current_dir(cwd)
        .args(&args)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() || String::from_utf8_lossy(&output.stderr).contains("Switched to") {
        Ok(format!("Switched to branch {}", branch))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn git_list_branches(cwd: &str) -> Result<Vec<String>, String> {
    let output = Command::new("git")
        .current_dir(cwd)
        .args(["branch", "--format=%(refname:short)"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let branches: Vec<String> = stdout
            .lines()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();
        Ok(branches)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
