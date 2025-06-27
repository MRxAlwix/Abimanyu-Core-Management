import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Worker, PayrollRecord } from '../../types';
import { dataService } from '../../services/dataService';
import { notificationService } from '../../services/notificationService';
import { formatCurrency } from '../../utils/calculations';

const payrollSchema = z.object({
  workerId: z.string().min(1, 'Pilih tukang'),
  period: z.string().min(1, 'Periode harus diisi'),
  daysWorked: z.number().min(0, 'Hari kerja minimal 0').max(31, 'Hari kerja maksimal 31'),
  overtimeHours: z.number().min(0, 'Jam lembur minimal 0').max(100, 'Jam lembur maksimal 100'),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollFormProps {
  workers: Worker[];
  onSubmit: (payroll: PayrollRecord) => void;
  onCancel?: () => void;
}

export function PayrollForm({ workers, onSubmit, onCancel }: PayrollFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      workerId: '',
      period: new Date().toISOString().slice(0, 7), // YYYY-MM format
      daysWorked: 0,
      overtimeHours: 0,
    },
  });

  const watchedValues = watch();
  const watchedWorkerId = watch('workerId');

  // Update selected worker when workerId changes
  React.useEffect(() => {
    const worker = workers.find(w => w.id === watchedWorkerId);
    setSelectedWorker(worker || null);
  }, [watchedWorkerId, workers]);

  // Calculate estimated pay
  const estimatedPay = React.useMemo(() => {
    if (!selectedWorker || !watchedValues.daysWorked) return 0;
    
    const regularPay = selectedWorker.dailyRate * watchedValues.daysWorked;
    const overtimePay = (selectedWorker.dailyRate / 8) * (watchedValues.overtimeHours || 0) * 1.5;
    return regularPay + overtimePay;
  }, [selectedWorker, watchedValues.daysWorked, watchedValues.overtimeHours]);

  const onFormSubmit = async (data: PayrollFormData) => {
    if (!selectedWorker) {
      notificationService.error('Pilih tukang terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payrollRecord = dataService.calculatePayroll(
        selectedWorker,
        data.daysWorked,
        data.overtimeHours,
        data.period
      );

      onSubmit(payrollRecord);
      notificationService.success(`Gaji ${selectedWorker.name} berhasil dihitung`);
      reset();
      setSelectedWorker(null);
    } catch (error: any) {
      notificationService.error(error.message || 'Gagal menghitung gaji');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeWorkers = workers.filter(w => w.isActive);

  if (activeWorkers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Tidak ada tukang aktif. Tambahkan tukang terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Worker Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pilih Tukang
        </label>
        <select
          {...register('workerId')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Pilih tukang</option>
          {activeWorkers.map(worker => (
            <option key={worker.id} value={worker.id}>
              {worker.name} - {formatCurrency(worker.dailyRate)}/hari
            </option>
          ))}
        </select>
        {errors.workerId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.workerId.message}
          </p>
        )}
      </div>

      {/* Selected Worker Info */}
      {selectedWorker && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Informasi Tukang
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Nama:</span>
              <span className="ml-2 font-medium">{selectedWorker.name}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Posisi:</span>
              <span className="ml-2 font-medium">{selectedWorker.position}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Tarif Harian:</span>
              <span className="ml-2 font-medium">{formatCurrency(selectedWorker.dailyRate)}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Status:</span>
              <span className="ml-2 font-medium text-green-600">Aktif</span>
            </div>
          </div>
        </div>
      )}

      {/* Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Periode (Bulan/Tahun)
        </label>
        <input
          type="month"
          {...register('period')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.period && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.period.message}
          </p>
        )}
      </div>

      {/* Days Worked and Overtime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hari Kerja
          </label>
          <input
            type="number"
            {...register('daysWorked', { valueAsNumber: true })}
            min="0"
            max="31"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="25"
          />
          {errors.daysWorked && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.daysWorked.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Jam Lembur
          </label>
          <input
            type="number"
            {...register('overtimeHours', { valueAsNumber: true })}
            min="0"
            max="100"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="8"
          />
          {errors.overtimeHours && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.overtimeHours.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Tarif lembur: 1.5x tarif normal per jam
          </p>
        </div>
      </div>

      {/* Estimated Pay */}
      {selectedWorker && watchedValues.daysWorked > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
            Estimasi Gaji
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700 dark:text-green-300">Gaji Pokok:</span>
              <span className="font-medium">
                {formatCurrency(selectedWorker.dailyRate * watchedValues.daysWorked)}
              </span>
            </div>
            {watchedValues.overtimeHours > 0 && (
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Lembur:</span>
                <span className="font-medium">
                  {formatCurrency((selectedWorker.dailyRate / 8) * watchedValues.overtimeHours * 1.5)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-green-200 dark:border-green-700 pt-2">
              <span className="font-semibold text-green-900 dark:text-green-200">Total:</span>
              <span className="font-bold text-lg text-green-900 dark:text-green-200">
                {formatCurrency(estimatedPay)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
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
          disabled={isSubmitting || !selectedWorker}
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" text="Menghitung..." />
          ) : (
            'Hitung Gaji'
          )}
        </Button>
      </div>
    </form>
  );
}