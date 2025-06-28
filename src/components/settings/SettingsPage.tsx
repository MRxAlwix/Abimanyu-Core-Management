import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Bell, Download, FolderSync as Sync, Monitor, Info, User, Shield, Palette, Database, RefreshCw, Volume2, VolumeX, Wifi, WifiOff, Cloud, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../auth/AuthProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { notificationService } from '../../services/notificationService';
import { backupService } from '../../services/backupService';
import { soundService } from '../../services/soundService';
import { firebaseService } from '../../services/firebaseService';

interface AppSettings {
  language: string;
  notifications: boolean;
  autoBackup: boolean;
  backupFrequency: 'weekly' | 'monthly';
  compactMode: boolean;
  defaultDailyRate: number;
  defaultOvertimeRate: number;
  autoSave: boolean;
  soundEnabled: boolean;
  firebaseSync: boolean;
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', {
    language: 'id',
    notifications: true,
    autoBackup: true,
    backupFrequency: 'weekly',
    compactMode: false,
    defaultDailyRate: 150000,
    defaultOvertimeRate: 25000,
    autoSave: true,
    soundEnabled: soundService.isEnabled(),
    firebaseSync: false,
  });

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(firebaseService.getConnectionInfo());

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    notificationService.success('Pengaturan berhasil disimpan');
  };

  const handleSoundToggle = () => {
    const newState = soundService.toggleSound();
    updateSetting('soundEnabled', newState);
  };

  const handleFirebaseSync = async () => {
    setIsSyncing(true);
    try {
      if (settings.firebaseSync) {
        // Sync data to Firebase
        const allData = {
          workers: JSON.parse(localStorage.getItem('workers') || '[]'),
          transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
          projects: JSON.parse(localStorage.getItem('projects') || '[]'),
          timestamp: new Date().toISOString()
        };
        
        await firebaseService.syncData(allData);
        notificationService.success('Data berhasil disinkronkan ke Firebase');
      }
      
      setFirebaseStatus(firebaseService.getConnectionInfo());
    } catch (error) {
      notificationService.error('Sinkronisasi Firebase gagal');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      notificationService.success('Sinkronisasi berhasil');
    } catch (error) {
      notificationService.error('Sinkronisasi gagal');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    backupService.exportBackup();
  };

  const settingsGroups = [
    {
      title: 'Tampilan & Interface',
      icon: Palette,
      items: [
        {
          label: 'Mode Tema',
          description: 'Pilih tema terang atau gelap',
          icon: theme === 'light' ? Sun : Moon,
          action: (
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleTheme}
              icon={theme === 'light' ? Moon : Sun}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
          ),
        },
        {
          label: 'Mode Kompak',
          description: 'Tampilan lebih padat untuk layar kecil',
          icon: Monitor,
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => updateSetting('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          ),
        },
        {
          label: 'Bahasa Interface',
          description: 'Pilih bahasa aplikasi',
          icon: Globe,
          action: (
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="id">🇮🇩 Bahasa Indonesia</option>
              <option value="en">🇺🇸 English</option>
              <option value="ms">🇲🇾 Bahasa Malaysia</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'Audio & Notifikasi',
      icon: Bell,
      items: [
        {
          label: 'Efek Suara',
          description: 'Aktifkan suara untuk feedback aksi',
          icon: settings.soundEnabled ? Volume2 : VolumeX,
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={handleSoundToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          ),
        },
        {
          label: 'Notifikasi Push',
          description: 'Aktifkan notifikasi sistem',
          icon: Bell,
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          ),
        },
        {
          label: 'Auto Save',
          description: 'Simpan otomatis setiap perubahan',
          icon: Database,
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          ),
        },
      ],
    },
    {
      title: 'Cloud & Backup',
      icon: Cloud,
      items: [
        {
          label: 'Firebase Sync',
          description: `Status: ${firebaseStatus.isConnected ? 'Connected' : 'Disconnected'}`,
          icon: firebaseStatus.isConnected ? Wifi : WifiOff,
          action: (
            <div className="flex items-center space-x-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.firebaseSync}
                  onChange={(e) => {
                    updateSetting('firebaseSync', e.target.checked);
                    if (e.target.checked) handleFirebaseSync();
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              {firebaseStatus.isConnected && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          ),
        },
        {
          label: 'Auto Backup',
          description: 'Backup otomatis data secara berkala',
          icon: Database,
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => updateSetting('autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          ),
        },
        {
          label: 'Frekuensi Backup',
          description: 'Seberapa sering backup otomatis',
          icon: RefreshCw,
          action: (
            <select
              value={settings.backupFrequency}
              onChange={(e) => updateSetting('backupFrequency', e.target.value)}
              disabled={!settings.autoBackup}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'Default Values',
      icon: Settings,
      items: [
        {
          label: 'Tarif Harian Default',
          description: 'Tarif default untuk tukang baru',
          icon: User,
          action: (
            <input
              type="number"
              value={settings.defaultDailyRate}
              onChange={(e) => updateSetting('defaultDailyRate', Number(e.target.value))}
              className="w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          ),
        },
        {
          label: 'Tarif Lembur Default',
          description: 'Tarif lembur per jam default',
          icon: User,
          action: (
            <input
              type="number"
              value={settings.defaultOvertimeRate}
              onChange={(e) => updateSetting('defaultOvertimeRate', Number(e.target.value))}
              className="w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          ),
        },
      ],
    },
    {
      title: 'Data & Sinkronisasi',
      icon: Sync,
      items: [
        {
          label: 'Sinkronisasi Manual',
          description: 'Sinkronkan data dengan cloud',
          icon: Sync,
          action: (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleManualSync}
              disabled={isSyncing}
              icon={Sync}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          ),
        },
        {
          label: 'Export Backup',
          description: 'Download backup semua data',
          icon: Download,
          action: (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportBackup}
              icon={Download}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              Export
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pengaturan Sistem
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola preferensi dan konfigurasi aplikasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={User}
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
          >
            Profil
          </Button>
          <Button
            variant="secondary"
            icon={Info}
            onClick={() => setIsAboutModalOpen(true)}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
          >
            About
          </Button>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.username}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email} • {user?.role}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Online
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={logout}
            size="sm"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            Logout
          </Button>
        </div>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <Card key={group.title} title={group.title} className="hover:shadow-lg transition-all duration-300">
          <div className="space-y-6">
            {group.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {item.action}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Firebase Status Card */}
      {firebaseStatus.isConnected && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Firebase Connected
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Project: {firebaseStatus.projectId} • Last sync: {new Date(firebaseStatus.lastSync).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </Card>
      )}

      {/* About Modal */}
      <Modal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        title="About Abimanyu Core"
        size="md"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Abimanyu Core Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              AI-Powered Construction Management System
            </p>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-6 rounded-xl">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Version</p>
                <p className="text-blue-600 dark:text-blue-400">v2.1.0</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Build</p>
                <p className="text-blue-600 dark:text-blue-400">2024.12.15</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Developer</p>
                <p className="text-blue-600 dark:text-blue-400">Abimanyu Team</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Platform</p>
                <p className="text-blue-600 dark:text-blue-400">Web + Mobile</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Abimanyu Core. All rights reserved. • Powered by AI
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="User Profile"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.username}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-6 rounded-xl">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}