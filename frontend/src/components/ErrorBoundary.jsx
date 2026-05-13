import React from "react";
import { AlertTriangleIcon, RefreshCcwIcon, HomeIcon } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
          <div className="max-w-md w-full bg-base-200 border border-base-300 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="size-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangleIcon className="size-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Something went wrong</h1>
              <p className="text-base-content/60 font-medium">
                We've encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="bg-base-300/50 p-4 rounded-2xl text-left overflow-hidden">
                <p className="text-xs font-mono text-error/80 break-all line-clamp-3">
                    {this.state.error?.toString()}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary flex-1 rounded-xl gap-2 font-bold"
              >
                <RefreshCcwIcon className="size-4" />
                Retry
              </button>
              <button
                onClick={this.handleReset}
                className="btn btn-ghost flex-1 rounded-xl gap-2 font-bold border border-base-300"
              >
                <HomeIcon className="size-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
