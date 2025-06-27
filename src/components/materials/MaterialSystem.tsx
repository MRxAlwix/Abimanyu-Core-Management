import React, { useState } from 'react';
import { Plus, Download, Search, Filter, Package, AlertTriangle, Calculator } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MaterialForm } from './MaterialForm';
import { MaterialTable } from './MaterialTable';
import { MaterialCalculator } from './MaterialCalculator';
import { Material } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, exportToCSV } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';

export function MaterialSystem() {
  const [materials, setMaterials] = useLocalStorage<Material[]>('materials', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleAddMaterial = (materialData: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: Date.now().toString(),
    };
    setMaterials(prev => [...prev, newMaterial]);
    setIsModalOpen(false);
    notificationService.success('Material berhasil ditambahkan');
  };

  const handleMaterialAction = (action: string, materialId?: string) => {
    if (action === 'export') {
      exportToCSV(materials, 'materials');
    } else if (action === 'delete' && materialId) {
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      notificationService.success('Material berhasil dihapus');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalMaterials = materials.length;
  const lowStockMaterials = materials.filter(m => m.stock <= m.minStock).length;
  const totalValue = materials.reduce((sum, m) => sum + (m.stock * m.pricePerUnit), 0);
  const categories = [...new Set(materials.map(m => m.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kalkulator Material & Biaya
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola material dan hitung kebutuhan proyek
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Calculator}
            onClick={() => setIsCalculatorOpen(true)}
          >
            Kalkulator
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handleMaterialAction('export')}
          >
            Export
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah Material
          </Button>
        </div>
      </div>

      {/* Material Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Material
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalMaterials}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Stok Menipis
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {lowStockMaterials}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nilai Total Stok
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kategori
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {categories.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari material atau supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Materials Table */}
      <MaterialTable 
        materials={filteredMaterials}
        onAction={handleMaterialAction}
      />

      {/* Add Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Material Baru"
        size="md"
      >
        <MaterialForm onSubmit={handleAddMaterial} />
      </Modal>

      {/* Material Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Kalkulator Material & Biaya"
        size="lg"
      >
        <MaterialCalculator materials={materials} />
      </Modal>
    </div>
  );
}