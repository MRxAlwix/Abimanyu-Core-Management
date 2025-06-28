import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, User, Mail, Phone, Briefcase, Users, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { registrationService } from '../../services/registrationService';

const registrationSchema = z.object({
  companyName: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
  ownerName: z.string().min(2, 'Nama pemilik minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  businessType: z.string().min(1, 'Jenis usaha harus dipilih'),
  projectCount: z.number().min(1, 'Jumlah proyek minimal 1'),
  workerCount: z.number().min(1, 'Jumlah tukang minimal 1'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onBack: () => void;
}

export function RegistrationForm({ onBack }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const businessTypes = [
    'Kontraktor Bangunan',
    'Developer Properti',
    'Renovasi & Interior',
    'Infrastruktur',
    'Konsultan Konstruksi',
    'Supplier Material',
    'Lainnya',
  ];

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await registrationService.submitRegistration(data);
      setIsSuccess(true);
    } catch (error: any) {
      // Error handled in service
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Pendaftaran Berhasil!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Pendaftaran Anda telah dikirim. Tim developer akan meninjau dan mengirim konfirmasi melalui email dalam 1-2 hari kerja.
          </p>
          <Button onClick={onBack} className="w-full">
            Kembali ke Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daftar Abimanyu Core Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sistem manajemen tukang dan keuangan untuk bisnis konstruksi
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Building className="w-4 h-4 inline mr-1" />
                Nama Perusahaan
              </label>
              <input
                {...register('companyName')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="PT. Konstruksi Jaya"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Nama Pemilik/Direktur
              </label>
              <input
                {...register('ownerName')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Budi Santoso"
              />
              {errors.ownerName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.ownerName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Perusahaan
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="admin@konstruksijaya.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Nomor Telepon
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="081234567890"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Jenis Usaha
            </label>
            <select
              {...register('businessType')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Pilih jenis usaha</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.businessType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.businessType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Jumlah Proyek Aktif
              </label>
              <input
                {...register('projectCount', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="5"
              />
              {errors.projectCount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.projectCount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Jumlah Tukang
              </label>
              <input
                {...register('workerCount', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="20"
              />
              {errors.workerCount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.workerCount.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Yang Anda Dapatkan:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>✓ Manajemen tukang dan gaji otomatis</li>
              <li>✓ Sistem kas masuk/keluar real-time</li>
              <li>✓ QR Code presensi dan lokasi</li>
              <li>✓ RAB otomatis dan kalkulasi material</li>
              <li>✓ Laporan mingguan dan export data</li>
              <li>✓ Backup otomatis ke Google Drive</li>
              <li>✓ Support prioritas 24/7</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              className="flex-1"
              icon={ArrowLeft}
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="Mengirim..." />
              ) : (
                'Daftar Sekarang'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dengan mendaftar, Anda menyetujui syarat dan ketentuan penggunaan
          </p>
        </div>
      </Card>
    </div>
  );
}