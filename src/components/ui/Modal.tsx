import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  useEffect(() => {
    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail.theme);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'abimanyu_theme' && e.newValue) {
        setCurrentTheme(e.newValue);
      }
    };

    document.addEventListener('theme-change', handleThemeChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    // Set initial theme
    setCurrentTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    return () => {
      document.removeEventListener('theme-change', handleThemeChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const themeClasses = currentTheme === 'dark' 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className={`fixed inset-0 transition-opacity ${
            currentTheme === 'dark' 
              ? 'bg-gray-900 bg-opacity-75' 
              : 'bg-gray-500 bg-opacity-75'
          }`}
          onClick={onClose}
        />
        
        <div className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl border ${themeClasses}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`p-1 transition-colors rounded-lg ${
                currentTheme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}