import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  console.error('Error caught:', error);

  if (error instanceof AxiosError) {
    const response = error.response?.data as ErrorResponse | undefined;
    
    // Check for specific error messages
    if (response?.message) {
      return response.message;
    }
    
    if (response?.error) {
      return response.error;
    }
    
    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.message || defaultMessage;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
};

export const showErrorToast = (error: unknown, defaultMessage?: string) => {
  const message = handleApiError(error, defaultMessage);
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
  });
};

export const showWarningToast = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#FEF3C7',
      color: '#92400E',
    },
  });
};

