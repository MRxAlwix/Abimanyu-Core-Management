import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { FormValidation } from '../common/FormValidation';
import { Worker } from '../../types';
import { validateWorker } from '../../utils/validation';
import { notificationService } from '../../services/notificationService';

interface WorkerFormProps {
  onSubmit: (worker: Omit<Worker, 'id'>) => void;
  onCancel?: () => void;
}

export function WorkerForm({ onSubmit, onCancel }: WorkerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dailyRate: 0,
    position: '',
    joinDate: new Date().toISOString().split('T')[0],
    isActive: true,
    phone: '',
    address: '',
    skills: [] as string[],
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    // Validate form
    const validation = validateWorker(formData);
    if (!validation.success) {
      const errorMessages = validation.errors?.map(err => err.message || 'Validation error') || [];
      setErrors(errorMessages);
      setIsSubmitting(false);
      notificationService.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    // Additional validation
    const additionalErrors: string[] = [];
    
    if (!formData.name.trim()) {
      additionalErrors.push('Nama harus diisi');
    }
    
    if (!formData.position.trim()) {
      additionalErrors.push('Posisi harus diisi');
    }
    
    if (formData.dailyRate <= 0) {
      additionalErrors.push('Tarif harian harus lebih dari 0');
    }

    if (additionalErrors.length > 0) {
      setErrors(additionalErrors);
      setIsSubmitting(false);
      notificationService.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    try {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        dailyRate: 0,
        position: '',
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        phone: '',
        address: '',
        skills: [],
      });
    } catch (error: any) {
      setErrors([error.message || 'Gagal menyimpan data tukang']);
      notificationService.error('Gagal menyimpan data tukang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormValidation errors={errors} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Masukkan nama lengkap"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Posisi/Jabatan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Contoh: Tukang Bangunan, Mandor, dll"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tarif Harian (Rp) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="dailyRate"
          value={formData.dailyRate}
          onChange={handleChange}
          required
          min="1000"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="150000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tanggal Masuk Kerja <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            No. Telepon
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="081234567890"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Alamat
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Alamat lengkap"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Tukang Aktif
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Batal
          </Button>
        )}
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Tukang'}
        </Button>
      </div>
    </form>
  );
}