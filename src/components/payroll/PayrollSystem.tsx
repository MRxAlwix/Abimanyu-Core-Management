import React, { useState } from 'react';
import { Plus, Download, Search, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { WorkerForm } from './WorkerForm';
import { PayrollTable } from './PayrollTable';
import { Worker, PayrollRecord } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { exportToCSV } from '../../utils/calculations';

export function PayrollSystem() {
  const [workers, setWorkers] = useLocalStorage<Worker[]>('workers', []);
  const [payrollRecords, setPayrollRecords] = useLocalStorage<PayrollRecord[]>('payrollRecords', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAddWorker = (workerData: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...workerData,
      id: Date.now().toString(),
    };
    setWorkers(prev => [...prev, newWorker]);
    setIsModalOpen(false);
  };

  const handlePayrollAction = (action: string, recordId?: string) => {
    if (action === 'export') {
      exportToCSV(payrollRecords, 'payroll-records');
    } else if (action === 'pay' && recordId) {
      setPayrollRecords(prev => prev.map(record => 
        record.id === recordId ? { ...record, status: 'paid' as const } : record
      ));
    }
  };

  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistem Gaji Tukang
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola data tukang dan perhitungan gaji
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handlePayrollAction('export')}
          >
            Export
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah Tukang
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {workers.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Tukang
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {workers.filter(w => w.isActive).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tukang Aktif
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {payrollRecords.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gaji Pending
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
              placeholder="Cari tukang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Sudah Dibayar</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payroll Table */}
      <PayrollTable 
        records={filteredRecords}
        onAction={handlePayrollAction}
      />

      {/* Add Worker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Tukang Baru"
        size="md"
      >
        <WorkerForm onSubmit={handleAddWorker} />
      </Modal>
    </div>
  );
}