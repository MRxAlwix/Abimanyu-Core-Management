import React from 'react';
import { X, Calendar, User, DollarSign, Clock, MapPin, Package, FileText, Wrench, Building, Phone, Mail } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface UniversalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'worker' | 'payroll' | 'transaction' | 'overtime' | 'project' | 'material' | 'attendance' | 'registration';
}

export function UniversalDetailModal({ isOpen, onClose, data, type }: UniversalDetailModalProps) {
  if (!isOpen || !data) return null;

  const renderContent = () => {
    switch (type) {
      case 'worker':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{data.position}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tarif Harian</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.dailyRate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className={`font-semibold ${data.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {data.isActive ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Bergabung</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(data.joinDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Telepon</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.phone || '-'}</p>
              </div>
            </div>
            
            {data.address && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alamat</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.address}</p>
              </div>
            )}
            
            {data.skills && data.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Keahlian</p>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'registration':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.companyName}</h3>
                <p className="text-gray-600 dark:text-gray-400">{data.businessType}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pemilik</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  <p className="font-semibold text-gray-900 dark:text-white">{data.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Telepon</p>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  <p className="font-semibold text-gray-900 dark:text-white">{data.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Daftar</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(data.requestedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah Proyek</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.projectCount} proyek</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah Tukang</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.workerCount} tukang</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                data.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                data.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {data.status === 'approved' ? 'Disetujui' : 
                 data.status === 'pending' ? 'Pending' : 'Ditolak'}
              </span>
            </div>

            {data.status === 'rejected' && data.rejectionReason && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alasan Penolakan</p>
                <p className="text-red-600 dark:text-red-400">{data.rejectionReason}</p>
              </div>
            )}
          </div>
        );

      case 'payroll':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gaji {data.workerName}</h3>
                <p className="text-gray-600 dark:text-gray-400">Periode {data.period}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hari Kerja</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.daysWorked} hari</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tarif Harian</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.dailyRate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gaji Pokok</p>
                  <p className="font-semibold text-green-600">{formatCurrency(data.regularPay)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lembur</p>
                  <p className="font-semibold text-orange-600">{formatCurrency(data.overtime)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Total Gaji</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalPay)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  data.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  data.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {data.status === 'paid' ? 'Dibayar' : data.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dibuat</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(data.createdAt)}</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Detail tidak tersedia</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Informasi</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}