import { Settings, Bell, GitBranch, PanelLeft, Terminal } from 'lucide-react'
import { useIDEStore } from '../store/useIDEStore'

export const StatusBar = () => {
  const { activeFile, toggleSidebar, toggleTerminal } = useIDEStore()

  const getLanguage = () => {
    if (!activeFile) return ''
    const ext = activeFile.name.split('.').pop()?.toLowerCase() || ''
    return ext.toUpperCase()
  }

  return (
    <footer className="h-[30px] bg-ide-accent text-white flex items-center justify-between px-4 text-xs select-none">
      <div className="flex items-center gap-4">
        {/* Toggle UI Buttons */}
        <div className="flex items-center gap-2 mr-2">
          <button onClick={toggleSidebar} className="hover:bg-white/20 p-1 rounded transition-colors" title="Toggle Sidebar">
            <PanelLeft size={14} />
          </button>
          <button onClick={toggleTerminal} className="hover:bg-white/20 p-1 rounded transition-colors" title="Toggle Terminal">
            <Terminal size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch size={14} />
          main
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors">
          0 errors, 0 warnings
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {activeFile && (
          <div className="hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors">
            UTF-8
          </div>
        )}
        {activeFile && (
          <div className="hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors">
            {getLanguage()}
          </div>
        )}
        <div className="hover:bg-white/20 p-1 rounded cursor-pointer transition-colors">
          <Settings size={14}/>
        </div>
        <div className="hover:bg-white/20 p-1 rounded cursor-pointer transition-colors">
          <Bell size={14}/>
        </div>
      </div>
    </footer>
  )
}
