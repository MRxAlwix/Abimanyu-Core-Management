import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useLocalStorage } from './useLocalStorage';
import { actionLimitService } from '../services/actionLimitService';

interface ActionLimitContextType {
  actionStatus: {
    used: number;
    max: number;
    remaining: number;
    percentage: number;
  };
  canPerformAction: () => boolean;
  performAction: (actionType: string) => boolean;
  refreshStatus: () => void;
}

const ActionLimitContext = createContext<ActionLimitContextType | undefined>(undefined);

export function ActionLimitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [premiumStatus] = useLocalStorage('premium_status', { isPremium: false });
  const [actionStatus, setActionStatus] = useState({
    used: 0,
    max: 100,
    remaining: 100,
    percentage: 0,
  });

  const isPremiumActive = premiumStatus.isPremium && 
    premiumStatus.premiumUntil && 
    new Date(premiumStatus.premiumUntil) > new Date();

  const refreshStatus = () => {
    if (user) {
      const status = actionLimitService.getActionStatus(user.id, isPremiumActive);
      setActionStatus(status);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [user, isPremiumActive]);

  const canPerformAction = () => {
    if (!user) return false;
    return actionLimitService.canPerformAction(user.id, isPremiumActive);
  };

  const performAction = (actionType: string) => {
    if (!user) return false;
    const success = actionLimitService.performAction(user.id, isPremiumActive, actionType);
    if (success) {
      refreshStatus();
    }
    return success;
  };

  return (
    <ActionLimitContext.Provider value={{
      actionStatus,
      canPerformAction,
      performAction,
      refreshStatus,
    }}>
      {children}
    </ActionLimitContext.Provider>
  );
}

export function useActionLimit() {
  const context = useContext(ActionLimitContext);
  if (!context) {
    throw new Error('useActionLimit must be used within ActionLimitProvider');
  }
  return context;
}