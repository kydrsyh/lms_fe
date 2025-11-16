import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../atoms';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleGoBack = () => {
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Go back in history
    window.history.back();
  };

  handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full">
            <div className="bg-white shadow-xl rounded-lg p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-100 p-4">
                  <ExclamationTriangleIcon className="h-16 w-16 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-center text-gray-600 mb-8">
                We're sorry for the inconvenience. An unexpected error has occurred.
                {isDevelopment && ' Check the console for more details.'}
              </p>

              {/* Error details (only in development) */}
              {isDevelopment && this.state.error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Error Details:
                  </h3>
                  <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <h3 className="text-sm font-semibold text-red-800 mt-4 mb-2">
                        Component Stack:
                      </h3>
                      <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={this.handleGoBack}
                  leftIcon={<ArrowLeftIcon />}
                >
                  Go Back
                </Button>
                <Button
                  variant="primary"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </div>

              {/* Additional help */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-center text-gray-500">
                  If the problem persists, please contact support or try again later.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

