import toast from 'react-hot-toast';
import { NOTIFICATION_TYPES } from '../config/constants';
import { soundService } from './soundService';

class NotificationService {
  success(message: string, options?: any) {
    soundService.playSound('success');
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
      ...options,
    });
  }

  error(message: string, options?: any) {
    soundService.playSound('error');
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
      ...options,
    });
  }

  warning(message: string, options?: any) {
    soundService.playSound('notification');
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  }

  info(message: string, options?: any) {
    soundService.playSound('notification');
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  }

  // Reminder notifications
  scheduleReminder(message: string, delay: number) {
    setTimeout(() => {
      this.warning(`Pengingat: ${message}`);
    }, delay);
  }

  // Weekly payroll reminder
  schedulePayrollReminder() {
    const now = new Date();
    const nextFriday = new Date();
    nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
    nextFriday.setHours(9, 0, 0, 0);

    const timeUntilReminder = nextFriday.getTime() - now.getTime();
    
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        this.warning('Jangan lupa input gaji mingguan untuk semua tukang!');
      }, timeUntilReminder);
    }
  }

  // Large transaction alert
  alertLargeTransaction(amount: number, type: 'income' | 'expense') {
    if (amount > 5000000) { // 5 million IDR
      const message = type === 'income' 
        ? `Pemasukan besar tercatat: ${this.formatCurrency(amount)}`
        : `Pengeluaran besar tercatat: ${this.formatCurrency(amount)}`;
      
      this.info(message);
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

export const notificationService = new NotificationService();