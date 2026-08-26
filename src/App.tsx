import { Sidebar } from './components/Sidebar'
import { EditorPane } from './components/EditorPane'
import { TerminalPane } from './components/TerminalPane'
import { StatusBar } from './components/StatusBar'
import './index.css'

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-ide-bg text-ide-text overflow-hidden font-sans">
      <div className="flex flex-1 h-[calc(100vh-30px)] overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <EditorPane />
          <TerminalPane />
        </div>
      </div>
      
      <StatusBar />
    </div>
  )
}

export default App
