import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';

interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  assignee: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

interface ProjectGanttProps {
  projectId: string;
  projectName: string;
}

export function ProjectGantt({ projectId, projectName }: ProjectGanttProps) {
  const [tasks, setTasks] = useState<GanttTask[]>([
    {
      id: '1',
      name: 'Persiapan Lokasi',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      progress: 100,
      dependencies: [],
      assignee: 'Ahmad Supandi',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Pekerjaan Pondasi',
      startDate: '2024-01-21',
      endDate: '2024-02-05',
      progress: 75,
      dependencies: ['1'],
      assignee: 'Budi Santoso',
      status: 'in-progress',
    },
    {
      id: '3',
      name: 'Pekerjaan Dinding',
      startDate: '2024-02-06',
      endDate: '2024-02-20',
      progress: 0,
      dependencies: ['2'],
      assignee: 'Candra Wijaya',
      status: 'not-started',
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    startDate: '',
    endDate: '',
    assignee: '',
  });

  const addTask = () => {
    if (!newTask.name || !newTask.startDate || !newTask.endDate || !newTask.assignee) {
      notificationService.warning('Lengkapi semua field');
      return;
    }

    const task: GanttTask = {
      id: Date.now().toString(),
      name: newTask.name,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      progress: 0,
      dependencies: [],
      assignee: newTask.assignee,
      status: 'not-started',
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ name: '', startDate: '', endDate: '', assignee: '' });
    setIsAddModalOpen(false);
    soundService.playSound('success');
    notificationService.success('Task berhasil ditambahkan');
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        let status: GanttTask['status'] = 'not-started';
        if (progress > 0 && progress < 100) status = 'in-progress';
        if (progress === 100) status = 'completed';
        
        return { ...task, progress, status };
      }
      return task;
    }));
    soundService.playSound('click');
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    soundService.playSound('success');
    notificationService.success('Task berhasil dihapus');
  };

  const getStatusColor = (status: GanttTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: GanttTask['status']) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'in-progress': return 'Berlangsung';
      case 'delayed': return 'Terlambat';
      default: return 'Belum Mulai';
    }
  };

  // Calculate timeline
  const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => new Date(d).getTime()))) : new Date();
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => new Date(d).getTime()))) : new Date();
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const getTaskPosition = (task: GanttTask) => {
    const startDays = Math.ceil((new Date(task.startDate).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${(startDays / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const workers = ['Ahmad Supandi', 'Budi Santoso', 'Candra Wijaya', 'Dedi Kurniawan', 'Eko Prasetyo'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Timeline Proyek
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {projectName} - Gantt Chart & Jadwal Kerja
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Tambah Task
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Task</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'in-progress').length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Berlangsung</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) || 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Progress Total</p>
          </div>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card title="Gantt Chart">
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {/* Timeline Header */}
            <div className="flex items-center space-x-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="w-48 text-sm font-medium text-gray-900 dark:text-white">Task</div>
              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">Timeline</div>
              <div className="w-24 text-sm font-medium text-gray-900 dark:text-white">Progress</div>
              <div className="w-20 text-sm font-medium text-gray-900 dark:text-white">Aksi</div>
            </div>

            {/* Tasks */}
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 py-2">
                <div className="w-48">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{task.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{task.assignee}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                
                <div className="flex-1 relative h-8 bg-gray-200 dark:bg-gray-700 rounded">
                  <div
                    className={`absolute top-0 h-full rounded ${getStatusColor(task.status)} opacity-80`}
                    style={getTaskPosition(task)}
                  >
                    <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </div>
                  </div>
                </div>
                
                <div className="w-24">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => updateTaskProgress(task.id, Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">{task.progress}%</p>
                </div>
                
                <div className="w-20 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Edit}
                    onClick={() => setSelectedTask(task)}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => deleteTask(task.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada task yang dibuat</p>
          </div>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Task Baru"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Task
            </label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Pekerjaan Pondasi"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Penanggung Jawab
            </label>
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Pilih tukang</option>
              {workers.map(worker => (
                <option key={worker} value={worker}>{worker}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={addTask}
              className="flex-1"
            >
              Tambah Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}