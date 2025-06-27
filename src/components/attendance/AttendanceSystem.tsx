import React, { useState } from 'react';
import { QrCode, Download, Search, Filter, Clock, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { QRGenerator } from './QRGenerator';
import { QRScanner } from './QRScanner';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceRecord } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { exportToCSV } from '../../utils/calculations';
import { notificationService } from '../../services/notificationService';

export function AttendanceSystem() {
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleAttendanceAction = (action: string, recordId?: string) => {
    if (action === 'export') {
      exportToCSV(attendanceRecords, 'attendance-records');
    } else if (action === 'delete' && recordId) {
      setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
      notificationService.success('Catatan presensi berhasil dihapus');
    }
  };

  const handleQRScan = (qrData: any, workerName: string) => {
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      workerId: Date.now().toString(),
      workerName,
      projectId: qrData.projectId || '',
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toISOString(),
      status: 'present',
      location: qrData.location || '',
      qrScanned: true,
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
    notificationService.success(`Presensi ${workerName} berhasil dicatat`);
    setIsQRScannerOpen(false);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || record.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const todayRecords = attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const lateToday = todayRecords.filter(r => r.status === 'late').length;
  const overtimeToday = todayRecords.filter(r => r.status === 'overtime').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            QR Code Presensi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sistem presensi harian dengan scan QR Code
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handleAttendanceAction('export')}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            icon={QrCode}
            onClick={() => setIsQRScannerOpen(true)}
          >
            Scan QR
          </Button>
          <Button
            icon={QrCode}
            onClick={() => setIsQRGeneratorOpen(true)}
          >
            Generate QR
          </Button>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hadir Hari Ini
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {presentToday}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Terlambat
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {lateToday}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lembur
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overtimeToday}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Presensi
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {attendanceRecords.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              placeholder="Cari nama tukang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {dateFilter && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDateFilter('')}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <AttendanceTable 
        records={filteredRecords}
        onAction={handleAttendanceAction}
      />

      {/* QR Generator Modal */}
      <Modal
        isOpen={isQRGeneratorOpen}
        onClose={() => setIsQRGeneratorOpen(false)}
        title="Generate QR Code Presensi"
        size="md"
      >
        <QRGenerator />
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        title="Scan QR Code Presensi"
        size="md"
      >
        <QRScanner onScan={handleQRScan} />
      </Modal>
    </div>
  );
}