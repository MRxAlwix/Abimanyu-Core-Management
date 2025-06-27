import { Worker, PayrollRecord, Transaction, OvertimeRecord, Project, Material, AttendanceRecord } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { errorHandler, withErrorBoundary } from '../utils/errorHandler';
import { notificationService } from './notificationService';

class DataService {
  // Worker operations
  createWorker = withErrorBoundary((worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...worker,
      id: Date.now().toString(),
      skills: worker.skills || [],
    };
    
    // Validate worker data
    if (!worker.name || worker.name.length < 2) {
      throw errorHandler.createValidationError('Nama tukang minimal 2 karakter');
    }
    
    if (worker.dailyRate < 1000) {
      throw errorHandler.createValidationError('Tarif harian minimal Rp 1.000');
    }
    
    return newWorker;
  }, 'DataService.createWorker');

  // Payroll operations
  calculatePayroll = withErrorBoundary((
    worker: Worker,
    daysWorked: number,
    overtimeHours: number = 0,
    period: string
  ): PayrollRecord => {
    if (daysWorked < 0 || daysWorked > 31) {
      throw errorHandler.createValidationError('Hari kerja harus antara 0-31');
    }
    
    if (overtimeHours < 0) {
      throw errorHandler.createValidationError('Jam lembur tidak boleh negatif');
    }

    const regularPay = worker.dailyRate * daysWorked;
    const overtimePay = (worker.dailyRate / 8) * overtimeHours * 1.5; // Assuming 8 hours per day, 1.5x rate
    const totalPay = regularPay + overtimePay;

    return {
      id: Date.now().toString(),
      workerId: worker.id,
      workerName: worker.name,
      period,
      daysWorked,
      dailyRate: worker.dailyRate,
      regularPay,
      overtime: overtimePay,
      totalPay,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }, 'DataService.calculatePayroll');

  // Transaction operations
  createTransaction = withErrorBoundary((transaction: Omit<Transaction, 'id'>) => {
    if (transaction.amount <= 0) {
      throw errorHandler.createValidationError('Jumlah transaksi harus lebih dari 0');
    }
    
    if (!transaction.description || transaction.description.length < 5) {
      throw errorHandler.createValidationError('Deskripsi minimal 5 karakter');
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdBy: 'current-user', // In real app, get from auth context
    };

    // Alert for large transactions
    if (transaction.amount > 5000000) {
      notificationService.alertLargeTransaction(transaction.amount, transaction.type);
    }

    return newTransaction;
  }, 'DataService.createTransaction');

  // Overtime operations
  createOvertimeRecord = withErrorBoundary((overtime: Omit<OvertimeRecord, 'id' | 'total'>) => {
    if (overtime.hours <= 0 || overtime.hours > 12) {
      throw errorHandler.createValidationError('Jam lembur harus antara 0.5-12 jam');
    }
    
    if (overtime.rate <= 0) {
      throw errorHandler.createValidationError('Tarif lembur harus lebih dari 0');
    }

    const total = overtime.hours * overtime.rate * 1.5;

    return {
      ...overtime,
      id: Date.now().toString(),
      total,
      status: 'pending' as const,
    };
  }, 'DataService.createOvertimeRecord');

  // Project operations
  createProject = withErrorBoundary((project: Omit<Project, 'id' | 'qrCode'>) => {
    if (!project.name || project.name.length < 3) {
      throw errorHandler.createValidationError('Nama proyek minimal 3 karakter');
    }
    
    if (project.budget <= 0) {
      throw errorHandler.createValidationError('Budget proyek harus lebih dari 0');
    }
    
    if (project.endDate && new Date(project.startDate) > new Date(project.endDate)) {
      throw errorHandler.createValidationError('Tanggal mulai tidak boleh setelah tanggal selesai');
    }

    return {
      ...project,
      id: Date.now().toString(),
      spent: project.spent || 0,
      workers: project.workers || [],
      progress: project.progress || 0,
      images: project.images || [],
    };
  }, 'DataService.createProject');

  // Material operations
  createMaterial = withErrorBoundary((material: Omit<Material, 'id'>) => {
    if (!material.name || material.name.length < 2) {
      throw errorHandler.createValidationError('Nama material minimal 2 karakter');
    }
    
    if (material.pricePerUnit <= 0) {
      throw errorHandler.createValidationError('Harga material harus lebih dari 0');
    }
    
    if (material.stock < 0 || material.minStock < 0) {
      throw errorHandler.createValidationError('Stok tidak boleh negatif');
    }

    return {
      ...material,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    };
  }, 'DataService.createMaterial');

  // Attendance operations
  createAttendanceRecord = withErrorBoundary((attendance: Omit<AttendanceRecord, 'id'>) => {
    if (!attendance.workerName || attendance.workerName.length < 2) {
      throw errorHandler.createValidationError('Nama tukang harus diisi');
    }
    
    if (!attendance.location) {
      throw errorHandler.createValidationError('Lokasi harus diisi');
    }

    // Validate check-in time is not in the future
    if (new Date(attendance.checkIn) > new Date()) {
      throw errorHandler.createValidationError('Waktu check-in tidak boleh di masa depan');
    }

    // Validate check-out is after check-in
    if (attendance.checkOut && new Date(attendance.checkOut) <= new Date(attendance.checkIn)) {
      throw errorHandler.createValidationError('Waktu check-out harus setelah check-in');
    }

    return {
      ...attendance,
      id: Date.now().toString(),
    };
  }, 'DataService.createAttendanceRecord');

  // Data integrity checks
  validateDataIntegrity = withErrorBoundary(() => {
    const issues: string[] = [];
    
    try {
      // Check for orphaned payroll records
      const workers = JSON.parse(localStorage.getItem('workers') || '[]');
      const payrollRecords = JSON.parse(localStorage.getItem('payrollRecords') || '[]');
      
      const workerIds = new Set(workers.map((w: Worker) => w.id));
      const orphanedPayrolls = payrollRecords.filter((p: PayrollRecord) => !workerIds.has(p.workerId));
      
      if (orphanedPayrolls.length > 0) {
        issues.push(`${orphanedPayrolls.length} catatan gaji tanpa data tukang`);
      }

      // Check for negative amounts in transactions
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const negativeTransactions = transactions.filter((t: Transaction) => t.amount < 0);
      
      if (negativeTransactions.length > 0) {
        issues.push(`${negativeTransactions.length} transaksi dengan jumlah negatif`);
      }

      // Check for future dates in attendance
      const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '[]');
      const futureAttendance = attendanceRecords.filter((a: AttendanceRecord) => 
        new Date(a.date) > new Date()
      );
      
      if (futureAttendance.length > 0) {
        issues.push(`${futureAttendance.length} catatan presensi dengan tanggal masa depan`);
      }

      return { isValid: issues.length === 0, issues };
    } catch (error) {
      throw errorHandler.createBusinessLogicError('Gagal memvalidasi integritas data');
    }
  }, 'DataService.validateDataIntegrity');

  // Cleanup operations
  cleanupData = withErrorBoundary(() => {
    const integrity = this.validateDataIntegrity();
    
    if (!integrity.isValid) {
      notificationService.warning(`Ditemukan ${integrity.issues.length} masalah data. Membersihkan...`);
      
      // Auto-fix common issues
      this.fixOrphanedRecords();
      this.fixNegativeAmounts();
      this.fixFutureDates();
      
      notificationService.success('Data berhasil dibersihkan');
    }
  }, 'DataService.cleanupData');

  private fixOrphanedRecords = () => {
    try {
      const workers = JSON.parse(localStorage.getItem('workers') || '[]');
      const payrollRecords = JSON.parse(localStorage.getItem('payrollRecords') || '[]');
      
      const workerIds = new Set(workers.map((w: Worker) => w.id));
      const validPayrolls = payrollRecords.filter((p: PayrollRecord) => workerIds.has(p.workerId));
      
      localStorage.setItem('payrollRecords', JSON.stringify(validPayrolls));
    } catch (error) {
      console.error('Failed to fix orphaned records:', error);
    }
  };

  private fixNegativeAmounts = () => {
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const validTransactions = transactions.filter((t: Transaction) => t.amount >= 0);
      
      localStorage.setItem('transactions', JSON.stringify(validTransactions));
    } catch (error) {
      console.error('Failed to fix negative amounts:', error);
    }
  };

  private fixFutureDates = () => {
    try {
      const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '[]');
      const validAttendance = attendanceRecords.filter((a: AttendanceRecord) => 
        new Date(a.date) <= new Date()
      );
      
      localStorage.setItem('attendance', JSON.stringify(validAttendance));
    } catch (error) {
      console.error('Failed to fix future dates:', error);
    }
  };
}

export const dataService = new DataService();