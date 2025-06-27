import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { OvertimeRecord } from '../../types';

interface OvertimeFormProps {
  onSubmit: (overtime: Omit<OvertimeRecord, 'id' | 'total'>) => void;
}

export function OvertimeForm({ onSubmit }: OvertimeFormProps) {
  const [formData, setFormData] = useState({
    workerId: '',
    workerName: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    rate: 0,
    description: '',
  });

  // Mock worker data - in real app, this would come from the worker database
  const mockWorkers = [
    { id: '1', name: 'Ahmad Supandi' },
    { id: '2', name: 'Budi Santoso' },
    { id: '3', name: 'Candra Wijaya' },
    { id: '4', name: 'Dedi Kurniawan' },
    { id: '5', name: 'Eko Prasetyo' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      workerId: '',
      workerName: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      rate: 0,
      description: '',
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

  const estimatedTotal = formData.hours * formData.rate * 1.5;

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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tanggal Lembur
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Jam Lembur
        </label>
        <input
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          required
          min="0"
          step="0.5"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="3.5"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Gunakan titik desimal untuk jam (contoh: 2.5 untuk 2 jam 30 menit)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tarif per Jam (Rp)
        </label>
        <input
          type="number"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          required
          min="0"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="25000"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tarif normal per jam (akan dikalikan 1.5x untuk lembur)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Deskripsi Pekerjaan
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          placeholder="Deskripsi pekerjaan lembur yang dilakukan..."
        />
      </div>

      {estimatedTotal > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Estimasi Total Lembur:</strong>
          </p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(estimatedTotal)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {formData.hours} jam × Rp {formData.rate.toLocaleString('id-ID')} × 1.5 (faktor lembur)
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Simpan Catatan Lembur
        </Button>
      </div>
    </form>
  );
}