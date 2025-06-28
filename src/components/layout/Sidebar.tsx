import React from 'react';
import { 
  Home, 
  Users, 
  DollarSign, 
  Clock, 
  FileText, 
  BarChart3,
  X,
  FolderOpen,
  Package,
  QrCode,
  Calendar,
  Settings,
  Crown,
  UserCog,
  Calculator,
  Gantt
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ActionLimitIndicator } from '../premium/ActionLimitIndicator';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'workers', label: 'Manajemen Tukang', icon: UserCog },
  { id: 'payroll', label: 'Sistem Gaji', icon: Users },
  { id: 'cashflow', label: 'Kas Masuk/Keluar', icon: DollarSign },
  { id: 'overtime', label: 'Hitungan Lembur', icon: Clock },
  { id: 'projects', label: 'Manajemen Proyek', icon: FolderOpen },
  { id: 'materials', label: 'Kalkulator Material', icon: Package },
  { id: 'attendance', label: 'QR Presensi', icon: QrCode },
  { id: 'rab', label: 'RAB Otomatis', icon: Calculator, premium: true },
  { id: 'gantt', label: 'Timeline Proyek', icon: Gantt, premium: true },
  { id: 'reports', label: 'Laporan Mingguan', icon: Calendar },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'premium', label: 'Premium', icon: Crown, premium: true },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [premiumStatus] = useLocalStorage('premium_status', { isPremium: false });

  const isPremiumActive = premiumStatus.isPremium && 
    premiumStatus.premiumUntil && 
    new Date(premiumStatus.premiumUntil) > new Date();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-20"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
                {isPremiumActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Limit Indicator */}
        <div className="p-4">
          <ActionLimitIndicator />
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isPremiumItem = item.premium;
            const canAccess = !isPremiumItem || isPremiumActive;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (canAccess) {
                    onTabChange(item.id);
                    onClose();
                  }
                }}
                disabled={!canAccess}
                className={`
                  w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : canAccess
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  }
                  ${isPremiumItem && !isPremiumActive ? 'relative' : ''}
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${
                  isPremiumItem && !isPremiumActive ? 'text-yellow-500' : ''
                }`} />
                <span className="font-medium">{item.label}</span>
                {isPremiumItem && !isPremiumActive && (
                  <Crown className="w-4 h-4 ml-auto text-yellow-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Developed by <strong>Abimanyu</strong>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              v1.1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}