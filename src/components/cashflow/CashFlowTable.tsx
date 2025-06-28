import React, { useState } from 'react';
import { Eye, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DetailModal } from '../common/DetailModal';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { soundService } from '../../services/soundService';

interface CashFlowTableProps {
  transactions: Transaction[];
  onAction: (action: string, transactionId?: string) => void;
}

export function CashFlowTable({ transactions, onAction }: CashFlowTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      completed: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Selesai' },
      pending: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
      cancelled: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Dibatalkan' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetail = (transaction: Transaction) => {
    soundService.playSound('click');
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleAction = (action: string, transactionId?: string) => {
    soundService.playSound('click');
    onAction(action, transactionId);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada transaksi yang tercatat
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
                  Tipe
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Kategori
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Deskripsi
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Jumlah
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
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Masuk</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 dark:text-red-400">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Keluar</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900 dark:text-white text-sm">
                      {transaction.description}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className={`font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => handleViewDetail(transaction)}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleAction('delete', transaction.id)}
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
        data={selectedTransaction}
        type="transaction"
      />
    </>
  );
}