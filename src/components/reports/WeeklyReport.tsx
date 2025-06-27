import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { WeeklyReport } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';

export function WeeklyReportSystem() {
  const [workers] = useLocalStorage('workers', []);
  const [transactions] = useLocalStorage('transactions', []);
  const [overtimeRecords] = useLocalStorage('overtimeRecords', []);
  const [payrollRecords] = useLocalStorage('payrollRecords', []);
  const [projects] = useLocalStorage('projects', []);
  
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday.toISOString().split('T')[0];
  });

  const generateWeeklyReport = (): WeeklyReport => {
    const weekStart = new Date(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Filter data for the selected week
    const weekTransactions = transactions.filter((t: any) => 
      t.date >= weekStartStr && t.date <= weekEndStr
    );
    
    const weekOvertime = overtimeRecords.filter((o: any) => 
      o.date >= weekStartStr && o.date <= weekEndStr
    );
    
    const weekPayroll = payrollRecords.filter((p: any) => 
      p.createdAt >= weekStartStr && p.createdAt <= weekEndStr
    );

    const totalIncome = weekTransactions
      .filter((t: any) => t.type === 'income' && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalExpenses = weekTransactions
      .filter((t: any) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalPayroll = weekPayroll
      .reduce((sum: number, p: any) => sum + p.totalPay, 0);

    const totalOvertimeAmount = weekOvertime
      .reduce((sum: number, o: any) => sum + o.total, 0);

    const activeWorkers = workers.filter((w: any) => w.isActive).length;
    const completedProjects = projects.filter((p: any) => 
      p.status === 'completed' && 
      p.endDate >= weekStartStr && 
      p.endDate <= weekEndStr
    ).length;

    // Calculate productivity for each worker
    const productivity = workers.map((worker: any) => {
      const workerOvertime = weekOvertime.filter((o: any) => o.workerId === worker.id);
      const workerPayroll = weekPayroll.filter((p: any) => p.workerId === worker.id);
      
      const hoursWorked = workerPayroll.reduce((sum: number, p: any) => sum + (p.daysWorked * 8), 0);
      const overtimeHours = workerOvertime.reduce((sum: number, o: any) => sum + o.hours, 0);
      const totalHours = hoursWorked + overtimeHours;
      
      return {
        workerId: worker.id,
        workerName: worker.name,
        hoursWorked,
        overtimeHours,
        productivity: totalHours > 0 ? Math.round((totalHours / 40) * 100) : 0, // 40 hours = 100%
      };
    });

    return {
      id: Date.now().toString(),
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalPayroll,
      totalOvertime: totalOvertimeAmount,
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      activeWorkers,
      completedProjects,
      productivity,
      generatedAt: new Date().toISOString(),
    };
  };

  const report = generateWeeklyReport();

  const exportReport = () => {
    const csvContent = [
      ['Laporan Mingguan Abimanyu Core Management'],
      [`Periode: ${formatDate(report.weekStart)} - ${formatDate(report.weekEnd)}`],
      [`Dibuat: ${formatDate(report.generatedAt)}`],
      [''],
      ['RINGKASAN KEUANGAN'],
      ['Total Gaji', formatCurrency(report.totalPayroll)],
      ['Total Lembur', formatCurrency(report.totalOvertime)],
      ['Total Pemasukan', formatCurrency(report.totalIncome)],
      ['Total Pengeluaran', formatCurrency(report.totalExpenses)],
      ['Kas Bersih', formatCurrency(report.netCashFlow)],
      [''],
      ['RINGKASAN OPERASIONAL'],
      ['Tukang Aktif', report.activeWorkers.toString()],
      ['Proyek Selesai', report.completedProjects.toString()],
      [''],
      ['PRODUKTIVITAS TUKANG'],
      ['Nama', 'Jam Kerja', 'Jam Lembur', 'Produktivitas (%)'],
      ...report.productivity.map(p => [
        p.workerName,
        p.hoursWorked.toString(),
        p.overtimeHours.toString(),
        p.productivity.toString()
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-mingguan-${report.weekStart}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notificationService.success('Laporan mingguan berhasil diekspor');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Laporan Mingguan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ringkasan otomatis gaji, lembur, kas, dan performa tukang
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button
            icon={Download}
            onClick={exportReport}
          >
            Export Laporan
          </Button>
        </div>
      </div>

      {/* Report Period */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Periode Laporan
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dibuat pada
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(report.generatedAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Gaji
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(report.totalPayroll)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Lembur
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(report.totalOvertime)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kas Bersih
              </p>
              <p className={`text-2xl font-bold ${report.netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(report.netCashFlow)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${report.netCashFlow >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <TrendingUp className={`w-6 h-6 ${report.netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Operational Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Ringkasan Operasional">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tukang Aktif</span>
              <span className="font-semibold text-gray-900 dark:text-white">{report.activeWorkers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Proyek Selesai</span>
              <span className="font-semibold text-gray-900 dark:text-white">{report.completedProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Pemasukan</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(report.totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Pengeluaran</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(report.totalExpenses)}</span>
            </div>
          </div>
        </Card>

        <Card title="Top Produktivitas">
          <div className="space-y-3">
            {report.productivity
              .sort((a, b) => b.productivity - a.productivity)
              .slice(0, 5)
              .map((worker, index) => (
                <div key={worker.workerId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {worker.workerName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {worker.hoursWorked}h kerja, {worker.overtimeHours}h lembur
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {worker.productivity}%
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}