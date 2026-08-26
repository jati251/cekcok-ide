import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIDEStore } from '../store/useIDEStore'
import { ExplorerSidebar } from './sidebar/ExplorerSidebar'
import { SearchSidebar } from './sidebar/SearchSidebar'
import { GitSidebar } from './sidebar/GitSidebar'
import { NodeSidebar } from './sidebar/NodeSidebar'

export const Sidebar: React.FC = () => {
  const { sidebarOpen, sidebarWidth, activeSidebarTab } = useIDEStore()

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="bg-ide-sidebar border-r border-ide-border flex flex-col h-full overflow-hidden select-none z-10 shrink-0"
          style={{ width: sidebarWidth }}
        >
          {activeSidebarTab === 'explorer' && <ExplorerSidebar />}
          {activeSidebarTab === 'search' && <SearchSidebar />}
          {activeSidebarTab === 'git' && <GitSidebar />}
          {activeSidebarTab === 'node' && <NodeSidebar />}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
