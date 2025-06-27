import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { qrService } from '../../services/qrService';
import { notificationService } from '../../services/notificationService';

interface QRScannerProps {
  onScan: (qrData: any, workerName: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [workerName, setWorkerName] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Mock workers for demo
  const mockWorkers = [
    'Ahmad Supandi',
    'Budi Santoso', 
    'Candra Wijaya',
    'Dedi Kurniawan',
    'Eko Prasetyo'
  ];

  const handleManualScan = () => {
    if (!workerName || !qrInput) {
      notificationService.warning('Pilih nama tukang dan masukkan data QR');
      return;
    }

    try {
      const qrData = qrService.validateQRData(qrInput);
      if (!qrData) {
        notificationService.error('QR Code tidak valid atau sudah kadaluarsa');
        return;
      }

      onScan(qrData, workerName);
      setWorkerName('');
      setQrInput('');
    } catch (error) {
      notificationService.error('Format QR Code tidak valid');
    }
  };

  const simulateScan = () => {
    if (!workerName) {
      notificationService.warning('Pilih nama tukang terlebih dahulu');
      return;
    }

    // Simulate QR scan with mock data
    const mockQRData = {
      id: Date.now().toString(),
      projectId: 'PROJ-001',
      date: new Date().toISOString().split('T')[0],
      location: 'Lokasi Kerja Demo',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    onScan(mockQRData, workerName);
    setWorkerName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pilih Nama Tukang
        </label>
        <select
          value={workerName}
          onChange={(e) => setWorkerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Pilih tukang</option>
          {mockWorkers.map(worker => (
            <option key={worker} value={worker}>{worker}</option>
          ))}
        </select>
      </div>

      {/* Camera Scanner (Simulated) */}
      <Card>
        <div className="text-center space-y-4">
          <div className="w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kamera QR Scanner
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                (Demo Mode)
              </p>
            </div>
          </div>
          
          <Button
            onClick={simulateScan}
            disabled={!workerName}
            className="w-full"
          >
            Simulasi Scan QR
          </Button>
        </div>
      </Card>

      {/* Manual Input */}
      <Card title="Input Manual QR Data">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data QR Code
            </label>
            <textarea
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Paste data QR code di sini..."
            />
          </div>
          
          <Button
            onClick={handleManualScan}
            disabled={!workerName || !qrInput}
            className="w-full"
            variant="secondary"
          >
            Proses Manual
          </Button>
        </div>
      </Card>

      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p><strong>Petunjuk Scan:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Pilih nama tukang yang akan presensi</li>
          <li>Arahkan kamera ke QR Code presensi</li>
          <li>Tunggu hingga QR Code terbaca otomatis</li>
          <li>Sistem akan mencatat presensi secara otomatis</li>
        </ol>
      </div>
    </div>
  );
}