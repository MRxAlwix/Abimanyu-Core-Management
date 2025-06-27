import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/layout/Layout';
import { notificationService } from './services/notificationService';
import { backupService } from './services/backupService';

function App() {
  useEffect(() => {
    // Initialize notification reminders
    notificationService.schedulePayrollReminder();
    
    // Initialize auto backup
    backupService.scheduleAutoBackup();
    
    // Show welcome message
    setTimeout(() => {
      notificationService.info('Selamat datang di Abimanyu Core Management!');
    }, 1000);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Layout />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;