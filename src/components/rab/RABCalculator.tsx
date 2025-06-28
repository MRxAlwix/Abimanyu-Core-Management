import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Download, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';

interface RABItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RABCalculation {
  id: string;
  projectName: string;
  items: RABItem[];
  subtotal: number;
  overhead: number;
  profit: number;
  total: number;
  createdAt: string;
}

export function RABCalculator() {
  const [projectName, setProjectName] = useState('');
  const [items, setItems] = useState<RABItem[]>([]);
  const [newItem, setNewItem] = useState({
    description: '',
    unit: '',
    quantity: 0,
    unitPrice: 0,
  });
  const [overheadPercent, setOverheadPercent] = useState(10);
  const [profitPercent, setProfitPercent] = useState(15);

  const addItem = () => {
    if (!newItem.description || !newItem.unit || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      notificationService.warning('Lengkapi semua field item');
      return;
    }

    const item: RABItem = {
      id: Date.now().toString(),
      description: newItem.description,
      unit: newItem.unit,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };

    setItems(prev => [...prev, item]);
    setNewItem({
      description: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
    });
    soundService.playSound('success');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    soundService.playSound('click');
  };

  const updateItem = (id: string, field: keyof RABItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const overhead = (subtotal * overheadPercent) / 100;
  const profit = (subtotal * profitPercent) / 100;
  const total = subtotal + overhead + profit;

  const saveRAB = () => {
    if (!projectName || items.length === 0) {
      notificationService.warning('Masukkan nama proyek dan minimal 1 item');
      return;
    }

    const rab: RABCalculation = {
      id: Date.now().toString(),
      projectName,
      items,
      subtotal,
      overhead,
      profit,
      total,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedRABs = JSON.parse(localStorage.getItem('rab_calculations') || '[]');
    savedRABs.push(rab);
    localStorage.setItem('rab_calculations', JSON.stringify(savedRABs));

    soundService.playSound('success');
    notificationService.success('RAB berhasil disimpan');
  };

  const exportRAB = () => {
    if (!projectName || items.length === 0) {
      notificationService.warning('Masukkan nama proyek dan minimal 1 item');
      return;
    }

    const csvContent = [
      [`RAB - ${projectName}`],
      [`Tanggal: ${new Date().toLocaleDateString('id-ID')}`],
      [''],
      ['No', 'Uraian Pekerjaan', 'Satuan', 'Volume', 'Harga Satuan', 'Jumlah'],
      ...items.map((item, index) => [
        (index + 1).toString(),
        item.description,
        item.unit,
        item.quantity.toString(),
        item.unitPrice.toString(),
        item.total.toString()
      ]),
      [''],
      ['', '', '', '', 'Subtotal', subtotal.toString()],
      ['', '', '', '', `Overhead (${overheadPercent}%)`, overhead.toString()],
      ['', '', '', '', `Profit (${profitPercent}%)`, profit.toString()],
      ['', '', '', '', 'TOTAL', total.toString()],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `RAB-${projectName}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    soundService.playSound('success');
    notificationService.success('RAB berhasil diekspor');
  };

  const commonUnits = ['m2', 'm3', 'm', 'buah', 'set', 'titik', 'ls', 'kg', 'ton'];
  const commonItems = [
    'Pekerjaan Tanah',
    'Pekerjaan Pondasi',
    'Pekerjaan Beton',
    'Pekerjaan Dinding',
    'Pekerjaan Atap',
    'Pekerjaan Lantai',
    'Pekerjaan Cat',
    'Pekerjaan Listrik',
    'Pekerjaan Sanitasi',
    'Pekerjaan Finishing'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calculator className="w-6 h-6 mr-2" />
            RAB Otomatis
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Rencana Anggaran Biaya otomatis untuk proyek konstruksi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Save}
            onClick={saveRAB}
            disabled={!projectName || items.length === 0}
          >
            Simpan RAB
          </Button>
          <Button
            icon={Download}
            onClick={exportRAB}
            disabled={!projectName || items.length === 0}
          >
            Export RAB
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <Card title="Informasi Proyek">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Proyek
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Renovasi Rumah Pak Budi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Overhead (%)
            </label>
            <input
              type="number"
              value={overheadPercent}
              onChange={(e) => setOverheadPercent(Number(e.target.value))}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profit (%)
            </label>
            <input
              type="number"
              value={profitPercent}
              onChange={(e) => setProfitPercent(Number(e.target.value))}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Add Item */}
      <Card title="Tambah Item Pekerjaan">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Uraian Pekerjaan
            </label>
            <select
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Pilih atau ketik pekerjaan</option>
              {commonItems.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            {newItem.description && !commonItems.includes(newItem.description) && (
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-2"
                placeholder="Ketik uraian pekerjaan"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Satuan
            </label>
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Pilih satuan</option>
              {commonUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Volume
            </label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Harga Satuan
            </label>
            <input
              type="number"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            icon={Plus}
            onClick={addItem}
            disabled={!newItem.description || !newItem.unit || newItem.quantity <= 0 || newItem.unitPrice <= 0}
          >
            Tambah Item
          </Button>
        </div>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card title="Daftar Pekerjaan">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">No</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">Uraian Pekerjaan</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">Satuan</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">Volume</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">Harga Satuan</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">Jumlah</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900 dark:text-white">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 px-2 text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {commonUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2 font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="py-2 px-2">
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => removeItem(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <Card title="Ringkasan RAB">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Overhead ({overheadPercent}%):</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(overhead)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Profit ({profitPercent}%):</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profit)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">TOTAL:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}