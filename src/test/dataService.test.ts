import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataService } from '../services/dataService';
import { Worker } from '../types';

// Mock the error handler
vi.mock('../utils/errorHandler', () => ({
  errorHandler: {
    createValidationError: (message: string) => new Error(message),
    handleError: vi.fn(),
  },
  withErrorBoundary: (fn: any) => fn,
}));

// Mock the notification service
vi.mock('../services/notificationService', () => ({
  notificationService: {
    alertLargeTransaction: vi.fn(),
  },
}));

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorker', () => {
    it('should create a worker with valid data', () => {
      const workerData = {
        name: 'John Doe',
        dailyRate: 150000,
        position: 'Tukang Bangunan',
        joinDate: '2024-01-01',
        isActive: true,
        skills: ['Bangunan', 'Renovasi'],
      };

      const result = dataService.createWorker(workerData);
      
      expect(result).toMatchObject(workerData);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should throw error for invalid worker name', () => {
      const workerData = {
        name: 'A', // Too short
        dailyRate: 150000,
        position: 'Tukang Bangunan',
        joinDate: '2024-01-01',
        isActive: true,
        skills: [],
      };

      expect(() => dataService.createWorker(workerData)).toThrow('Nama tukang minimal 2 karakter');
    });

    it('should throw error for invalid daily rate', () => {
      const workerData = {
        name: 'John Doe',
        dailyRate: 500, // Too low
        position: 'Tukang Bangunan',
        joinDate: '2024-01-01',
        isActive: true,
        skills: [],
      };

      expect(() => dataService.createWorker(workerData)).toThrow('Tarif harian minimal Rp 1.000');
    });
  });

  describe('calculatePayroll', () => {
    const mockWorker: Worker = {
      id: '1',
      name: 'John Doe',
      dailyRate: 150000,
      position: 'Tukang Bangunan',
      joinDate: '2024-01-01',
      isActive: true,
      skills: [],
    };

    it('should calculate payroll correctly', () => {
      const result = dataService.calculatePayroll(mockWorker, 25, 8, '2024-01');
      
      expect(result.workerId).toBe(mockWorker.id);
      expect(result.workerName).toBe(mockWorker.name);
      expect(result.daysWorked).toBe(25);
      expect(result.regularPay).toBe(3750000); // 150000 * 25
      expect(result.overtime).toBe(225000); // (150000/8) * 8 * 1.5
      expect(result.totalPay).toBe(3975000);
      expect(result.status).toBe('pending');
    });

    it('should handle zero overtime', () => {
      const result = dataService.calculatePayroll(mockWorker, 20, 0, '2024-01');
      
      expect(result.regularPay).toBe(3000000);
      expect(result.overtime).toBe(0);
      expect(result.totalPay).toBe(3000000);
    });

    it('should throw error for invalid days worked', () => {
      expect(() => dataService.calculatePayroll(mockWorker, -1, 0, '2024-01'))
        .toThrow('Hari kerja harus antara 0-31');
      
      expect(() => dataService.calculatePayroll(mockWorker, 35, 0, '2024-01'))
        .toThrow('Hari kerja harus antara 0-31');
    });

    it('should throw error for negative overtime', () => {
      expect(() => dataService.calculatePayroll(mockWorker, 25, -1, '2024-01'))
        .toThrow('Jam lembur tidak boleh negatif');
    });
  });

  describe('createTransaction', () => {
    it('should create transaction with valid data', () => {
      const transactionData = {
        type: 'income' as const,
        category: 'Pembayaran Proyek',
        amount: 5000000,
        description: 'Pembayaran proyek renovasi rumah',
        date: '2024-01-15',
        status: 'completed' as const,
      };

      const result = dataService.createTransaction(transactionData);
      
      expect(result).toMatchObject(transactionData);
      expect(result.id).toBeDefined();
      expect(result.createdBy).toBe('current-user');
    });

    it('should throw error for zero or negative amount', () => {
      const transactionData = {
        type: 'income' as const,
        category: 'Pembayaran Proyek',
        amount: 0,
        description: 'Invalid transaction',
        date: '2024-01-15',
        status: 'completed' as const,
      };

      expect(() => dataService.createTransaction(transactionData))
        .toThrow('Jumlah transaksi harus lebih dari 0');
    });

    it('should throw error for short description', () => {
      const transactionData = {
        type: 'income' as const,
        category: 'Pembayaran Proyek',
        amount: 1000000,
        description: 'abc', // Too short
        date: '2024-01-15',
        status: 'completed' as const,
      };

      expect(() => dataService.createTransaction(transactionData))
        .toThrow('Deskripsi minimal 5 karakter');
    });
  });

  describe('createOvertimeRecord', () => {
    it('should create overtime record with valid data', () => {
      const overtimeData = {
        workerId: '1',
        workerName: 'John Doe',
        date: '2024-01-15',
        hours: 4,
        rate: 18750, // 150000 / 8
        description: 'Lembur finishing proyek',
      };

      const result = dataService.createOvertimeRecord(overtimeData);
      
      expect(result).toMatchObject(overtimeData);
      expect(result.id).toBeDefined();
      expect(result.total).toBe(112500); // 4 * 18750 * 1.5
      expect(result.status).toBe('pending');
    });

    it('should throw error for invalid hours', () => {
      const overtimeData = {
        workerId: '1',
        workerName: 'John Doe',
        date: '2024-01-15',
        hours: 0,
        rate: 18750,
        description: 'Invalid overtime',
      };

      expect(() => dataService.createOvertimeRecord(overtimeData))
        .toThrow('Jam lembur harus antara 0.5-12 jam');
    });

    it('should throw error for invalid rate', () => {
      const overtimeData = {
        workerId: '1',
        workerName: 'John Doe',
        date: '2024-01-15',
        hours: 4,
        rate: 0,
        description: 'Invalid overtime',
      };

      expect(() => dataService.createOvertimeRecord(overtimeData))
        .toThrow('Tarif lembur harus lebih dari 0');
    });
  });
});