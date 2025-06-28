import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { notificationService } from '../../services/notificationService';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil?: string;
  subscriptionType?: 'monthly' | 'yearly';
}

interface PremiumContextType {
  premiumStatus: PremiumStatus;
  isPremiumActive: boolean;
  updatePremiumStatus: (status: PremiumStatus) => void;
  checkPremiumExpiry: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumStatusProvider({ children }: { children: ReactNode }) {
  const [premiumStatus, setPremiumStatus] = useLocalStorage<PremiumStatus>('premium_status', {
    isPremium: false,
  });
  
  const [isPremiumActive, setIsPremiumActive] = useState(false);

  const checkPremiumExpiry = () => {
    const isActive = premiumStatus.isPremium && 
      premiumStatus.premiumUntil && 
      new Date(premiumStatus.premiumUntil) > new Date();
    
    setIsPremiumActive(isActive);
    
    // Check if premium expired
    if (premiumStatus.isPremium && premiumStatus.premiumUntil && !isActive) {
      setPremiumStatus({ isPremium: false });
      notificationService.warning('Langganan Premium Anda telah berakhir');
    }
  };

  const updatePremiumStatus = (status: PremiumStatus) => {
    setPremiumStatus(status);
    checkPremiumExpiry();
    
    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('premium-status-change', { detail: status }));
  };

  useEffect(() => {
    checkPremiumExpiry();
    
    // Check expiry every minute
    const interval = setInterval(checkPremiumExpiry, 60000);
    
    // Listen for premium status changes
    const handlePremiumChange = (e: CustomEvent) => {
      checkPremiumExpiry();
    };
    
    window.addEventListener('premium-status-change', handlePremiumChange as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('premium-status-change', handlePremiumChange as EventListener);
    };
  }, [premiumStatus]);

  return (
    <PremiumContext.Provider value={{
      premiumStatus,
      isPremiumActive,
      updatePremiumStatus,
      checkPremiumExpiry,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremiumStatus() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremiumStatus must be used within PremiumStatusProvider');
  }
  return context;
}