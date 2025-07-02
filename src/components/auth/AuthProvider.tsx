import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, AuthState } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on app start
    const initializeAuth = async () => {
      try {
        // Try to refresh session from Supabase
        const refreshedAuth = await authService.refreshSession();
        if (refreshedAuth) {
          setAuthState(refreshedAuth);
        } else {
          // Fallback to localStorage
          const currentAuth = authService.getCurrentUser();
          if (currentAuth && authService.validateToken(currentAuth.token!)) {
            setAuthState(currentAuth);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(email, password);
      setAuthState(authData);
      notificationService.success(`Selamat datang, ${authData.user?.username}!`);
    } catch (error: any) {
      notificationService.error(error.message || 'Login gagal');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      notificationService.info('Anda telah logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!authState.user) return;
    
    const updatedUser = { ...authState.user, ...data };
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    
    // Update in storage
    const updatedAuth = { ...authState, user: updatedUser };
    localStorage.setItem('abimanyu_auth', JSON.stringify(updatedAuth));
    
    notificationService.success('Profil berhasil diperbarui');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Memuat aplikasi..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateProfile,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}