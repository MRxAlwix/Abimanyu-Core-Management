import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('abimanyu_theme') as Theme;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('abimanyu_theme', theme);
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      // Force update all components with custom event
      document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: 'dark' } }));
      // Also trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'abimanyu_theme',
        newValue: 'dark',
        oldValue: theme === 'light' ? 'light' : null,
      }));
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      // Force update all components with custom event
      document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: 'light' } }));
      // Also trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'abimanyu_theme',
        newValue: 'light',
        oldValue: theme === 'dark' ? 'dark' : null,
      }));
    }

    // Apply CSS variables for consistent theming
    if (theme === 'dark') {
      root.style.setProperty('--toast-bg', '#374151');
      root.style.setProperty('--toast-color', '#F9FAFB');
    } else {
      root.style.setProperty('--toast-bg', '#FFFFFF');
      root.style.setProperty('--toast-color', '#111827');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}