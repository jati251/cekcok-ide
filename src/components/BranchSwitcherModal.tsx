import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Plus, Check, X } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'
import { safeInvoke } from '../utils/tauriBridge'
import { toast } from 'react-hot-toast'

interface BranchSwitcherModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BranchSwitcherModal: React.FC<BranchSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentDir, gitStatus, refreshGitStatus } = useIDEStore()
  const [branches, setBranches] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen || !currentDir) return

    let isMounted = true
    safeInvoke<string[]>('git_list_branches', { cwd: currentDir })
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          setBranches(list)
        }
      })
      .catch((err) => {
        console.error('Failed to list branches:', err)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, currentDir])

  if (!isOpen) return null

  const filteredBranches = branches.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const exactMatch = branches.some(
    (b) => b.toLowerCase() === searchQuery.toLowerCase().trim()
  )

  const handleCheckout = async (branchName: string, create: boolean = false) => {
    try {
      toast.loading(`Switching to branch ${branchName}...`, { id: 'branch-switch' })
      await safeInvoke('git_checkout_branch', {
        cwd: currentDir,
        branch: branchName,
        create,
      })
      toast.success(create ? `Created and switched to ${branchName}` : `Switched to ${branchName}`, {
        id: 'branch-switch',
      })
      refreshGitStatus()
      onClose()
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error(`Git error: ${err}`, { id: 'branch-switch' })
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-24 p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.12 }}
          style={{
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
            color: 'var(--color-ide-text)',
          }}
          className="relative w-full max-w-md border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        >
          {/* Header & Search */}
          <div
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="flex items-center gap-2 p-3 border-b"
          >
            <GitBranch size={15} className="text-ide-accent shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Select a branch to checkout or type new branch name..."
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
                color: 'var(--color-ide-text)',
              }}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border focus:border-ide-accent focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose()
                if (e.key === 'Enter') {
                  const trimmed = searchQuery.trim()
                  if (trimmed) {
                    if (exactMatch) {
                      handleCheckout(trimmed, false)
                    } else if (filteredBranches.length > 0) {
                      handleCheckout(filteredBranches[0], false)
                    } else {
                      handleCheckout(trimmed, true)
                    }
                  }
                }
              }}
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 opacity-60 hover:opacity-100 rounded-lg cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Branch List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-xs">
            {/* Option to create new branch if search query doesn't match exactly */}
            {searchQuery.trim() && !exactMatch && (
              <div
                onClick={() => handleCheckout(searchQuery.trim(), true)}
                style={{
                  backgroundColor: 'var(--color-ide-bg)',
                  borderColor: 'var(--color-ide-border)',
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-ide-accent cursor-pointer group transition-colors text-ide-accent font-medium"
              >
                <Plus size={14} className="group-hover:scale-110 transition-transform" />
                <span className="truncate">
                  Create new branch <strong>"{searchQuery.trim()}"</strong>
                </span>
              </div>
            )}

            {isLoading ? (
              <div className="p-4 text-center opacity-60 text-xs">Loading branches...</div>
            ) : filteredBranches.length === 0 && !searchQuery.trim() ? (
              <div className="p-4 text-center opacity-60 text-xs">No branches found</div>
            ) : (
              filteredBranches.map((branch) => {
                const isCurrent = branch === gitStatus.branch
                return (
                  <div
                    key={branch}
                    onClick={() => handleCheckout(branch, false)}
                    style={{
                      backgroundColor: isCurrent ? 'var(--color-ide-bg)' : 'transparent',
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isCurrent
                        ? 'font-bold text-ide-accent border border-ide-accent/40'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch size={13} className={`shrink-0 ${isCurrent ? 'text-ide-accent' : 'opacity-60'}`} />
                      <span className="truncate font-mono">{branch}</span>
                    </div>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-ide-accent/20 text-ide-accent font-sans">
                        <Check size={11} /> current
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Note */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-bg)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="px-3 py-2 border-t text-[11px] opacity-60 flex items-center justify-between"
          >
            <span>Current: <strong>{gitStatus.branch || 'none'}</strong></span>
            <span className="font-mono text-[10px]">Press Enter to select</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
