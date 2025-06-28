import React from 'react';
import { Crown, Zap } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { actionLimitService } from '../../services/actionLimitService';

export function ActionLimitIndicator() {
  const { user } = useAuth();
  const [premiumStatus] = useLocalStorage('premium_status', { isPremium: false });
  
  if (!user) return null;
  
  const isPremiumActive = premiumStatus.isPremium && 
    premiumStatus.premiumUntil && 
    new Date(premiumStatus.premiumUntil) > new Date();
  
  const actionStatus = actionLimitService.getActionStatus(user.id, isPremiumActive);
  
  const getColorClass = () => {
    if (actionStatus.percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (actionStatus.percentage >= 75) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = () => {
    if (actionStatus.percentage >= 90) return 'bg-red-500';
    if (actionStatus.percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {isPremiumActive ? (
            <Crown className="w-4 h-4 text-yellow-500 mr-2" />
          ) : (
            <Zap className="w-4 h-4 text-blue-500 mr-2" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Aksi Bulan Ini
          </span>
        </div>
        <span className={`text-sm font-bold ${getColorClass()}`}>
          {actionStatus.used}/{actionStatus.max}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(actionStatus.percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {actionStatus.remaining} tersisa
        </span>
        {!isPremiumActive && actionStatus.percentage >= 75 && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Upgrade Premium
          </span>
        )}
      </div>
    </div>
  );
}