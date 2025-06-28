import React, { useState } from 'react';
import { Eye, CheckCircle, CreditCard, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DetailModal } from '../common/DetailModal';
import { KasbonRecord } from './KasbonSystem';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface KasbonTableProps {
  records: KasbonRecord[];
  onAction: (action: string, recordId?: string) => void;
}

export function KasbonTable({ records, onAction }: KasbonTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<KasbonRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusBadge = (status: KasbonRecord['status']) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
      approved: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Disetujui' },
      paid: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Dibayar' },
      deducted: { class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Dipotong Gaji' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (records.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada catatan kasbon
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
                  Jumlah
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Alasan
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
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(record.amount)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={record.reason}>
                      {record.reason}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        Detail
                      </Button>
                      {record.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle}
                          onClick={() => onAction('approve', record.id)}
                        >
                          Setujui
                        </Button>
                      )}
                      {record.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CreditCard}
                          onClick={() => onAction('pay', record.id)}
                        >
                          Bayar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => onAction('delete', record.id)}
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
        type="payroll"
      />
    </>
  );
}