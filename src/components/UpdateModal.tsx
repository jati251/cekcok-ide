import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, X, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react'
import {
  checkForAppUpdates,
  installCurrentUpdate,
  UpdateInfo,
  UpdateProgressState,
  formatBytes,
  updaterEventEmitter,
} from '../utils/updater'
import { restartApp } from '../utils/tauriBridge'
import { toast } from 'react-hot-toast'

export const UpdateModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [progressState, setProgressState] = useState<UpdateProgressState>({
    stage: 'idle',
    percentage: 0,
    downloadedBytes: 0,
    totalBytes: 0,
  })

  useEffect(() => {
    // Check for updates on startup silently after 3 seconds
    const timer = setTimeout(() => {
      checkForAppUpdates(true).then((info) => {
        if (info) {
          setUpdateInfo(info)
          setIsOpen(true)
        }
      })
    }, 3000)

    // Listen for custom trigger event (e.g. from Menu or Home or StatusBar)
    const handleManualCheck = () => {
      checkForAppUpdates(false).then((info) => {
        if (info) {
          setUpdateInfo(info)
          setIsOpen(true)
        }
      })
    }

    const handleUpdateStatus = (e: Event) => {
      const custom = e as CustomEvent
      if (custom.detail?.stage === 'available' && custom.detail?.info) {
        setUpdateInfo(custom.detail.info)
        setIsOpen(true)
      }
    }

    window.addEventListener('check-for-updates', handleManualCheck)
    updaterEventEmitter.addEventListener('update-status', handleUpdateStatus)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('check-for-updates', handleManualCheck)
      updaterEventEmitter.removeEventListener('update-status', handleUpdateStatus)
    }
  }, [])

  const handleInstall = async () => {
    try {
      setProgressState({
        stage: 'downloading',
        percentage: 0,
        downloadedBytes: 0,
        totalBytes: 0,
      })

      await installCurrentUpdate((state) => {
        setProgressState(state)
      })

      toast.success('Update installed! Click Restart to apply.', { duration: 5000 })
    } catch (err) {
      console.error('Installation error:', err)
      setProgressState((prev) => ({
        ...prev,
        stage: 'error',
        error: err instanceof Error ? err.message : 'Update failed',
      }))
      toast.error('Failed to install update.')
    }
  }

  const handleRestart = async () => {
    try {
      toast.loading('Restarting Cekcok IDE...', { id: 'restarting' })
      await new Promise((r) => setTimeout(r, 500))
      await restartApp()
    } catch (err) {
      console.error('Restart failed:', err)
      toast.error('Could not restart automatically. Please close and reopen the app.')
    }
  }

  if (!isOpen || !updateInfo) return null

  const isWorking =
    progressState.stage === 'downloading' ||
    progressState.stage === 'installing' ||
    progressState.stage === 'ready_to_restart'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Simple Backdrop without blurry ghosting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={() => !isWorking && setIsOpen(false)}
        />

        {/* Modal Window matching IDE Design System */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          style={{
            backgroundColor: 'var(--color-ide-sidebar)',
            borderColor: 'var(--color-ide-border)',
            color: 'var(--color-ide-text)',
          }}
          className="relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div
            style={{ borderColor: 'var(--color-ide-border)' }}
            className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ide-accent/20 text-ide-accent rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Update Available
                </h3>
                <p className="text-[11px] text-ide-accent font-mono font-medium">
                  v{updateInfo.currentVersion} <ArrowRight size={11} className="inline mx-1 opacity-70" /> v{updateInfo.version}
                </p>
              </div>
            </div>
            {!isWorking && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Body / Release Notes & Progress */}
          <div className="p-5 space-y-4 text-xs">
            {/* What's New Box */}
            <div
              style={{
                backgroundColor: 'var(--color-ide-bg)',
                borderColor: 'var(--color-ide-border)',
              }}
              className="border rounded-xl p-3.5 max-h-48 overflow-y-auto"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1.5">
                Release Notes (v{updateInfo.version})
              </span>
              <p className="opacity-80 leading-relaxed whitespace-pre-wrap text-[11px]">
                {updateInfo.body || 'Performance improvements and bug fixes.'}
              </p>
            </div>

            {/* Progress Section */}
            {isWorking && (
              <div
                style={{
                  backgroundColor: 'var(--color-ide-bg)',
                  borderColor: 'var(--color-ide-border)',
                }}
                className="space-y-2 border p-3.5 rounded-xl"
              >
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    {progressState.stage === 'downloading' && (
                      <>
                        <RefreshCw size={13} className="animate-spin text-ide-accent" />
                        <span>Downloading update package...</span>
                      </>
                    )}
                    {progressState.stage === 'installing' && (
                      <>
                        <RefreshCw size={13} className="animate-spin text-ide-accent" />
                        <span>Applying update files...</span>
                      </>
                    )}
                    {progressState.stage === 'ready_to_restart' && (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span>Update installed! Restart to finish.</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-ide-accent font-bold">{progressState.percentage}%</span>
                </div>

                {/* Progress bar with clean CSS transition */}
                <div
                  style={{
                    backgroundColor: 'var(--color-ide-sidebar)',
                    borderColor: 'var(--color-ide-border)',
                  }}
                  className="h-2 w-full rounded-full overflow-hidden border"
                >
                  <div
                    className="h-full bg-ide-accent rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, progressState.percentage))}%` }}
                  />
                </div>

                {/* Size stats */}
                {progressState.totalBytes > 0 && (
                  <div className="flex justify-between text-[10px] opacity-60 font-mono">
                    <span>{formatBytes(progressState.downloadedBytes)} downloaded</span>
                    <span>{formatBytes(progressState.totalBytes)} total</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {progressState.stage === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-500">
                <AlertCircle size={15} className="shrink-0" />
                <span>{progressState.error || 'Failed to download or apply update.'}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              backgroundColor: 'var(--color-ide-bg)',
              borderColor: 'var(--color-ide-border)',
            }}
            className="p-4 border-t flex items-center justify-between shrink-0"
          >
            <span className="text-[11px] opacity-60">
              {updateInfo.date ? `Release date: ${updateInfo.date}` : 'Official release'}
            </span>

            <div className="flex items-center gap-2">
              {!isWorking && progressState.stage !== 'ready_to_restart' && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Later
                </button>
              )}

              {progressState.stage === 'ready_to_restart' ? (
                <>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Restart Now</span>
                  </button>
                </>
              ) : progressState.stage === 'error' ? (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  disabled={isWorking}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-ide-accent hover:opacity-90 text-white rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isWorking ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      <span>Download &amp; Install</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
