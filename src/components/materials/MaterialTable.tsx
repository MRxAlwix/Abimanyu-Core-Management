import React from 'react';
import { Eye, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Material } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface MaterialTableProps {
  materials: Material[];
  onAction: (action: string, materialId?: string) => void;
}

export function MaterialTable({ materials, onAction }: MaterialTableProps) {
  if (materials.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada material yang tercatat
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
                Material
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Kategori
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Supplier
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Harga/Satuan
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Stok
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Nilai Total
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => {
              const isLowStock = material.stock <= material.minStock;
              const totalValue = material.stock * material.pricePerUnit;

              return (
                <tr key={material.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {isLowStock && (
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {material.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Satuan: {material.unit}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full">
                      {material.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {material.supplier}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {formatCurrency(material.pricePerUnit)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className={`font-medium ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {material.stock} {material.unit}
                      </span>
                      {isLowStock && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-full">
                          Stok Menipis
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {material.minStock} {material.unit}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(totalValue)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => onAction('view', material.id)}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => onAction('delete', material.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}