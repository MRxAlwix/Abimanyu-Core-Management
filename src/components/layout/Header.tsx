import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ProfileDropdown } from '../ui/ProfileDropdown';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface HeaderProps {
  onMenuToggle: () => void;
  onNavigate: (page: string) => void;
}

export function Header({ onMenuToggle, onNavigate }: HeaderProps) {
  const [premiumStatus] = useLocalStorage('premium_status', { isPremium: false });

  const isPremiumActive = premiumStatus.isPremium && 
    premiumStatus.premiumUntil && 
    new Date(premiumStatus.premiumUntil) > new Date();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Abimanyu Core Management
          </h1>
          {isPremiumActive && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Premium Active
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        
        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <ProfileDropdown onNavigate={onNavigate} />
      </div>
    </header>
  );
}