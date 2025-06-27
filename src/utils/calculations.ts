import { PayrollRecord, OvertimeRecord } from '../types';

export const calculateRegularPay = (dailyRate: number, daysWorked: number): number => {
  return dailyRate * daysWorked;
};

export const calculateOvertimePay = (hourlyRate: number, overtimeHours: number): number => {
  return hourlyRate * overtimeHours * 1.5; // 1.5x multiplier for overtime
};

export const calculateTotalPay = (regularPay: number, overtimePay: number): number => {
  return regularPay + overtimePay;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};