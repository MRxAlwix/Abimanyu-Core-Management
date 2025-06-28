import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Bell, Download, FolderSync as Sync, Monitor, Info, User, Shield, Palette, Database, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../auth/AuthProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { notificationService } from '../../services/notificationService';
import { backupService } from '../../services/backupService';
import { soundService } from '../../services/soundService';

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
  });

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    notificationService.success('Pengaturan berhasil disimpan');
  };

  const handleSoundToggle = () => {
    const newState = soundService.toggleSound();
    updateSetting('soundEnabled', newState);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync process
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
      title: 'Tampilan',
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
            >
              {theme === 'light' ? 'Gelap' : 'Terang'}
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
          label: 'Bahasa',
          description: 'Pilih bahasa aplikasi',
          icon: Globe,
          action: (
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
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
          label: 'Notifikasi',
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
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
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
              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
          description: 'Sinkronkan data dengan server',
          icon: Sync,
          action: (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleManualSync}
              disabled={isSyncing}
              icon={Sync}
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pengaturan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola preferensi dan konfigurasi aplikasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={User}
            onClick={() => setIsProfileModalOpen(true)}
          >
            Profil
          </Button>
          <Button
            variant="secondary"
            icon={Info}
            onClick={() => setIsAboutModalOpen(true)}
          >
            Tentang
          </Button>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user?.username}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email} • {user?.role}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={logout}
            size="sm"
          >
            Logout
          </Button>
        </div>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <Card key={group.title} title={group.title}>
          <div className="space-y-4">
            {group.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
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

      {/* About Modal */}
      <Modal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        title="Tentang Aplikasi"
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Abimanyu Core Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sistem Manajemen Tukang dan Keuangan
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Versi</p>
                <p className="text-gray-600 dark:text-gray-400">1.0.0</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Build</p>
                <p className="text-gray-600 dark:text-gray-400">2024.01.15</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Developer</p>
                <p className="text-gray-600 dark:text-gray-400">Abimanyu</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Platform</p>
                <p className="text-gray-600 dark:text-gray-400">Web</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Abimanyu. All rights reserved.
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Profil Pengguna"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.username}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bergabung:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Login Terakhir:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}