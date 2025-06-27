import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Dashboard } from '../dashboard/Dashboard';
import { PayrollSystem } from '../payroll/PayrollSystem';
import { CashFlowSystem } from '../cashflow/CashFlowSystem';
import { OvertimeSystem } from '../overtime/OvertimeSystem';
import { ProjectSystem } from '../projects/ProjectSystem';
import { MaterialSystem } from '../materials/MaterialSystem';
import { AttendanceSystem } from '../attendance/AttendanceSystem';
import { WeeklyReportSystem } from '../reports/WeeklyReport';
import { SettingsPage } from '../settings/SettingsPage';
import { PremiumFeatures } from '../premium/PremiumFeatures';

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'payroll':
        return <PayrollSystem />;
      case 'cashflow':
        return <CashFlowSystem />;
      case 'overtime':
        return <OvertimeSystem />;
      case 'projects':
        return <ProjectSystem />;
      case 'materials':
        return <MaterialSystem />;
      case 'attendance':
        return <AttendanceSystem />;
      case 'reports':
        return <WeeklyReportSystem />;
      case 'premium':
        return <PremiumFeatures />;
      case 'settings':
        return <SettingsPage />;
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Analitik
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fitur analitik akan segera hadir
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(true)}
          onNavigate={setActiveTab}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}