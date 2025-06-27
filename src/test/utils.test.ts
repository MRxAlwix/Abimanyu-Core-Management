import { describe, it, expect } from 'vitest';
import { 
  calculateRegularPay, 
  calculateOvertimePay, 
  calculateTotalPay,
  formatCurrency,
  formatDate 
} from '../utils/calculations';

describe('Calculation Utils', () => {
  describe('calculateRegularPay', () => {
    it('should calculate regular pay correctly', () => {
      expect(calculateRegularPay(100000, 25)).toBe(2500000);
      expect(calculateRegularPay(150000, 20)).toBe(3000000);
      expect(calculateRegularPay(75000, 0)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateRegularPay(0, 25)).toBe(0);
      expect(calculateRegularPay(100000, 0)).toBe(0);
    });
  });

  describe('calculateOvertimePay', () => {
    it('should calculate overtime pay with 1.5x multiplier', () => {
      expect(calculateOvertimePay(12500, 8)).toBe(150000); // 12500 * 8 * 1.5
      expect(calculateOvertimePay(15000, 4)).toBe(90000);  // 15000 * 4 * 1.5
    });

    it('should handle zero overtime hours', () => {
      expect(calculateOvertimePay(12500, 0)).toBe(0);
    });
  });

  describe('calculateTotalPay', () => {
    it('should sum regular and overtime pay', () => {
      expect(calculateTotalPay(2500000, 150000)).toBe(2650000);
      expect(calculateTotalPay(1000000, 0)).toBe(1000000);
      expect(calculateTotalPay(0, 100000)).toBe(100000);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in Indonesian Rupiah', () => {
      expect(formatCurrency(1000000)).toBe('Rp1.000.000');
      expect(formatCurrency(2500000)).toBe('Rp2.500.000');
      expect(formatCurrency(0)).toBe('Rp0');
    });
  });

  describe('formatDate', () => {
    it('should format date in Indonesian locale', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Januari');
    });
  });
});