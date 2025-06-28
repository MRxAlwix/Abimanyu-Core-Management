import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useLocalStorage } from './useLocalStorage';
import { notificationService } from '../services/notificationService';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil?: string;
  subscriptionType?: 'monthly' | 'yearly';
  features: {
    unlimitedActions: boolean;
    advancedReports: boolean;
    cloudBackup: boolean;
    prioritySupport: boolean;
    customThemes: boolean;
    aiAssistant: boolean;
  };
}

interface PremiumContextType {
  premiumStatus: PremiumStatus;
  isPremiumActive: boolean;
  updatePremiumStatus: (status: Partial<PremiumStatus>) => void;
  checkPremiumExpiry: () => void;
  hasFeature: (feature: keyof PremiumStatus['features']) => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumStatusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useLocalStorage<PremiumStatus>('premium_status', {
    isPremium: false,
    features: {
      unlimitedActions: false,
      advancedReports: false,
      cloudBackup: false,
      prioritySupport: false,
      customThemes: false,
      aiAssistant: false,
    },
  });
  
  const [isPremiumActive, setIsPremiumActive] = useState(false);

  const checkPremiumExpiry = () => {
    // Check user's premium status from auth
    const userPremium = user?.isPremium && user?.premiumUntil && 
      new Date(user.premiumUntil) > new Date();
    
    // Check local premium status
    const localPremium = premiumStatus.isPremium && 
      premiumStatus.premiumUntil && 
      new Date(premiumStatus.premiumUntil) > new Date();
    
    const isActive = userPremium || localPremium;
    setIsPremiumActive(isActive);
    
    // Update features based on premium status
    if (isActive && !premiumStatus.features.unlimitedActions) {
      setPremiumStatus(prev => ({
        ...prev,
        isPremium: true,
        features: {
          unlimitedActions: true,
          advancedReports: true,
          cloudBackup: true,
          prioritySupport: true,
          customThemes: true,
          aiAssistant: true,
        },
      }));
    }
    
    // Check if premium expired
    if (premiumStatus.isPremium && premiumStatus.premiumUntil && !isActive) {
      setPremiumStatus(prev => ({
        ...prev,
        isPremium: false,
        features: {
          unlimitedActions: false,
          advancedReports: false,
          cloudBackup: false,
          prioritySupport: false,
          customThemes: false,
          aiAssistant: false,
        },
      }));
      notificationService.warning('Langganan Premium Anda telah berakhir');
    }
  };

  const updatePremiumStatus = (status: Partial<PremiumStatus>) => {
    setPremiumStatus(prev => ({ ...prev, ...status }));
    checkPremiumExpiry();
    
    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('premium-status-change', { detail: status }));
  };

  const hasFeature = (feature: keyof PremiumStatus['features']): boolean => {
    return isPremiumActive && premiumStatus.features[feature];
  };

  useEffect(() => {
    checkPremiumExpiry();
    
    // Check expiry every minute
    const interval = setInterval(checkPremiumExpiry, 60000);
    
    // Listen for premium status changes
    const handlePremiumChange = () => {
      checkPremiumExpiry();
    };
    
    window.addEventListener('premium-status-change', handlePremiumChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('premium-status-change', handlePremiumChange);
    };
  }, [user, premiumStatus]);

  // Sync with user's premium status
  useEffect(() => {
    if (user?.isPremium && user?.premiumUntil) {
      updatePremiumStatus({
        isPremium: true,
        premiumUntil: user.premiumUntil,
        subscriptionType: 'yearly',
      });
    }
  }, [user]);

  return (
    <PremiumContext.Provider value={{
      premiumStatus,
      isPremiumActive,
      updatePremiumStatus,
      checkPremiumExpiry,
      hasFeature,
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