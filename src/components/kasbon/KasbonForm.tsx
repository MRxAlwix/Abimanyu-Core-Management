import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { KasbonRecord } from './KasbonSystem';

interface KasbonFormProps {
  onSubmit: (kasbon: Omit<KasbonRecord, 'id' | 'status'>) => void;
}

export function KasbonForm({ onSubmit }: KasbonFormProps) {
  const [formData, setFormData] = useState({
    workerId: '',
    workerName: '',
    amount: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Mock worker data
  const mockWorkers = [
    { id: '1', name: 'Ahmad Supandi' },
    { id: '2', name: 'Budi Santoso' },
    { id: '3', name: 'Candra Wijaya' },
    { id: '4', name: 'Dedi Kurniawan' },
    { id: '5', name: 'Eko Prasetyo' },
  ];

  const commonReasons = [
    'Keperluan Mendadak',
    'Biaya Pengobatan',
    'Biaya Sekolah Anak',
    'Perbaikan Rumah',
    'Modal Usaha',
    'Lainnya',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      workerId: '',
      workerName: '',
      amount: 0,
      reason: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleWorkerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWorker = mockWorkers.find(w => w.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      workerId: e.target.value,
      workerName: selectedWorker?.name || '',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pilih Tukang
        </label>
        <select
          value={formData.workerId}
          onChange={handleWorkerSelect}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Pilih tukang</option>
          {mockWorkers.map(worker => (
            <option key={worker.id} value={worker.id}>{worker.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Jumlah Kasbon (Rp)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="10000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="500000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Alasan Kasbon
        </label>
        <select
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Pilih alasan</option>
          {commonReasons.map(reason => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Catatan Tambahan
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          placeholder="Catatan tambahan (opsional)..."
        />
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Catatan:</strong> Kasbon yang disetujui akan otomatis dipotong dari gaji tukang pada periode berikutnya.
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Ajukan Kasbon
        </Button>
      </div>
    </form>
  );
}