import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Crown, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PremiumBadge } from '../premium/PremiumBadge';

interface ProfileDropdownProps {
  onNavigate: (page: string) => void;
}

export function ProfileDropdown({ onNavigate }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [premiumStatus] = useLocalStorage('premium_status', { isPremium: false });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPremiumActive = premiumStatus.isPremium && 
    premiumStatus.premiumUntil && 
    new Date(premiumStatus.premiumUntil) > new Date();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: 'Kelola Akun',
      icon: User,
      action: () => {
        onNavigate('settings');
        setIsOpen(false);
      },
    },
    {
      label: 'Langganan Premium',
      icon: Crown,
      action: () => {
        onNavigate('premium');
        setIsOpen(false);
      },
      premium: true,
    },
    {
      label: 'Pengaturan',
      icon: Settings,
      action: () => {
        onNavigate('settings');
        setIsOpen(false);
      },
    },
    {
      label: 'Keluar',
      icon: LogOut,
      action: () => {
        logout();
        setIsOpen(false);
      },
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.username}
          </p>
          <div className="flex items-center space-x-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
            {isPremiumActive && <PremiumBadge size="sm" showText={false} />}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </span>
                  {isPremiumActive && <PremiumBadge size="sm" />}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  item.danger 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-700 dark:text-gray-300'
                } ${item.premium && !isPremiumActive ? 'opacity-75' : ''}`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${
                  item.premium && !isPremiumActive ? 'text-yellow-500' : ''
                }`} />
                <span className="flex-1">{item.label}</span>
                {item.premium && !isPremiumActive && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}