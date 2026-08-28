import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIDEStore } from '../store/useIDEStore'
import { TOOLS } from './ToolRegistry'

export const Sidebar: React.FC = () => {
  const { sidebarOpen, sidebarWidth, activeSidebarTab, toolLayout } = useIDEStore()

  // Find the active tool if it's currently on the left panel
  const activeTool = TOOLS[activeSidebarTab]
  const isToolOnLeft = activeTool && toolLayout[activeTool.id] === 'left'

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && isToolOnLeft && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="bg-ide-sidebar border-r border-ide-border flex flex-col h-full overflow-hidden select-none z-10 shrink-0"
          style={{ width: sidebarWidth }}
          data-drop-zone="left-tools"
        >
          <activeTool.component />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
