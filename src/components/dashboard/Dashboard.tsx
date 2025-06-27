import React from 'react';
import { 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';

export function Dashboard() {
  const stats = {
    totalWorkers: 25,
    activeWorkers: 23,
    monthlyPayroll: 45000000,
    totalIncome: 125000000,
    totalExpenses: 78000000,
    netCashFlow: 47000000,
    pendingOvertimes: 12,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ringkasan data terkini sistem manajemen Abimanyu Core
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tukang
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalWorkers}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {stats.activeWorkers} aktif
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Gaji Bulan Ini
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.monthlyPayroll)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                +12% dari bulan lalu
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kas Bersih
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.netCashFlow)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lembur Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingOvertimes}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Perlu review
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ringkasan Kas" className="h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Total Pemasukan
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-200">
                  {formatCurrency(stats.totalIncome)}
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
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>

        <Card title="Aktivitas Terbaru" className="h-fit">
          <div className="space-y-3">
            {[
              { action: 'Gaji dibayarkan', worker: 'Ahmad Supandi', time: '2 jam lalu', type: 'payroll' },
              { action: 'Lembur dicatat', worker: 'Budi Santoso', time: '4 jam lalu', type: 'overtime' },
              { action: 'Kas masuk', worker: 'Pembayaran Proyek A', time: '6 jam lalu', type: 'income' },
              { action: 'Pengeluaran', worker: 'Pembelian Material', time: '1 hari lalu', type: 'expense' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'payroll' ? 'bg-blue-500' :
                  activity.type === 'overtime' ? 'bg-orange-500' :
                  activity.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.worker}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}