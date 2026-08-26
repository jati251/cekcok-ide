import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  RefreshCw,
  Plus,
  Minus,
  RotateCcw,
  Check,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useIDEStore } from '../../store/useIDEStore'

export const GitSidebar: React.FC = () => {
  const {
    currentDir,
    gitStatus,
    isGitLoading,
    refreshGitStatus,
    runTerminalCommand,
    openFile,
  } = useIDEStore()

  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)

  const handleStageFile = async (file: string) => {
    try {
      await invoke('git_stage', { cwd: currentDir, files: [file] })
      await refreshGitStatus()
    } catch (err) {
      console.error('Stage error:', err)
    }
  }

  const handleUnstageFile = async (file: string) => {
    try {
      await invoke('git_unstage', { cwd: currentDir, files: [file] })
      await refreshGitStatus()
    } catch (err) {
      console.error('Unstage error:', err)
    }
  }

  const handleStageAll = async () => {
    try {
      await invoke('git_stage', { cwd: currentDir, files: ['.'] })
      await refreshGitStatus()
    } catch (err) {
      console.error('Stage all error:', err)
    }
  }

  const handleUnstageAll = async () => {
    try {
      await invoke('git_unstage', { cwd: currentDir, files: ['.'] })
      await refreshGitStatus()
    } catch (err) {
      console.error('Unstage all error:', err)
    }
  }

  const handleDiscardFile = async (file: string) => {
    if (!confirm(`Discard all changes to ${file}? This cannot be undone.`)) return
    try {
      await invoke('git_discard', { cwd: currentDir, files: [file] })
      await refreshGitStatus()
    } catch (err) {
      console.error('Discard error:', err)
    }
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) return
    setIsCommitting(true)
    try {
      await invoke('git_commit', { cwd: currentDir, message: commitMessage })
      setCommitMessage('')
      await refreshGitStatus()
    } catch (err) {
      alert(`Commit error: ${err}`)
    } finally {
      setIsCommitting(false)
    }
  }

  const handlePush = async () => {
    try {
      await invoke('git_push', { cwd: currentDir })
      await refreshGitStatus()
    } catch (err) {
      alert(`Push error: ${err}`)
    }
  }

  const handlePull = async () => {
    try {
      await invoke('git_pull', { cwd: currentDir })
      await refreshGitStatus()
    } catch (err) {
      alert(`Pull error: ${err}`)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border bg-[#1f1f1f]">
        <span>Source Control</span>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshGitStatus}
            className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Refresh Git Status"
          >
            <RefreshCw size={13} className={isGitLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handlePull}
            className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Pull Changes"
          >
            <ArrowDown size={13} />
          </button>
          <button
            onClick={handlePush}
            className="hover:text-white text-[#999] p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Push Changes"
          >
            <ArrowUp size={13} />
          </button>
        </div>
      </div>

      {!gitStatus.is_repo ? (
        <div className="p-4 text-center text-xs text-[#888] space-y-2">
          <p>Not a Git repository.</p>
          <button
            onClick={() => runTerminalCommand('git init')}
            className="bg-ide-accent hover:bg-ide-accent-hover text-white px-3 py-1 rounded text-xs cursor-pointer"
          >
            Initialize Repository
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Branch & Sync Bar */}
          <div className="flex items-center justify-between text-xs bg-[#2b2b2b] px-2.5 py-1.5 rounded">
            <span className="font-mono text-white/90 font-medium truncate">
              ⎇ {gitStatus.branch}
            </span>
            <span className="text-[10px] text-ide-muted">
              ↑{gitStatus.ahead} ↓{gitStatus.behind}
            </span>
          </div>

          {/* Commit Box */}
          <div className="space-y-1.5">
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Message (Cmd+Enter to commit)"
              rows={2}
              className="w-full bg-[#3c3c3c] text-white text-xs p-2 rounded border border-transparent focus:border-ide-accent focus:outline-none resize-none"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleCommit()
                }
              }}
            />
            <button
              onClick={handleCommit}
              disabled={isCommitting || !commitMessage.trim()}
              className="w-full bg-ide-accent hover:bg-ide-accent-hover disabled:opacity-50 text-white text-xs py-1.5 rounded font-medium cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              <Check size={14} />
              Commit
            </button>
          </div>

          {/* Staged Changes */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1">
              <span>Staged Changes ({gitStatus.staged.length})</span>
              {gitStatus.staged.length > 0 && (
                <button
                  onClick={handleUnstageAll}
                  className="hover:text-white text-[#888] cursor-pointer p-0.5"
                  title="Unstage All"
                >
                  <Minus size={13} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {gitStatus.staged.map((f) => (
                <div
                  key={`staged-${f.path}`}
                  className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded text-xs group cursor-pointer"
                  onClick={() =>
                    openFile({
                      name: f.path.split(/[/\\]/).pop() || f.path,
                      path: f.path,
                      is_dir: false,
                    })
                  }
                >
                  <span className="truncate text-white/90">{f.path}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-green-400 font-mono">
                      {f.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnstageFile(f.path)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-white text-[#888] cursor-pointer"
                      title="Unstage"
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Changes (Unstaged) */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-ide-muted uppercase tracking-wider mb-1">
              <span>Changes ({gitStatus.unstaged.length})</span>
              {gitStatus.unstaged.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleStageAll}
                    className="hover:text-white text-[#888] cursor-pointer p-0.5"
                    title="Stage All"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              {gitStatus.unstaged.map((f) => (
                <div
                  key={`unstaged-${f.path}`}
                  className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded text-xs group cursor-pointer"
                  onClick={() =>
                    openFile({
                      name: f.path.split(/[/\\]/).pop() || f.path,
                      path: f.path,
                      is_dir: false,
                    })
                  }
                >
                  <span className="truncate text-white/90">{f.path}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      {f.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStageFile(f.path)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-white text-[#888] cursor-pointer"
                      title="Stage File"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDiscardFile(f.path)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-[#888] cursor-pointer"
                      title="Discard Changes"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
