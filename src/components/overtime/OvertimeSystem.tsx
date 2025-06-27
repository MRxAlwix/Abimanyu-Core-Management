import React, { useState } from 'react';
import { Plus, Download, Search, Filter, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { OvertimeForm } from './OvertimeForm';
import { OvertimeTable } from './OvertimeTable';
import { OvertimeRecord } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, exportToCSV } from '../../utils/calculations';

export function OvertimeSystem() {
  const [overtimeRecords, setOvertimeRecords] = useLocalStorage<OvertimeRecord[]>('overtimeRecords', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleAddOvertime = (overtimeData: Omit<OvertimeRecord, 'id' | 'total'>) => {
    const newOvertime: OvertimeRecord = {
      ...overtimeData,
      id: Date.now().toString(),
      total: overtimeData.hours * overtimeData.rate * 1.5, // 1.5x multiplier for overtime
    };
    setOvertimeRecords(prev => [...prev, newOvertime]);
    setIsModalOpen(false);
  };

  const handleOvertimeAction = (action: string, recordId?: string) => {
    if (action === 'export') {
      exportToCSV(overtimeRecords, 'overtime-records');
    } else if (action === 'delete' && recordId) {
      setOvertimeRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  const filteredRecords = overtimeRecords.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || record.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const totalHours = overtimeRecords.reduce((sum, record) => sum + record.hours, 0);
  const totalAmount = overtimeRecords.reduce((sum, record) => sum + record.total, 0);
  const averageRate = overtimeRecords.length > 0 
    ? overtimeRecords.reduce((sum, record) => sum + record.rate, 0) / overtimeRecords.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistem Hitungan Lembur
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola dan hitung jam lembur tukang
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handleOvertimeAction('export')}
          >
            Export
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Catat Lembur
          </Button>
        </div>
      </div>

      {/* Overtime Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-2">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalHours}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Jam Lembur
            </p>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Biaya Lembur
            </p>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(averageRate)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rata-rata Tarif/Jam
            </p>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {overtimeRecords.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Catatan
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari tukang atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {dateFilter && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDateFilter('')}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Overtime Table */}
      <OvertimeTable 
        records={filteredRecords}
        onAction={handleOvertimeAction}
      />

      {/* Add Overtime Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Jam Lembur"
        size="md"
      >
        <OvertimeForm onSubmit={handleAddOvertime} />
      </Modal>
    </div>
  );
}