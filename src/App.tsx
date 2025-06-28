import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ActionLimitProvider } from './hooks/useActionLimit';
import { PremiumStatusProvider } from './components/premium/PremiumStatusProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { notificationService } from './services/notificationService';
import { backupService } from './services/backupService';
import { dataService } from './services/dataService';

function AppContent() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize application
    const initializeApp = async () => {
      try {
        // Check data integrity on startup
        const integrity = dataService.validateDataIntegrity();
        if (!integrity.isValid) {
          console.warn('Data integrity issues found:', integrity.issues);
          dataService.cleanupData();
        }

        // Initialize notification reminders
        notificationService.schedulePayrollReminder();
        
        // Initialize auto backup (in production, this would be more sophisticated)
        if (process.env.NODE_ENV === 'production') {
          backupService.scheduleAutoBackup();
        }
        
        // Show welcome message after a short delay
        setTimeout(() => {
          notificationService.info('Selamat datang di Abimanyu Core Management!');
        }, 1500);

        // Log successful initialization
        console.log('Abimanyu Core Management initialized successfully');
      } catch (error) {
        console.error('Failed to initialize application:', error);
        notificationService.error('Gagal menginisialisasi aplikasi');
      }
    };

    initializeApp();
  }, [isAuthenticated]);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      notificationService.error('Terjadi kesalahan sistem');
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      notificationService.error('Terjadi kesalahan aplikasi');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <PremiumStatusProvider>
      <ActionLimitProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Layout />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </div>
      </ActionLimitProvider>
    </PremiumStatusProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;