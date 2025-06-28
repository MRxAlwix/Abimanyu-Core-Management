import React, { useState } from 'react';
import { Eye, Trash2, MapPin, Calendar, Users, QrCode } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DetailModal } from '../common/DetailModal';
import { Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { soundService } from '../../services/soundService';

interface ProjectTableProps {
  projects: Project[];
  onAction: (action: string, projectId?: string) => void;
}

export function ProjectTable({ projects, onAction }: ProjectTableProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      planning: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Perencanaan' },
      active: { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Aktif' },
      completed: { class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', label: 'Selesai' },
      paused: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Ditunda' },
      cancelled: { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Dibatalkan' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetail = (project: Project) => {
    soundService.playSound('click');
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleAction = (action: string, projectId?: string) => {
    soundService.playSound('click');
    onAction(action, projectId);
  };

  if (projects.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada proyek yang tercatat
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
                  Nama Proyek
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Lokasi
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Periode
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Budget
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Progress
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
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manager: {project.manager}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm">{project.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <div className="text-sm">
                        <p>{formatDate(project.startDate)}</p>
                        {project.endDate && (
                          <p className="text-gray-500">s/d {formatDate(project.endDate)}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(project.budget)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Terpakai: {formatCurrency(project.spent)}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {project.progress}%
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => handleViewDetail(project)}
                      >
                        Detail
                      </Button>
                      {project.qrCode && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={QrCode}
                          onClick={() => handleAction('qr', project.id)}
                        >
                          QR
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleAction('delete', project.id)}
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
        data={selectedProject}
        type="project"
      />
    </>
  );
}