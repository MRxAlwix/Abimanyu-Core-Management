import React, { useState } from 'react';
import { Eye, Trash2, Clock, MapPin, QrCode } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DetailModal } from '../common/DetailModal';
import { AttendanceRecord } from '../../types';
import { formatDate } from '../../utils/calculations';
import { soundService } from '../../services/soundService';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onAction: (action: string, recordId?: string) => void;
}

export function AttendanceTable({ records, onAction }: AttendanceTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const statusConfig = {
      present: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Hadir' },
      absent: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Tidak Hadir' },
      late: { class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', label: 'Terlambat' },
      overtime: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Lembur' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetail = (record: AttendanceRecord) => {
    soundService.playSound('click');
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleAction = (action: string, recordId?: string) => {
    soundService.playSound('click');
    onAction(action, recordId);
  };

  if (records.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada catatan presensi
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Tanggal
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Nama Tukang
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Jam Masuk
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Jam Keluar
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Lokasi
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  QR Scan
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatDate(record.date)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.workerName}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm">{formatTime(record.checkIn)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {record.checkOut ? (
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm">{formatTime(record.checkOut)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm max-w-xs truncate" title={record.location}>
                        {record.location}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="py-3 px-4">
                    {record.qrScanned ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <QrCode className="w-4 h-4 mr-1" />
                        <span className="text-sm">Ya</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Manual</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => handleViewDetail(record)}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleAction('delete', record.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedRecord}
        type="attendance"
      />
    </>
  );
}