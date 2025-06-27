import { useState, useEffect } from 'react';
import { safeLocalStorage, errorHandler } from '../utils/errorHandler';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = safeLocalStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createStorageError(`Error reading localStorage key "${key}"`),
        'useLocalStorage.initialize'
      );
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const success = safeLocalStorage.setItem(key, JSON.stringify(valueToStore));
      if (!success) {
        throw new Error(`Failed to save to localStorage: ${key}`);
      }
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createStorageError(`Error setting localStorage key "${key}"`),
        'useLocalStorage.setValue'
      );
    }
  };

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          errorHandler.handleError(
            errorHandler.createStorageError(`Error syncing localStorage key "${key}"`),
            'useLocalStorage.sync'
          );
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}