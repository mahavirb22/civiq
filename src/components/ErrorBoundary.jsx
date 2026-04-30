import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      const { fallbackTitle, fallbackText } = this.props;
      return (
        <div role="alert" aria-live="assertive" className="min-h-[500px] h-full flex items-center justify-center p-6 bg-background">
          <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
            <h2 className="font-editorial text-2xl text-text-primary">
              {fallbackTitle || "Something went wrong"}
            </h2>
            <p className="font-ui text-sm text-text-secondary leading-relaxed">
              {fallbackText || "Civiq hit an unexpected error. Your progress is saved."}
            </p>
            
            <div className="flex flex-col w-full gap-3 mt-6 text-sm font-ui uppercase font-bold tracking-wider">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-black py-3 rounded hover:bg-primary/90 flex items-center justify-center gap-2"
                aria-label="Reload page"
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-surface-app text-text-secondary border border-border py-3 rounded hover:text-white transition-colors flex items-center justify-center gap-2"
                aria-label="Go home"
              >
                <Home size={16} /> Go Home
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
