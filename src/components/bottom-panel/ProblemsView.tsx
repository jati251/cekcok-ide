import React from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle2, FileCode } from 'lucide-react'
import { useIDEStore, DiagnosticItem } from '../../store/useIDEStore'

export const ProblemsView: React.FC = () => {
  const { diagnostics, openFile, currentDir } = useIDEStore()

  const errors = diagnostics.filter((d) => d.severity === 'error')
  const warnings = diagnostics.filter((d) => d.severity === 'warning')
  const infos = diagnostics.filter((d) => d.severity === 'info')

  const handleJumpToProblem = (problem: DiagnosticItem) => {
    const filename = problem.file.split(/[/\\]/).filter(Boolean).pop() || problem.file
    openFile({
      name: filename,
      path: problem.file,
      is_dir: false,
    })
  }

  // Group problems by file
  const groupedProblems = diagnostics.reduce<Record<string, DiagnosticItem[]>>((acc, curr) => {
    if (!acc[curr.file]) acc[curr.file] = []
    acc[curr.file].push(curr)
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col bg-[#181818] text-[#cccccc] font-sans select-none overflow-hidden">
      {/* Diagnostics Filter/Summary Bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-[#1f1f1f] border-b border-ide-border text-xs">
        <div className="flex items-center gap-1.5 text-red-400 font-medium">
          <AlertCircle size={13} />
          <span>{errors.length} Errors</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-400 font-medium">
          <AlertTriangle size={13} />
          <span>{warnings.length} Warnings</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400 font-medium">
          <Info size={13} />
          <span>{infos.length} Info</span>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {diagnostics.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-ide-muted space-y-2 select-none py-8">
            <CheckCircle2 size={24} className="text-green-500 opacity-80" />
            <div className="text-sm font-semibold text-white/40">No problems have been detected in the workspace.</div>
            <div className="text-[11px] text-[#777]">Syntax errors and lint issues will appear here automatically.</div>
          </div>
        ) : (
          Object.entries(groupedProblems).map(([filePath, fileDiagnostics]) => {
            const relPath = filePath.replace(currentDir, '').replace(/^[/\\]/, '')
            const filename = filePath.split(/[/\\]/).filter(Boolean).pop() || filePath

            return (
              <div key={filePath} className="mb-3">
                {/* File Header */}
                <div className="flex items-center gap-1.5 text-white/90 font-medium py-1 px-2 rounded bg-white/5 cursor-pointer hover:bg-white/10">
                  <FileCode size={13} className="text-ide-accent" />
                  <span>{filename}</span>
                  <span className="text-[10px] text-ide-muted font-sans ml-1">({relPath})</span>
                  <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.2 rounded font-sans text-ide-muted">
                    {fileDiagnostics.length}
                  </span>
                </div>

                {/* Problem Items */}
                <div className="mt-1 pl-4 space-y-1">
                  {fileDiagnostics.map((d) => {
                    const icon =
                      d.severity === 'error' ? (
                        <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                      ) : d.severity === 'warning' ? (
                        <AlertTriangle size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                      )

                    return (
                      <div
                        key={d.id}
                        onClick={() => handleJumpToProblem(d)}
                        className="flex items-start gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        {icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[#eee] group-hover:text-white">{d.message}</span>
                            {d.source && (
                              <span className="text-[10px] text-[#777] font-sans">[{d.source}]</span>
                            )}
                          </div>
                          <div className="text-[10px] text-ide-muted mt-0.5">
                            Ln {d.line}, Col {d.col}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
