import React from 'react';
import { X, Calendar, User, DollarSign, Clock, MapPin, Package, FileText, Wrench } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'worker' | 'payroll' | 'transaction' | 'overtime' | 'project' | 'material' | 'attendance';
}

export function DetailModal({ isOpen, onClose, data, type }: DetailModalProps) {
  if (!isOpen || !data) return null;

  const renderWorkerDetails = () => (
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

  const renderPayrollDetails = () => (
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

  const renderTransactionDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${data.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <DollarSign className={`w-6 h-6 ${data.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{data.category}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah</p>
          <p className={`text-3xl font-bold ${data.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {data.type === 'income' ? '+' : '-'}{formatCurrency(data.amount)}
          </p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deskripsi</p>
        <p className="text-gray-900 dark:text-white">{data.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatDate(data.date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            data.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            data.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {data.status === 'completed' ? 'Selesai' : data.status === 'pending' ? 'Pending' : 'Dibatalkan'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderOvertimeDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Clock className="w-8 h-8 text-orange-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lembur {data.workerName}</h3>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(data.date)}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Jam Lembur</p>
            <p className="font-semibold text-gray-900 dark:text-white">{data.hours} jam</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tarif per Jam</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.rate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tarif Lembur (1.5x)</p>
            <p className="font-semibold text-orange-600">{formatCurrency(data.rate * 1.5)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bayar</p>
            <p className="font-semibold text-green-600">{formatCurrency(data.total)}</p>
          </div>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deskripsi Pekerjaan</p>
        <p className="text-gray-900 dark:text-white">{data.description}</p>
      </div>
    </div>
  );

  const renderProjectDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <MapPin className="w-8 h-8 text-purple-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{data.location}</p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deskripsi</p>
        <p className="text-gray-900 dark:text-white">{data.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
          <p className="font-semibold text-blue-600">{formatCurrency(data.budget)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Terpakai</p>
          <p className="font-semibold text-orange-600">{formatCurrency(data.spent)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Mulai</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatDate(data.startDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.endDate ? formatDate(data.endDate) : 'Belum ditentukan'}
          </p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.progress}% selesai</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manager</p>
        <p className="font-semibold text-gray-900 dark:text-white">{data.manager}</p>
      </div>
    </div>
  );

  const renderMaterialDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Package className="w-8 h-8 text-teal-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{data.category}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Supplier</p>
          <p className="font-semibold text-gray-900 dark:text-white">{data.supplier}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Satuan</p>
          <p className="font-semibold text-gray-900 dark:text-white">{data.unit}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Harga per Satuan</p>
          <p className="font-semibold text-blue-600">{formatCurrency(data.pricePerUnit)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stok Saat Ini</p>
          <p className={`font-semibold ${data.stock <= data.minStock ? 'text-red-600' : 'text-green-600'}`}>
            {data.stock} {data.unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stok Minimum</p>
          <p className="font-semibold text-gray-900 dark:text-white">{data.minStock} {data.unit}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Nilai Total</p>
          <p className="font-semibold text-green-600">{formatCurrency(data.stock * data.pricePerUnit)}</p>
        </div>
      </div>
      
      {data.stock <= data.minStock && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-300 font-medium">⚠️ Stok Menipis!</p>
          <p className="text-red-600 dark:text-red-400 text-sm">Segera lakukan pemesanan ulang material ini.</p>
        </div>
      )}
    </div>
  );

  const renderAttendanceDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Clock className="w-8 h-8 text-emerald-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Presensi {data.workerName}</h3>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(data.date)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Jam Masuk</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {new Date(data.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Jam Keluar</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.checkOut ? new Date(data.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            data.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            data.status === 'late' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
            data.status === 'overtime' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {data.status === 'present' ? 'Hadir' : 
             data.status === 'late' ? 'Terlambat' :
             data.status === 'overtime' ? 'Lembur' : 'Tidak Hadir'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">QR Scan</p>
          <p className={`font-semibold ${data.qrScanned ? 'text-green-600' : 'text-gray-600'}`}>
            {data.qrScanned ? 'Ya' : 'Manual'}
          </p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lokasi</p>
        <p className="text-gray-900 dark:text-white">{data.location}</p>
      </div>
      
      {data.notes && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Catatan</p>
          <p className="text-gray-900 dark:text-white">{data.notes}</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'worker':
        return renderWorkerDetails();
      case 'payroll':
        return renderPayrollDetails();
      case 'transaction':
        return renderTransactionDetails();
      case 'overtime':
        return renderOvertimeDetails();
      case 'project':
        return renderProjectDetails();
      case 'material':
        return renderMaterialDetails();
      case 'attendance':
        return renderAttendanceDetails();
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