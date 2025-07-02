import { supabase } from '../config/database';
import { notificationService } from './notificationService';
import { Worker, Transaction, PayrollRecord, Project, Material, AttendanceRecord, OvertimeRecord } from '../types';

class DatabaseService {
  // Workers
  async getWorkers(userId: string): Promise<Worker[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(worker => ({
        id: worker.id,
        name: worker.name,
        dailyRate: worker.daily_rate,
        position: worker.position,
        joinDate: worker.join_date,
        isActive: worker.is_active,
        phone: worker.phone,
        address: worker.address,
        skills: worker.skills || [],
      }));
    } catch (error: any) {
      console.error('Error fetching workers:', error);
      notificationService.error('Gagal memuat data tukang');
      return [];
    }
  }

  async createWorker(userId: string, worker: Omit<Worker, 'id'>): Promise<Worker | null> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .insert({
          user_id: userId,
          name: worker.name,
          daily_rate: worker.dailyRate,
          position: worker.position,
          join_date: worker.joinDate,
          is_active: worker.isActive,
          phone: worker.phone,
          address: worker.address,
          skills: worker.skills,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        dailyRate: data.daily_rate,
        position: data.position,
        joinDate: data.join_date,
        isActive: data.is_active,
        phone: data.phone,
        address: data.address,
        skills: data.skills || [],
      };
    } catch (error: any) {
      console.error('Error creating worker:', error);
      notificationService.error('Gagal menambahkan tukang');
      return null;
    }
  }

  async updateWorker(workerId: string, updates: Partial<Worker>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          name: updates.name,
          daily_rate: updates.dailyRate,
          position: updates.position,
          join_date: updates.joinDate,
          is_active: updates.isActive,
          phone: updates.phone,
          address: updates.address,
          skills: updates.skills,
        })
        .eq('id', workerId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error updating worker:', error);
      notificationService.error('Gagal memperbarui data tukang');
      return false;
    }
  }

  async deleteWorker(workerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', workerId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      notificationService.error('Gagal menghapus tukang');
      return false;
    }
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        status: transaction.status,
        projectId: transaction.project_id,
        createdBy: transaction.created_by,
      }));
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      notificationService.error('Gagal memuat data transaksi');
      return [];
    }
  }

  async createTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          status: transaction.status,
          project_id: transaction.projectId,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
        status: data.status,
        projectId: data.project_id,
        createdBy: data.created_by,
      };
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      notificationService.error('Gagal menambahkan transaksi');
      return null;
    }
  }

  // Payroll Records
  async getPayrollRecords(userId: string): Promise<PayrollRecord[]> {
    try {
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(record => ({
        id: record.id,
        workerId: record.worker_id,
        workerName: record.worker_name,
        period: record.period,
        daysWorked: record.days_worked,
        dailyRate: record.daily_rate,
        regularPay: record.regular_pay,
        overtime: record.overtime,
        totalPay: record.total_pay,
        status: record.status,
        createdAt: record.created_at,
        paidAt: record.paid_at,
      }));
    } catch (error: any) {
      console.error('Error fetching payroll records:', error);
      notificationService.error('Gagal memuat data gaji');
      return [];
    }
  }

  async createPayrollRecord(userId: string, payroll: Omit<PayrollRecord, 'id'>): Promise<PayrollRecord | null> {
    try {
      const { data, error } = await supabase
        .from('payroll_records')
        .insert({
          user_id: userId,
          worker_id: payroll.workerId,
          worker_name: payroll.workerName,
          period: payroll.period,
          days_worked: payroll.daysWorked,
          daily_rate: payroll.dailyRate,
          regular_pay: payroll.regularPay,
          overtime: payroll.overtime,
          total_pay: payroll.totalPay,
          status: payroll.status,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        workerId: data.worker_id,
        workerName: data.worker_name,
        period: data.period,
        daysWorked: data.days_worked,
        dailyRate: data.daily_rate,
        regularPay: data.regular_pay,
        overtime: data.overtime,
        totalPay: data.total_pay,
        status: data.status,
        createdAt: data.created_at,
        paidAt: data.paid_at,
      };
    } catch (error: any) {
      console.error('Error creating payroll record:', error);
      notificationService.error('Gagal menambahkan catatan gaji');
      return null;
    }
  }

  // Projects
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        location: project.location,
        startDate: project.start_date,
        endDate: project.end_date,
        status: project.status,
        budget: project.budget,
        spent: project.spent,
        workers: [], // This would need a separate junction table
        manager: project.manager,
        progress: project.progress,
        images: [], // This would need a separate table
        qrCode: project.qr_code,
      }));
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      notificationService.error('Gagal memuat data proyek');
      return [];
    }
  }

  async createProject(userId: string, project: Omit<Project, 'id'>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: project.name,
          description: project.description,
          location: project.location,
          start_date: project.startDate,
          end_date: project.endDate,
          status: project.status,
          budget: project.budget,
          spent: project.spent,
          manager: project.manager,
          progress: project.progress,
          qr_code: project.qrCode,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        location: data.location,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        budget: data.budget,
        spent: data.spent,
        workers: [],
        manager: data.manager,
        progress: data.progress,
        images: [],
        qrCode: data.qr_code,
      };
    } catch (error: any) {
      console.error('Error creating project:', error);
      notificationService.error('Gagal menambahkan proyek');
      return null;
    }
  }

  // Materials
  async getMaterials(userId: string): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      return data.map(material => ({
        id: material.id,
        name: material.name,
        unit: material.unit,
        pricePerUnit: material.price_per_unit,
        supplier: material.supplier,
        category: material.category,
        stock: material.stock,
        minStock: material.min_stock,
        lastUpdated: material.updated_at,
      }));
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      notificationService.error('Gagal memuat data material');
      return [];
    }
  }

  async createMaterial(userId: string, material: Omit<Material, 'id'>): Promise<Material | null> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          user_id: userId,
          name: material.name,
          unit: material.unit,
          price_per_unit: material.pricePerUnit,
          supplier: material.supplier,
          category: material.category,
          stock: material.stock,
          min_stock: material.minStock,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        unit: data.unit,
        pricePerUnit: data.price_per_unit,
        supplier: data.supplier,
        category: data.category,
        stock: data.stock,
        minStock: data.min_stock,
        lastUpdated: data.updated_at,
      };
    } catch (error: any) {
      console.error('Error creating material:', error);
      notificationService.error('Gagal menambahkan material');
      return null;
    }
  }

  // Sync local data to database
  async syncLocalDataToDatabase(userId: string): Promise<void> {
    try {
      // Get local data
      const localWorkers = JSON.parse(localStorage.getItem('workers') || '[]');
      const localTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const localPayroll = JSON.parse(localStorage.getItem('payrollRecords') || '[]');
      const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const localMaterials = JSON.parse(localStorage.getItem('materials') || '[]');

      // Sync workers
      for (const worker of localWorkers) {
        await this.createWorker(userId, worker);
      }

      // Sync transactions
      for (const transaction of localTransactions) {
        await this.createTransaction(userId, transaction);
      }

      // Sync payroll records
      for (const payroll of localPayroll) {
        await this.createPayrollRecord(userId, payroll);
      }

      // Sync projects
      for (const project of localProjects) {
        await this.createProject(userId, project);
      }

      // Sync materials
      for (const material of localMaterials) {
        await this.createMaterial(userId, material);
      }

      notificationService.success('Data lokal berhasil disinkronkan ke database');
    } catch (error: any) {
      console.error('Error syncing local data:', error);
      notificationService.error('Gagal sinkronisasi data lokal');
    }
  }

  // Load data from database to local storage
  async loadDataFromDatabase(userId: string): Promise<void> {
    try {
      const [workers, transactions, payrollRecords, projects, materials] = await Promise.all([
        this.getWorkers(userId),
        this.getTransactions(userId),
        this.getPayrollRecords(userId),
        this.getProjects(userId),
        this.getMaterials(userId),
      ]);

      // Update local storage
      localStorage.setItem('workers', JSON.stringify(workers));
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('payrollRecords', JSON.stringify(payrollRecords));
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('materials', JSON.stringify(materials));

      notificationService.success('Data berhasil dimuat dari database');
    } catch (error: any) {
      console.error('Error loading data from database:', error);
      notificationService.error('Gagal memuat data dari database');
    }
  }
}

export const databaseService = new DatabaseService();