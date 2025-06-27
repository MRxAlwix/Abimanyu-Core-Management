import React, { useState, useEffect } from 'react';
import { Download, MapPin, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { qrService } from '../../services/qrService';
import { notificationService } from '../../services/notificationService';

export function QRGenerator() {
  const [qrCode, setQrCode] = useState<string>('');
  const [projectId, setProjectId] = useState('');
  const [location, setLocation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    if (!projectId || !location) {
      notificationService.warning('Masukkan ID proyek dan lokasi');
      return;
    }

    setIsGenerating(true);
    try {
      const qrCodeDataURL = await qrService.generateAttendanceQR(projectId, location);
      setQrCode(qrCodeDataURL);
      notificationService.success('QR Code berhasil dibuat');
    } catch (error) {
      notificationService.error('Gagal membuat QR Code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-presensi-${projectId}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notificationService.success('QR Code berhasil diunduh');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID Proyek
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="PROJ-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lokasi Kerja
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Jl. Merdeka No. 123, Jakarta"
          />
        </div>
      </div>

      <Button
        onClick={generateQR}
        disabled={isGenerating || !projectId || !location}
        className="w-full"
      >
        {isGenerating ? 'Membuat QR Code...' : 'Generate QR Code'}
      </Button>

      {qrCode && (
        <Card>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <img src={qrCode} alt="QR Code Presensi" className="border rounded-lg" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{location}</span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Berlaku: {new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <Button
              icon={Download}
              onClick={downloadQR}
              variant="secondary"
              className="w-full"
            >
              Download QR Code
            </Button>
          </div>
        </Card>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p><strong>Cara Penggunaan:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Generate QR Code untuk lokasi kerja tertentu</li>
          <li>Print atau tampilkan QR Code di lokasi kerja</li>
          <li>Tukang scan QR Code saat datang dan pulang</li>
          <li>Sistem otomatis mencatat waktu dan lokasi presensi</li>
        </ol>
      </div>
    </div>
  );
}