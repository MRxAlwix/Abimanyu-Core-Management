import React, { useState } from 'react';
import { Plus, Download, Search, Filter, Users, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DetailModal } from '../common/DetailModal';
import { WorkerForm } from '../payroll/WorkerForm';
import { Worker } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useActionLimit } from '../../hooks/useActionLimit';
import { exportToCSV, formatCurrency, formatDate } from '../../utils/calculations';
import { dataService } from '../../services/dataService';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';

export function WorkerManagement() {
  const { canPerformAction, performAction } = useActionLimit();
  const [workers, setWorkers] = useLocalStorage<Worker[]>('workers', []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showArchived, setShowArchived] = useState(false);
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
      setIsAddModalOpen(false);
      performAction('add_worker');
      soundService.playSound('success');
      notificationService.success(`Tukang ${newWorker.name} berhasil ditambahkan`);
    } catch (error: any) {
      soundService.playSound('error');
      notificationService.error(error.message || 'Gagal menambahkan tukang');
    }
  };

  const handleEditWorker = (workerData: Omit<Worker, 'id'>) => {
    if (!canPerformAction() || !selectedWorker) {
      return;
    }

    try {
      const updatedWorker = { ...selectedWorker, ...workerData };
      setWorkers(prev => prev.map(w => w.id === selectedWorker.id ? updatedWorker : w));
      setIsEditModalOpen(false);
      setSelectedWorker(null);
      performAction('edit_worker');
      soundService.playSound('success');
      notificationService.success(`Data ${updatedWorker.name} berhasil diperbarui`);
    } catch (error: any) {
      soundService.playSound('error');
      notificationService.error(error.message || 'Gagal memperbarui data tukang');
    }
  };

  const handleDeleteWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Tukang',
      message: `Apakah yakin ingin menghapus ${worker.name}? Data gaji dan lembur terkait akan tetap tersimpan.`,
      onConfirm: () => {
        if (!canPerformAction()) return;
        
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        performAction('delete_worker');
        soundService.playSound('success');
        notificationService.success(`${worker.name} berhasil dihapus`);
      },
    });
  };

  const handleArchiveWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Arsipkan Tukang',
      message: `Apakah yakin ingin mengarsipkan ${worker.name}? Tukang akan dipindahkan ke arsip dan tidak aktif.`,
      onConfirm: () => {
        if (!canPerformAction()) return;
        
        setWorkers(prev => prev.map(w => 
          w.id === workerId 
            ? { ...w, isActive: false, archivedAt: new Date().toISOString() }
            : w
        ));
        performAction('archive_worker');
        soundService.playSound('notification');
        notificationService.success(`${worker.name} berhasil diarsipkan`);
      },
    });
  };

  const handleRestoreWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    if (!canPerformAction()) return;
    
    setWorkers(prev => prev.map(w => 
      w.id === workerId 
        ? { ...w, isActive: true, archivedAt: undefined }
        : w
    ));
    performAction('restore_worker');
    soundService.playSound('success');
    notificationService.success(`${worker.name} berhasil dipulihkan`);
  };

  const handleExport = () => {
    if (!canPerformAction()) return;
    
    const exportData = filteredWorkers.map(worker => ({
      nama: worker.name,
      posisi: worker.position,
      tarif_harian: worker.dailyRate,
      tanggal_bergabung: worker.joinDate,
      status: worker.isActive ? 'Aktif' : 'Tidak Aktif',
      telepon: worker.phone || '',
      alamat: worker.address || '',
      keahlian: worker.skills.join(', '),
    }));
    
    exportToCSV(exportData, 'data-tukang');
    performAction('export_data');
    soundService.playSound('success');
    notificationService.success('Data tukang berhasil diekspor');
  };

  const filteredWorkers = workers
    .filter(worker => {
      const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           worker.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && worker.isActive) ||
                           (statusFilter === 'inactive' && !worker.isActive);
      const matchesArchive = showArchived ? !worker.isActive : worker.isActive;
      return matchesSearch && matchesStatus && matchesArchive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dailyRate':
          return b.dailyRate - a.dailyRate;
        case 'joinDate':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        default:
          return 0;
      }
    });

  const activeWorkers = workers.filter(w => w.isActive).length;
  const archivedWorkers = workers.filter(w => !w.isActive).length;
  const averageDailyRate = workers.length > 0 
    ? workers.reduce((sum, w) => sum + w.dailyRate, 0) / workers.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Tukang
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola data tukang, edit profil, dan arsipkan data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Archive}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Aktif' : 'Arsip'}
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
            disabled={filteredWorkers.length === 0}
          >
            Export
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
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
                {workers.length}
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
                Diarsipkan
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {archivedWorkers}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rata-rata Tarif
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(averageDailyRate)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              placeholder="Cari nama atau posisi..."
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
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">Urutkan: Nama</option>
              <option value="dailyRate">Urutkan: Tarif</option>
              <option value="joinDate">Urutkan: Tanggal Bergabung</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Workers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Nama
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Posisi
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Tarif Harian
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Bergabung
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {worker.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {worker.phone || 'No telepon tidak tersedia'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {worker.position}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatCurrency(worker.dailyRate)}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatDate(worker.joinDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      worker.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {worker.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Users}
                        onClick={() => {
                          soundService.playSound('click');
                          setSelectedWorker(worker);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        Detail
                      </Button>
                      {worker.isActive ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Edit}
                            onClick={() => {
                              soundService.playSound('click');
                              setSelectedWorker(worker);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Archive}
                            onClick={() => handleArchiveWorker(worker.id)}
                          >
                            Arsip
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={Trash2}
                            onClick={() => handleDeleteWorker(worker.id)}
                          >
                            Hapus
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          icon={RotateCcw}
                          onClick={() => handleRestoreWorker(worker.id)}
                        >
                          Pulihkan
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredWorkers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {showArchived ? 'Tidak ada tukang yang diarsipkan' : 'Tidak ada tukang yang ditemukan'}
            </p>
          </div>
        )}
      </Card>

      {/* Add Worker Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Tukang Baru"
        size="md"
      >
        <WorkerForm 
          onSubmit={handleAddWorker}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Worker Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedWorker(null);
        }}
        title="Edit Data Tukang"
        size="md"
      >
        {selectedWorker && (
          <WorkerForm 
            initialData={selectedWorker}
            onSubmit={handleEditWorker}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedWorker(null);
            }}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedWorker(null);
        }}
        data={selectedWorker}
        type="worker"
      />

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