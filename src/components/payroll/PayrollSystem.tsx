import React, { useState } from 'react';
import { Plus, Download, Search, Filter, Calculator, Users, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { WorkerForm } from './WorkerForm';
import { PayrollForm } from './PayrollForm';
import { PayrollTable } from './PayrollTable';
import { Worker, PayrollRecord } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useActionLimit } from '../../hooks/useActionLimit';
import { exportToCSV, formatCurrency } from '../../utils/calculations';
import { dataService } from '../../services/dataService';
import { notificationService } from '../../services/notificationService';

export function PayrollSystem() {
  const { canPerformAction, performAction } = useActionLimit();
  const [workers, setWorkers] = useLocalStorage<Worker[]>('workers', []);
  const [payrollRecords, setPayrollRecords] = useLocalStorage<PayrollRecord[]>('payrollRecords', []);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleAddWorker = (workerData: Omit<Worker, 'id'>) => {
    if (!canPerformAction()) {
      return;
    }

    try {
      const newWorker = dataService.createWorker(workerData);
      setWorkers(prev => [...prev, newWorker]);
      setIsWorkerModalOpen(false);
      performAction('add_worker');
      notificationService.success(`Tukang ${newWorker.name} berhasil ditambahkan`);
    } catch (error: any) {
      notificationService.error(error.message || 'Gagal menambahkan tukang');
    }
  };

  const handleAddPayroll = (payrollRecord: PayrollRecord) => {
    if (!canPerformAction()) {
      return;
    }

    // Check for duplicate payroll in the same period
    const existingPayroll = payrollRecords.find(
      p => p.workerId === payrollRecord.workerId && p.period === payrollRecord.period
    );

    if (existingPayroll) {
      setConfirmDialog({
        isOpen: true,
        title: 'Gaji Sudah Ada',
        message: `Gaji untuk ${payrollRecord.workerName} periode ${payrollRecord.period} sudah tercatat. Apakah ingin mengganti dengan data baru?`,
        onConfirm: () => {
          setPayrollRecords(prev => 
            prev.map(p => p.id === existingPayroll.id ? payrollRecord : p)
          );
          setIsPayrollModalOpen(false);
          performAction('update_payroll');
          notificationService.success('Gaji berhasil diperbarui');
        },
      });
    } else {
      setPayrollRecords(prev => [...prev, payrollRecord]);
      setIsPayrollModalOpen(false);
      performAction('add_payroll');
      notificationService.success(`Gaji ${payrollRecord.workerName} berhasil dihitung`);
    }
  };

  const handlePayrollAction = (action: string, recordId?: string) => {
    switch (action) {
      case 'export':
        if (payrollRecords.length === 0) {
          notificationService.warning('Tidak ada data gaji untuk diekspor');
          return;
        }
        if (!canPerformAction()) {
          return;
        }
        exportToCSV(payrollRecords, 'payroll-records');
        performAction('export_data');
        notificationService.success('Data gaji berhasil diekspor');
        break;
        
      case 'pay':
        if (recordId) {
          setConfirmDialog({
            isOpen: true,
            title: 'Konfirmasi Pembayaran',
            message: 'Apakah yakin ingin menandai gaji ini sebagai sudah dibayar?',
            onConfirm: () => {
              if (!canPerformAction()) return;
              setPayrollRecords(prev => prev.map(record => 
                record.id === recordId 
                  ? { ...record, status: 'paid' as const, paidAt: new Date().toISOString() }
                  : record
              ));
              performAction('update_payroll');
              notificationService.success('Status gaji berhasil diperbarui');
            },
          });
        }
        break;
        
      case 'delete':
        if (recordId) {
          const record = payrollRecords.find(r => r.id === recordId);
          setConfirmDialog({
            isOpen: true,
            title: 'Hapus Catatan Gaji',
            message: `Apakah yakin ingin menghapus catatan gaji ${record?.workerName}?`,
            onConfirm: () => {
              if (!canPerformAction()) return;
              setPayrollRecords(prev => prev.filter(r => r.id !== recordId));
              performAction('delete_payroll');
              notificationService.success('Catatan gaji berhasil dihapus');
            },
          });
        }
        break;
    }
  };

  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.period.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.isActive).length;
  const pendingPayrolls = payrollRecords.filter(r => r.status === 'pending').length;
  const totalPayrollThisMonth = payrollRecords
    .filter(r => r.period === new Date().toISOString().slice(0, 7) && r.status === 'paid')
    .reduce((sum, r) => sum + r.totalPay, 0);

  // Data integrity check
  React.useEffect(() => {
    const integrity = dataService.validateDataIntegrity();
    if (!integrity.isValid) {
      notificationService.warning('Ditemukan masalah pada data. Sistem akan membersihkan otomatis.');
      dataService.cleanupData();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistem Gaji Tukang
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola data tukang dan perhitungan gaji otomatis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handlePayrollAction('export')}
            disabled={payrollRecords.length === 0}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            icon={Calculator}
            onClick={() => setIsPayrollModalOpen(true)}
            disabled={activeWorkers === 0}
          >
            Hitung Gaji
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsWorkerModalOpen(true)}
          >
            Tambah Tukang
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tukang
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalWorkers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeWorkers} aktif
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
                Tukang Aktif
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeWorkers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Siap bekerja
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Gaji Pending
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {pendingPayrolls}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Belum dibayar
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bulan Ini
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(totalPayrollThisMonth)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sudah dibayar
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
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
              placeholder="Cari tukang atau periode..."
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
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        title="Tambah Tukang Baru"
        size="md"
      >
        <WorkerForm 
          onSubmit={handleAddWorker}
          onCancel={() => setIsWorkerModalOpen(false)}
        />
      </Modal>

      {/* Calculate Payroll Modal */}
      <Modal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        title="Hitung Gaji Tukang"
        size="lg"
      >
        <PayrollForm 
          workers={workers}
          onSubmit={handleAddPayroll}
          onCancel={() => setIsPayrollModalOpen(false)}
        />
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
}