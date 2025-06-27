import { describe, it, expect } from 'vitest';
import { 
  validateWorker, 
  validateTransaction, 
  validateOvertime,
  validatePayrollCalculation,
  validateCashFlowBalance,
  isValidDateRange,
  isNotFutureDate,
  isWorkingDay
} from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateWorker', () => {
    it('should validate correct worker data', () => {
      const validWorker = {
        name: 'John Doe',
        dailyRate: 150000,
        position: 'Tukang Bangunan',
        joinDate: '2024-01-01',
        phone: '081234567890',
        address: 'Jakarta',
      };

      const result = validateWorker(validWorker);
      expect(result.success).toBe(true);
      expect(result.errors).toBe(null);
    });

    it('should reject invalid worker data', () => {
      const invalidWorker = {
        name: 'A', // Too short
        dailyRate: 500, // Too low
        position: '',
        joinDate: 'invalid-date',
      };

      const result = validateWorker(invalidWorker);
      expect(result.success).toBe(false);
      expect(result.errors).toBeTruthy();
    });
  });

  describe('validateTransaction', () => {
    it('should validate correct transaction data', () => {
      const validTransaction = {
        type: 'income',
        category: 'Pembayaran Proyek',
        amount: 5000000,
        description: 'Pembayaran proyek renovasi rumah',
        date: '2024-01-15',
      };

      const result = validateTransaction(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should reject invalid transaction data', () => {
      const invalidTransaction = {
        type: 'invalid',
        category: '',
        amount: -1000,
        description: 'abc', // Too short
        date: 'invalid-date',
      };

      const result = validateTransaction(invalidTransaction);
      expect(result.success).toBe(false);
    });
  });

  describe('validatePayrollCalculation', () => {
    it('should validate correct payroll parameters', () => {
      expect(validatePayrollCalculation(25, 150000, 8)).toBe(true);
      expect(validatePayrollCalculation(20, 100000, 0)).toBe(true);
    });

    it('should reject invalid payroll parameters', () => {
      expect(validatePayrollCalculation(-1, 150000, 8)).toBe(false);
      expect(validatePayrollCalculation(35, 150000, 8)).toBe(false);
      expect(validatePayrollCalculation(25, 500, 8)).toBe(false);
      expect(validatePayrollCalculation(25, 150000, -1)).toBe(false);
    });
  });

  describe('validateCashFlowBalance', () => {
    it('should identify healthy cash flow', () => {
      const result = validateCashFlowBalance(10000000, 7000000);
      expect(result.isHealthy).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('should warn about high expenses', () => {
      const result = validateCashFlowBalance(10000000, 8500000);
      expect(result.isHealthy).toBe(true);
      expect(result.warning).toContain('Perhatian');
    });

    it('should flag unhealthy cash flow', () => {
      const result = validateCashFlowBalance(10000000, 9500000);
      expect(result.isHealthy).toBe(false);
      expect(result.warning).toContain('terlalu tinggi');
    });
  });

  describe('Date validation helpers', () => {
    it('should validate date ranges', () => {
      expect(isValidDateRange('2024-01-01', '2024-01-31')).toBe(true);
      expect(isValidDateRange('2024-01-31', '2024-01-01')).toBe(false);
      expect(isValidDateRange('2024-01-01')).toBe(true); // No end date
    });

    it('should check if date is not in future', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      expect(isNotFutureDate(yesterday)).toBe(true);
      expect(isNotFutureDate(today)).toBe(true);
      expect(isNotFutureDate(tomorrow)).toBe(false);
    });

    it('should identify working days', () => {
      // Monday = 1, Sunday = 0
      expect(isWorkingDay('2024-01-15')).toBe(true); // Monday
      expect(isWorkingDay('2024-01-20')).toBe(true); // Saturday
      expect(isWorkingDay('2024-01-21')).toBe(false); // Sunday
    });
  });
});