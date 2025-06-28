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
  FileText,
  Zap,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { Worker, PayrollRecord, Transaction, OvertimeRecord, Project, Material, AttendanceRecord } from '../../types';

export function Dashboard() {
  const [workers] = useLocalStorage<Worker[]>('workers', []);
  const [payrollRecords] = useLocalStorage<PayrollRecord[]>('payrollRecords', []);
  const [transactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [overtimeRecords] = useLocalStorage<OvertimeRecord[]>('overtimeRecords', []);
  const [projects] = useLocalStorage<Project[]>('projects', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [attendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentWeek = getWeekRange(new Date());

    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.isActive).length;

    const monthlyPayroll = payrollRecords
      .filter(p => p.period === currentMonth && p.status === 'paid')
      .reduce((sum, p) => sum + p.totalPay, 0);
    
    const pendingPayrolls = payrollRecords.filter(p => p.status === 'pending').length;

    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalIncome = completedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = completedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = totalIncome - totalExpenses;

    const monthlyIncome = completedTransactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = completedTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingOvertimes = overtimeRecords.filter(o => o.status === 'pending').length;
    const totalOvertimeHours = overtimeRecords
      .filter(o => o.date >= currentWeek.start && o.date <= currentWeek.end)
      .reduce((sum, o) => sum + o.hours, 0);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalProjectBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalProjectSpent = projects.reduce((sum, p) => sum + p.spent, 0);

    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => m.stock <= m.minStock).length;
    const totalMaterialValue = materials.reduce((sum, m) => sum + (m.stock * m.pricePerUnit), 0);

    const todayAttendance = attendanceRecords.filter(a => a.date === today);
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;

    // Performance metrics
    const avgProjectProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0;
    
    const productivityScore = Math.round(
      (presentToday / Math.max(activeWorkers, 1)) * 100
    );

    const budgetUtilization = totalProjectBudget > 0 
      ? (totalProjectSpent / totalProjectBudget) * 100 
      : 0;

    return {
      totalWorkers,
      activeWorkers,
      monthlyPayroll,
      pendingPayrolls,
      totalIncome,
      totalExpenses,
      netCashFlow,
      monthlyIncome,
      monthlyExpenses,
      pendingOvertimes,
      totalOvertimeHours,
      activeProjects,
      completedProjects,
      totalProjectBudget,
      totalProjectSpent,
      totalMaterials,
      lowStockMaterials,
      totalMaterialValue,
      presentToday,
      lateToday,
      avgProjectProgress,
      productivityScore,
      budgetUtilization,
    };
  }, [workers, payrollRecords, transactions, overtimeRecords, projects, materials, attendanceRecords]);

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

    payrollRecords.slice(-3).forEach(p => {
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

    transactions.slice(-3).forEach(t => {
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

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [payrollRecords, transactions]);

  const healthIndicators = useMemo(() => {
    const indicators = [];

    if (stats.netCashFlow < 0) {
      indicators.push({
        type: 'error',
        message: 'Kas bersih negatif - perlu perhatian segera',
        action: 'Periksa pengeluaran'
      });
    }

    if (stats.lowStockMaterials > 0) {
      indicators.push({
        type: 'warning',
        message: `${stats.lowStockMaterials} material stok menipis`,
        action: 'Pesan ulang material'
      });
    }

    if (stats.pendingPayrolls > 5) {
      indicators.push({
        type: 'info',
        message: `${stats.pendingPayrolls} gaji belum dibayar`,
        action: 'Proses pembayaran'
      });
    }

    if (stats.productivityScore < 70) {
      indicators.push({
        type: 'warning',
        message: `Produktivitas rendah: ${stats.productivityScore}%`,
        action: 'Evaluasi kehadiran'
      });
    }

    return indicators;
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights powered by AI • {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">System Online</span>
          </div>
          <Button
            variant="secondary"
            icon={Zap}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700"
          >
            AI Insights
          </Button>
        </div>
      </div>

      {/* Health Indicators */}
      {healthIndicators.length > 0 && (
        <div className="space-y-2">
          {healthIndicators.map((indicator, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 backdrop-blur-sm ${
                indicator.type === 'error' 
                  ? 'bg-red-50/80 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                  : indicator.type === 'warning'
                  ? 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                  : 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{indicator.message}</p>
                  <p className="text-sm opacity-75 mt-1">{indicator.action}</p>
                </div>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Tukang Aktif
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {stats.activeWorkers}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {stats.productivityScore}% produktivitas
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Gaji Bulan Ini
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(stats.monthlyPayroll)}
              </p>
              <p className="text-xs text-green-500 dark:text-green-400 mt-1 flex items-center">
                <Award className="w-3 h-3 mr-1" />
                {stats.pendingPayrolls} pending
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Kas Bersih
              </p>
              <p className={`text-3xl font-bold ${
                stats.netCashFlow >= 0 
                  ? 'text-purple-700 dark:text-purple-300' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(stats.netCashFlow)}
              </p>
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-1 flex items-center">
                {stats.netCashFlow >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stats.netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
              </p>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${
              stats.netCashFlow >= 0 ? 'bg-purple-500' : 'bg-red-500'
            }`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Proyek Aktif
              </p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {stats.activeProjects}
              </p>
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 flex items-center">
                <BarChart3 className="w-3 h-3 mr-1" />
                {Math.round(stats.avgProjectProgress)}% rata-rata
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">{stats.totalOvertimeHours}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lembur Minggu Ini</p>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <Package className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-teal-600">{stats.totalMaterials}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Material</p>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <QrCode className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{stats.presentToday}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hadir Hari Ini</p>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <Target className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-pink-600">{Math.round(stats.budgetUtilization)}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Budget Utilization</p>
          </div>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Summary */}
        <Card title="💰 Ringkasan Kas Bulan Ini" className="h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Total Pemasukan
                </p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">
                  {formatCurrency(stats.monthlyIncome)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Total Pengeluaran
                </p>
                <p className="text-xl font-bold text-red-800 dark:text-red-200">
                  {formatCurrency(stats.monthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Kas Bersih Bulan Ini
                </p>
                <p className={`text-xl font-bold ${
                  (stats.monthlyIncome - stats.monthlyExpenses) >= 0 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {formatCurrency(stats.monthlyIncome - stats.monthlyExpenses)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="🔄 Aktivitas Terbaru" className="h-fit">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.color === 'green' ? 'bg-green-500' :
                    activity.color === 'blue' ? 'bg-blue-500' :
                    activity.color === 'orange' ? 'bg-orange-500' :
                    activity.color === 'red' ? 'bg-red-500' :
                    activity.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'
                  } animate-pulse`} />
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
        <Card title="🏗️ Ringkasan Proyek">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalProjectBudget)}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Budget</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(stats.totalProjectSpent)}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Total Terpakai</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round(stats.budgetUtilization)}%
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Utilisasi Budget</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function getWeekRange(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
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