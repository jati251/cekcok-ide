import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null })
  }

  private handleResetData = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#18181a] text-white p-6 text-center select-none">
          <div className="max-w-md w-full bg-[#202022] border border-red-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-xs text-gray-400">
                {this.props.fallbackMessage || 'An unexpected rendering error occurred in this workspace.'}
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-2.5 bg-black/40 rounded-lg text-left text-[11px] font-mono text-red-300 max-h-24 overflow-y-auto break-all border border-white/5">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>

              {this.props.onReset && (
                <button
                  onClick={this.handleResetData}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Clear corrupted workspace cache and restart"
                >
                  <Trash2 size={13} />
                  <span>Reset Cache</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
