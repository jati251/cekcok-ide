use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub line_number: usize,
    pub line_text: String,
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
pub fn search_files(cwd: &str, query: &str, case_sensitive: bool) -> Result<Vec<SearchResult>, String> {
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
