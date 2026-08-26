use ignore::WalkBuilder;
use rayon::prelude::*;
use regex::RegexBuilder;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub line_number: usize,
    pub line_text: String,
}

#[tauri::command]
pub fn search_files(
    cwd: &str,
    query: &str,
    case_sensitive: bool,
) -> Result<Vec<SearchResult>, String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }

    let root = Path::new(cwd);
    if !root.exists() || !root.is_dir() {
        return Ok(Vec::new());
    }

    // Build regex matcher
    let re = RegexBuilder::new(&regex::escape(trimmed))
        .case_insensitive(!case_sensitive)
        .build()
        .map_err(|e| e.to_string())?;

    // Collect all candidate file paths using Ripgrep's ignore engine
    let mut walker = WalkBuilder::new(root);
    walker
        .hidden(true) // skip hidden by default unless configured
        .git_ignore(true) // respect .gitignore
        .git_global(true)
        .git_exclude(true)
        .parents(true);

    let entries: Vec<_> = walker
        .build()
        .filter_map(|res| res.ok())
        .filter(|entry| {
            entry.file_type().is_some_and(|ft| ft.is_file())
        })
        .map(|entry| entry.into_path())
        .collect();

    let results = Mutex::new(Vec::new());
    let max_results = 200;

    // Parallel search across collected files using Rayon
    entries.par_iter().for_each(|path| {
        // Quick exit if max results reached
        if let Ok(lock) = results.lock() {
            if lock.len() >= max_results {
                return;
            }
        }

        // Avoid searching massive binary files (> 5MB)
        if let Ok(metadata) = fs::metadata(path) {
            if metadata.len() > 5 * 1024 * 1024 {
                return;
            }
        }

        if let Ok(content) = fs::read_to_string(path) {
            let mut file_matches = Vec::new();
            let file_name = path
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_default();
            let file_path_str = path.to_string_lossy().into_owned();

            for (idx, line) in content.lines().enumerate() {
                if re.is_match(line) {
                    file_matches.push(SearchResult {
                        file_path: file_path_str.clone(),
                        file_name: file_name.clone(),
                        line_number: idx + 1,
                        line_text: line.trim().to_string(),
                    });

                    if file_matches.len() >= 20 {
                        break;
                    }
                }
            }

            if !file_matches.is_empty() {
                if let Ok(mut lock) = results.lock() {
                    if lock.len() < max_results {
                        lock.extend(file_matches);
                    }
                }
            }
        }
    });

    let final_results = results.into_inner().unwrap_or_default();
    Ok(final_results)
}
