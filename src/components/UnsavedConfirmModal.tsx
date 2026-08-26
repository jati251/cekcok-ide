import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'

export const UnsavedConfirmModal = () => {
  const { pendingCloseFile, handleUnsavedConfirm } = useIDEStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pendingCloseFile) return
      if (e.key === 'Escape') {
        e.preventDefault()
        handleUnsavedConfirm('cancel')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleUnsavedConfirm('save')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pendingCloseFile, handleUnsavedConfirm])

  if (!pendingCloseFile) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 select-none p-4"
        onClick={() => handleUnsavedConfirm('cancel')}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-[440px] bg-[#252526] border border-ide-border rounded-lg shadow-2xl p-5 flex flex-col space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white leading-snug">
                Do you want to save the changes you made to {pendingCloseFile.name}?
              </h3>
              <p className="text-xs text-[#999999]">
                Your changes will be lost if you don't save them.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ide-border/50">
            <button
              onClick={() => handleUnsavedConfirm('save')}
              className="bg-ide-accent hover:bg-ide-accent-hover text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={() => handleUnsavedConfirm('dont_save')}
              className="bg-[#3c3c3c] hover:bg-[#484848] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Don't Save
            </button>
            <button
              onClick={() => handleUnsavedConfirm('cancel')}
              className="border border-ide-border hover:bg-white/5 text-[#cccccc] text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
