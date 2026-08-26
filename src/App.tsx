import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Editor from "@monaco-editor/react";
import { 
  FolderOpen, 
  FileCode2, 
  FileJson, 
  FileText,
  File,
  TerminalSquare,
  Settings,
  Bell,
  GitBranch
} from "lucide-react";
import "./index.css";

interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
}

const getLanguageFromFilename = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'rs': return 'rust';
    case 'ts': case 'tsx': return 'typescript';
    case 'js': case 'jsx': return 'javascript';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'css': return 'css';
    case 'html': return 'html';
    default: return 'plaintext';
  }
};

const getIconForFile = (filename: string, isDir: boolean) => {
  if (isDir) return FolderOpen;
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json': return FileJson;
    case 'md': return FileText;
    case 'rs': case 'ts': case 'tsx': case 'js': case 'jsx': return FileCode2;
    default: return File;
  }
};

function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadDirectory = async (path: string) => {
    try {
      const result = await invoke<FileNode[]>("read_dir", { path });
      setFiles(result);
    } catch (error) {
      console.error("Failed to load directory:", error);
    }
  };

  useEffect(() => {
    // Load current directory on startup
    const init = async () => {
      await loadDirectory(".");
    };
    init();
     
  }, []);

  const handleFileClick = async (file: FileNode) => {
    if (file.is_dir) {
      // In a real IDE, this would toggle a folder tree. 
      // For now, let's just navigate into it.
      loadDirectory(file.path);
    } else {
      setActiveFile(file);
      setIsLoading(true);
      try {
        const content = await invoke<string>("read_file", { path: file.path });
        setCode(content);
      } catch (error) {
        console.error("Failed to read file:", error);
        setCode(`// Error loading file:\n${error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="ide-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Explorer</span>
            <button 
              onClick={() => loadDirectory(".")}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px' }}
              title="Go back to root"
            >
              [ROOT]
            </button>
          </div>
          <div className="sidebar-content">
            {files.map((file) => {
              const Icon = getIconForFile(file.name, file.is_dir);
              const isActive = activeFile?.path === file.path;
              return (
                <div 
                  key={file.path}
                  className={`file-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleFileClick(file)}
                >
                  <Icon size={16} color={file.is_dir ? "#cca700" : "currentColor"} />
                  <span>{file.name}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="main-content">
          <div className="editor-tabs">
            {activeFile ? (
              <div className="editor-tab">
                {(() => {
                   const ActiveIcon = getIconForFile(activeFile.name, false);
                   return <ActiveIcon size={14} />;
                })()}
                {activeFile.name}
              </div>
            ) : (
              <div className="editor-tab" style={{ color: '#888', borderTopColor: 'transparent', backgroundColor: 'transparent' }}>
                No file opened
              </div>
            )}
          </div>
          
          <div className="editor-container">
            {activeFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                path={activeFile.name}
                language={getLanguageFromFilename(activeFile.name)}
                value={isLoading ? "Loading..." : code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  padding: { top: 16 },
                  fontFamily: "'Consolas', 'Courier New', monospace"
                }}
              />
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'var(--font-family)' }}>
                Select a file from the explorer to start editing
              </div>
            )}
          </div>

          {/* Terminal Panel (Mock) */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TerminalSquare size={14} />
                Terminal
              </div>
            </div>
            <div className="terminal-content">
              <div className="terminal-line">
                <span className="terminal-prompt">cekcok@macbook ~$</span> echo "File system wired up!"
              </div>
              <div className="terminal-line">
                File system wired up!
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-left">
          <div className="status-item">
            <GitBranch size={14} />
            main
          </div>
          {activeFile && (
            <div className="status-item">
              {activeFile.name}
            </div>
          )}
        </div>
        <div className="status-right">
          <div className="status-item">UTF-8</div>
          {activeFile && (
            <div className="status-item">{getLanguageFromFilename(activeFile.name).toUpperCase()}</div>
          )}
          <div className="status-item"><Settings size={14}/></div>
          <div className="status-item"><Bell size={14}/></div>
        </div>
      </footer>
    </>
  );
}

export default App;
