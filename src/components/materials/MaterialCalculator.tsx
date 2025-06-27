import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Material, MaterialCalculation } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';

interface MaterialCalculatorProps {
  materials: Material[];
}

interface CalculationItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export function MaterialCalculator({ materials }: MaterialCalculatorProps) {
  const [calculationItems, setCalculationItems] = useState<CalculationItem[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [projectName, setProjectName] = useState('');

  const addMaterial = () => {
    if (!selectedMaterialId || quantity <= 0) {
      notificationService.warning('Pilih material dan masukkan jumlah yang valid');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;

    const existingItem = calculationItems.find(item => item.materialId === selectedMaterialId);
    
    if (existingItem) {
      setCalculationItems(prev => prev.map(item => 
        item.materialId === selectedMaterialId 
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.pricePerUnit }
          : item
      ));
    } else {
      const newItem: CalculationItem = {
        materialId: material.id,
        materialName: material.name,
        quantity,
        unit: material.unit,
        pricePerUnit: material.pricePerUnit,
        total: quantity * material.pricePerUnit,
      };
      setCalculationItems(prev => [...prev, newItem]);
    }

    setSelectedMaterialId('');
    setQuantity(0);
  };

  const removeMaterial = (materialId: string) => {
    setCalculationItems(prev => prev.filter(item => item.materialId !== materialId));
  };

  const updateQuantity = (materialId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeMaterial(materialId);
      return;
    }

    setCalculationItems(prev => prev.map(item => 
      item.materialId === materialId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.pricePerUnit }
        : item
    ));
  };

  const totalCost = calculationItems.reduce((sum, item) => sum + item.total, 0);

  const exportCalculation = () => {
    if (calculationItems.length === 0) {
      notificationService.warning('Tambahkan material terlebih dahulu');
      return;
    }

    const calculation: MaterialCalculation = {
      id: Date.now().toString(),
      projectId: '',
      materials: calculationItems.map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        total: item.total,
      })),
      totalCost,
      createdAt: new Date().toISOString(),
      notes: projectName,
    };

    // Create CSV content
    const csvContent = [
      ['Kalkulasi Material - ' + (projectName || 'Tanpa Nama')],
      ['Tanggal: ' + new Date().toLocaleDateString('id-ID')],
      [''],
      ['Material', 'Jumlah', 'Satuan', 'Harga/Satuan', 'Total'],
      ...calculationItems.map(item => [
        item.materialName,
        item.quantity.toString(),
        item.unit,
        item.pricePerUnit.toString(),
        item.total.toString()
      ]),
      [''],
      ['Total Biaya', '', '', '', totalCost.toString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kalkulasi-material-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notificationService.success('Kalkulasi berhasil diekspor');
  };

  const clearCalculation = () => {
    setCalculationItems([]);
    setProjectName('');
    notificationService.info('Kalkulasi dikosongkan');
  };

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nama Proyek (Opsional)
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Renovasi Rumah Pak Budi"
        />
      </div>

      {/* Add Material */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Pilih Material</option>
              {materials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.name} - {formatCurrency(material.pricePerUnit)}/{material.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Jumlah"
            />
          </div>
          <Button
            icon={Plus}
            onClick={addMaterial}
            disabled={!selectedMaterialId || quantity <= 0}
          >
            Tambah
          </Button>
        </div>
      </Card>

      {/* Calculation Items */}
      {calculationItems.length > 0 && (
        <Card title="Daftar Material">
          <div className="space-y-3">
            {calculationItems.map((item) => (
              <div key={item.materialId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.materialName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.pricePerUnit)}/{item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.materialId, Number(e.target.value))}
                    min="0"
                    step="0.1"
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {item.unit}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400 w-24 text-right">
                    {formatCurrency(item.total)}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => removeMaterial(item.materialId)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Total and Actions */}
      {calculationItems.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Biaya Material
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalCost)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={clearCalculation}
              >
                Kosongkan
              </Button>
              <Button
                icon={Calculator}
                onClick={exportCalculation}
              >
                Export Kalkulasi
              </Button>
            </div>
          </div>
        </Card>
      )}

      {calculationItems.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Pilih material untuk memulai kalkulasi
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}