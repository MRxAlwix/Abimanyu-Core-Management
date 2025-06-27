import { notificationService } from '../services/notificationService';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

class ErrorHandler {
  private errors: AppError[] = [];

  logError(error: AppError): void {
    this.errors.push(error);
    console.error('Application Error:', error);
    
    // Store in localStorage for debugging
    try {
      const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      storedErrors.push(error);
      // Keep only last 100 errors
      if (storedErrors.length > 100) {
        storedErrors.splice(0, storedErrors.length - 100);
      }
      localStorage.setItem('app_errors', JSON.stringify(storedErrors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  handleError(error: any, context?: string): void {
    const appError: AppError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: { context, stack: error.stack },
      timestamp: new Date().toISOString(),
    };

    this.logError(appError);
    
    // Show user-friendly message
    if (error.code === 'VALIDATION_ERROR') {
      notificationService.warning(error.message);
    } else if (error.code === 'NETWORK_ERROR') {
      notificationService.error('Koneksi bermasalah. Silakan coba lagi.');
    } else if (error.code === 'STORAGE_ERROR') {
      notificationService.error('Gagal menyimpan data. Periksa ruang penyimpanan.');
    } else {
      notificationService.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  }

  getErrors(): AppError[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem('app_errors');
  }

  // Specific error creators
  createValidationError(message: string, details?: any): AppError {
    return {
      code: 'VALIDATION_ERROR',
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  createNetworkError(message: string, details?: any): AppError {
    return {
      code: 'NETWORK_ERROR',
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  createStorageError(message: string, details?: any): AppError {
    return {
      code: 'STORAGE_ERROR',
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  createBusinessLogicError(message: string, details?: any): AppError {
    return {
      code: 'BUSINESS_LOGIC_ERROR',
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }
}

export const errorHandler = new ErrorHandler();

// Global error boundary helper
export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.catch === 'function') {
        return result.catch((error: any) => {
          errorHandler.handleError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(error, context);
      throw error;
    }
  }) as T;
};

// Async wrapper with error handling
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    errorHandler.handleError(error, context);
    return null;
  }
};

// Local storage wrapper with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createStorageError(`Failed to get item: ${key}`),
        'localStorage.getItem'
      );
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createStorageError(`Failed to set item: ${key}`),
        'localStorage.setItem'
      );
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createStorageError(`Failed to remove item: ${key}`),
        'localStorage.removeItem'
      );
      return false;
    }
  },
};