import React, { useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Package,
  AlertTriangle,
  Calendar,
  MapPin,
  QrCode,
  FileText
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { Worker, PayrollRecord, Transaction, OvertimeRecord, Project, Material, AttendanceRecord } from '../../types';

export function Dashboard() {
  // Get all data from localStorage
  const [workers] = useLocalStorage<Worker[]>('workers', []);
  const [payrollRecords] = useLocalStorage<PayrollRecord[]>('payrollRecords', []);
  const [transactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [overtimeRecords] = useLocalStorage<OvertimeRecord[]>('overtimeRecords', []);
  const [projects] = useLocalStorage<Project[]>('projects', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [attendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);

  // Calculate real-time statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentWeek = getWeekRange(new Date());

    // Worker statistics
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.isActive).length;

    // Payroll statistics
    const monthlyPayroll = payrollRecords
      .filter(p => p.period === currentMonth && p.status === 'paid')
      .reduce((sum, p) => sum + p.totalPay, 0);
    
    const pendingPayrolls = payrollRecords.filter(p => p.status === 'pending').length;

    // Cash flow statistics
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalIncome = completedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = completedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = totalIncome - totalExpenses;

    // Monthly cash flow
    const monthlyIncome = completedTransactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = completedTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    // Overtime statistics
    const pendingOvertimes = overtimeRecords.filter(o => o.status === 'pending').length;
    const totalOvertimeHours = overtimeRecords
      .filter(o => o.date >= currentWeek.start && o.date <= currentWeek.end)
      .reduce((sum, o) => sum + o.hours, 0);
    
    const totalOvertimeAmount = overtimeRecords
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + o.total, 0);

    // Project statistics
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalProjectBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalProjectSpent = projects.reduce((sum, p) => sum + p.spent, 0);

    // Material statistics
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => m.stock <= m.minStock).length;
    const totalMaterialValue = materials.reduce((sum, m) => sum + (m.stock * m.pricePerUnit), 0);

    // Attendance statistics
    const todayAttendance = attendanceRecords.filter(a => a.date === today);
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;
    const weeklyAttendance = attendanceRecords.filter(a => 
      a.date >= currentWeek.start && a.date <= currentWeek.end
    ).length;

    return {
      // Workers
      totalWorkers,
      activeWorkers,
      
      // Payroll
      monthlyPayroll,
      pendingPayrolls,
      
      // Cash Flow
      totalIncome,
      totalExpenses,
      netCashFlow,
      monthlyIncome,
      monthlyExpenses,
      
      // Overtime
      pendingOvertimes,
      totalOvertimeHours,
      totalOvertimeAmount,
      
      // Projects
      activeProjects,
      completedProjects,
      totalProjectBudget,
      totalProjectSpent,
      
      // Materials
      totalMaterials,
      lowStockMaterials,
      totalMaterialValue,
      
      // Attendance
      presentToday,
      lateToday,
      weeklyAttendance,
    };
  }, [workers, payrollRecords, transactions, overtimeRecords, projects, materials, attendanceRecords]);

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: string;
      action: string;
      subject: string;
      time: string;
      icon: string;
      color: string;
    }> = [];

    // Recent payroll records
    payrollRecords
      .slice(-5)
      .forEach(p => {
        activities.push({
          id: p.id,
          type: 'payroll',
          action: p.status === 'paid' ? 'Gaji dibayarkan' : 'Gaji dihitung',
          subject: p.workerName,
          time: p.paidAt || p.createdAt,
          icon: 'DollarSign',
          color: p.status === 'paid' ? 'green' : 'blue'
        });
      });

    // Recent transactions
    transactions
      .slice(-5)
      .forEach(t => {
        activities.push({
          id: t.id,
          type: 'transaction',
          action: t.type === 'income' ? 'Kas masuk' : 'Kas keluar',
          subject: t.description,
          time: t.date,
          icon: t.type === 'income' ? 'TrendingUp' : 'TrendingDown',
          color: t.type === 'income' ? 'green' : 'red'
        });
      });

    // Recent overtime
    overtimeRecords
      .slice(-3)
      .forEach(o => {
        activities.push({
          id: o.id,
          type: 'overtime',
          action: 'Lembur dicatat',
          subject: o.workerName,
          time: o.date,
          icon: 'Clock',
          color: 'orange'
        });
      });

    // Recent attendance
    attendanceRecords
      .slice(-3)
      .forEach(a => {
        activities.push({
          id: a.id,
          type: 'attendance',
          action: 'Presensi',
          subject: a.workerName,
          time: a.checkIn,
          icon: 'QrCode',
          color: 'purple'
        });
      });

    // Sort by time and take latest 8
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [payrollRecords, transactions, overtimeRecords, attendanceRecords]);

  // Health indicators
  const healthIndicators = useMemo(() => {
    const indicators = [];

    // Cash flow health
    if (stats.netCashFlow < 0) {
      indicators.push({
        type: 'error',
        message: 'Kas bersih negatif - perlu perhatian segera',
        action: 'Periksa pengeluaran'
      });
    } else if (stats.monthlyExpenses > stats.monthlyIncome * 0.9) {
      indicators.push({
        type: 'warning',
        message: 'Pengeluaran bulan ini tinggi (>90% pemasukan)',
        action: 'Monitor pengeluaran'
      });
    }

    // Low stock materials
    if (stats.lowStockMaterials > 0) {
      indicators.push({
        type: 'warning',
        message: `${stats.lowStockMaterials} material stok menipis`,
        action: 'Pesan ulang material'
      });
    }

    // Pending items
    if (stats.pendingPayrolls > 5) {
      indicators.push({
        type: 'info',
        message: `${stats.pendingPayrolls} gaji belum dibayar`,
        action: 'Proses pembayaran'
      });
    }

    if (stats.pendingOvertimes > 3) {
      indicators.push({
        type: 'info',
        message: `${stats.pendingOvertimes} lembur perlu review`,
        action: 'Review lembur'
      });
    }

    return indicators;
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ringkasan real-time sistem manajemen Abimanyu Core
        </p>
      </div>

      {/* Health Indicators */}
      {healthIndicators.length > 0 && (
        <div className="space-y-2">
          {healthIndicators.map((indicator, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                indicator.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                  : indicator.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{indicator.message}</p>
                  <p className="text-sm opacity-75">{indicator.action}</p>
                </div>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Workers */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tukang Aktif
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.activeWorkers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                dari {stats.totalWorkers} total
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Monthly Payroll */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Gaji Bulan Ini
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.monthlyPayroll)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.pendingPayrolls} pending
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Net Cash Flow */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kas Bersih
              </p>
              <p className={`text-2xl font-bold ${
                stats.netCashFlow >= 0 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(stats.netCashFlow)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                {stats.netCashFlow >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                )}
                {stats.netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              stats.netCashFlow >= 0 
                ? 'bg-purple-100 dark:bg-purple-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              <Activity className={`w-6 h-6 ${
                stats.netCashFlow >= 0 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Proyek Aktif
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.activeProjects}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.completedProjects} selesai
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overtime */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lembur Minggu Ini
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.totalOvertimeHours}h
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.pendingOvertimes} pending
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        {/* Materials */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Material
              </p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {stats.totalMaterials}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.lowStockMaterials} stok menipis
              </p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
              <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </Card>

        {/* Attendance Today */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hadir Hari Ini
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.presentToday}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.lateToday} terlambat
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
              <QrCode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* Material Value */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nilai Material
              </p>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {formatCurrency(stats.totalMaterialValue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total stok
              </p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-full">
              <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Summary */}
        <Card title="Ringkasan Kas Bulan Ini" className="h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Total Pemasukan
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-200">
                  {formatCurrency(stats.monthlyIncome)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Total Pengeluaran
                </p>
                <p className="text-lg font-bold text-red-900 dark:text-red-200">
                  {formatCurrency(stats.monthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Kas Bersih Bulan Ini
                </p>
                <p className={`text-lg font-bold ${
                  (stats.monthlyIncome - stats.monthlyExpenses) >= 0 
                    ? 'text-blue-900 dark:text-blue-200' 
                    : 'text-red-900 dark:text-red-200'
                }`}>
                  {formatCurrency(stats.monthlyIncome - stats.monthlyExpenses)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="Aktivitas Terbaru" className="h-fit">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.color === 'green' ? 'bg-green-500' :
                    activity.color === 'blue' ? 'bg-blue-500' :
                    activity.color === 'orange' ? 'bg-orange-500' :
                    activity.color === 'red' ? 'bg-red-500' :
                    activity.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {activity.subject}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(activity.time)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada aktivitas
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Project Overview */}
      {projects.length > 0 && (
        <Card title="Ringkasan Proyek">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalProjectBudget)}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Budget</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(stats.totalProjectSpent)}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">Total Terpakai</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((stats.totalProjectSpent / stats.totalProjectBudget) * 100)}%
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">Utilisasi Budget</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper functions
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

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  
  return formatDate(dateString);
}