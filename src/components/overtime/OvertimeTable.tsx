import React from 'react';
import { Eye, Trash2, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { OvertimeRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface OvertimeTableProps {
  records: OvertimeRecord[];
  onAction: (action: string, recordId?: string) => void;
}

export function OvertimeTable({ records, onAction }: OvertimeTableProps) {
  if (records.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada catatan lembur
          </p>
        </div>
      </Card>
    );
  }

  return (
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
                Jam Lembur
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Tarif/Jam
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Total Bayar
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Deskripsi
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
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-medium">{record.hours}h</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">
                  {formatCurrency(record.rate)}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (1.5x = {formatCurrency(record.rate * 1.5)})
                  </p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(record.total)}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={record.description}>
                    {record.description}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Eye}
                      onClick={() => onAction('view', record.id)}
                    >
                      Detail
                    </Button>
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
  );
}