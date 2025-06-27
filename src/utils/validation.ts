import { z } from 'zod';

// Worker validation schema
export const workerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  dailyRate: z.number().min(1000, 'Tarif harian minimal Rp 1.000').max(1000000, 'Tarif harian maksimal Rp 1.000.000'),
  position: z.string().min(2, 'Posisi minimal 2 karakter'),
  joinDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Transaction validation schema
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Tipe transaksi harus dipilih' }),
  category: z.string().min(1, 'Kategori harus dipilih'),
  amount: z.number().min(1, 'Jumlah minimal Rp 1').max(1000000000, 'Jumlah maksimal Rp 1 miliar'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter').max(200, 'Deskripsi maksimal 200 karakter'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
});

// Overtime validation schema
export const overtimeSchema = z.object({
  workerId: z.string().min(1, 'Tukang harus dipilih'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
  hours: z.number().min(0.5, 'Jam lembur minimal 0.5 jam').max(12, 'Jam lembur maksimal 12 jam'),
  rate: z.number().min(1000, 'Tarif minimal Rp 1.000').max(100000, 'Tarif maksimal Rp 100.000'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter').max(200, 'Deskripsi maksimal 200 karakter'),
});

// Project validation schema
export const projectSchema = z.object({
  name: z.string().min(3, 'Nama proyek minimal 3 karakter').max(100, 'Nama proyek maksimal 100 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter').max(500, 'Deskripsi maksimal 500 karakter'),
  location: z.string().min(5, 'Lokasi minimal 5 karakter').max(200, 'Lokasi maksimal 200 karakter'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Format tanggal mulai tidak valid'),
  endDate: z.string().optional(),
  budget: z.number().min(100000, 'Budget minimal Rp 100.000').max(10000000000, 'Budget maksimal Rp 10 miliar'),
  manager: z.string().min(2, 'Nama manager minimal 2 karakter'),
});

// Material validation schema
export const materialSchema = z.object({
  name: z.string().min(2, 'Nama material minimal 2 karakter').max(100, 'Nama material maksimal 100 karakter'),
  unit: z.string().min(1, 'Satuan harus dipilih'),
  pricePerUnit: z.number().min(1, 'Harga minimal Rp 1').max(10000000, 'Harga maksimal Rp 10 juta'),
  supplier: z.string().min(2, 'Nama supplier minimal 2 karakter'),
  category: z.string().min(1, 'Kategori harus dipilih'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
  minStock: z.number().min(0, 'Stok minimum tidak boleh negatif'),
});

// Validation helper functions
export const validateWorker = (data: any) => {
  try {
    return { success: true, data: workerSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: 'Validation error' }] };
  }
};

export const validateTransaction = (data: any) => {
  try {
    return { success: true, data: transactionSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: 'Validation error' }] };
  }
};

export const validateOvertime = (data: any) => {
  try {
    return { success: true, data: overtimeSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: 'Validation error' }] };
  }
};

export const validateProject = (data: any) => {
  try {
    return { success: true, data: projectSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: 'Validation error' }] };
  }
};

export const validateMaterial = (data: any) => {
  try {
    return { success: true, data: materialSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: 'Validation error' }] };
  }
};

// Date validation helpers
export const isValidDateRange = (startDate: string, endDate?: string): boolean => {
  if (!endDate) return true;
  return new Date(startDate) <= new Date(endDate);
};

export const isNotFutureDate = (date: string): boolean => {
  return new Date(date) <= new Date();
};

export const isWorkingDay = (date: string): boolean => {
  const day = new Date(date).getDay();
  return day >= 1 && day <= 6; // Monday to Saturday
};

// Business logic validation
export const validatePayrollCalculation = (daysWorked: number, dailyRate: number, overtimeHours: number = 0): boolean => {
  if (daysWorked < 0 || daysWorked > 31) return false;
  if (dailyRate < 1000 || dailyRate > 1000000) return false;
  if (overtimeHours < 0 || overtimeHours > 100) return false;
  return true;
};

export const validateCashFlowBalance = (income: number, expenses: number): { isHealthy: boolean; warning?: string } => {
  const ratio = expenses / income;
  
  if (ratio > 0.9) {
    return { isHealthy: false, warning: 'Pengeluaran terlalu tinggi (>90% dari pemasukan)' };
  }
  
  if (ratio > 0.8) {
    return { isHealthy: true, warning: 'Perhatian: Pengeluaran tinggi (>80% dari pemasukan)' };
  }
  
  return { isHealthy: true };
};