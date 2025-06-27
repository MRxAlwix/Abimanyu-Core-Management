import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Worker, PayrollRecord, Transaction, OvertimeRecord, Project, Material, AttendanceRecord } from '../types';

export function useDashboardData() {
  const [workers] = useLocalStorage<Worker[]>('workers', []);
  const [payrollRecords] = useLocalStorage<PayrollRecord[]>('payrollRecords', []);
  const [transactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [overtimeRecords] = useLocalStorage<OvertimeRecord[]>('overtimeRecords', []);
  const [projects] = useLocalStorage<Project[]>('projects', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [attendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);

  const dashboardData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentWeek = getWeekRange(new Date());

    return {
      // Raw data
      workers,
      payrollRecords,
      transactions,
      overtimeRecords,
      projects,
      materials,
      attendanceRecords,

      // Computed statistics
      stats: {
        // Workers
        totalWorkers: workers.length,
        activeWorkers: workers.filter(w => w.isActive).length,
        
        // Payroll
        monthlyPayroll: payrollRecords
          .filter(p => p.period === currentMonth && p.status === 'paid')
          .reduce((sum, p) => sum + p.totalPay, 0),
        pendingPayrolls: payrollRecords.filter(p => p.status === 'pending').length,
        
        // Cash Flow
        totalIncome: transactions
          .filter(t => t.type === 'income' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyIncome: transactions
          .filter(t => t.type === 'income' && t.status === 'completed' && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyExpenses: transactions
          .filter(t => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.amount, 0),
        
        // Overtime
        pendingOvertimes: overtimeRecords.filter(o => o.status === 'pending').length,
        weeklyOvertimeHours: overtimeRecords
          .filter(o => o.date >= currentWeek.start && o.date <= currentWeek.end)
          .reduce((sum, o) => sum + o.hours, 0),
        totalOvertimeAmount: overtimeRecords
          .filter(o => o.status === 'approved')
          .reduce((sum, o) => sum + o.total, 0),
        
        // Projects
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalProjectBudget: projects.reduce((sum, p) => sum + p.budget, 0),
        totalProjectSpent: projects.reduce((sum, p) => sum + p.spent, 0),
        
        // Materials
        totalMaterials: materials.length,
        lowStockMaterials: materials.filter(m => m.stock <= m.minStock).length,
        totalMaterialValue: materials.reduce((sum, m) => sum + (m.stock * m.pricePerUnit), 0),
        
        // Attendance
        presentToday: attendanceRecords.filter(a => a.date === today && a.status === 'present').length,
        lateToday: attendanceRecords.filter(a => a.date === today && a.status === 'late').length,
        weeklyAttendance: attendanceRecords.filter(a => 
          a.date >= currentWeek.start && a.date <= currentWeek.end
        ).length,
      },

      // Time periods
      periods: {
        today,
        currentMonth,
        currentWeek,
      }
    };
  }, [workers, payrollRecords, transactions, overtimeRecords, projects, materials, attendanceRecords]);

  return dashboardData;
}

function getWeekRange(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}