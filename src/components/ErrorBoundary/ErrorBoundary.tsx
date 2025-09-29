import React, { Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorBoundary.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Wrapper component to use hooks inside ErrorBoundary
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-boundary">
      <div className="error-boundary__content">
        <h2 className="error-boundary__title">Something went wrong</h2>
        <p className="error-boundary__message">
          An unexpected error occurred. Please try again.
        </p>
        <button 
          className="error-boundary__retry-btn" 
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    
    // Reload the current route by navigating to the same path
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return <ErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
