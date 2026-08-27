import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, X, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import {
  checkForAppUpdates,
  installCurrentUpdate,
  UpdateInfo,
  UpdateProgressState,
  formatBytes,
  updaterEventEmitter,
} from '../utils/updater'
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

      toast.success('Update installed! Restarting application...', { duration: 4000 })
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

  if (!isOpen || !updateInfo) return null

  const isWorking =
    progressState.stage === 'downloading' ||
    progressState.stage === 'installing' ||
    progressState.stage === 'ready_to_restart'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#202022] border border-[#38383c] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-purple-600/30 border-b border-[#38383c] p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  Update Available
                </h3>
                <p className="text-xs text-cyan-300 font-medium">
                  v{updateInfo.currentVersion} <ArrowRight size={12} className="inline mx-1 opacity-70" /> v
                  {updateInfo.version}
                </p>
              </div>
            </div>
            {!isWorking && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body / Release Notes & Progress */}
          <div className="p-5 space-y-4">
            <div className="bg-[#18181a] border border-[#2e2e32] rounded-xl p-3.5 max-h-48 overflow-y-auto">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                What's New in v{updateInfo.version}
              </span>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {updateInfo.body}
              </p>
            </div>

            {/* Progress Section */}
            {isWorking && (
              <div className="space-y-2 bg-[#18181a] border border-[#2e2e32] p-3.5 rounded-xl">
                <div className="flex justify-between text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    {progressState.stage === 'downloading' && (
                      <>
                        <RefreshCw size={13} className="animate-spin text-cyan-400" />
                        Downloading update package...
                      </>
                    )}
                    {progressState.stage === 'installing' && (
                      <>
                        <RefreshCw size={13} className="animate-spin text-blue-400" />
                        Applying update & preparing files...
                      </>
                    )}
                    {progressState.stage === 'ready_to_restart' && (
                      <>
                        <CheckCircle2 size={13} className="text-green-400" />
                        Complete! Restarting Cekcok IDE...
                      </>
                    )}
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">{progressState.percentage}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-[#252528] rounded-full overflow-hidden border border-[#38383c]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${progressState.percentage}%` }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                  />
                </div>

                {/* Size stats */}
                {progressState.totalBytes > 0 && (
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>{formatBytes(progressState.downloadedBytes)} transferred</span>
                    <span>{formatBytes(progressState.totalBytes)} total</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {progressState.stage === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertCircle size={15} className="shrink-0" />
                <span>{progressState.error || 'Failed to download or apply update.'}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#1a1a1c] border-t border-[#38383c] flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {updateInfo.date ? `Published: ${updateInfo.date}` : 'Signed official release'}
            </span>

            <div className="flex items-center gap-2.5">
              {!isWorking && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  Later
                </button>
              )}

              {progressState.stage === 'error' ? (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  Retry Install
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  disabled={isWorking}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-md disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isWorking ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Download & Install
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
