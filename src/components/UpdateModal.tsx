import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, X, ArrowRight } from 'lucide-react'
import { checkForAppUpdates, installCurrentUpdate, UpdateInfo } from '../utils/updater'
import { toast } from 'react-hot-toast'

export const UpdateModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    // Check for updates on startup silently
    const timer = setTimeout(() => {
      checkForAppUpdates(true).then((info) => {
        if (info) {
          setUpdateInfo(info)
          setIsOpen(true)
        }
      })
    }, 4000)

    // Listen for custom trigger event
    const handleManualCheck = () => {
      checkForAppUpdates(false).then((info) => {
        if (info) {
          setUpdateInfo(info)
          setIsOpen(true)
        }
      })
    }

    window.addEventListener('check-for-updates', handleManualCheck)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('check-for-updates', handleManualCheck)
    }
  }, [])

  const handleInstall = async () => {
    try {
      setIsInstalling(true)
      setProgress(0)
      await installCurrentUpdate((p) => setProgress(p))
      toast.success('Update installed! Restarting application...', { duration: 4000 })
    } catch (err) {
      console.error('Installation error:', err)
      toast.error('Failed to install update.')
      setIsInstalling(false)
      setProgress(null)
    }
  }

  if (!isOpen || !updateInfo) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#202022] border border-[#38383c] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-b border-[#38383c] p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  Update Available
                </h3>
                <p className="text-xs text-cyan-300 font-medium">
                  v{updateInfo.currentVersion} <ArrowRight size={12} className="inline mx-1 opacity-70" /> v{updateInfo.version}
                </p>
              </div>
            </div>
            {!isInstalling && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body / Release Notes */}
          <div className="p-5 space-y-4">
            <div className="bg-[#18181a] border border-[#2e2e32] rounded-xl p-3.5 max-h-48 overflow-y-auto">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ide-muted block mb-1.5">
                Release Notes
              </span>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {updateInfo.body}
              </p>
            </div>

            {/* Progress Bar if downloading */}
            {isInstalling && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300 font-medium">
                  <span>Downloading and applying update...</span>
                  <span>{progress !== null ? `${progress}%` : ''}</span>
                </div>
                <div className="h-2 w-full bg-[#18181a] rounded-full overflow-hidden border border-[#2e2e32]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${progress ?? 0}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#1a1a1c] border-t border-[#38383c] flex items-center justify-end gap-2.5">
            {!isInstalling && (
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Remind Me Later
              </button>
            )}
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {isInstalling ? (
                <>Installing...</>
              ) : (
                <>
                  <Download size={14} />
                  Update & Restart
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
