import React, { useState } from 'react';
import { Plus, Download, Search, Filter, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { KasbonForm } from './KasbonForm';
import { KasbonTable } from './KasbonTable';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, exportToCSV } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';

export interface KasbonRecord {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'deducted';
  approvedBy?: string;
  approvedAt?: string;
  deductedFromPayroll?: string;
  notes?: string;
}

export function KasbonSystem() {
  const [kasbonRecords, setKasbonRecords] = useLocalStorage<KasbonRecord[]>('kasbon_records', []);
  const [payrollRecords] = useLocalStorage('payrollRecords', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAddKasbon = (kasbonData: Omit<KasbonRecord, 'id' | 'status'>) => {
    const newKasbon: KasbonRecord = {
      ...kasbonData,
      id: Date.now().toString(),
      status: 'pending',
    };
    
    setKasbonRecords(prev => [...prev, newKasbon]);
    setIsModalOpen(false);
    soundService.playSound('success');
    notificationService.success(`Kasbon ${kasbonData.workerName} berhasil dicatat`);
  };

  const handleKasbonAction = (action: string, recordId?: string) => {
    soundService.playSound('click');
    
    switch (action) {
      case 'export':
        exportToCSV(kasbonRecords, 'kasbon-records');
        notificationService.success('Data kasbon berhasil diekspor');
        break;
        
      case 'approve':
        if (recordId) {
          setKasbonRecords(prev => prev.map(record => 
            record.id === recordId 
              ? { 
                  ...record, 
                  status: 'approved' as const,
                  approvedBy: 'Admin',
                  approvedAt: new Date().toISOString()
                }
              : record
          ));
          notificationService.success('Kasbon berhasil disetujui');
        }
        break;
        
      case 'pay':
        if (recordId) {
          setKasbonRecords(prev => prev.map(record => 
            record.id === recordId 
              ? { ...record, status: 'paid' as const }
              : record
          ));
          notificationService.success('Kasbon berhasil dibayar');
        }
        break;
        
      case 'delete':
        if (recordId) {
          setKasbonRecords(prev => prev.filter(r => r.id !== recordId));
          notificationService.success('Kasbon berhasil dihapus');
        }
        break;
    }
  };

  // Auto-deduct kasbon from payroll
  React.useEffect(() => {
    const approvedKasbons = kasbonRecords.filter(k => k.status === 'approved');
    const currentPayrolls = payrollRecords.filter((p: any) => p.status === 'pending');
    
    approvedKasbons.forEach(kasbon => {
      const matchingPayroll = currentPayrolls.find((p: any) => p.workerId === kasbon.workerId);
      if (matchingPayroll && !kasbon.deductedFromPayroll) {
        // Mark kasbon as deducted
        setKasbonRecords(prev => prev.map(k => 
          k.id === kasbon.id 
            ? { ...k, status: 'deducted' as const, deductedFromPayroll: matchingPayroll.id }
            : k
        ));
        
        notificationService.info(`Kasbon ${kasbon.workerName} otomatis dipotong dari gaji`);
      }
    });
  }, [payrollRecords, kasbonRecords]);

  const filteredRecords = kasbonRecords.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalKasbon = kasbonRecords.reduce((sum, record) => sum + record.amount, 0);
  const pendingKasbon = kasbonRecords.filter(r => r.status === 'pending').length;
  const approvedKasbon = kasbonRecords.filter(r => r.status === 'approved').length;
  const paidKasbon = kasbonRecords.filter(r => r.status === 'paid').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistem Kasbon Tukang
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola kasbon dan pemotongan gaji otomatis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handleKasbonAction('export')}
          >
            Export
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah Kasbon
          </Button>
        </div>
      </div>

      {/* Kasbon Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Kasbon
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalKasbon)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Menunggu Persetujuan
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingKasbon}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Disetujui
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {approvedKasbon}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sudah Dibayar
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {paidKasbon}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              placeholder="Cari tukang atau alasan kasbon..."
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
              <option value="approved">Disetujui</option>
              <option value="paid">Dibayar</option>
              <option value="deducted">Dipotong Gaji</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Kasbon Table */}
      <KasbonTable 
        records={filteredRecords}
        onAction={handleKasbonAction}
      />

      {/* Add Kasbon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Kasbon Baru"
        size="md"
      >
        <KasbonForm onSubmit={handleAddKasbon} />
      </Modal>
    </div>
  );
}