import React, { useState } from 'react';
import { Camera, User, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { qrService } from '../../services/qrService';
import { notificationService } from '../../services/notificationService';
import { useActionLimit } from '../../hooks/useActionLimit';

interface QRScannerProps {
  onScan: (qrData: any, workerName: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const { canPerformAction, performAction } = useActionLimit();
  const [workerName, setWorkerName] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Mock workers for demo
  const mockWorkers = [
    'Ahmad Supandi',
    'Budi Santoso', 
    'Candra Wijaya',
    'Dedi Kurniawan',
    'Eko Prasetyo'
  ];

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualScan = () => {
    if (!workerName || !qrInput) {
      notificationService.warning('Pilih nama tukang dan masukkan data QR');
      return;
    }

    if (!canPerformAction()) {
      return;
    }

    try {
      const qrData = qrService.validateQRData(qrInput);
      if (!qrData) {
        notificationService.error('QR Code tidak valid atau sudah kadaluarsa');
        return;
      }

      onScan(qrData, workerName);
      performAction('scan_qr');
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

    if (!canPerformAction()) {
      return;
    }

    setIsScanning(true);

    // Simulate network delay
    setTimeout(() => {
      try {
        if (!isOnline) {
          // Offline fallback
          const offlineQRData = {
            id: Date.now().toString(),
            projectId: 'OFFLINE-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            location: 'Lokasi Offline (akan disinkronkan)',
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            offline: true,
          };

          onScan(offlineQRData, workerName);
          performAction('scan_qr_offline');
          notificationService.warning('Mode offline: Data akan disinkronkan saat online');
        } else {
          // Online simulation
          const mockQRData = {
            id: Date.now().toString(),
            projectId: 'PROJ-001',
            date: new Date().toISOString().split('T')[0],
            location: 'Lokasi Kerja Demo',
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };

          onScan(mockQRData, workerName);
          performAction('scan_qr');
        }

        setWorkerName('');
      } catch (error) {
        notificationService.error('Gagal memproses QR scan');
      } finally {
        setIsScanning(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <div className={`flex items-center justify-center p-2 rounded-lg ${
        isOnline 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Offline - Data akan disinkronkan</span>
          </>
        )}
      </div>

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
              {!isOnline && (
                <p className="text-xs text-red-500 mt-1">
                  Mode Offline
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={simulateScan}
            disabled={!workerName || isScanning}
            className="w-full"
          >
            {isScanning ? 'Memproses...' : 'Simulasi Scan QR'}
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
          <li>Mode offline: Data disimpan lokal dan disinkronkan saat online</li>
        </ol>
      </div>
    </div>
  );
}