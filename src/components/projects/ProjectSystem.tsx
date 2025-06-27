import React, { useState } from 'react';
import { Plus, Download, Search, Filter, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ProjectForm } from './ProjectForm';
import { ProjectTable } from './ProjectTable';
import { Project } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, exportToCSV } from '../../utils/calculations';
import { qrService } from '../../services/qrService';
import { notificationService } from '../../services/notificationService';

export function ProjectSystem() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'qrCode'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        qrCode: await qrService.generateProjectQR(Date.now().toString(), projectData.name),
      };
      
      setProjects(prev => [...prev, newProject]);
      setIsModalOpen(false);
      notificationService.success('Proyek berhasil ditambahkan');
    } catch (error) {
      notificationService.error('Gagal menambahkan proyek');
    }
  };

  const handleProjectAction = (action: string, projectId?: string) => {
    if (action === 'export') {
      exportToCSV(projects, 'projects');
    } else if (action === 'delete' && projectId) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      notificationService.success('Proyek berhasil dihapus');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Proyek
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola proyek berdasarkan lokasi dan periode kerja
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handleProjectAction('export')}
          >
            Export
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah Proyek
          </Button>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Proyek Aktif
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeProjects}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Proyek Selesai
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedProjects}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Budget
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Terpakai
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
              placeholder="Cari proyek atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Semua Status</option>
              <option value="planning">Perencanaan</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="paused">Ditunda</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Projects Table */}
      <ProjectTable 
        projects={filteredProjects}
        onAction={handleProjectAction}
      />

      {/* Add Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Proyek Baru"
        size="lg"
      >
        <ProjectForm onSubmit={handleAddProject} />
      </Modal>
    </div>
  );
}