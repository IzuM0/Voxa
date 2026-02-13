import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary component to catch rendering and lifecycle errors.
 * 
 * Features:
 * - Catches rendering errors, lifecycle errors, and errors in child components
 * - Provides a user-friendly fallback UI
 * - Allows retry without full page reload
 * - Logs errors to console
 * - Accessible and keyboard-friendly
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Store error info for potential debugging
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (
      this.state.hasError &&
      prevProps.resetKeys &&
      this.props.resetKeys &&
      prevProps.resetKeys.join(",") !== this.props.resetKeys.join(",")
    ) {
      this.handleReset();
    }
  }

  handleReset = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    // Full page reload as fallback
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] px-4 py-12"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="size-10 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-center">
            Something went wrong
          </h2>
          
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Something went wrong while loading this section. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={this.handleReset}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label="Retry loading this section"
            >
              <RefreshCw className="size-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            
            <Button
              onClick={this.handleReload}
              variant="outline"
              aria-label="Reload the entire page"
            >
              Reload Page
            </Button>
          </div>

          {/* Development-only error details */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-8 max-w-2xl w-full">
              <summary className="text-sm text-muted-foreground cursor-pointer mb-2">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 p-4 bg-muted rounded-md text-xs font-mono overflow-auto">
                <div className="font-semibold mb-2 text-destructive">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
