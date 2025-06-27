import { STORAGE_KEYS } from '../config/constants';
import { notificationService } from './notificationService';

class BackupService {
  private getAllData() {
    const data: Record<string, any> = {};
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          data[key] = JSON.parse(item);
        } catch {
          data[key] = item;
        }
      }
    });

    return data;
  }

  exportBackup(): void {
    try {
      const data = this.getAllData();
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `abimanyu-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notificationService.success('Backup berhasil diunduh');
    } catch (error) {
      console.error('Backup export error:', error);
      notificationService.error('Gagal membuat backup');
    }
  }

  importBackup(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          
          if (!backup.data || !backup.version) {
            throw new Error('Invalid backup format');
          }

          // Restore data
          Object.entries(backup.data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          });

          notificationService.success('Backup berhasil dipulihkan');
          resolve();
        } catch (error) {
          console.error('Backup import error:', error);
          notificationService.error('Gagal memulihkan backup');
          reject(error);
        }
      };

      reader.onerror = () => {
        notificationService.error('Gagal membaca file backup');
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  }

  scheduleAutoBackup(): void {
    // Auto backup every 7 days
    const BACKUP_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    setInterval(() => {
      this.exportBackup();
      notificationService.info('Backup otomatis telah dibuat');
    }, BACKUP_INTERVAL);
  }
}

export const backupService = new BackupService();