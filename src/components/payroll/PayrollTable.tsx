import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DetailModal } from '../common/DetailModal';
import { PayrollRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { soundService } from '../../services/soundService';

interface PayrollTableProps {
  records: PayrollRecord[];
  onAction: (action: string, recordId?: string) => void;
}

export function PayrollTable({ records, onAction }: PayrollTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusBadge = (status: PayrollRecord['status']) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
      paid: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Dibayar' },
      cancelled: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Dibatalkan' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetail = (record: PayrollRecord) => {
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
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada data gaji yang tercatat
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
                  Nama Tukang
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Periode
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Hari Kerja
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Gaji Pokok
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Lembur
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Total
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
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.workerName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(record.dailyRate)}/hari
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.period}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {record.daysWorked} hari
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatCurrency(record.regularPay)}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatCurrency(record.overtime)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(record.totalPay)}
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
                        onClick={() => handleViewDetail(record)}
                      >
                        Detail
                      </Button>
                      {record.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle}
                          onClick={() => handleAction('pay', record.id)}
                        >
                          Bayar
                        </Button>
                      )}
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